import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { FEEDBACK_DIMENSIONS, ratingToScore } from '@/lib/feedback/dimensions'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── GET — fetch survey data by token (no auth required) ──────────────────────

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 })

  const { data: request } = await supabaseAdmin
    .from('feedback_requests')
    .select('id, participant_id, status, respondent_name')
    .eq('token', token)
    .single()

  if (!request) return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
  if (request.status === 'completed') return NextResponse.json({ alreadySubmitted: true })

  // Get participant first name
  const { data: profile } = await supabaseAdmin
    .from('profiles').select('full_name').eq('id', request.participant_id).single()
  const firstName = profile?.full_name?.split(' ')[0] ?? 'this person'

  // Get company values if configured
  const { data: profData } = await supabaseAdmin
    .from('profiles').select('company_id').eq('id', request.participant_id).single()

  let companyValues: { id: string; value_name: string; behaviours: string[] }[] = []
  if (profData?.company_id) {
    const { data: valueRows } = await supabaseAdmin
      .from('company_value_behaviours')
      .select('id, value_name, behaviours')
      .eq('company_id', profData.company_id)
      .order('value_order')
    companyValues = (valueRows ?? []) as typeof companyValues
  }

  return NextResponse.json({
    requestId:     request.id,
    participantId: request.participant_id,
    firstName,
    respondentName: request.respondent_name,
    dimensions:    FEEDBACK_DIMENSIONS,
    companyValues,
  })
}

// ── POST — submit a survey response (no auth required) ───────────────────────

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    token:          string
    ratings:        Record<string, number>   // e.g. { "d1_s0": 3, "d1_s1": 2, ... }
    valuesRatings:  Record<string, number>   // e.g. { "Integrity": 3 }
    comment:        string
  }

  const { token, ratings, valuesRatings, comment } = body
  if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 })

  const { data: request } = await supabaseAdmin
    .from('feedback_requests')
    .select('id, participant_id, status')
    .eq('token', token)
    .single()

  if (!request) return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
  if (request.status === 'completed') return NextResponse.json({ alreadySubmitted: true })

  // Compute per-dimension 0–100 scores from raw statement ratings
  const dimScores: Record<string, number | null> = {}
  for (const dim of FEEDBACK_DIMENSIONS) {
    const stmtRatings = dim.statements.map((_, si) => ratings[`d${dim.id}_s${si}`]).filter(Boolean) as number[]
    if (stmtRatings.length === 0) { dimScores[`d${dim.id}_score`] = null; continue }
    const avg = stmtRatings.reduce((a, b) => a + b, 0) / stmtRatings.length
    dimScores[`d${dim.id}_score`] = ratingToScore(avg)
  }

  // Insert response
  const { error: insertErr } = await supabaseAdmin.from('feedback_responses').insert({
    request_id:     request.id,
    participant_id: request.participant_id,
    d1_score:       dimScores['d1_score'],
    d2_score:       dimScores['d2_score'],
    d3_score:       dimScores['d3_score'],
    d4_score:       dimScores['d4_score'],
    d5_score:       dimScores['d5_score'],
    d6_score:       dimScores['d6_score'],
    d7_score:       dimScores['d7_score'],
    values_ratings: Object.keys(valuesRatings ?? {}).length > 0 ? valuesRatings : null,
    comment:        comment?.trim() || null,
  })

  if (insertErr) {
    console.error('[feedback/survey] insert error:', insertErr)
    return NextResponse.json({ error: 'Failed to save response' }, { status: 500 })
  }

  // Mark request as completed
  await supabaseAdmin
    .from('feedback_requests')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', request.id)

  return NextResponse.json({ success: true })
}
