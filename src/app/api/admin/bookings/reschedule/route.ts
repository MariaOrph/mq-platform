// ── POST /api/admin/bookings/reschedule ────────────────────────────────────────
// Admin-initiated reschedule. Atomically:
//   1. Validates the new slot is still offered AND not already taken
//   2. Updates the booking's slot_at + bumps a refresh token (we keep the
//      same row + same cancel_token so old links still work)
//   3. Emails the booker with a fresh REQUEST .ics for the new time
//
// Note: the old slot's CANCEL is not strictly necessary because we keep the
// same UID and bump SEQUENCE — calendar clients treat the new REQUEST as an
// update and replace the original event.

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { requireMqAdmin } from '@/lib/auth/admin-route'
import {
  generateUpcomingSlots,
  formatSlotDate,
  formatSlotTime,
} from '@/lib/bookings/slots'
import { buildBookingIcs } from '@/lib/bookings/ics'
import { bookingRescheduledHtml } from '@/lib/email/booking-templates'

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.mindsetquo.com'

interface Payload {
  bookingId?: string
  newSlot?:   string  // ISO UTC
  note?:      string
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
  const newSlot   = body.newSlot?.trim()
  const note      = body.note?.trim() || undefined

  if (!bookingId || !newSlot) {
    return NextResponse.json({ error: 'Missing bookingId or newSlot' }, { status: 400 })
  }

  const newSlotDate = new Date(newSlot)
  if (Number.isNaN(newSlotDate.getTime())) {
    return NextResponse.json({ error: 'Invalid newSlot' }, { status: 400 })
  }

  // Validate the new slot is one of the slots we currently offer.
  const offered = generateUpcomingSlots().map(d => d.toISOString())
  if (!offered.includes(newSlotDate.toISOString())) {
    return NextResponse.json({ error: 'That slot is not offered.' }, { status: 400 })
  }

  // Look up the booking.
  const { data: booking, error: lookupError } = await auth.supabase
    .from('bookings')
    .select('id, slot_at, name, email, status, cancel_token, topic')
    .eq('id', bookingId)
    .maybeSingle()

  if (lookupError) {
    return NextResponse.json({ error: lookupError.message }, { status: 500 })
  }
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }
  if (booking.status === 'cancelled') {
    return NextResponse.json({ error: 'Cannot reschedule a cancelled booking.' }, { status: 400 })
  }

  // No-op if the new slot equals the current slot.
  if (new Date(booking.slot_at as string).toISOString() === newSlotDate.toISOString()) {
    return NextResponse.json({ ok: true, unchanged: true })
  }

  // Move to the new slot. Partial unique index on slot_at where
  // status='confirmed' will reject this with code 23505 if another confirmed
  // booking already holds the target slot.
  const { error: updateError } = await auth.supabase
    .from('bookings')
    .update({ slot_at: newSlotDate.toISOString() })
    .eq('id', booking.id)

  if (updateError) {
    if ((updateError as { code?: string }).code === '23505') {
      return NextResponse.json(
        { error: 'That slot is already taken by another booking.' },
        { status: 409 },
      )
    }
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // ── Email the booker with a fresh ics ─────────────────────────────────────
  const resendKey = process.env.RESEND_API_KEY
  const resend    = resendKey && !resendKey.startsWith('re_your_') ? new Resend(resendKey) : null
  const fromAddr  = process.env.RESEND_FROM ?? 'MQ <hello@mindsetquo.com>'

  if (resend) {
    const oldSlot     = new Date(booking.slot_at as string)
    const oldDate     = formatSlotDate(oldSlot)
    const oldTime     = formatSlotTime(oldSlot)
    const newDate     = formatSlotDate(newSlotDate)
    const newTime     = formatSlotTime(newSlotDate)
    const firstName   = (booking.name as string).split(/\s+/)[0]
    const cancelUrl   = `${appUrl}/book-a-call/cancel/${booking.cancel_token}`

    // Sequence based on epoch seconds — always greater than what was sent
    // before, so calendar clients apply the update in place.
    const ics = buildBookingIcs({
      uid:            booking.id as string,
      startUTC:       newSlotDate,
      attendeeEmail:  booking.email as string,
      attendeeName:   booking.name as string,
      organizerEmail: 'hello@mindsetquo.com',
      organizerName:  'MQ — Maria & Richard',
      description:    'Discovery call about the Manager Mindset Accelerator. We have 30 minutes together.',
      cancelUrl,
      sequence:       Math.floor(Date.now() / 1000),
    })

    const icsAttachment = {
      filename:    'mq-discovery-call.ics',
      content:     Buffer.from(ics).toString('base64'),
      contentType: 'text/calendar; charset=utf-8; method=REQUEST',
    }

    await resend.emails
      .send({
        from:    fromAddr,
        to:      booking.email as string,
        subject: `Rescheduled — your discovery call is now ${newDate}, ${newTime}`,
        html:    bookingRescheduledHtml({
          firstName,
          oldDateLabel: oldDate,
          oldTimeLabel: oldTime,
          newDateLabel: newDate,
          newTimeLabel: newTime,
          cancelUrl,
          note,
        }),
        attachments: [icsAttachment],
      })
      .catch(() => null)
  }

  return NextResponse.json({ ok: true })
}
