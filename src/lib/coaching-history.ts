/**
 * Mid-session conversation-history capping for the MQ Coaching Room.
 *
 * The coaching-room route used to send only the last 10 messages of
 * the session to Anthropic and silently drop everything older. That
 * kept input cost low but lost early-session context the moment a
 * conversation passed 10 messages — the participant frames a situation
 * in turn 3, does a roleplay in turn 18, and the coach has forgotten
 * the original framing.
 *
 * Strategy:
 *   - Always keep the last VERBATIM_CAP messages in full as the
 *     `messages` array sent to Anthropic.
 *   - Anything older is folded into a rolling Haiku-generated summary
 *     stored on the session row (`history_summary`,
 *     `history_summary_through` on `coaching_chats`).
 *   - The summary is appended to the cached `system` text so it reuses
 *     the same prompt-cache hit as the rest of the system prompt while
 *     it stays stable.
 *   - The summary is refreshed at most once every REFRESH_EVERY new
 *     older messages, which bounds the added Haiku cost and latency.
 *
 * The mid-session summary lives only for the duration of the session.
 * Cross-session memory is still handled by the existing
 * `updateCoachingMemory()` flow which fires on new_session.
 *
 * Failure mode: if the Haiku call fails, this module falls back to the
 * previously stored summary or, if none exists, to sending the full
 * conversation. The coach must never break because the summariser is
 * unhealthy.
 */

// ─── Tunables ────────────────────────────────────────────────────────

/** How many of the most recent messages always go to Anthropic verbatim. */
export const VERBATIM_CAP = 20

/**
 * Once the cap is breached, refresh the rolling summary every N
 * additional older messages. 6 ≈ 3 user/coach exchanges.
 */
export const REFRESH_EVERY = 6

/** Per-message char cap when serialising older messages for Haiku. */
const SUMMARISER_PER_MESSAGE_CHARS = 600

const SUMMARISER_MODEL = 'claude-haiku-4-5-20251001'
const SUMMARISER_MAX_TOKENS = 250

// ─── Types ───────────────────────────────────────────────────────────

export interface InboundMessage {
  role: string
  content: string
}

export interface ApiMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface PreparedHistory {
  /** Goes into the Anthropic `messages` array on this turn. Does NOT include the new user message. */
  apiMessages: ApiMessage[]
  /** Block to append to the system prompt. Empty string when no summarisation is in effect. */
  historySummaryBlock: string
  /** Non-null when this turn produced a fresh summary the caller should persist. */
  refreshedSummary: string | null
  /** Non-null when refreshedSummary is non-null. Count of messages now folded into the summary. */
  refreshedThrough: number | null
  /** Diagnostic counters for logging. */
  diag: {
    total: number
    kept: number
    summarised: number
    didRefresh: boolean
  }
}

export interface PrepareCoachingHistoryArgs {
  /** All persisted messages for this session, in chronological order. Does NOT include the new user turn. */
  messages: InboundMessage[]
  storedSummary: string | null
  storedSummaryThrough: number | null
}

// ─── Helpers ─────────────────────────────────────────────────────────

/**
 * Synthetic openers (e.g. MQ Builder auto-start triggers) must not
 * count against the cap and must not be sent to the model. The MQ
 * route already filters these via the `hideTrigger` body flag at
 * insert time, so this is defence in depth.
 */
function isRealMessage(m: InboundMessage): boolean {
  if (typeof m?.content !== 'string') return false
  const trimmed = m.content.trim()
  if (trimmed.length === 0) return false
  if (trimmed.startsWith('[SYSTEM:')) return false
  return true
}

function toApiMessage(m: InboundMessage): ApiMessage {
  return {
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  }
}

function serialiseForSummariser(messages: InboundMessage[]): string {
  return messages
    .map(m => {
      const role = m.role === 'assistant' ? 'Coach' : 'Participant'
      const trimmed = m.content.length > SUMMARISER_PER_MESSAGE_CHARS
        ? m.content.slice(0, SUMMARISER_PER_MESSAGE_CHARS) + '…'
        : m.content
      return `${role}: ${trimmed}`
    })
    .join('\n\n')
}

