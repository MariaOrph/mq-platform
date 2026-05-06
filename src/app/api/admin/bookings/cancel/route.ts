// ── POST /api/admin/bookings/cancel ────────────────────────────────────────────
// Admin-initiated cancellation. Marks booking as cancelled, frees the slot,
// emails the booker an apology with a rebook link + a CANCEL .ics so their
// calendar drops the event.

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { requireMqAdmin } from '@/lib/auth/admin-route'
import { formatSlotDate, formatSlotTime } from '@/lib/bookings/slots'
import { buildBookingCancelIcs } from '@/lib/bookings/ics'
import { bookingCancelledByHostHtml } from '@/lib/email/booking-templates'

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.mindsetquo.com'

interface Payload {
  bookingId?: string
  note?:      string  // optional — added to the email
}

export async function POST(req: NextRequest) {
  const auth = await requireMqAdmin(req)
  if (!auth.ok) return auth.response

  let body: Payload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const bookingId = body.bookingId?.trim()
  if (!bookingId) {
    return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 })
  }

  const note = body.note?.trim() || undefined

  // Look up the booking we're cancelling.
  const { data: booking, error: lookupError } = await auth.supabase
    .from('bookings')
    .select('id, slot_at, name, email, status')
    .eq('id', bookingId)
    .maybeSingle()

  if (lookupError) {
    return NextResponse.json({ error: lookupError.message }, { status: 500 })
  }
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }
  if (booking.status === 'cancelled') {
    return NextResponse.json({ ok: true, alreadyCancelled: true })
  }

  // Mark as cancelled — the partial unique index frees the slot back up
  // automatically because it only covers status='confirmed'.
  const { error: updateError } = await auth.supabase
    .from('bookings')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('id', booking.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // ── Email the booker (best-effort) ────────────────────────────────────────
  const resendKey = process.env.RESEND_API_KEY
  const resend    = resendKey && !resendKey.startsWith('re_your_') ? new Resend(resendKey) : null
  const fromAddr  = process.env.RESEND_FROM ?? 'MQ <hello@mindsetquo.com>'

  if (resend) {
    const slot      = new Date(booking.slot_at as string)
    const dateLabel = formatSlotDate(slot)
    const timeLabel = formatSlotTime(slot)
    const firstName = (booking.name as string).split(/\s+/)[0]
    const rebookUrl = `${appUrl}/book-a-call`

    // Sequence based on Unix epoch seconds — guaranteed to be greater than
    // anything previously sent for this booking, which is what calendar
    // clients require to apply the CANCEL.
    const cancelIcs = buildBookingCancelIcs({
      uid:            booking.id as string,
      startUTC:       slot,
      attendeeEmail:  booking.email as string,
      attendeeName:   booking.name as string,
      organizerEmail: 'hello@mindsetquo.com',
      organizerName:  'MQ — Maria & Richard',
      sequence:       Math.floor(Date.now() / 1000),
    })

    const cancelAttachment = {
      filename:    'mq-discovery-call-cancelled.ics',
      content:     Buffer.from(cancelIcs).toString('base64'),
      contentType: 'text/calendar; charset=utf-8; method=CANCEL',
    }

    await resend.emails
      .send({
        from:    fromAddr,
        to:      booking.email as string,
        subject: `Cancelled — your discovery call on ${dateLabel}`,
        html:    bookingCancelledByHostHtml({ firstName, dateLabel, timeLabel, rebookUrl, note }),
        attachments: [cancelAttachment],
      })
      .catch(() => null)
  }

  return NextResponse.json({ ok: true })
}
