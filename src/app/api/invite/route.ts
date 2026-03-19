import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { inviteEmailHtml, inviteEmailText } from '@/lib/email/templates'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY!
const appUrl       = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { cohortId, emails, role, companyId } = body as {
    cohortId:  string
    emails:    string[]
    role:      string
    companyId: string
  }

  if (!cohortId || !Array.isArray(emails) || emails.length === 0) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!serviceKey) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY is not set' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // ── Look up cohort + company name for email ────────────────────────────────
  const { data: cohortData } = await supabase
    .from('cohorts')
    .select('name, companies(name)')
    .eq('id', cohortId)
    .single()

  const cohortName  = cohortData?.name ?? 'your cohort'
  const companyName = (cohortData?.companies as { name?: string } | null)?.name ?? 'your organisation'

  // ── Resend client (optional — falls back gracefully if not configured) ─────
  const resendKey = process.env.RESEND_API_KEY
  const resend    = resendKey && !resendKey.startsWith('re_your_') ? new Resend(resendKey) : null
  const fromAddr  = process.env.RESEND_FROM ?? 'MQ <hello@mindsetquo.com>'

  let invited = 0
  const errors: string[] = []

  for (const email of emails) {
    // ── Generate invite link (creates user, returns URL, no email sent) ───────
    // Note: we do NOT skip already-invited emails — re-submitting is intentional resend.
    let inviteUrl = `${appUrl}/auth/invite`

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type:  'invite',
      email,
      options: {
        data: {
          role:       role ?? 'participant',
          company_id: companyId || null,   // treat empty string as null (avoids ::uuid cast error in trigger)
        },
        redirectTo: `${appUrl}/auth/invite`,
      },
    })

    if (linkError) {
      // User already exists — generate a magic link for sign-in instead.
      // Must point to a CLIENT-SIDE page (/auth/invite) because Supabase magic
      // links use the hash/implicit flow: the tokens land in #access_token=...
      // which is invisible to server-side route handlers like /auth/callback.
      const { data: magicData, error: magicError } = await supabase.auth.admin.generateLink({
        type:  'magiclink',
        email,
        options: { redirectTo: `${appUrl}/auth/invite` },
      })
      if (magicError) {
        errors.push(`${email}: ${magicError.message}`)
        continue
      }
      inviteUrl = magicData?.properties?.action_link ?? inviteUrl
    } else {
      inviteUrl = linkData?.properties?.action_link ?? inviteUrl
    }

    // ── Look up first name if profile exists ──────────────────────────────────
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('email', email)
      .maybeSingle()

    const firstName = profileData?.full_name?.split(' ')[0] ?? null

    // ── Send via Resend ───────────────────────────────────────────────────────
    if (resend) {
      await resend.emails.send({
        from:    fromAddr,
        to:      email,
        subject: "You've been invited to your MQ journey",
        html:    inviteEmailHtml({ firstName, cohortName, companyName, inviteUrl }),
        text:    inviteEmailText({ firstName, cohortName, companyName, inviteUrl }),
      })
    } else {
      // Fallback: use Supabase's built-in email (development only)
      console.warn('[invite] Resend not configured — invite link:', inviteUrl)
    }

    // ── Add to cohort_participants ────────────────────────────────────────────
    const { error: cpError } = await supabase
      .from('cohort_participants')
      .upsert({
        cohort_id:  cohortId,
        email,
        invited_at: new Date().toISOString(),
      }, { onConflict: 'cohort_id,email', ignoreDuplicates: false })

    if (cpError) {
      errors.push(`${email} (cohort insert): ${cpError.message}`)
    } else {
      invited++
    }
  }

  return NextResponse.json({ invited, errors })
}
