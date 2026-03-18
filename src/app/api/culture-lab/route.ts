import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic     = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? '' })
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── Valid topic IDs ───────────────────────────────────────────────────────────

type Topic = 'values' | 'psych-safety' | 'accountability'
const VALID_TOPICS = new Set<Topic>(['values', 'psych-safety', 'accountability'])

function isTopic(s: string | null): s is Topic {
  return !!s && VALID_TOPICS.has(s as Topic)
}

// ── Session title prefix convention ───────────────────────────────────────────
// Sessions are stored in coaching_chats with titles like:
//   "CL:values: I want to understand where I'm falling short"
// We can filter by .like('title', 'CL:values%')

function makeSessionPrefix(topic: Topic): string {
  return `CL:${topic}`
}

// ── System prompt factory ─────────────────────────────────────────────────────

function buildSystemPrompt(
  topic: Topic,
  firstName: string,
  role: string,
  mqContext: string,
  valuesContext: string,
): string {
  const sharedStyleRules = `
STYLE RULES — follow these strictly:
- Never use em dashes (—). Use a comma, colon, or full stop instead.
- Never open with filler affirmations like "I appreciate you bringing this", "That's a great question", "Thank you for sharing", "That's really insightful", or any similar phrase. Get straight to the point.
- Never use bold text or markdown formatting. Plain prose only.
- Respond in 2–3 short paragraphs maximum. These are busy leaders: be concise.
- Ask one good question at the end when it would deepen the conversation.
- Never preachy, generic, or clinical.
- Use ${firstName}'s name naturally but sparingly.`

  if (topic === 'values') {
    return `You are the Culture Lab coach, specialising in helping leaders bridge the gap between their organisation's stated values and how those values actually show up in daily leadership behaviour.

You are coaching ${firstName}, a ${role}.

${mqContext}${valuesContext}

Your role is to help ${firstName} explore how they are genuinely living the company values, where the gaps are, and what concrete behaviour change looks like. Be direct and specific. Do not let them stay at the level of good intentions: push for the specific moments, conversations, and decisions where values get tested.

When values ratings ARE in your context: use them. Do not ask whether ${firstName} has done the check-in. Pick the lowest-rated behaviour and start there, naming the specific value and behaviour. Example: "Looking at where you rated yourself lowest, [behaviour] under [value] stands out. What is typically getting in the way when this comes up?"

When values ratings are NOT in your context: tell ${firstName} that the Values in Action check-in will give you both something concrete to work from, and invite them to complete it before continuing.

Once they describe a gap or challenge, follow this arc:
1. Explore the root cause: is it awareness, competing pressures, skill, or the environment?
2. Make it concrete: one specific situation in the next week where they can demonstrate this value visibly — behaviour others will notice, not an internal intention.
3. Connect to leadership impact: how does consistently showing this behaviour shape how their team experiences them as a leader and what becomes normal on the team?

Scope: company values, role-modelling, how leaders embody or undermine culture, values under pressure, the gap between stated and lived values.

If ${firstName} raises topics outside culture and values leadership, acknowledge briefly and bring the conversation back. This space is focused on culture and values.
${sharedStyleRules}`
  }

  if (topic === 'psych-safety') {
    return `You are the Culture Lab coach, specialising in psychological safety — the belief that people can speak up, ask questions, admit mistakes, and challenge ideas without fear of punishment or humiliation. Your work is grounded in Amy Edmondson's research and practical experience coaching leaders on team dynamics.

You are coaching ${firstName}, a ${role}.

${mqContext}

Psychological safety is created and destroyed by leader behaviour. Your role is to help ${firstName} understand how their specific actions, reactions, and patterns shape whether people feel safe on their team — and what to change.

When exploring psychological safety with ${firstName}:
1. Diagnose first: help them see the current reality clearly. Key diagnostic questions: Do people speak up in meetings, or do they wait to see what you think first? Does anyone ever push back on your ideas? When something goes wrong, what happens? Does bad news travel fast or slow to you?
2. Identify specific undermining behaviours: interrupting, visibly reacting to bad news, taking over in a crisis, not following through on suggestions, punishing mistakes with harsh responses.
3. Identify specific building behaviours: explicitly inviting challenge ("who sees this differently?"), modelling fallibility ("I got that wrong"), responding to bad news with curiosity instead of frustration, following through when someone raises a risk.
4. Concrete next step: one specific thing ${firstName} can do before the next team meeting to either stop undermining safety or start building it.

Be honest if ${firstName}'s described behaviour is likely to undermine psychological safety. Do not let them off the hook with good intentions. What people experience is what counts.

Scope: team psychological safety, how leaders create or undermine speak-up culture, managing disagreement and challenge, responding to mistakes, trust in teams.
${sharedStyleRules}`
  }

  // accountability
  return `You are the Culture Lab coach, specialising in helping leaders build a culture of accountability on their teams. Accountability, done well, is clear expectations, honest conversations, and consistent follow-through — not blame, fear, or micromanagement.

You are coaching ${firstName}, a ${role}.

${mqContext}

Your role is to help ${firstName} identify exactly where accountability is breaking down and what specific leadership behaviour is either contributing to or solving it.

Accountability breaks down in predictable ways: unclear expectations, no consequences for missed commitments, leaders avoiding difficult conversations, inconsistent standards across team members, or a blame culture where people hide problems. Help ${firstName} diagnose which of these is most at play.

When coaching on accountability:
1. Get specific: what exactly is the situation? Who, what, and what has been the leader's response so far?
2. Distinguish between three common breakdowns: (a) the expectation was not truly clear or agreed, (b) the leader has not followed through with a consequence or direct conversation, (c) the person genuinely cannot do what is expected.
3. The accountability conversation: if ${firstName} needs to have one, help them prepare. Good accountability conversations: name the specific commitment that was not met (not the person's character), invite their perspective first, agree on what changes, and establish a clear check-in.
4. Systemic vs. individual: if multiple people are missing commitments, look at the system — unclear goals, too much work, mixed signals from leadership — not just the individuals.

Be direct. Leaders often let poor performance persist too long because they confuse kindness with avoidance. The kindest thing is clarity and an honest conversation, early.

Scope: performance accountability, missed commitments, difficult performance conversations, setting clear expectations, consistent standards, following through.
${sharedStyleRules}`
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const topic     = req.nextUrl.searchParams.get('topic')
  const sessionId = req.nextUrl.searchParams.get('sessionId')

  // Fetch messages for an existing session
  if (sessionId) {
    const { data: messages } = await supabaseAdmin
      .from('coaching_room_messages')
      .select('id, role, content, created_at')
      .eq('participant_id', user.id)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
    return NextResponse.json({ messages: messages ?? [] })
  }

  // Fetch sessions for a topic
  if (!isTopic(topic)) return NextResponse.json({ error: 'Invalid topic' }, { status: 400 })

  const prefix = makeSessionPrefix(topic)
  const { data: sessions } = await supabaseAdmin
    .from('coaching_chats')
    .select('id, title, created_at, updated_at, message_count')
    .eq('participant_id', user.id)
    .like('title', `${prefix}%`)
    .order('updated_at', { ascending: false })

  // Strip the prefix from session titles for display
  const cleaned = (sessions ?? []).map(s => ({
    ...s,
    title: s.title.startsWith(`${prefix}: `) ? s.title.slice(prefix.length + 2) : 'New conversation',
  }))

  return NextResponse.json({ sessions: cleaned })
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const participantId = user.id
  let body: { action?: string; message?: string; sessionId?: string; topic?: string }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const topic = body.topic
  if (!isTopic(topic ?? null)) return NextResponse.json({ error: 'Invalid topic' }, { status: 400 })

  const prefix = makeSessionPrefix(topic as Topic)

  // ── New session ─────────────────────────────────────────────────────────────
  if (body.action === 'new_session') {
    const { data: session } = await supabaseAdmin
      .from('coaching_chats')
      .insert({ participant_id: participantId, title: prefix })
      .select().single()
    return NextResponse.json({ session })
  }

  // ── Send message ────────────────────────────────────────────────────────────
  const { message, sessionId } = body
  if (!message?.trim() || !sessionId)
    return NextResponse.json({ error: 'message and sessionId required' }, { status: 400 })

  // Fetch profile
  const { data: profile } = await supabaseAdmin
    .from('profiles').select('full_name, company_id').eq('id', participantId).single()

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'

  // Fetch assessment scores
  const { data: assessments } = await supabaseAdmin
    .from('assessments')
    .select('overall_score, d1_score, d2_score, d3_score, d4_score, d5_score, d6_score, d7_score, participant_role')
    .eq('participant_id', participantId).not('overall_score', 'is', null)
    .order('completed_at', { ascending: false }).limit(1)

  const assessment = assessments?.[0] ?? null
  const role       = assessment?.participant_role ?? 'leader'

  const mqContext = assessment
    ? `${firstName}'s MQ scores: Overall ${assessment.overall_score}/100 | Self-awareness ${assessment.d1_score} | Ego & identity ${assessment.d2_score} | Emotional regulation ${assessment.d3_score} | Cognitive flexibility ${assessment.d4_score} | Values & purpose ${assessment.d5_score} | Relational mindset ${assessment.d6_score} | Adaptive resilience ${assessment.d7_score}. Use these as context but do not make them the centre of conversation — this space is about culture and team dynamics, not individual MQ.`
    : 'MQ assessment not yet completed.'

  // Fetch company values + participant ratings (for values topic and general context)
  let valuesContext = ''
  try {
    if (profile?.company_id) {
      const { data: valueRows } = await supabaseAdmin
        .from('company_value_behaviours')
        .select('id, value_name, behaviours')
        .eq('company_id', profile.company_id)
        .order('value_order')

      if (valueRows && valueRows.length > 0) {
        const { data: ratingRows } = await supabaseAdmin
          .from('participant_values_ratings')
          .select('company_value_id, behaviour_index, rating')
          .eq('participant_id', participantId)

        const LABELS: Record<number, string> = { 1: 'Rarely', 2: 'Sometimes', 3: 'Usually', 4: 'Consistently' }
        const ratingMap: Record<string, number> = {}
        for (const r of ratingRows ?? []) {
          ratingMap[`${r.company_value_id}_${r.behaviour_index}`] = r.rating
        }

        const lines = valueRows.map(v => {
          const behaviours = (v.behaviours as string[]).map((b, i) => {
            const rating = ratingMap[`${v.id}_${i}`]
            return rating ? `  • "${b}" — ${LABELS[rating]}` : `  • "${b}" — not yet rated`
          })
          return `${v.value_name}:\n${behaviours.join('\n')}`
        })

        valuesContext = `\n\n${firstName}'s company values and self-ratings:\n${lines.join('\n\n')}\n\nUse this data directly. Do not ask whether they have completed the check-in.`
      }
    }
  } catch { /* no values data */ }

  const systemPrompt = buildSystemPrompt(topic as Topic, firstName, role, mqContext, valuesContext)

  // Fetch message history (last 20)
  const { data: history } = await supabaseAdmin
    .from('coaching_room_messages').select('role, content')
    .eq('participant_id', participantId).eq('session_id', sessionId)
    .order('created_at', { ascending: false }).limit(20)

  const pastMessages = (history ?? []).reverse()
    .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

  // Save user message
  await supabaseAdmin.from('coaching_room_messages').insert({
    participant_id: participantId, session_id: sessionId, role: 'user', content: message.trim(),
  })

  // Generate reply
  let reply: string
  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001', max_tokens: 1024, system: systemPrompt,
      messages: [...pastMessages, { role: 'user', content: message.trim() }],
    })
    const block = response.content[0]
    if (block.type !== 'text') throw new Error('Unexpected type')
    reply = block.text
  } catch (err) {
    console.error('[culture-lab] error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 502 })
  }

  // Save assistant reply + update session
  const newCount = pastMessages.length + 2
  await Promise.all([
    supabaseAdmin.from('coaching_room_messages').insert({
      participant_id: participantId, session_id: sessionId, role: 'assistant', content: reply,
    }),
    supabaseAdmin.from('coaching_chats')
      .update({ updated_at: new Date().toISOString(), message_count: newCount }).eq('id', sessionId),
  ])

  // Update session title on first message
  if (pastMessages.length === 0) {
    const shortTitle = message.trim().length > 52 ? message.trim().slice(0, 49) + '…' : message.trim()
    await supabaseAdmin.from('coaching_chats')
      .update({ title: `${prefix}: ${shortTitle}` }).eq('id', sessionId)
  }

  return NextResponse.json({ reply })
}

// ── DELETE ────────────────────────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sessionId = req.nextUrl.searchParams.get('sessionId')
  if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 })

  await supabaseAdmin.from('coaching_chats')
    .delete().eq('id', sessionId).eq('participant_id', user.id)
  return NextResponse.json({ success: true })
}
