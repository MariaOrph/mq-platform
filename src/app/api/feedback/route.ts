import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { feedbackInviteHtml, feedbackInviteText } from '@/lib/email/templates'
import { FEEDBACK_DIMENSIONS, ratingToScore, aggregatePeerScores, MIN_RESPONSES_TO_SHOW } from '@/lib/feedback/dimensions'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const fromAddr = process.env.RESEND_FROM ?? 'MQ <hello@mindsetquo.com>'

// ── GET — fetch requests + results for the authenticated participant ───────────

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch all requests for this participant
  const { data: requests } = await supabaseAdmin
    .from('feedback_requests')
    .select('id, respondent_email, respondent_name, relationship, status, created_at, completed_at')
    .eq('participant_id', user.id)
    .order('created_at', { ascending: false })

  const totalSent      = requests?.length ?? 0
  const totalCompleted = requests?.filter(r => r.status === 'completed').length ?? 0

  // Only compute results if minimum threshold met
  if (totalCompleted < MIN_RESPONSES_TO_SHOW) {
    return NextResponse.json({ requests: requests ?? [], totalSent, totalCompleted, results: null })
  }

  // Fetch all responses for this participant
  const { data: responses } = await supabaseAdmin
    .from('feedback_responses')
    .select('d1_score, d2_score, d3_score, d4_score, d5_score, d6_score, d7_score, values_ratings, comment')
    .eq('participant_id', user.id)

  if (!responses || responses.length === 0) {
    return NextResponse.json({ requests: requests ?? [], totalSent, totalCompleted, results: null })
  }

  // Aggregate dimension scores
  const dimKeys = ['d1_score','d2_score','d3_score','d4_score','d5_score','d6_score','d7_score'] as const
  const peerDimScores = FEEDBACK_DIMENSIONS.map((_, i) => {
    const key    = dimKeys[i]
    const scores = responses.map(r => r[key] as number | null).filter((s): s is number => s !== null)
    return aggregatePeerScores(scores)
  })

  // Aggregate values ratings
  const valuesMap: Record<string, number[]> = {}
  for (const r of responses) {
    const vr = r.values_ratings as Record<string, number> | null
    if (!vr) continue
    for (const [k, v] of Object.entries(vr)) {
      if (!valuesMap[k]) valuesMap[k] = []
      valuesMap[k].push(v as number)
    }
  }
  const peerValuesScores: Record<string, number> = {}
  for (const [k, vals] of Object.entries(valuesMap)) {
    peerValuesScores[k] = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
  }

  // Collect comments (anonymous, pooled)
  const comments = responses
    .map(r => r.comment?.trim())
    .filter((c): c is string => !!c && c.length > 0)

  return NextResponse.json({
    requests:        requests ?? [],
    totalSent,
    totalCompleted,
    results: {
      peerDimScores,
      peerValuesScores,
      comments,
      responseCount: responses.length,
    },
  })
}

// ── POST — send feedback requests ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as {
    respondents: { email: string; name?: string; relationship?: string }[]
  }

  if (!Array.isArray(body.respondents) || body.respondents.length === 0) {
    return NextResponse.json({ error: 'No respondents provided' }, { status: 400 })
  }

  // Get participant first name for email
  const { data: profile } = await supabaseAdmin
    .from('profiles').select('full_name').eq('id', user.id).single()
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Someone'

  const resendKey = process.env.RESEND_API_KEY
  const resend    = resendKey && !resendKey.startsWith('re_your_') ? new Resend(resendKey) : null

  const sent: string[] = []
  const errors: string[] = []

  for (const r of body.respondents) {
    if (!r.email?.includes('@')) { errors.push(r.email); continue }

    // Insert request row
    const { data: requestRow, error: insertErr } = await supabaseAdmin
      .from('feedback_requests')
      .insert({
        participant_id:   user.id,
        respondent_email: r.email.trim().toLowerCase(),
        respondent_name:  r.name?.trim() || null,
        relationship:     r.relationship?.trim() || null,
      })
      .select('token')
      .single()

    if (insertErr || !requestRow) { errors.push(r.email); continue }

    const surveyUrl = `${appUrl}/feedback/${requestRow.token}`

    // Send email
    if (resend) {
      try {
        await resend.emails.send({
          from:    fromAddr,
          to:      r.email.trim().toLowerCase(),
          subject: `${firstName} has asked for your feedback`,
          html:    feedbackInviteHtml({ participantFirstName: firstName, respondentName: r.name ?? null, surveyUrl }),
          text:    feedbackInviteText({ participantFirstName: firstName, respondentName: r.name ?? null, surveyUrl }),
        })
      } catch (e) {
        console.error('[feedback] email send failed:', e)
      }
    }

    sent.push(r.email)
  }

  return NextResponse.json({ sent, errors })
}

// ── DELETE — remove a pending request ─────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await supabaseAdmin
    .from('feedback_requests')
    .delete()
    .eq('id', id)
    .eq('participant_id', user.id)
    .eq('status', 'pending')

  return NextResponse.json({ success: true })
}
