import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? '' })

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

// Returns dim IDs ordered weakest first based on assessment scores
function getDimOrder(scores: (number | null)[]): number[] {
  return scores
    .map((s, i) => ({ s: s ?? 999, id: i + 1 }))
    .sort((a, b) => a.s - b.s)
    .map(d => d.id)
}

// Card 1-4 = weakest dim, 5-8 = 2nd weakest, etc.
function getDimForCard(cardNumber: number, dimOrder: number[]): number {
  return dimOrder[Math.floor((cardNumber - 1) / 4)]
}

// Which card within the dimension (1-4)
function getCardVariant(cardNumber: number): number {
  return ((cardNumber - 1) % 4) + 1
}

async function generateCardContent(
  dimId: number,
  cardVariant: number,
  dimScore: number,
  role: string
): Promise<{ title: string; teaser: string; reflection: string | null; exercise: string; insight: string }> {
  const dimName = DIMENSION_NAMES[dimId]

  const prompt = `You are a world-class executive coach generating a daily practice card for the MQ (Mindset Quotient) leadership development programme.

Dimension: ${dimName}
Card variant: ${cardVariant} of 4 (each card must be COMPLETELY different — different angle, different exercise)
Leadership role: ${role}
Dimension score: ${dimScore}/100 (lower score = bigger development opportunity)

Generate a JSON object with EXACTLY these keys:

"title": A ritual-style name for this practice (3-6 words). Think: "The Values Audit", "Name the Pattern", "The Perspective Ladder". Evocative, memorable, coach-like.

"teaser": One punchy sentence preview (max 10 words). Start with an action verb. E.g. "Uncover the values quietly running your decisions."

"insight": A genuinely surprising, specific psychological or leadership insight about this dimension. NOT generic. Reference real research, cognitive patterns, or counterintuitive truths. (2-3 sentences). E.g. for Values clarity: "Research shows most leaders can name their values but fewer than 30% can describe how those values show up in their actual decisions. The gap between stated values and enacted values is the single biggest source of leadership inconsistency."

"exercise": A specific, structured exercise achievable in under 10 minutes. Be CONCRETE — give exact steps, lists to write, questions to answer. E.g. "Write down your top 5 values as a leader. Now look at your calendar or decisions from the last 3 days. Next to each value, mark: ✓ (it showed up), ✗ (it was missing), or ? (you're not sure). Where are the gaps?" This should feel like real coaching work — not vague journaling prompts.

Tone: Premium, direct, expert. Like a top executive coach who respects the reader's intelligence.
Return ONLY valid JSON. No markdown, no extra text.`

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
  const parsed = JSON.parse(text.trim())
  return {
    title:      parsed.title    ?? `${dimName} Practice ${cardVariant}`,
    teaser:     parsed.teaser   ?? 'A practice to develop your leadership mindset.',
    reflection: null,
    exercise:   parsed.exercise ?? 'Take 5 minutes to complete this practice today.',
    insight:    parsed.insight  ?? `${dimName} is one of the most powerful predictors of effective leadership.`,
  }
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const participantId = user.id
  const today = new Date().toISOString().split('T')[0]

  // Load assessment to determine dim order
  const { data: assessments } = await supabaseAdmin
    .from('assessments')
    .select('d1_score, d2_score, d3_score, d4_score, d5_score, d6_score, participant_role, overall_score')
    .eq('participant_id', participantId)
    .not('overall_score', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(1)

  const assessment = assessments?.[0]
  if (!assessment) {
    return NextResponse.json({ noAssessment: true })
  }

  const scores = [
    assessment.d1_score, assessment.d2_score, assessment.d3_score,
    assessment.d4_score, assessment.d5_score, assessment.d6_score,
  ]
  const dimOrder = getDimOrder(scores)
  const role = assessment.participant_role ?? 'leader'

  // Load all sparks for this participant
  const { data: sparks } = await supabaseAdmin
    .from('daily_sparks')
    .select('*')
    .eq('participant_id', participantId)
    .order('card_number', { ascending: true })

  const allSparks = sparks ?? []
  const completedSparks = allSparks.filter(s => s.status === 'complete')
  const totalCompleted = completedSparks.length

  // Find current active card available today
  let currentCard = allSparks.find(
    s => s.status === 'active' && s.assigned_date <= today
  ) ?? null

  // If no current card, should we create the next one?
  if (!currentCard) {
    const nextCardNumber = allSparks.length + 1

    if (nextCardNumber <= 24) {
      const lastCompleted = completedSparks[completedSparks.length - 1]

      // Create first card always, or next card if last was completed on a previous day
      const shouldCreate = !lastCompleted || lastCompleted.completed_date < today

      if (shouldCreate) {
        const dimId = getDimForCard(nextCardNumber, dimOrder)
        const cardVariant = getCardVariant(nextCardNumber)
        const dimScore = (scores[dimId - 1] ?? 50) as number

        // Generate content
        let content: { title: string; teaser: string; reflection: string | null; exercise: string; insight: string } = { title: '', teaser: '', reflection: null, exercise: '', insight: '' }
        try {
          content = await generateCardContent(dimId, cardVariant, dimScore, role)
        } catch (err) {
          console.error('Content generation failed:', err)
          content = {
            title:      `${DIMENSION_NAMES[dimId]} — Practice ${cardVariant}`,
            teaser:     'A practice to strengthen your leadership mindset.',
            reflection: null,
            exercise:   `Today, choose one moment to consciously practise ${DIMENSION_NAMES[dimId].toLowerCase()}. Write down one specific situation where you could apply this and what you would do differently.`,
            insight:    `${DIMENSION_NAMES[dimId]} is one of the most powerful predictors of effective leadership. Small daily practices create lasting change.`,
          }
        }

        const { data: newCard } = await supabaseAdmin
          .from('daily_sparks')
          .insert({
            participant_id: participantId,
            card_number:    nextCardNumber,
            dimension_id:   dimId,
            assigned_date:  today,
            status:         'active',
            ...content,
          })
          .select()
          .single()

        currentCard = newCard
      }
    }
  }

  return NextResponse.json({
    currentCard,
    completedSparks,
    totalCompleted,
    dimOrder,
  })
}
