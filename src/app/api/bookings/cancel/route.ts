import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { formatSlotDate, formatSlotTime } from '@/lib/bookings/slots'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!

const NOTIFY_EMAILS = ['maria@mindsetquo.com', 'richard@mindsetquo.com']

export async function POST(req: NextRequest) {
  if (!serviceKey) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  let body: { token?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const token = body.token?.trim()
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: booking, error: lookupError } = await supabase
    .from('bookings')
    .select('id, slot_at, name, email, status')
    .eq('cancel_token', token)
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

  const { error: updateError } = await supabase
    .from('bookings')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('id', booking.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Notify Maria + Richard (best-effort).
  const resendKey = process.env.RESEND_API_KEY
  const resend    = resendKey && !resendKey.startsWith('re_your_') ? new Resend(resendKey) : null
  const fromAddr  = process.env.RESEND_FROM ?? 'MQ <hello@mindsetquo.com>'

  if (resend) {
    const slot      = new Date(booking.slot_at as string)
    const dateLabel = formatSlotDate(slot)
    const timeLabel = formatSlotTime(slot)
    await resend.emails
      .send({
        from:    fromAddr,
        to:      NOTIFY_EMAILS,
        subject: `Cancelled: ${booking.name} — ${dateLabel} ${timeLabel}`,
        html:    `<p>${booking.name} (${booking.email}) cancelled their discovery call on ${dateLabel} at ${timeLabel}. Slot is now free.</p>`,
      })
      .catch(() => null)
  }

  return NextResponse.json({ ok: true })
}
