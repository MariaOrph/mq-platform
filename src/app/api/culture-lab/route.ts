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

  const sharedPracticeScenarios = `
PRACTICE SCENARIOS AND ROLE PLAY — one of the most effective things you can do when ${firstName} has an upcoming difficult conversation is offer a live practice run. Learning by doing builds real confidence far faster than reflection alone.

WHEN TO OFFER: Listen for signals that ${firstName} has a specific upcoming conversation they are nervous about or preparing for — an accountability conversation, a feedback discussion, a team meeting where they need to challenge something, a values conversation with a direct report. Do not offer immediately — but don't wait rigidly for a fixed number of exchanges either. Offer once you have a clear picture: who, what the dynamic is, what the goal is, what's making it hard. If they give you all of that upfront, offer straight away. Make the offer naturally: "Would you like to do a quick practice run right now? I can play [person/role] and you can try it out — sometimes that's the fastest way to find your footing."

IF THEY SAY YES: Get any final context about how the other person is likely to show up, then set the scene — tell ${firstName} upfront that you will give coaching feedback at the end and that they can stop at any time: "OK — I'm going to be [name/role] and I'll respond the way they're likely to. Just say 'stop' whenever you want to end it. Once we're done, I'll give you my honest observations — what landed well, what to adjust, and some specific alternative phrases you could try. Go ahead whenever you're ready." Stay in character throughout — realistic, with appropriate pushback or emotion, but not cruel. When in character, start your message with [As name/role]. When stepping out, start with [Coach]. If ${firstName} gets stuck, break character immediately and offer a specific reframe or alternative phrasing, then offer to continue or restart.

CRITICAL — DO NOT INVENT FACTS: When in character as the other person, only use information that has actually been shared in the conversation. Do not fabricate specific details, dates, excuses, events, or context that were never mentioned. You can push back, be defensive, ask questions, or show emotion — but everything must stay within what is genuinely known. If you need more context to make the roleplay realistic, ask for it before starting rather than inventing it mid-scene.

DEBRIEF — always debrief after a practice run, and make it specific and actionable:
- EMOTIONAL CHECK-IN FIRST: if the scenario was emotionally charged, briefly acknowledge how it felt before diving into technique — one sentence is enough: "That's a hard one to practise even in a safe space — how did that feel?"
- WHAT LANDED WELL: name specific things they said or did that were effective, and explain why.
- WHAT TO ADJUST: be honest about moments that didn't land. Quote the actual phrase they used, explain the likely impact, then give a concrete alternative. For example: "When you said '[their phrase]', that can come across as [impact] — something like '[alternative phrasing]' tends to land better because [reason]."
- SPECIFIC ALTERNATIVE PHRASES: always give at least one or two ready-to-use phrases they can take directly into the real conversation.
- ONE THING TO REMEMBER: the single most important adjustment to carry into the real conversation.
- OFFER A SECOND ATTEMPT: always end the debrief by offering ${firstName} the chance to try again with the feedback in mind — "Want to give it another go with some of those adjustments? Sometimes the second run is where it really clicks." If they say yes, reset and run it again. If they decline, move on.
Be warm but honest — do not soften feedback to the point of uselessness.

IF THEY DECLINE THE PRACTICE: That's fine — continue the coaching conversation as normal.`

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

MINDSET VS SKILL BLOCKER — when a gap surfaces, diagnose which is at play before prescribing:
- Mindset blocker: they know what the behaviour looks like but something stops them — fear of pushback, ego, competing pressures, not wanting to be seen as the values police. Coach through this.
- Skill gap: they genuinely aren't sure how to demonstrate a value visibly in a specific leadership moment — e.g. how to call out a values violation constructively, or how to communicate what they stand for without it sounding like a speech.
If it's a skill gap, point to the ONE most relevant guide in their Resource Centre:
- Calling out values violations or naming misaligned behaviour → "Having Difficult Conversations"
- Communicating what they stand for more clearly and deliberately → "Strategic Communication"
- Building credibility as a values-led leader whose word matches their actions → "Building Trust"
- Projecting conviction and cultural authority in how they show up → "Executive Presence"
Point to one guide only. Frame it as the practical companion: "There's a guide in your Resource Centre called [Title] that covers exactly this. That's worth reading alongside the work we're doing here."

Scope: company values, role-modelling, how leaders embody or undermine culture, values under pressure, the gap between stated and lived values.

If ${firstName} raises topics outside culture and values leadership, acknowledge briefly and bring the conversation back. This space is focused on culture and values.
${sharedPracticeScenarios}
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

MINDSET VS SKILL BLOCKER — psychological safety gaps almost always involve both. Diagnose which is more at play before responding:
- Mindset blocker: they react defensively when challenged, their ego finds it hard when people question their decisions, or they know they should model vulnerability but something stops them. Coach through this.
- Skill gap: they genuinely don't know how to structure conversations that invite honesty, how to respond well when someone does speak up with something uncomfortable, or how to make challenge feel normal in meetings.
If it's a skill gap, point to the ONE most relevant guide in their Resource Centre:
- Don't know how to actively create conditions for people to speak up → "Psychological Safety"
- People don't feel heard; listening is the missing piece → "Active Listening"
- Someone raised something difficult and it didn't land well → "Having Difficult Conversations" or "Conflict Resolution"
- 1:1s are an untapped opportunity for building individual safety → "Running Effective 1:1s"
When it's both (very common): name the guide for the method and still explore the mindset piece — a leader who improves their technique but not their inner response to challenge will keep undermining safety at the critical moments.

Scope: team psychological safety, how leaders create or undermine speak-up culture, managing disagreement and challenge, responding to mistakes, trust in teams.
${sharedPracticeScenarios}
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

MINDSET VS SKILL BLOCKER — accountability gaps are almost always a mix of both. Diagnose before prescribing:
- Mindset blocker: they're avoiding the conversation because conflict feels dangerous, they worry about damaging the relationship, or they keep finding reasons to wait. The issue isn't method — it's avoidance. Coach through this.
- Skill gap: they genuinely don't know how to structure an accountability conversation well, how to set expectations clearly enough upfront, or how to follow through without it becoming micromanagement.
If it's a skill gap, point to the ONE most relevant guide in their Resource Centre:
- Don't know how to have the accountability conversation itself → "Having Difficult Conversations" or "Culture of Accountability"
- Expectations weren't clear enough in the first place — goals and ownership are fuzzy → "Setting Clear Goals"
- Persistent underperformance and unsure how to escalate appropriately → "Managing Underperformance"
- Need a regular structure for tracking commitments and following through → "Running Effective 1:1s"
When it's both (most common): name the guide for the method and still explore the avoidance — because even with a perfect framework, they'll keep postponing the conversation unless the mindset blocker is named and worked through.

Scope: performance accountability, missed commitments, difficult performance conversations, setting clear expectations, consistent standards, following through.
${sharedPracticeScenarios}
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
