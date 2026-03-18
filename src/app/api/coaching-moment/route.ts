import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? '' })

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── Dimension map ─────────────────────────────────────────────────────────────

const DIMENSION_NAMES: Record<number, string> = {
  1: 'Self-awareness',
  2: 'Ego & identity',
  3: 'Emotional regulation',
  4: 'Cognitive flexibility',
  5: 'Values & purpose',
  6: 'Relational mindset',
  7: 'Adaptive resilience',
}

// ── Prompts ───────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a warm, expert leadership coach working for MQ (Mindset Quotient). MQ is defined as the ability to notice your thoughts, beliefs and emotional triggers — and choose how you respond to them, rather than being unconsciously driven by them. Your role is to create deeply personalised daily coaching moments for managers and leaders. Your tone is warm, direct, and coach-like — never generic, never preachy. Always speak to the person by their first name. Always reference what they shared. Always connect the coaching to their role as a manager or leader — show them how the mindset dimension you're working on today is directly affecting their team, their relationships, and their leadership impact. Crucially: always use possibility language. Never frame anything as a deficit or criticism. Always frame insights as what opens up, what becomes possible, what grows — when this dimension develops. The manager should finish reading feeling motivated and seen, not judged.`

function buildUserPrompt(
  name: string,
  role: string,
  dimensionName: string,
  dimensionScore: number,
  context: string,
  companyValues?: string | null
): string {
  const contextLine = context.trim()
    ? `Context shared by participant: "${context.trim()}"`
    : `Context shared by participant: No context provided — base the session on their MQ profile and focus dimension`

  const valuesLine = (dimensionName === 'Values & purpose' && companyValues?.trim())
    ? `Company values for this organisation: ${companyValues.trim()}
Values framing: This leader's Values Clarity coaching should be framed around how well they are living and leading through their COMPANY's values (listed above), not just generic personal values. Reference the specific company values where relevant.`
    : ''

  return `Participant name: ${name}
Role: ${role}
Focus dimension today: ${dimensionName} (their score: ${dimensionScore}/100)
${contextLine}
${valuesLine}
Programme stage: during programme

Generate a coaching moment with exactly three sections:

1. REFLECTION: 3-4 sentences. Speak directly to their situation through the lens of the focus dimension. If they shared context, reference it specifically and personally. Connect their inner mindset to their outer impact as a manager — but always in terms of what becomes possible as this develops, never what's wrong right now. Use their first name at least once.${dimensionName === 'Values & purpose' && companyValues?.trim() ? ' Where relevant, reference the company values by name.' : ''}

2. PRACTICE: A short practice title (5 words max), then 3-4 sentences describing exactly what to do today. Make it concrete, specific, and achievable in under 10 minutes. Ground it in their actual management situation where possible.

3. INSIGHT: 2-3 sentences of relevant neuroscience or psychology research that explains why this dimension matters for leaders. Then one quote — from a researcher, well-known leader, or MQ itself. Format the quote as: "Quote text" — Attribution

Return as JSON only. No preamble, no markdown code fences, no explanation outside the JSON object. The JSON must be valid and parseable. Use this exact shape:
{"heading":"","reflection":"","practiceTitle":"","practiceBody":"","insightBody":"","insightQuote":""}`
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── Authenticate ────────────────────────────────────────────────────────
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const participantId = user.id

  // ── Parse body ───────────────────────────────────────────────────────────
  let body: { name: string; role: string; dimensionId: number; dimensionScore: number; context: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const { name, role, dimensionId, dimensionScore, context } = body

  if (!dimensionId || dimensionId < 1 || dimensionId > 7) {
    return NextResponse.json({ error: 'Invalid dimensionId' }, { status: 400 })
  }

  const today = new Date().toISOString().split('T')[0]

  // ── Check cache (existing session for today) ─────────────────────────────
  const { data: existing } = await supabaseAdmin
    .from('coaching_sessions')
    .select('*')
    .eq('participant_id', participantId)
    .eq('session_date', today)
    .single()

  if (existing?.heading) {
    return NextResponse.json({ sessionId: existing.id, cached: true, ...existing })
  }

  // ── Generate via Anthropic ────────────────────────────────────────────────
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  }

  // ── Look up company values from participant's cohort ─────────────────────
  let companyValues: string | null = null
  const { data: cohortRow } = await supabaseAdmin
    .from('cohort_participants')
    .select('cohorts(company_values)')
    .eq('participant_id', participantId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  if (cohortRow) {
    const cohort = cohortRow.cohorts as { company_values?: string | null } | null
    companyValues = cohort?.company_values ?? null
  }

  const dimensionName = DIMENSION_NAMES[dimensionId]
  const userPrompt    = buildUserPrompt(name, role ?? 'leader', dimensionName, dimensionScore, context ?? '', companyValues)

  let generated: {
    heading: string
    reflection: string
    practiceTitle: string
    practiceBody: string
    insightBody: string
    insightQuote: string
  }

  try {
    const message = await anthropic.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      system:     SYSTEM_PROMPT,
      messages:   [{ role: 'user', content: userPrompt }],
    })

    const block = message.content[0]
    if (block.type !== 'text') throw new Error('Unexpected response type')

    // Strip any accidental markdown fences
    let raw = block.text.trim()
    if (raw.startsWith('```')) {
      raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    }
    generated = JSON.parse(raw)
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number; error?: unknown; headers?: unknown }
    console.error('[/api/coaching-moment] generation error:', {
      message: e?.message,
      status:  e?.status,
      error:   JSON.stringify(e?.error),
    })
    return NextResponse.json({ error: 'Generation failed', detail: e?.message }, { status: 502 })
  }

  // ── Persist session ───────────────────────────────────────────────────────
  const { data: session, error: dbError } = await supabaseAdmin
    .from('coaching_sessions')
    .upsert({
      participant_id:   participantId,
      session_date:     today,
      dimension_id:     dimensionId,
      context_provided: context?.trim() || null,
      heading:          generated.heading,
      reflection_ai:    generated.reflection,
      practice_title:   generated.practiceTitle,
      practice_body:    generated.practiceBody,
      insight_body:     generated.insightBody,
      insight_quote:    generated.insightQuote,
      status:           'draft',
    }, { onConflict: 'participant_id,session_date' })
    .select()
    .single()

  if (dbError || !session) {
    console.error('[/api/coaching-moment] db error:', dbError)
    return NextResponse.json({ error: 'Failed to save session' }, { status: 500 })
  }

  return NextResponse.json({ sessionId: session.id, cached: false, ...session })
}
