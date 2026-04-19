import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import {
  CARD_LIBRARY, getDimOrder, getDimForCard, getCardVariant,
  isValuesCard, getValuesSlotIndex, TOTAL_CARDS_BASE, TOTAL_CARDS_WITH_VALUES,
} from './card-library'

const anthropic     = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? '' })
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type CompanyValue = {
  id: string
  value_name: string
  value_order: number
  behaviours: string[]
  // Cached card content (null = not yet generated, generate on first use)
  spark_title?:    string | null
  spark_teaser?:   string | null
  spark_insight?:  string | null
  spark_exercise?: string | null
}

// ── AI generation for values cards (with company-level caching) ─────────────
//
// A values card is identical for every user at the same company, so we:
//   1. Check if cached in company_value_behaviours (spark_* columns)
//   2. If cached → return instantly, no AI call
//   3. If not cached → call AI once, save to DB, return
// This saves ~80-90% of Daily Spark AI costs in a multi-user cohort.

async function generateValuesCard(
  value: CompanyValue,
): Promise<{ title: string; teaser: string; insight: string; exercise: string }> {
  // Cache hit — return cached content, no AI call
  if (value.spark_title && value.spark_teaser && value.spark_insight && value.spark_exercise) {
    return {
      title:    value.spark_title,
      teaser:   value.spark_teaser,
      insight:  value.spark_insight,
      exercise: value.spark_exercise,
    }
  }

  // Cache miss — generate via AI and persist
  const behavioursText = value.behaviours.map((b, i) => `${i + 1}. ${b}`).join('\n')
  let content: { title: string; teaser: string; insight: string; exercise: string }
  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `You are writing a Daily Spark card for a leadership development platform. This card explores a company value called "${value.value_name}".

The specific behaviours associated with this value are:
${behavioursText}

Write a Daily Spark card with these four fields:
- title: A short, punchy title (5–8 words). Should feel like a challenge or invitation. Always put the value name in quotes within the title so it's clear it refers to a company value (e.g. "Living 'On It'" not "Living On It").
- teaser: One sentence (max 15 words) that hooks the leader into reading more.
- insight: 2–3 sentences on why this value matters in leadership. Grounded and specific — avoid generic platitudes.
- exercise: A practical reflection or micro-challenge tied directly to this value and its behaviours. 3–6 sentences. Specific enough to act on today.

Return ONLY a valid JSON object with keys: title, teaser, insight, exercise. No markdown, no explanation.`,
      }],
    })
    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '{}'
    content = JSON.parse(text)
  } catch {
    content = {
      title:    `Living '${value.value_name}' Today`,
      teaser:   `What does ${value.value_name} really look like in action today?`,
      insight:  `${value.value_name} is more than a wall poster — it shows up in every decision, conversation, and moment of pressure. Leaders who consciously embody their company's values set the standard for what is normal on their teams.`,
      exercise: `Think of one moment in the past week where ${value.value_name} was either clearly demonstrated or clearly missing in your own behaviour. What happened, and what would it look like to fully embody this value in your next interaction with your team?`,
    }
  }

  // Persist to cache for future users — fire and forget, don't block response on this
  supabaseAdmin
    .from('company_value_behaviours')
    .update({
      spark_title:    content.title,
      spark_teaser:   content.teaser,
      spark_insight:  content.insight,
      spark_exercise: content.exercise,
    })
    .eq('id', value.id)
    .then(({ error }) => {
      if (error) console.error('Failed to cache values card:', error)
    })

  return content
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const participantId = user.id
  const today = new Date().toISOString().split('T')[0]

  // Assessment scores
  const { data: assessments } = await supabaseAdmin
    .from('assessments')
    .select('d1_score, d2_score, d3_score, d4_score, d5_score, d6_score, d7_score, overall_score')
    .eq('participant_id', participantId)
    .not('overall_score', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(1)

  const assessment = assessments?.[0]
  if (!assessment) return NextResponse.json({ noAssessment: true })

  const scores = [
    assessment.d1_score, assessment.d2_score, assessment.d3_score,
    assessment.d4_score, assessment.d5_score, assessment.d6_score,
    assessment.d7_score,
  ]
  const dimOrder = getDimOrder(scores)

  // Company values (if any)
  let companyValues: CompanyValue[] = []
  const { data: profile } = await supabaseAdmin
    .from('profiles').select('company_id').eq('id', participantId).single()

  if (profile?.company_id) {
    const { data: values } = await supabaseAdmin
      .from('company_value_behaviours')
      .select('id, value_name, value_order, behaviours, spark_title, spark_teaser, spark_insight, spark_exercise')
      .eq('company_id', profile.company_id)
      .order('value_order')
    companyValues = (values ?? []).map(v => ({ ...v, behaviours: v.behaviours as string[] }))
  }

  const totalCards = companyValues.length > 0 ? TOTAL_CARDS_WITH_VALUES : TOTAL_CARDS_BASE

  // Existing sparks
  const { data: sparks } = await supabaseAdmin
    .from('daily_sparks')
    .select('*')
    .eq('participant_id', participantId)
    .order('card_number', { ascending: true })

  const allSparks      = sparks ?? []
  const completedSparks = allSparks.filter(s => s.status === 'complete')
  const totalCompleted  = completedSparks.length

  let currentCard = allSparks.find(
    s => s.status === 'active' && s.assigned_date <= today
  ) ?? null

  if (!currentCard) {
    const nextCardNumber = allSparks.length + 1

    if (nextCardNumber <= totalCards) {
      const lastCompleted  = completedSparks[completedSparks.length - 1]
      const shouldCreate   = !lastCompleted || lastCompleted.completed_date < today

      if (shouldCreate) {
        if (isValuesCard(nextCardNumber) && companyValues.length > 0) {
          // ── Values card — AI-generated ─────────────────────────────────
          const slotIndex = getValuesSlotIndex(nextCardNumber) // 0–5
          const value     = companyValues[slotIndex % companyValues.length]

          const content = await generateValuesCard(value)
          const { data: newCard } = await supabaseAdmin
            .from('daily_sparks')
            .insert({
              participant_id: participantId,
              card_number:    nextCardNumber,
              dimension_id:   null,              // null signals values card
              assigned_date:  today,
              status:         'active',
              title:          content.title,
              teaser:         content.teaser,
              insight:        content.insight,
              exercise:       content.exercise,
              reflection:     value.value_name,  // store value name for display
            })
            .select()
            .single()
          currentCard = newCard

        } else {
          // ── MQ card ────────────────────────────────────────────────────
          const dimId       = getDimForCard(nextCardNumber, dimOrder)
          const cardVariant = getCardVariant(nextCardNumber)
          const content     = CARD_LIBRARY[dimId]?.[cardVariant]

          if (content) {
            const { data: newCard } = await supabaseAdmin
              .from('daily_sparks')
              .insert({
                participant_id: participantId,
                card_number:    nextCardNumber,
                dimension_id:   dimId,
                assigned_date:  today,
                status:         'active',
                title:          content.title,
                teaser:         content.teaser,
                insight:        content.insight,
                exercise:       content.exercise,
                reflection:     null,
              })
              .select()
              .single()
            currentCard = newCard
          }
        }
      }
    }
  }

  return NextResponse.json({ currentCard, completedSparks, totalCompleted, dimOrder, totalCards })
}

// ── PATCH — save notes ────────────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { cardId, notes } = await req.json()
  if (!cardId) return NextResponse.json({ error: 'cardId required' }, { status: 400 })

  await supabaseAdmin
    .from('daily_sparks')
    .update({ notes })
    .eq('id', cardId)
    .eq('participant_id', user.id)

  return NextResponse.json({ success: true })
}