const SUMMARISER_PROMPT_HEADER =
  'Summarise the earlier portion of this ongoing leadership coaching conversation in 4 to 6 sentences. The conversation is still live and will continue. Capture: what the participant came in with, what ground has been covered so far, anything they have committed to or tried, any roleplay or practice scenario in progress, and any thread the coach should be ready to pick back up. Write it as a third-person briefing note to the same coach, who will continue the conversation right after this point. No direct quotes. No greeting or sign-off. Just the substance.'

async function runSummariser(olderMessages: InboundMessage[]): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.warn('[history-cap] ANTHROPIC_API_KEY missing, cannot summarise')
    return null
  }

  const conversation = serialiseForSummariser(olderMessages)

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: SUMMARISER_MODEL,
        max_tokens: SUMMARISER_MAX_TOKENS,
        messages: [
          {
            role: 'user',
            content: `${SUMMARISER_PROMPT_HEADER}\n\nCONVERSATION SO FAR:\n${conversation}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      console.warn('[history-cap] Haiku summariser failed:', response.status, body.slice(0, 300))
      return null
    }

    const result = (await response.json()) as { content?: Array<{ text?: string }> }
    const text = result?.content?.[0]?.text?.trim()
    return text && text.length > 0 ? text : null
  } catch (err) {
    console.warn(
      '[history-cap] Haiku summariser threw:',
      err instanceof Error ? err.message : String(err),
    )
    return null
  }
}

function buildSummaryBlock(summary: string): string {
  return (
    '\n\n=== EARLIER IN THIS CONVERSATION (summarised so far) ===\n' +
    summary +
    '\n=== END EARLIER ===\n\n' +
    'Treat the above as your own prior turns in this session. The verbatim messages that follow pick up from this point. Do not announce that earlier content was summarised — to the participant, the conversation is one continuous thread.'
  )
}

// ─── Main entry ──────────────────────────────────────────────────────

/**
 * Decide what to send to Anthropic on this coaching turn.
 *
 *   - Sessions at or below the cap behave identically to before this
 *     module existed.
 *   - Sessions past the cap split into older + recent. Recent is sent
 *     verbatim. Older is represented by `historySummaryBlock`, which
 *     is reused from the session row when fresh enough, or regenerated
 *     by Haiku when stale.
 */
export async function prepareCoachingHistory(
  args: PrepareCoachingHistoryArgs,
): Promise<PreparedHistory> {
  const realMessages = args.messages.filter(isRealMessage)
  const total = realMessages.length

  if (total <= VERBATIM_CAP) {
    return {
      apiMessages: realMessages.map(toApiMessage),
      historySummaryBlock: '',
      refreshedSummary: null,
      refreshedThrough: null,
      diag: { total, kept: total, summarised: 0, didRefresh: false },
    }
  }

  const olderCount = total - VERBATIM_CAP
  const older = realMessages.slice(0, olderCount)
  const recent = realMessages.slice(olderCount)

  const storedThrough = args.storedSummaryThrough ?? 0
  const drift = olderCount - storedThrough
  const needsRefresh = !args.storedSummary || drift >= REFRESH_EVERY

  let summary: string | null = args.storedSummary ?? null
  let refreshedSummary: string | null = null
  let refreshedThrough: number | null = null
  let didRefresh = false

  if (needsRefresh) {
    const fresh = await runSummariser(older)
    if (fresh) {
      summary = fresh
      refreshedSummary = fresh
      refreshedThrough = olderCount
      didRefresh = true
    } else if (!summary) {
      // Refresh failed AND there is no prior summary to fall back on.
      // Send the full conversation rather than silently dropping
      // history. Costs more on this turn, but preserves coaching
      // fidelity until the summariser recovers.
      console.warn(
        `[history-cap] no stored summary and Haiku unavailable; sending full ${total} messages verbatim`,
      )
      return {
        apiMessages: realMessages.map(toApiMessage),
        historySummaryBlock: '',
        refreshedSummary: null,
        refreshedThrough: null,
        diag: { total, kept: total, summarised: 0, didRefresh: false },
      }
    }
    // else: refresh failed but we have a stale prior summary — use it.
  }

  const historySummaryBlock = summary ? buildSummaryBlock(summary) : ''

  return {
    apiMessages: recent.map(toApiMessage),
    historySummaryBlock,
    refreshedSummary,
    refreshedThrough,
    diag: { total, kept: recent.length, summarised: olderCount, didRefresh },
  }
}
