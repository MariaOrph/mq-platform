import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import {
  generateUpcomingSlots,
  formatSlotDate,
  formatSlotTime,
  SLOT_DURATION_MINUTES,
} from '@/lib/bookings/slots'
import { buildBookingIcs } from '@/lib/bookings/ics'
import {
  bookingConfirmationHtml,
  bookingNotificationHtml,
} from '@/lib/email/booking-templates'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!
const appUrl      = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.mindsetquo.com'

// Internal recipients for booking notifications.
const NOTIFY_EMAILS = ['maria@mindsetquo.com', 'richard@mindsetquo.com']

interface BookingPayload {
  slot:     string  // ISO UTC
  name:     string
  email:    string
  company?: string
  jobRole?: string
  phone?:   string
  topic?:   string
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

function trim(value: unknown, max = 500): string | null {
  if (typeof value !== 'string') return null
  const t = value.trim()
  if (!t) return null
  return t.slice(0, max)
}

export async function POST(req: NextRequest) {
  if (!serviceKey) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  let body: BookingPayload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const name  = trim(body.name, 120)
  const email = trim(body.email, 200)
  const slot  = trim(body.slot, 50)

  if (!name || !email || !slot) {
    return NextResponse.json({ error: 'Name, email and slot are required.' }, { status: 400 })
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  // Validate the slot is one of the slots we actually offer (and still future).
  const slotDate = new Date(slot)
  if (Number.isNaN(slotDate.getTime())) {
    return NextResponse.json({ error: 'Invalid slot.' }, { status: 400 })
  }
  const offered = generateUpcomingSlots().map((d) => d.toISOString())
  if (!offered.includes(slotDate.toISOString())) {
    return NextResponse.json({ error: 'That slot is no longer available.' }, { status: 400 })
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const company = trim(body.company, 200)
  const jobRole = trim(body.jobRole, 200)
  const phone   = trim(body.phone, 60)
  const topic   = trim(body.topic, 1000)

  // Insert. Partial unique index on slot_at where status='confirmed' will
  // reject simultaneous double-bookings.
  const { data: inserted, error: insertError } = await supabase
    .from('bookings')
    .insert({
      slot_at:  slotDate.toISOString(),
      name,
      email:    email.toLowerCase(),
      company,
      job_role: jobRole,
      phone,
      topic,
    })
    .select('id, cancel_token')
    .single()

  if (insertError) {
    if ((insertError as { code?: string }).code === '23505') {
      return NextResponse.json(
        { error: 'Sorry — someone just grabbed that slot. Please pick another.' },
        { status: 409 },
      )
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // ── Send emails (best-effort; do not fail the booking if email fails) ──────
  const dateLabel = formatSlotDate(slotDate)
  const timeLabel = formatSlotTime(slotDate)
  const cancelUrl = `${appUrl}/book-a-call/cancel/${inserted!.cancel_token}`
  const firstName = name.split(/\s+/)[0]

  const resendKey = process.env.RESEND_API_KEY
  const resend    = resendKey && !resendKey.startsWith('re_your_') ? new Resend(resendKey) : null
  const fromAddr  = process.env.RESEND_FROM ?? 'MQ <hello@mindsetquo.com>'

  if (resend) {
    const ics = buildBookingIcs({
      uid:            inserted!.id as string,
      startUTC:       slotDate,
      attendeeEmail:  email,
      attendeeName:   name,
      organizerEmail: 'hello@mindsetquo.com',
      organizerName:  'MQ — Maria & Richard',
      description:    'Discovery call about the Manager Mindset Accelerator. We have 30 minutes together.',
      cancelUrl,
    })

    const icsAttachment = {
      filename: 'mq-discovery-call.ics',
      content:  Buffer.from(ics).toString('base64'),
      contentType: 'text/calendar; charset=utf-8; method=REQUEST',
    }

    const tasks: Promise<unknown>[] = []

    // Confirmation to booker
    tasks.push(
      resend.emails.send({
        from:    fromAddr,
        to:      email,
        subject: `Your discovery call is booked — ${dateLabel}, ${timeLabel}`,
        html:    bookingConfirmationHtml({ firstName, dateLabel, timeLabel, cancelUrl, topic }),
        attachments: [icsAttachment],
      }),
    )

    // Internal notification — single email to both recipients
    tasks.push(
      resend.emails.send({
        from:    fromAddr,
        to:      NOTIFY_EMAILS,
        subject: `New booking: ${name} — ${dateLabel} ${timeLabel}`,
        html:    bookingNotificationHtml({
          name, email, company, jobRole, phone, topic, dateLabel, timeLabel, cancelUrl,
        }),
        attachments: [icsAttachment],
      }),
    )

    await Promise.allSettled(tasks)
  }

  return NextResponse.json({
    ok: true,
    dateLabel,
    timeLabel,
    durationMinutes: SLOT_DURATION_MINUTES,
  })
}
