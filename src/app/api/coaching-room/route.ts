import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic     = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? '' })
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DIMENSION_NAMES: Record<number, string> = {
  1: 'Self-awareness', 2: 'Cognitive flexibility', 3: 'Emotional regulation',
  4: 'Values clarity',  5: 'Relational mindset',    6: 'Adaptive resilience',
}

function getFocusDimension(scores: (number | null)[]): number {
  return scores.map((s, i) => ({ s: s ?? 999, i })).sort((a, b) => a.s - b.s)[0].i + 1
}

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sessionId = req.nextUrl.searchParams.get('sessionId')

  if (sessionId) {
    const { data: messages } = await supabaseAdmin
      .from('coaching_room_messages')
      .select('id, role, content, created_at')
      .eq('participant_id', user.id)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
    return NextResponse.json({ messages: messages ?? [] })
  }

  const { data: sessions } = await supabaseAdmin
    .from('coaching_sessions')
    .select('id, title, created_at, updated_at, message_count')
    .eq('participant_id', user.id)
    .order('updated_at', { ascending: false })
  return NextResponse.json({ sessions: sessions ?? [] })
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const participantId = user.id
  let body: { action?: string; message?: string; sessionId?: string; prevSessionId?: string }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  if (body.action === 'new_session') {
    if (body.prevSessionId) {
      void updateCoachingMemory(participantId, body.prevSessionId)
    }
    const { data: session } = await supabaseAdmin
      .from('coaching_sessions')
      .insert({ participant_id: participantId, title: 'New conversation' })
      .select().single()
    return NextResponse.json({ session })
  }

  const { message, sessionId } = body
  if (!message?.trim() || !sessionId)
    return NextResponse.json({ error: 'message and sessionId required' }, { status: 400 })

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('full_name, coaching_memory').eq('id', participantId).single()

  const { data: assessments } = await supabaseAdmin
    .from('assessments')
    .select('overall_score, d1_score, d2_score, d3_score, d4_score, d5_score, d6_score, participant_role')
    .eq('participant_id', participantId).not('overall_score', 'is', null)
    .order('completed_at', { ascending: false }).limit(1)

  const assessment = assessments?.[0] ?? null
  const firstName  = profile?.full_name?.split(' ')[0] ?? 'there'
  const role       = assessment?.participant_role ?? 'leader'

  let focusDimName = 'general mindset'
  if (assessment) {
    const scores = [assessment.d1_score, assessment.d2_score, assessment.d3_score,
                    assessment.d4_score, assessment.d5_score, assessment.d6_score]
    focusDimName = DIMENSION_NAMES[getFocusDimension(scores)]
  }

  let companyValues: string | null = null
  try {
    const { data: cr } = await supabaseAdmin.from('cohort_participants')
      .select('cohorts(company_values)').eq('participant_id', participantId)
      .order('created_at', { ascending: false }).limit(1).single()
    if (cr) companyValues = (cr.cohorts as { company_values?: string | null } | null)?.company_values ?? null
  } catch { /* no cohort */ }

  const scoresSummary = assessment
    ? `Overall MQ: ${assessment.overall_score}/100 | Self-awareness: ${assessment.d1_score} | Cognitive flexibility: ${assessment.d2_score} | Emotional regulation: ${assessment.d3_score} | Values clarity: ${assessment.d4_score} | Relational mindset: ${assessment.d5_score} | Adaptive resilience: ${assessment.d6_score} | Focus: ${focusDimName}`
    : 'Assessment not yet completed.'

  const memoryContext = profile?.coaching_memory
    ? `\n\nWhat you know about ${firstName} from previous coaching sessions:\n${profile.coaching_memory}\n\nUse this to personalise your coaching. Reference past themes naturally.`
    : ''
  const valuesContext = companyValues ? `\n\nOrganisation values: ${companyValues}. Reference where relevant.` : ''

  const systemPrompt = `You are MQ Coach — a warm, expert leadership coach for MQ (Mindset Quotient). MQ is the ability to notice your thoughts, beliefs and emotional triggers — and choose how you respond rather than being driven by them unconsciously.

You are coaching ${firstName}, a ${role}.

MQ Assessment: ${scoresSummary}${valuesContext}${memoryContext}

Your role is to be a genuine coaching presence. Listen deeply, ask powerful questions, offer reframes, help ${firstName} think through whatever is on their mind. Always connect insights to their leadership. Tone: warm, direct, possibility-focused. Never preachy, generic, or clinical.

Respond in 2–4 conversational paragraphs. Ask one good question at the end when it would deepen the conversation. No bullet points unless asked. Use ${firstName}'s name naturally.`

  const { data: history } = await supabaseAdmin
    .from('coaching_room_messages').select('role, content')
    .eq('participant_id', participantId).eq('session_id', sessionId)
    .order('created_at', { ascending: false }).limit(20)

  const pastMessages = (history ?? []).reverse()
    .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

  await supabaseAdmin.from('coaching_room_messages').insert({
    participant_id: participantId, session_id: sessionId, role: 'user', content: message.trim(),
  })

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
    console.error('[coaching-room] error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 502 })
  }

  const newCount = pastMessages.length + 2
  await Promise.all([
    supabaseAdmin.from('coaching_room_messages').insert({
      participant_id: participantId, session_id: sessionId, role: 'assistant', content: reply,
    }),
    supabaseAdmin.from('coaching_sessions')
      .update({ updated_at: new Date().toISOString(), message_count: newCount }).eq('id', sessionId),
  ])

  if (pastMessages.length === 0) {
    const title = message.trim().length > 52 ? message.trim().slice(0, 49) + '…' : message.trim()
    await supabaseAdmin.from('coaching_sessions').update({ title }).eq('id', sessionId)
  }

  return NextResponse.json({ reply })
}

export async function DELETE(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sessionId = req.nextUrl.searchParams.get('sessionId')
  if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 })

  await supabaseAdmin.from('coaching_sessions')
    .delete().eq('id', sessionId).eq('participant_id', user.id)
  return NextResponse.json({ success: true })
}

async function updateCoachingMemory(participantId: string, sessionId: string) {
  try {
    const { data: messages } = await supabaseAdmin
      .from('coaching_room_messages').select('role, content')
      .eq('session_id', sessionId).order('created_at', { ascending: true })

    if (!messages || messages.length < 4) return

    const transcript = messages
      .map(m => `${m.role === 'user' ? 'Participant' : 'Coach'}: ${m.content}`).join('\n\n')

    const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    const summaryResp = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001', max_tokens: 300,
      messages: [{ role: 'user', content: `Summarise this coaching session in 2-3 sentences for future reference. Focus on: what the person was working through, notable patterns in how they think or lead, and key insights that emerged. Be specific and personal, not generic. Start with [${dateStr}].\n\n${transcript}` }],
    })
    const block = summaryResp.content[0]
    if (block.type !== 'text') return

    const { data: profile } = await supabaseAdmin
      .from('profiles').select('coaching_memory').eq('id', participantId).single()

    const updated = profile?.coaching_memory
      ? `${profile.coaching_memory}\n\n${block.text.trim()}`
      : block.text.trim()

    await supabaseAdmin.from('profiles').update({ coaching_memory: updated }).eq('id', participantId)
  } catch (err) {
    console.error('[coaching-room] memory update failed:', err)
  }
}
