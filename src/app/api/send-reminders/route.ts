import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { reminderEmailHtml, reminderEmailText, reminderSubjectLine } from '@/lib/email/templates'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const DIMENSION_NAMES: Record<number, string> = {
  1: 'Self-awareness',
  2: 'Ego management',
  3: 'Emotional regulation',
  4: 'Clarity & communication',
  5: 'Trust & development',
  6: 'Standards & accountability',
  7: 'Relational intelligence',
}

function getFocusDimension(scores: (number | null)[]): number {
  const valid = scores.map((s, i) => ({ s: s ?? 999, i }))
  valid.sort((a, b) => a.s - b.s)
  return valid[0].i + 1
}

// ── Route ─────────────────────────────────────────────────────────────────────
// Called by Vercel cron at 8am UTC daily.
// Protected by a shared secret so only the cron job can trigger it.

export async function GET(req: NextRequest) {
  // ── Authorise cron call ───────────────────────────────────────────────────
  // CRON_SECRET is MANDATORY in production — without it, anyone on the
  // internet could trigger this endpoint and spam emails.
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error('[send-reminders] CRON_SECRET is not configured — refusing to run')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey || resendKey.startsWith('re_your_')) {
    return NextResponse.json({ error: 'Resend not configured' }, { status: 500 })
  }

  const resend   = new Resend(resendKey)
  const fromAddr = process.env.RESEND_FROM ?? 'MQ <hello@mindsetquo.com>'
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? 'https://mindsetquo.com'
  const today    = new Date().toISOString().split('T')[0]

  // ── Find all participants in Active cohorts ───────────────────────────────
  const { data: cohortParticipants, error: cpError } = await supabaseAdmin
    .from('cohort_participants')
    .select(`
      participant_id,
      cohorts!inner(status)
    `)
    .not('participant_id', 'is', null)
    .eq('cohorts.status', 'Active')

  if (cpError || !cohortParticipants) {
    console.error('[send-reminders] cohort query error:', cpError)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  // Deduplicate participant IDs (a participant may be in multiple cohorts)
  const participantIds = [...new Set(
    cohortParticipants.map(r => r.participant_id).filter(Boolean)
  )] as string[]

  if (participantIds.length === 0) {
    return NextResponse.json({ sent: 0, skipped: 0, message: 'No active participants' })
  }

  // ── Find who has already completed today's session ────────────────────────
  const { data: completedToday } = await supabaseAdmin
    .from('coaching_sessions')
    .select('participant_id')
    .eq('session_date', today)
    .eq('status', 'complete')
    .in('participant_id', participantIds)

  const completedIds = new Set((completedToday ?? []).map(r => r.participant_id))

  // Filter out those who are done
  const toRemind = participantIds.filter(id => !completedIds.has(id))

  if (toRemind.length === 0) {
    return NextResponse.json({ sent: 0, skipped: participantIds.length, message: 'All done today' })
  }

  // ── Load profiles (email, name, unsubscribed flag, unsubscribe token) ─────
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name, coaching_reminders_unsubscribed, unsubscribe_token')
    .in('id', toRemind)

  // ── Load latest assessment per participant ────────────────────────────────
  const { data: allAssessments } = await supabaseAdmin
    .from('assessments')
    .select('participant_id, d1_score, d2_score, d3_score, d4_score, d5_score, d6_score, d7_score, completed_at')
    .in('participant_id', toRemind)
    .not('overall_score', 'is', null)
    .order('completed_at', { ascending: false })

  type AssessmentRow = { participant_id: string; d1_score: number | null; d2_score: number | null; d3_score: number | null; d4_score: number | null; d5_score: number | null; d6_score: number | null; d7_score: number | null; completed_at: string }
  // Map to latest assessment per participant
  const latestAssessment: Record<string, AssessmentRow> = {}
  for (const a of allAssessments ?? []) {
    if (!latestAssessment[a.participant_id]) {
      latestAssessment[a.participant_id] = a
    }
  }

  // ── Send emails ───────────────────────────────────────────────────────────
  let sent    = 0
  let skipped = 0
  // Seed for rotating subject lines — use today's date as seed
  const daySeed = new Date().getDate()

  for (const profile of profiles ?? []) {
    if (profile.coaching_reminders_unsubscribed) {
      skipped++
      continue
    }

    const assessment   = latestAssessment[profile.id]
    if (!assessment) { skipped++; continue } // No assessment = no coaching session to remind about

    const scores       = [assessment.d1_score, assessment.d2_score, assessment.d3_score,
                          assessment.d4_score, assessment.d5_score, assessment.d6_score,
                          assessment.d7_score]
    const focusId      = getFocusDimension(scores)
    const dimName      = DIMENSION_NAMES[focusId]
    const firstName    = profile.full_name?.split(' ')[0] ?? 'there'
    // Use unsubscribe_token (unguessable) instead of raw profile.id
    const unsubUrl     = `${appUrl}/unsubscribe?token=${profile.unsubscribe_token}`
    const dashboardUrl = `${appUrl}/dashboard`

    try {
      await resend.emails.send({
        from:    fromAddr,
        to:      profile.email,
        subject: reminderSubjectLine(firstName, daySeed + sent),
        html:    reminderEmailHtml({ firstName, dimensionName: dimName, dashboardUrl, unsubscribeUrl: unsubUrl }),
        text:    reminderEmailText({ firstName, dimensionName: dimName, dashboardUrl, unsubscribeUrl: unsubUrl }),
      })
      sent++
    } catch (err) {
      console.error('[send-reminders] failed for', profile.email, err)
      skipped++
    }
  }

  console.log(`[send-reminders] done — sent: ${sent}, skipped: ${skipped}`)
  return NextResponse.json({ sent, skipped, date: today })
}
