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
    .from('coaching_chats')
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
      .from('coaching_chats')
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

  // Fetch structured values + behaviours + participant ratings
  let valuesWithRatings: string | null = null
  try {
    const { data: profData } = await supabaseAdmin
      .from('profiles').select('company_id').eq('id', participantId).single()

    if (profData?.company_id) {
      const { data: companyValueRows } = await supabaseAdmin
        .from('company_value_behaviours')
        .select('id, value_name, behaviours')
        .eq('company_id', profData.company_id)
        .order('value_order')

      if (companyValueRows && companyValueRows.length > 0) {
        const { data: ratingRows } = await supabaseAdmin
          .from('participant_values_ratings')
          .select('company_value_id, behaviour_index, rating')
          .eq('participant_id', participantId)

        const LABELS: Record<number, string> = { 1: 'Rarely', 2: 'Sometimes', 3: 'Usually', 4: 'Consistently' }
        const ratingMap: Record<string, number> = {}
        for (const r of ratingRows ?? []) {
          ratingMap[`${r.company_value_id}_${r.behaviour_index}`] = r.rating
        }

        const lines = companyValueRows.map(v => {
          const behaviours = (v.behaviours as string[]).map((b, i) => {
            const rating = ratingMap[`${v.id}_${i}`]
            return rating ? `  • "${b}" → ${LABELS[rating]}` : `  • "${b}" → not yet rated`
          })
          return `${v.value_name}:\n${behaviours.join('\n')}`
        })

        valuesWithRatings = lines.join('\n\n')
      }
    }
  } catch { /* no values data */ }

  const scoresSummary = assessment
    ? `Overall MQ: ${assessment.overall_score}/100 | Self-awareness: ${assessment.d1_score} | Cognitive flexibility: ${assessment.d2_score} | Emotional regulation: ${assessment.d3_score} | Values clarity: ${assessment.d4_score} | Relational mindset: ${assessment.d5_score} | Adaptive resilience: ${assessment.d6_score} | Focus: ${focusDimName}`
    : 'Assessment not yet completed.'

  const memoryContext = profile?.coaching_memory
    ? `\n\nWhat you know about ${firstName} from previous coaching sessions:\n${profile.coaching_memory}\n\nUse this to personalise your coaching. Reference past themes naturally.`
    : ''
  const valuesContext = valuesWithRatings
    ? `\n\n${firstName}'s company values and how they self-rated their own behaviours:\n${valuesWithRatings}\n\nUse this to make coaching more specific. Reference behaviours they rated low (Rarely/Sometimes) as growth edges. Reference behaviours rated high (Consistently) as strengths to build on.`
    : companyValues
      ? `\n\nOrganisation values: ${companyValues}. Reference where relevant.`
      : ''

  const systemPrompt = `You are MQ Coach — a warm, expert leadership coach for MQ (Mindset Quotient). MQ is the ability to notice your thoughts, beliefs and emotional triggers — and choose how you respond rather than being driven by them unconsciously.

You are coaching ${firstName}, a ${role}.

MQ Assessment: ${scoresSummary}${valuesContext}${memoryContext}

Your role is to be a genuine coaching presence. Listen deeply, ask powerful questions, offer reframes, help ${firstName} think through whatever is on their mind at work. Always connect insights to their leadership. Tone: warm, direct, possibility-focused. Never preachy, generic, or clinical.

Respond in 2–4 conversational paragraphs. Ask one good question at the end when it would deepen the conversation. No bullet points unless asked. Use ${firstName}'s name naturally.

━━━ DIMENSION DEVELOPMENT CONVERSATIONS ━━━
If ${firstName} asks to "build" or "develop" or "improve" a specific MQ dimension (e.g. "Help me build my self-awareness", "I want to work on my emotional regulation"), follow this coaching arc:

1. DIAGNOSE FIRST — do not jump straight to advice. Open with one specific diagnostic question to understand their current experience. Examples:
   - Self-awareness: "Before we dig in, can you tell me about a recent moment where you felt your self-awareness let you down — where you only understood how you'd come across after the fact?"
   - Cognitive flexibility: "Tell me about a situation recently where you found it hard to shift your thinking, even when part of you knew you should."
   - Emotional regulation: "What does it look like when this dimension is at its worst for you — what's a recent moment where your emotional response got ahead of you?"
   - Values clarity: "When did you last make a decision that felt slightly off, like you weren't quite acting in line with what you stand for?"
   - Relational mindset: "Think of a relationship at work that isn't as strong as you'd like. What's one thing you notice about how you show up in it?"
   - Adaptive resilience: "What's something you're currently carrying that's testing your resilience — and what's your honest sense of how you're holding up?"

2. LISTEN AND REFLECT — respond to what they share with a brief reflection that shows you heard them specifically, not generically.

3. GUIDE — offer 2–3 targeted, practical strategies or questions tailored to what they've described. Make them specific to their situation, not generic advice.

4. ONE CONCRETE NEXT STEP — close with one thing they can try before the next time they open the coaching room.

Use their assessment scores to calibrate: if their score on the dimension is low, treat it as a genuine growth area. If it's high, treat it as a strength they can deepen or leverage more intentionally.

━━━ SCOPE ━━━
This is a workplace leadership and management coaching space. You can coach on: leadership challenges, team dynamics, communication, decision-making, managing pressure and stress at work, self-awareness, values, career development, and any of the 6 MQ dimensions. Work-related stress and burnout are absolutely in scope — these are core leadership topics.

If ${firstName} raises topics that are clearly outside this scope (personal relationships, finances, parenting, health unrelated to work, etc.), respond warmly but redirect: acknowledge what they've shared, note that this space is designed for leadership coaching, and gently bring the conversation back. Example: "That sounds like a lot to be carrying. This space is focused on your leadership journey — if it feels connected to how you're showing up at work, I'd love to explore that angle with you. What feels most alive for you at work right now?"

━━━ MENTAL HEALTH & WELLBEING — IMPORTANT ━━━
You are a coaching tool, not a therapist or mental health professional. You must handle the following situations with care:

LEVEL 1 — Signs of significant emotional distress (e.g. ${firstName} expresses feeling hopeless, very low, unable to cope, mentions anxiety or depression beyond normal work stress):
Respond with warmth and care. Acknowledge what they've shared without minimising it. Then gently note that what they're describing sounds like it may benefit from more than coaching support, and encourage them to speak with someone qualified. Suggest: their organisation's HR or People team, their GP, or the following UK resources:
- Mind (mental health support): mind.org.uk | 0300 123 3393 (Mon–Fri 9am–6pm)
- Samaritans (free, confidential, 24/7): 116 123 | jo@samaritans.org
- NHS urgent mental health: call 111, select mental health option
Then, if they wish to continue, bring the conversation gently back to work. Do not continue coaching as if nothing was said.

LEVEL 2 — Crisis signals (e.g. ${firstName} mentions thoughts of suicide, self-harm, or harming others — even indirectly or in passing):
Stop coaching immediately. Respond with genuine warmth and care — never clinical or robotic. Tell ${firstName} that what they've shared matters, that you're not able to provide the right support for this, and that they should reach out to someone right now. Provide:
- Samaritans: 116 123 (free, 24/7) or text SHOUT to 85258
- NHS emergency: 999 (if in immediate danger) or 111 (urgent but not emergency)
- Encourage them to tell someone they trust — a friend, colleague, or family member — right now.
Do not continue any coaching after this. Keep your response warm, human, and focused entirely on their safety.

LEVEL 3 — Concern about someone else (e.g. ${firstName} is worried a colleague or team member may be at risk):
Acknowledge the weight of what they're carrying. Encourage them to speak with their HR or People team as a first step, or to gently check in with the person directly if they feel safe doing so. If the situation sounds urgent, share the same crisis resources above. You can then offer to help ${firstName} think through how to have that conversation at work if they'd like.`

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
    supabaseAdmin.from('coaching_chats')
      .update({ updated_at: new Date().toISOString(), message_count: newCount }).eq('id', sessionId),
  ])

  if (pastMessages.length === 0) {
    const title = message.trim().length > 52 ? message.trim().slice(0, 49) + '…' : message.trim()
    await supabaseAdmin.from('coaching_chats').update({ title }).eq('id', sessionId)
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

  await supabaseAdmin.from('coaching_chats')
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
