import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import CancelButton from './CancelButton'

export const metadata: Metadata = {
  title: 'Cancel booking | MQ',
}

export const dynamic = 'force-dynamic'

const BRAND = {
  darkGreen: '#0A2E2A',
  tealSoft:  '#B9F8DD',
  mintPale:  '#F4FDF9',
  ink:       '#0A2E2A',
  inkSoft:   '#05A88E',
  grey:      '#6B7280',
  greyLight: '#9CA3AF',
  border:    '#D1FAE5',
}

const LONDON_TZ = 'Europe/London'

function formatFullDate(d: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: LONDON_TZ,
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(d)
}
function formatTime(d: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: LONDON_TZ,
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(d)
}

export default async function CancelBookingPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: booking } = await supabase
    .from('bookings')
    .select('slot_at, name, status')
    .eq('cancel_token', token)
    .maybeSingle()

  return (
    <div style={{ backgroundColor: BRAND.mintPale, color: BRAND.ink, minHeight: '100vh', marginBottom: '-5rem' }}>
      <header
        className="sticky top-0 z-40 backdrop-blur-md"
        style={{ backgroundColor: 'rgba(244,253,249,0.85)', borderBottom: `1px solid ${BRAND.tealSoft}` }}
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-4">
          <Link href="/programmes" className="flex items-center gap-2">
            <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-1px', color: BRAND.inkSoft }}>MQ</span>
            <span style={{ fontSize: 11, color: BRAND.greyLight, letterSpacing: 2, textTransform: 'uppercase' }}>
              Mindset Quotient<sup>®</sup>
            </span>
          </Link>
        </div>
      </header>

      <section className="max-w-xl mx-auto px-6 lg:px-8 pt-16 pb-24">
        {!booking ? (
          <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: '#fff', border: `1px solid ${BRAND.border}` }}>
            <h1 className="text-xl font-bold mb-3" style={{ color: BRAND.darkGreen }}>Booking not found</h1>
            <p style={{ color: BRAND.grey, lineHeight: 1.7 }}>
              This cancel link is invalid or has expired. If you need help, email{' '}
              <a href="mailto:hello@mindsetquo.com" style={{ color: BRAND.inkSoft, fontWeight: 600 }}>
                hello@mindsetquo.com
              </a>.
            </p>
          </div>
        ) : booking.status === 'cancelled' ? (
          <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: '#fff', border: `1px solid ${BRAND.border}` }}>
            <h1 className="text-xl font-bold mb-3" style={{ color: BRAND.darkGreen }}>Already cancelled</h1>
            <p style={{ color: BRAND.grey, lineHeight: 1.7 }}>
              This booking has already been cancelled. Want to pick a new time?
            </p>
            <Link
              href="/book-a-call"
              className="inline-block mt-5 px-6 py-3 rounded-full font-semibold text-sm"
              style={{ backgroundColor: BRAND.darkGreen, color: '#fff' }}
            >
              Book another call
            </Link>
          </div>
        ) : (
          <CancelConfirm
            token={token}
            name={(booking.name as string) ?? ''}
            slotIso={booking.slot_at as string}
          />
        )}
      </section>
    </div>
  )
}

function CancelConfirm({ token, name, slotIso }: { token: string; name: string; slotIso: string }) {
  const slot = new Date(slotIso)
  return (
    <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: '#fff', border: `1px solid ${BRAND.border}` }}>
      <h1 className="text-2xl font-extrabold mb-3" style={{ color: BRAND.darkGreen }}>
        Cancel this call?
      </h1>
      <p className="mb-2" style={{ color: BRAND.grey }}>{name ? `${name},` : ''} you have a discovery call booked for</p>
      <p className="text-lg font-semibold mb-6" style={{ color: BRAND.darkGreen }}>
        {formatFullDate(slot)} at {formatTime(slot)} UK time
      </p>
      <CancelButton token={token} />
      <p className="mt-4 text-sm" style={{ color: BRAND.greyLight }}>
        Need to reschedule? Cancel here, then{' '}
        <Link href="/book-a-call" style={{ color: BRAND.inkSoft, fontWeight: 600 }}>book a new time</Link>.
      </p>
    </div>
  )
}
