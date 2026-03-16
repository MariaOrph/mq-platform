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

function getDimOrder(scores: (number | null)[]): number[] {
  return scores
    .map((s, i) => ({ s: s ?? 999, id: i + 1 }))
    .sort((a, b) => a.s - b.s)
    .map(d => d.id)
}

function getDimForCard(cardNumber: number, dimOrder: number[]): number {
  return dimOrder[Math.floor((cardNumber - 1) / 4)]
}

function getCardVariant(cardNumber: number): number {
  return ((cardNumber - 1) % 4) + 1
}

async function generateCardContent(
  dimId: number,
  cardVariant: number,
  dimScore: number,
  role: string
) {
  const dimName = DIMENSION_NAMES[dimId]
  const prompt = `You are generating a daily practice card for the MQ (Mindset Quotient) leadership coaching programme.

Dimension: ${dimName}
Card variant: ${cardVariant} of 4 for this dimension (make each card distinctly different)
Leadership role: ${role}
Dimension score: ${dimScore}/100

Generate a JSON object with keys: "title", "teaser", "reflection", "exercise", "insight".
- title: A compelling practice name (3-6 words)
- teaser: One punchy sentence (max 10 words), start with action verb
- reflection: A thought-provoking question (2-3 sentences)
- exercise: A concrete activity for today, under 10 minutes (2-3 sentences)
- insight: A surprising insight about why this matters for leadership (2 sentences)

Return ONLY valid JSON.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
    const parsed = JSON.parse(text.trim())
    return {
      title:      parsed.title      ?? `${dimName} Practice ${cardVariant}`,
      teaser:     parsed.teaser     ?? 'A practice to develop your leadership mindset.',
      reflection: parsed.reflection ?? `Reflect on your ${dimName.toLowerCase()} today.`,
      exercise:   parsed.exercise   ?? 'Take 5 minutes to practise this today.',
      insight:    parsed.insight    ?? `${dimName} is key to effective leadership.`,
    }
  } catch {
    return {
      title:      `${dimName} — Practice ${cardVariant}`,
      teaser:     'A practice to strengthen your leadership mindset.',
      reflection: `Think about a recent situation where your ${dimName.toLowerCase()} was tested.`,
      exercise:   `Today, choose one moment to consciously practise ${dimName.toLowerCase()}.`,
      insight:    `${dimName} is one of the most powerful predictors of effective leadership.`,
    }
  }
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const participantId = user.id
  const { cardId } = await req.json()

  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

  // Mark current card complete
  const { data: completed } = await supabaseAdmin
    .from('daily_sparks')
    .update({ status: 'complete', completed_date: today })
    .eq('id', cardId)
    .eq('participant_id', participantId)
    .select()
    .single()

  if (!completed) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 })
  }

  const totalCompleted = completed.card_number
  const isMilestone = [4, 8, 12, 16, 20, 24].includes(totalCompleted)
  const isComplete = totalCompleted === 24

  // Pre-generate the next card (if not finished)
  if (!isComplete) {
    const nextCardNumber = completed.card_number + 1

    // Get assessment for dim ordering
    const { data: assessments } = await supabaseAdmin
      .from('assessments')
      .select('d1_score, d2_score, d3_score, d4_score, d5_score, d6_score, participant_role')
      .eq('participant_id', participantId)
      .not('overall_score', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(1)

    const assessment = assessments?.[0]
    if (assessment) {
      const scores = [
        assessment.d1_score, assessment.d2_score, assessment.d3_score,
        assessment.d4_score, assessment.d5_score, assessment.d6_score,
      ]
      const dimOrder = getDimOrder(scores)
      const dimId = getDimForCard(nextCardNumber, dimOrder)
      const cardVariant = getCardVariant(nextCardNumber)
      const dimScore = (scores[dimId - 1] ?? 50) as number
      const role = assessment.participant_role ?? 'leader'

      const content = await generateCardContent(dimId, cardVariant, dimScore, role)

      await supabaseAdmin
        .from('daily_sparks')
        .insert({
          participant_id: participantId,
          card_number:    nextCardNumber,
          dimension_id:   dimId,
          assigned_date:  tomorrow,
          status:         'active',
          ...content,
        })
        .select()
        .single()
    }
  }

  return NextResponse.json({ success: true, totalCompleted, isMilestone, isComplete })
}
