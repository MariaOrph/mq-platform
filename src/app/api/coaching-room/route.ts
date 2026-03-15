import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic    = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? '' })
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DIMENSION_NAMES: Record<number, string> = {
  1: 'Self-awareness',
  2: 'Cognitive flexibility',
  3: 'Emotional regulation',
  4: 'Values clarity',
  5: 'Relational mindset',
  6: 'Adaptive resilience',
}

function getFocusDimension(scores: (number | null)[]): number {
  const valid = scores.map((s, i) => ({ s: s ?? 999, i }))
  valid.sort((a, b) => a.s - b.s)
  return valid[0].i + 1
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
  let body: { message: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const { message } = body
  if (!message?.trim()) return NextResponse.json({ error: 'Message is required' }, { status: 400 })

  // ── Load participant profile + assessment ────────────────────────────────
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('full_name, email')
    .eq('id', participantId)
    .single()

  const { data: assessments } = await supabaseAdmin
    .from('assessments')
    .select('overall_score, d1_score, d2_score, d3_score, d4_score, d5_score, d6_score, participant_role')
    .eq('participant_id', participantId)
    .not('overall_score', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(1)

  const assessment = assessments?.[0] ?? null
  const firstName  = profile?.full_name?.split(' ')[0] ?? 'there'
  const role       = assessment?.participant_role ?? 'leader'

  // Focus dimension
  let focusDimName = 'general mindset'
  if (assessment) {
    const scores    = [assessment.d1_score, assessment.d2_score, assessment.d3_score,
                       assessment.d4_score, assessment.d5_score, assessment.d6_score]
    const focusId   = getFocusDimension(scores)
    focusDimName    = DIMENSION_NAMES[focusId]
  }

  // ── Load company values ──────────────────────────────────────────────────
  let companyValues: string | null = null
  const { data: cohortRow } = await supabaseAdmin
    .from('cohort_participants')
    .select('cohorts(company_values)')
    .eq('participant_id', participantId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  if (cohortRow) {
    const cohort  = cohortRow.cohorts as { company_values?: string | null } | null
    companyValues = cohort?.company_values ?? null
  }

  // ── Build system prompt ──────────────────────────────────────────────────
  const scoresSummary = assessment
    ? `Overall MQ score: ${assessment.overall_score}/100
Self-awareness: ${assessment.d1_score}/100
Cognitive flexibility: ${assessment.d2_score}/100
Emotional regulation: ${assessment.d3_score}/100
Values clarity: ${assessment.d4_score}/100
Relational mindset: ${assessment.d5_score}/100
Adaptive resilience: ${assessment.d6_score}/100
Current focus dimension: ${focusDimName}`
    : 'Assessment not yet completed.'

  const valuesContext = companyValues
    ? `\nThis participant's organisation has defined company values: ${companyValues}. Where relevant, you can reference these in your coaching.`
    : ''

  const systemPrompt = `You are MQ Coach — a warm, expert leadership coach working for MQ (Mindset Quotient). MQ is defined as the ability to notice your thoughts, beliefs and emotional triggers — and choose how you respond to them, rather than being unconsciously driven by them.

You are in an open, always-available coaching conversation with ${firstName}, who works as a ${role}.

Participant profile:
${scoresSummary}${valuesContext}

Your role is to be a genuine coaching presence — not a chatbot. You listen deeply, ask powerful questions, offer reframes, and help ${firstName} think through whatever is on their mind. You always connect insights to their role as a manager or leader. Your tone is warm, direct, and possibility-focused — never preachy, never generic, never clinical.

Keep responses conversational and coach-like — typically 2-4 paragraphs. Ask one good question at the end when it would help the conversation go deeper. Never give bullet-point lists unless specifically asked. Always use the participant's first name naturally.`

  // ── Load last 20 messages for context ───────────────────────────────────
  const { data: history } = await supabaseAdmin
    .from('coaching_room_messages')
    .select('role, content')
    .eq('participant_id', participantId)
    .order('created_at', { ascending: false })
    .limit(20)

  const pastMessages = (history ?? [])
    .reverse()
    .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

  // ── Save user message ────────────────────────────────────────────────────
  await supabaseAdmin.from('coaching_room_messages').insert({
    participant_id: participantId,
    role:           'user',
    content:        message.trim(),
  })

  // ── Call Anthropic ───────────────────────────────────────────────────────
  let reply: string
  try {
    const response = await anthropic.messages.create({
      model:    'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system:   systemPrompt,
      messages: [
        ...pastMessages,
        { role: 'user', content: message.trim() },
      ],
    })
    const block = response.content[0]
    if (block.type !== 'text') throw new Error('Unexpected response type')
    reply = block.text
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number }
    console.error('[/api/coaching-room] generation error:', { message: e?.message, status: e?.status })
    return NextResponse.json({ error: 'Generation failed' }, { status: 502 })
  }

  // ── Save assistant reply ─────────────────────────────────────────────────
  await supabaseAdmin.from('coaching_room_messages').insert({
    participant_id: participantId,
    role:           'assistant',
    content:        reply,
  })

  return NextResponse.json({ reply })
}

// ── GET: load message history ─────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: messages } = await supabaseAdmin
    .from('coaching_room_messages')
    .select('id, role, content, created_at')
    .eq('participant_id', user.id)
    .order('created_at', { ascending: true })

  return NextResponse.json({ messages: messages ?? [] })
}
