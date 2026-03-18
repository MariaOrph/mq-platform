import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic     = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? '' })
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DIMENSION_NAMES: Record<number, string> = {
  1: 'Self-awareness',
  2: 'Ego & identity',
  3: 'Emotional regulation',
  4: 'Cognitive flexibility',
  5: 'Values & purpose',
  6: 'Relational mindset',
  7: 'Adaptive resilience',
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
    .select('overall_score, d1_score, d2_score, d3_score, d4_score, d5_score, d6_score, d7_score, participant_role')
    .eq('participant_id', participantId).not('overall_score', 'is', null)
    .order('completed_at', { ascending: false }).limit(1)

  const assessment = assessments?.[0] ?? null
  const firstName  = profile?.full_name?.split(' ')[0] ?? 'there'
  const role       = assessment?.participant_role ?? 'leader'

  let focusDimName = 'general mindset'
  if (assessment) {
    const scores = [assessment.d1_score, assessment.d2_score, assessment.d3_score,
                    assessment.d4_score, assessment.d5_score, assessment.d6_score,
                    assessment.d7_score]
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
    ? `Overall MQ: ${assessment.overall_score}/100 | Self-awareness: ${assessment.d1_score} | Ego & identity: ${assessment.d2_score} | Emotional regulation: ${assessment.d3_score} | Cognitive flexibility: ${assessment.d4_score} | Values & purpose: ${assessment.d5_score} | Relational mindset: ${assessment.d6_score} | Adaptive resilience: ${assessment.d7_score} | Focus: ${focusDimName}`
    : 'Assessment not yet completed.'

  const memoryContext = profile?.coaching_memory
    ? `\n\nWhat you know about ${firstName} from previous coaching sessions:\n${profile.coaching_memory}\n\nUse this to personalise your coaching. Reference past themes naturally.`
    : ''
  const valuesContext = valuesWithRatings
    ? `\n\n${firstName}'s company values and how they self-rated their own behaviours:\n${valuesWithRatings}\n\nUse this to make coaching more specific. Reference behaviours they rated low (Rarely/Sometimes) as growth opportunities. Reference behaviours rated high (Consistently) as strengths to build on.`
    : companyValues
      ? `\n\nOrganisation values: ${companyValues}. Reference where relevant.`
      : ''

  const systemPrompt = `You are MQ Coach — a warm, expert leadership coach for MQ (Mindset Quotient). MQ is the ability to notice your thoughts, beliefs and emotional triggers — and choose how you respond rather than being driven by them unconsciously.

You are coaching ${firstName}, a ${role}.

MQ Assessment: ${scoresSummary}${valuesContext}${memoryContext}

Your role is to be a genuine coaching presence. Listen deeply, ask powerful questions, offer reframes, help ${firstName} think through whatever is on their mind at work. Always connect insights to their leadership. Tone: warm, direct, possibility-focused. Never preachy, generic, or clinical.

Respond in 2–3 short paragraphs maximum. These are busy leaders — be concise. Every sentence should earn its place. Ask one good question at the end when it would deepen the conversation. No bullet points unless asked. Use ${firstName}'s name naturally but sparingly.

STYLE RULES — follow these strictly:
- Never use em dashes (—). Use a comma, colon, or full stop instead.
- Never open with filler affirmations like "I appreciate you bringing this", "That's a great question", "Thank you for sharing", "That's really insightful", or any similar phrase. Get straight to the point.
- Never use bold text or markdown formatting. Plain prose only.
- Keep responses tight. If you can say it in one sentence, do not use two.

━━━ COACHING ORIENTATION — IMPORTANT ━━━
This is a professional leadership coaching tool. The frame of reference is always the organisation's goals and ${firstName}'s accountabilities within them — not personal fulfilment, personal values, or what they personally find meaningful. These are not the same thing.

When helping ${firstName} prioritise, focus, or find clarity, always anchor to: their role accountabilities, their team's goals, and the organisation's mission — not to what they personally want or care about. Do not ask questions like "what matters to you personally?" or "what would make you feel fulfilled?" or "what do you care about?". Instead ask: "What are you most accountable for delivering right now?", "What does your team need most from you?", or "Where is the highest-leverage place you could focus given your goals?"

Personal values (e.g. integrity, honesty) are relevant only in so far as they relate to how ${firstName} shows up as a leader — not as a source of direction-setting or prioritisation. The organisation sets the direction; coaching helps ${firstName} show up at their best within it.

━━━ DIMENSION DEVELOPMENT CONVERSATIONS ━━━
If ${firstName} asks to "build" or "develop" or "improve" a specific MQ dimension (e.g. "Help me build my self-awareness", "I want to work on my emotional regulation"), follow this coaching arc:

1. ORIENT FIRST — before asking anything, briefly explain what the dimension means in 1–2 sentences. Keep it plain and grounded, not textbook. Then move straight into the diagnostic question. Use this structure for each dimension:

   - Self-awareness: "Self-awareness is about seeing yourself clearly: how you come across, what drives your reactions, and the impact you have on others. Before we dig in, can you think of a recent moment where you only understood how you'd come across after the fact, when it was too late to change it?"

   - Ego & identity: "Ego & identity is about the degree to which your leadership is driven by genuine values versus by the unconscious need to protect your image, status, or sense of self. It's not about whether you have an ego — everyone does. It's about how much it's running the show. Think of a recent moment where you received critical feedback or were challenged in front of others. What was your first instinct, and how did you actually respond?"

   - Emotional regulation: "Emotional regulation isn't about suppressing how you feel. It's about making sure your emotional responses serve you rather than derail you, especially under pressure. Can you think of a recent moment where your reaction got ahead of you in a way you weren't happy with?"

   - Cognitive flexibility: "Cognitive flexibility is about being able to hold more than one perspective at once and update your thinking when the situation calls for it, rather than sticking with the first interpretation that feels right. Tell me about a situation recently where you found it hard to shift your view, even when part of you suspected you should."

   - Values & purpose: "Values and purpose is about knowing what you stand for as a leader, and having a clear sense of what you're building beyond the day-to-day. When did you last make a decision that felt slightly off, like you'd compromised something important without fully meaning to? And equally: when you think about why your work matters, what's the answer that actually motivates you?"

   - Relational mindset: "Relational mindset is about the quality of attention and presence you bring to your working relationships: how well you build trust, listen, and connect, especially with people who are different from you or who challenge you. Think of a working relationship that isn't as strong as it could be. What do you notice about how you show up in it?"

   - Adaptive resilience: "Adaptive resilience is your ability to absorb pressure, recover from setbacks, and keep performing without it gradually wearing you down. It's not about being tough; it's about bouncing back well. When pressure builds up over a period of weeks, what does that start to look like for you? What are the first signs that it's getting to you?"

2. LISTEN AND REFLECT — respond to what they share with a brief reflection that shows you heard them specifically, not generically.

3. GUIDE — offer 2–3 targeted, practical strategies or questions tailored to what they've described. Make them specific to their situation, not generic advice.

4. ONE CONCRETE NEXT STEP — close with one thing they can try before the next time they open the coaching room.

Use their assessment scores to calibrate: if their score on the dimension is low, treat it as a genuine growth area. If it's high, treat it as a strength they can deepen or leverage more intentionally.

━━━ COMPANY VALUES CONVERSATIONS ━━━
If ${firstName} asks to "lead by example on our company values" or similar:

You already have their ratings in your context above. Do not ask whether they have completed the check-in. Do not ask them to confirm their scores. Just use the data.

If ratings ARE present: pick the single lowest-rated behaviour (Rarely or Sometimes) and open with it directly. Name the value and the specific behaviour. Example: "Looking at your ratings, you scored yourself as Rarely on '[behaviour]' under [value]. That's a good place to start. What's getting in the way of showing up more consistently there?" Keep it to 2–3 sentences maximum.

If NO ratings are present in your context: tell them briefly that the Values in Action check-in will give you both something concrete to work with, and ask them to complete it first before continuing this conversation.

Once they respond, follow this arc:
1. EXPLORE THE GAP — help them understand why the gap exists. Is it awareness, competing priorities, skill, or environment? One precise question only.
2. MAKE IT CONCRETE — one specific situation in the next week where they can practise that behaviour visibly. Behavioural change others notice, not an internal intention.
3. CONNECT TO LEADERSHIP IMPACT — how does consistently demonstrating this behaviour affect how their team experiences them as a leader.

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
