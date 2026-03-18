import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import {
  CARD_LIBRARY, getDimOrder, getDimForCard, getCardVariant,
  isValuesCard, getValuesSlotIndex, TOTAL_CARDS_BASE, TOTAL_CARDS_WITH_VALUES,
} from '../card-library'

const anthropic     = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? '' })
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type CompanyValue = { id: string; value_name: string; value_order: number; behaviours: string[] }

// ── AI generation for values cards ────────────────────────────────────────────

async function generateValuesCard(
  valueName: string,
  behaviours: string[],
): Promise<{ title: string; teaser: string; insight: string; exercise: string }> {
  const behavioursText = behaviours.map((b, i) => `${i + 1}. ${b}`).join('\n')
  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `You are writing a Daily Spark card for a leadership development platform. This card explores a company value called "${valueName}".

The specific behaviours associated with this value are:
${behavioursText}

Write a Daily Spark card with these four fields:
- title: A short, punchy title (5–8 words). Should feel like a challenge or invitation.
- teaser: One sentence (max 15 words) that hooks the leader into reading more.
- insight: 2–3 sentences on why this value matters in leadership. Grounded and specific — avoid generic platitudes.
- exercise: A practical reflection or micro-challenge tied directly to this value and its behaviours. 3–6 sentences. Specific enough to act on today.

Return ONLY a valid JSON object with keys: title, teaser, insight, exercise. No markdown, no explanation.`,
      }],
    })
    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '{}'
    return JSON.parse(text)
  } catch {
    return {
      title:    `Living ${valueName}`,
      teaser:   `What does ${valueName} really look like in action today?`,
      insight:  `${valueName} is more than a wall poster — it shows up in every decision, conversation, and moment of pressure. Leaders who consciously embody their company's values set the standard for what is normal on their teams.`,
      exercise: `Think of one moment in the past week where ${valueName} was either clearly demonstrated or clearly missing in your own behaviour. What happened, and what would it look like to fully embody this value in your next interaction with your team?`,
    }
  }
}

// ── Milestone sets ─────────────────────────────────────────────────────────────

const MILESTONES_28 = new Set([4, 8, 12, 16, 20, 24, 28])
const MILESTONES_34 = new Set([5, 10, 15, 20, 25, 30, 34])

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const participantId = user.id
  const { cardId }    = await req.json()

  const today    = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

  const { data: completed } = await supabaseAdmin
    .from('daily_sparks')
    .update({ status: 'complete', completed_date: today })
    .eq('id', cardId)
    .eq('participant_id', participantId)
    .select()
    .single()

  if (!completed) return NextResponse.json({ error: 'Card not found' }, { status: 404 })

  // Company values — determines totalCards and provides content for next values card
  let companyValues: CompanyValue[] = []
  const { data: profile } = await supabaseAdmin
    .from('profiles').select('company_id').eq('id', participantId).single()

  if (profile?.company_id) {
    const { data: values } = await supabaseAdmin
      .from('company_value_behaviours')
      .select('id, value_name, value_order, behaviours')
      .eq('company_id', profile.company_id)
      .order('value_order')
    companyValues = (values ?? []).map(v => ({ ...v, behaviours: v.behaviours as string[] }))
  }

  const totalCards     = companyValues.length > 0 ? TOTAL_CARDS_WITH_VALUES : TOTAL_CARDS_BASE
  const milestoneSet   = totalCards === TOTAL_CARDS_WITH_VALUES ? MILESTONES_34 : MILESTONES_28

  const totalCompleted = completed.card_number
  const isMilestone    = milestoneSet.has(totalCompleted)
  const isComplete     = totalCompleted === totalCards

  if (!isComplete) {
    const nextCardNumber = completed.card_number + 1

    const { data: assessments } = await supabaseAdmin
      .from('assessments')
      .select('d1_score, d2_score, d3_score, d4_score, d5_score, d6_score, d7_score')
      .eq('participant_id', participantId)
      .not('overall_score', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(1)

    const assessment = assessments?.[0]
    if (assessment) {
      const scores  = [
        assessment.d1_score, assessment.d2_score, assessment.d3_score,
        assessment.d4_score, assessment.d5_score, assessment.d6_score,
        assessment.d7_score,
      ]
      const dimOrder = getDimOrder(scores)

      if (isValuesCard(nextCardNumber) && companyValues.length > 0) {
        // ── Values card — AI-generated ───────────────────────────────────
        const slotIndex = getValuesSlotIndex(nextCardNumber)
        const value     = companyValues[slotIndex % companyValues.length]

        const content = await generateValuesCard(value.value_name, value.behaviours)
        await supabaseAdmin
          .from('daily_sparks')
          .insert({
            participant_id: participantId,
            card_number:    nextCardNumber,
            dimension_id:   null,
            assigned_date:  tomorrow,
            status:         'active',
            title:          content.title,
            teaser:         content.teaser,
            insight:        content.insight,
            exercise:       content.exercise,
            reflection:     value.value_name,
          })

      } else {
        // ── MQ card ──────────────────────────────────────────────────────
        const dimId       = getDimForCard(nextCardNumber, dimOrder)
        const cardVariant = getCardVariant(nextCardNumber)
        const content     = CARD_LIBRARY[dimId]?.[cardVariant]

        if (content) {
          await supabaseAdmin
            .from('daily_sparks')
            .insert({
              participant_id: participantId,
              card_number:    nextCardNumber,
              dimension_id:   dimId,
              assigned_date:  tomorrow,
              status:         'active',
              title:          content.title,
              teaser:         content.teaser,
              insight:        content.insight,
              exercise:       content.exercise,
              reflection:     null,
            })
        }
      }
    }
  }

  return NextResponse.json({ success: true, totalCompleted, isMilestone, isComplete, totalCards })
}
