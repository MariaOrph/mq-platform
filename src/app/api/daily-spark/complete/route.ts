import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { CARD_LIBRARY, getDimOrder, getDimForCard, getCardVariant } from '../card-library'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const participantId = user.id
  const { cardId } = await req.json()

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

  const totalCompleted = completed.card_number
  const isMilestone    = [4, 8, 12, 16, 20, 24].includes(totalCompleted)
  const isComplete     = totalCompleted === 24

  if (!isComplete) {
    const nextCardNumber = completed.card_number + 1

    const { data: assessments } = await supabaseAdmin
      .from('assessments')
      .select('d1_score, d2_score, d3_score, d4_score, d5_score, d6_score')
      .eq('participant_id', participantId)
      .not('overall_score', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(1)

    const assessment = assessments?.[0]
    if (assessment) {
      const scores  = [assessment.d1_score, assessment.d2_score, assessment.d3_score, assessment.d4_score, assessment.d5_score, assessment.d6_score]
      const dimOrder   = getDimOrder(scores)
      const dimId      = getDimForCard(nextCardNumber, dimOrder)
      const cardVariant = getCardVariant(nextCardNumber)
      const content    = CARD_LIBRARY[dimId]?.[cardVariant]

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

  return NextResponse.json({ success: true, totalCompleted, isMilestone, isComplete })
}
