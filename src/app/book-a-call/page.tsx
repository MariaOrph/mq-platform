import type { Metadata } from 'next'
import Link from 'next/link'
import BookingForm from './BookingForm'

export const metadata: Metadata = {
  title: 'Book a discovery call | MQ',
  description: 'Book a 30-minute discovery call about the Manager Mindset Accelerator. Friday mornings, UK time.',
}

const BRAND = {
  darkGreen: '#0A2E2A',
  teal:      '#0AF3CD',
  tealSoft:  '#B9F8DD',
  mint:      '#E8FDF7',
  mintPale:  '#F4FDF9',
  ink:       '#0A2E2A',
  inkSoft:   '#05A88E',
  grey:      '#6B7280',
  greyLight: '#9CA3AF',
}

export default function BookCallPage() {
  return (
    <div style={{ backgroundColor: BRAND.mintPale, color: BRAND.ink, marginBottom: '-5rem', minHeight: '100vh' }}>
      {/* ── NAV BAR ────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 backdrop-blur-md"
        style={{ backgroundColor: 'rgba(244,253,249,0.85)', borderBottom: `1px solid ${BRAND.tealSoft}` }}
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/programmes" className="flex items-center gap-2">
            <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-1px', color: BRAND.inkSoft }}>MQ</span>
            <span style={{ fontSize: 11, color: BRAND.greyLight, letterSpacing: 2, textTransform: 'uppercase' }}>
              Mindset Quotient<sup>®</sup>
            </span>
          </Link>
          <Link
            href="/programmes"
            className="text-sm font-medium hover:underline"
            style={{ color: BRAND.darkGreen }}
          >
            ← Back
          </Link>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 lg:px-8 pt-12 pb-6 text-center">
        <p
          className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4"
          style={{ backgroundColor: BRAND.tealSoft, color: BRAND.darkGreen }}
        >
          30 minutes • Friday mornings • UK time
        </p>
        <h1
          className="font-extrabold tracking-tight mb-4"
          style={{ fontSize: 'clamp(28px, 5vw, 44px)', lineHeight: 1.15, color: BRAND.darkGreen }}
        >
          Book a discovery call
        </h1>
        <p className="text-base lg:text-lg" style={{ color: BRAND.grey, lineHeight: 1.6 }}>
          A no-pressure 30 minutes with Maria or Richard. Talk to us about your current situation, and we'll explore how our programmes can help you, and show you how the MQ app works.
        </p>
      </section>

      {/* ── PICKER + FORM ──────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 lg:px-8 pb-24">
        <BookingForm />
      </section>
    </div>
  )
}
