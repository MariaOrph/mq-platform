import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { CARD_LIBRARY, getDimOrder, getDimForCard, getCardVariant } from './card-library'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const participantId = user.id
  const today = new Date().toISOString().split('T')[0]

  const { data: assessments } = await supabaseAdmin
    .from('assessments')
    .select('d1_score, d2_score, d3_score, d4_score, d5_score, d6_score, overall_score')
    .eq('participant_id', participantId)
    .not('overall_score', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(1)

  const assessment = assessments?.[0]
  if (!assessment) return NextResponse.json({ noAssessment: true })

  const scores = [
    assessment.d1_score, assessment.d2_score, assessment.d3_score,
    assessment.d4_score, assessment.d5_score, assessment.d6_score,
  ]
  const dimOrder = getDimOrder(scores)

  const { data: sparks } = await supabaseAdmin
    .from('daily_sparks')
    .select('*')
    .eq('participant_id', participantId)
    .order('card_number', { ascending: true })

  const allSparks = sparks ?? []
  const completedSparks = allSparks.filter(s => s.status === 'complete')
  const totalCompleted = completedSparks.length

  let currentCard = allSparks.find(
    s => s.status === 'active' && s.assigned_date <= today
  ) ?? null

  if (!currentCard) {
    const nextCardNumber = allSparks.length + 1

    if (nextCardNumber <= 24) {
      const lastCompleted = completedSparks[completedSparks.length - 1]
      const shouldCreate = !lastCompleted || lastCompleted.completed_date < today

      if (shouldCreate) {
        const dimId      = getDimForCard(nextCardNumber, dimOrder)
        const cardVariant = getCardVariant(nextCardNumber)
        const content    = CARD_LIBRARY[dimId]?.[cardVariant]

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

  return NextResponse.json({ currentCard, completedSparks, totalCompleted, dimOrder })
}
