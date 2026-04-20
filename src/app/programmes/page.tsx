import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

// ── Brand tokens (mirror the app) ──────────────────────────────────────────────
const BRAND = {
  darkGreen:  '#0A2E2A',
  teal:       '#0AF3CD',
  tealSoft:   '#B9F8DD',
  mint:       '#E8FDF7',
  mintPale:   '#F4FDF9',
  cream:      '#FFFBEB',
  ink:        '#0A2E2A',
  inkSoft:    '#05A88E',
  grey:       '#6B7280',
  greyLight:  '#9CA3AF',
}

export const metadata: Metadata = {
  title: 'The Manager Mindset Accelerator — MQ',
  description: 'Change how your managers think, and they\'ll change how your business performs. A coaching-led development programme for first-time and emerging managers, enhanced by the MQ app.',
  openGraph: {
    title: 'The Manager Mindset Accelerator',
    description: 'Change how your managers think, and they\'ll change how your business performs.',
    images: ['/founders.jpg'],
  },
}

export default function ProgrammesPage() {
  const bookCallHref = 'https://www.mindsetquo.com/contact'

  return (
    <div
      // Negative margin absorbs the pb-20 that the root layout adds for the
      // (now-hidden) bottom nav — otherwise we get an empty strip under the
      // footer. This keeps the landing page visually flush.
      style={{ backgroundColor: BRAND.mintPale, color: BRAND.ink, marginBottom: '-5rem' }}
    >

      {/* ── NAV BAR ────────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 backdrop-blur-md"
        style={{ backgroundColor: 'rgba(244,253,249,0.85)', borderBottom: `1px solid ${BRAND.tealSoft}` }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/programmes" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black tracking-tight"
              style={{ backgroundColor: BRAND.darkGreen, color: 'white' }}
            >
              M<span style={{ color: BRAND.teal }}>Q</span>
            </div>
            <span className="font-bold text-sm tracking-tight" style={{ color: BRAND.ink }}>
              Mindset Quotient<sup className="text-[9px]">®</sup>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center text-xs font-semibold px-3 py-2 rounded-lg hover:opacity-70 transition-opacity"
              style={{ color: BRAND.inkSoft }}
            >
              App login
            </Link>
            <a
              href={bookCallHref}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center text-xs sm:text-sm font-bold px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: BRAND.teal, color: BRAND.darkGreen }}
            >
              Book a call
            </a>
          </div>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(165deg, ${BRAND.darkGreen} 0%, #0d3830 55%, #0f443a 100%)`,
        }}
      >
        {/* Glow accent */}
        <div
          aria-hidden
          className="absolute rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ width: 620, height: 620, top: -200, right: -140, background: BRAND.teal }}
        />
        <div
          aria-hidden
          className="absolute rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ width: 520, height: 520, bottom: -180, left: -120, background: BRAND.teal }}
        />

        <div className="relative max-w-6xl mx-auto px-6 pt-16 sm:pt-24 pb-20 sm:pb-28">
          <div className="grid lg:grid-cols-[1.15fr_1fr] gap-12 items-center">
            {/* Left — copy */}
            <div>
              <p
                className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] px-3 py-1.5 rounded-full mb-7"
                style={{ backgroundColor: 'rgba(10,243,205,0.12)', color: BRAND.teal, border: `1px solid rgba(10,243,205,0.25)` }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: BRAND.teal }} />
                The Manager Mindset Accelerator
              </p>

              <h1
                className="font-black tracking-tight mb-6 text-white"
                style={{ fontSize: 'clamp(2.25rem, 5.2vw, 4rem)', lineHeight: 1.05 }}
              >
                Change how your managers think,<br />
                <span style={{ color: BRAND.teal }}>and they&apos;ll change how your business performs.</span>
              </h1>

              <p className="text-base sm:text-lg mb-9 max-w-xl" style={{ color: 'rgba(185,248,221,0.85)', lineHeight: 1.65 }}>
                A coaching-led development programme for first-time and emerging managers.
                Built on mindset, measured with data, and enhanced by the MQ app so growth continues long after the workshop ends.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-10">
                <a
                  href={bookCallHref}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: BRAND.teal, color: BRAND.darkGreen, boxShadow: '0 10px 30px rgba(10,243,205,0.25)' }}
                >
                  Book a discovery call
                  <span aria-hidden>→</span>
                </a>
                <a
                  href="#the-app"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
                  style={{ border: '1px solid rgba(185,248,221,0.3)', color: 'white' }}
                >
                  See the app in action
                </a>
              </div>

              {/* Trust bar */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs" style={{ color: 'rgba(185,248,221,0.7)' }}>
                <span className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: BRAND.teal }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Grounded in neuroscience
                </span>
                <span className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: BRAND.teal }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Measurable ROI dashboard
                </span>
                <span className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: BRAND.teal }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  8–12 week programme
                </span>
              </div>
            </div>

            {/* Right — phone mockup */}
            <div className="relative flex justify-center lg:justify-end">
              <div
                className="relative"
                style={{ width: 300, height: 620, maxWidth: '85vw' }}
              >
                {/* Phone frame */}
                <div
                  className="absolute inset-0 rounded-[44px] overflow-hidden"
                  style={{
                    backgroundColor: '#0a0a0a',
                    border: '6px solid #1a1a1a',
                    boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset',
                  }}
                >
                  <div className="relative w-full h-full" style={{ backgroundColor: BRAND.mintPale }}>
                    {/* Notch */}
                    <div
                      className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 rounded-full z-10"
                      style={{ backgroundColor: '#0a0a0a' }}
                    />
                    {/* App mock — dashboard preview */}
                    <div className="px-4 pt-10 pb-6 h-full overflow-hidden">
                      {/* App header */}
                      <div className="flex items-center justify-between mb-4 px-1">
                        <div>
                          <p className="text-[10px] font-semibold" style={{ color: BRAND.inkSoft }}>Good morning</p>
                          <p className="text-sm font-black" style={{ color: BRAND.ink }}>Maria</p>
                        </div>
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold"
                          style={{ backgroundColor: BRAND.teal, color: BRAND.darkGreen }}
                        >MO</div>
                      </div>

                      {/* Score card */}
                      <div
                        className="rounded-2xl p-3.5 mb-3"
                        style={{ background: `linear-gradient(135deg, ${BRAND.darkGreen} 0%, #0d3830 100%)` }}
                      >
                        <p className="text-[10px] font-bold text-white mb-0.5">MQ Score</p>
                        <p className="text-[10px]" style={{ color: BRAND.tealSoft }}>Strong</p>
                        <div className="flex items-end gap-2 mt-2">
                          <span className="text-3xl font-black leading-none" style={{ color: BRAND.teal }}>78</span>
                          <span className="text-[10px] mb-1" style={{ color: BRAND.tealSoft }}>/ 100</span>
                        </div>
                      </div>

                      {/* Dimension bars */}
                      <div className="space-y-1.5 mb-3">
                        {[
                          { n: 'Self-awareness', v: 82, c: '#fdcb5e' },
                          { n: 'Ego management', v: 71, c: '#EC4899' },
                          { n: 'Emotional regulation', v: 88, c: '#ff7b7a' },
                          { n: 'Clarity & comms', v: 74, c: '#ff9f43' },
                          { n: 'Trust & development', v: 66, c: '#00c9a7' },
                        ].map(d => (
                          <div key={d.n}>
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-semibold" style={{ color: BRAND.ink }}>{d.n}</span>
                              <span className="text-[9px] font-bold" style={{ color: d.c }}>{d.v}</span>
                            </div>
                            <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#F3F4F6' }}>
                              <div className="h-full rounded-full" style={{ width: `${d.v}%`, backgroundColor: d.c }} />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Daily Spark card */}
                      <div
                        className="rounded-xl p-3"
                        style={{ background: 'linear-gradient(135deg, #FFF8E1 0%, #FFFBF0 100%)', border: '1px solid #fdcb5e' }}
                      >
                        <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: '#D97706' }}>Today&apos;s Daily Spark</p>
                        <p className="text-[11px] font-semibold leading-snug" style={{ color: BRAND.ink }}>
                          Build trust through micro-moments
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE HIDDEN LEVER (PROBLEM) ──────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.18em] mb-3" style={{ color: BRAND.inkSoft }}>
              The hidden lever
            </p>
            <h2
              className="font-black tracking-tight mb-5"
              style={{ fontSize: 'clamp(1.875rem, 4vw, 3rem)', lineHeight: 1.1, color: BRAND.ink }}
            >
              Your people are your greatest asset.<br />
              Your managers are your biggest lever.
            </h2>
            <p className="text-base sm:text-lg max-w-2xl mx-auto" style={{ color: BRAND.grey, lineHeight: 1.7 }}>
              When managers aren&apos;t driving the performance you need, it&apos;s rarely capability. They&apos;re stuck in
              individual-contributor mode, under-coached, and navigating a mindset shift they were never trained for.
            </p>
          </div>

          {/* Stat cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-14">
            {[
              { stat: '82%', label: 'of UK managers are "accidental" — no formal development.' },
              { stat: '70%', label: 'of variance in team engagement is determined by the manager. (Gallup)' },
              { stat: '80%', label: 'of people stay in a job because they have a manager they trust.' },
            ].map((s, i) => (
              <div
                key={i}
                className="rounded-2xl p-7"
                style={{ backgroundColor: 'white', border: `1px solid ${BRAND.tealSoft}`, boxShadow: '0 2px 16px rgba(10,46,42,0.04)' }}
              >
                <p
                  className="font-black leading-none mb-3"
                  style={{ fontSize: 'clamp(2.5rem, 5vw, 3.25rem)', color: BRAND.darkGreen, fontVariantNumeric: 'tabular-nums' }}
                >
                  {s.stat}
                </p>
                <p className="text-sm" style={{ color: BRAND.grey, lineHeight: 1.6 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Hidden cost */}
          <div
            className="rounded-3xl p-8 sm:p-10"
            style={{ backgroundColor: BRAND.cream, border: `1px solid #fdcb5e` }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] mb-2" style={{ color: '#B45309' }}>
              The hidden cost of doing nothing
            </p>
            <h3 className="text-xl sm:text-2xl font-bold mb-5" style={{ color: BRAND.ink, lineHeight: 1.3 }}>
              The damage is invisible until it&apos;s too late.
            </h3>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2.5">
              {[
                'Burnout and quiet disengagement',
                'Opportunity cost of misfiring teams',
                'Missed growth, revenue and innovation',
                'Attrition and rehiring costs',
                'Lost productivity in high-potential hires',
                'Slow, steady cultural erosion',
              ].map((t, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm" style={{ color: BRAND.ink }}>
                  <span style={{ color: '#D97706', marginTop: 2 }}>✕</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT IS MQ ─────────────────────────────────────────────────────── */}
      <section
        className="py-20 sm:py-28 px-6 relative overflow-hidden"
        style={{ background: `linear-gradient(180deg, ${BRAND.mintPale} 0%, ${BRAND.mint} 100%)` }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.18em] mb-3" style={{ color: BRAND.inkSoft }}>
              What is MQ?
            </p>
            <h2
              className="font-black tracking-tight mb-5"
              style={{ fontSize: 'clamp(1.875rem, 4vw, 2.75rem)', lineHeight: 1.15, color: BRAND.ink }}
            >
              The next evolution beyond IQ and EQ.
            </h2>
            <p className="text-base sm:text-lg max-w-2xl mx-auto" style={{ color: BRAND.grey, lineHeight: 1.7 }}>
              Mindset Quotient<sup className="text-xs">®</sup> measures our capacity to observe, regulate, and reframe the
              thought patterns, beliefs and inner scripts that drive our behaviour. It&apos;s the intelligence of
              self-direction. When you learn to master it, you amplify your capacity to lead — and create the conditions
              for others to do the same.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { code: 'IQ', label: 'Cognitive intelligence', desc: 'How we process, reason, and solve.', muted: true },
              { code: 'EQ', label: 'Emotional intelligence', desc: 'How we read and relate to others.', muted: true },
              { code: 'MQ', label: 'Mindset intelligence', desc: 'How we direct, regulate, and rewire ourselves.', muted: false },
            ].map((c, i) => (
              <div
                key={i}
                className="rounded-2xl p-7"
                style={c.muted
                  ? { backgroundColor: 'white', border: `1px solid ${BRAND.tealSoft}` }
                  : { background: `linear-gradient(135deg, ${BRAND.darkGreen} 0%, #0d3830 100%)`, color: 'white' }
                }
              >
                <p
                  className="font-black mb-2 leading-none"
                  style={{ fontSize: '2.5rem', color: c.muted ? BRAND.greyLight : BRAND.teal }}
                >
                  {c.code}
                </p>
                <p className="text-sm font-bold mb-1.5" style={{ color: c.muted ? BRAND.ink : 'white' }}>
                  {c.label}
                </p>
                <p className="text-sm" style={{ color: c.muted ? BRAND.grey : 'rgba(185,248,221,0.8)', lineHeight: 1.6 }}>
                  {c.desc}
                </p>
              </div>
            ))}
          </div>

          <p className="text-sm text-center mt-8 max-w-xl mx-auto" style={{ color: BRAND.greyLight }}>
            MQ is grounded in evidence-based research from neuroscience, behavioural psychology, and adult learning —
            so that change isn&apos;t just intellectual. It&apos;s real and lasting.
          </p>
        </div>
      </section>

      {/* ── THE ACCELERATOR — THREE PHASES ─────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.18em] mb-3" style={{ color: BRAND.inkSoft }}>
              Our signature programme
            </p>
            <h2
              className="font-black tracking-tight mb-5"
              style={{ fontSize: 'clamp(1.875rem, 4vw, 2.75rem)', lineHeight: 1.15, color: BRAND.ink }}
            >
              The Accelerator experience
            </h2>
            <p className="text-base sm:text-lg max-w-2xl mx-auto" style={{ color: BRAND.grey, lineHeight: 1.7 }}>
              A three-part journey rooted in the compounding power of mindset, relationships and culture.
              A redesign of how your managers think, behave and lead — from the inside out.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                phase: 'Phase 1',
                title: 'IGNITE',
                subtitle: 'Leading yourself',
                summary: 'Mindset — where the making of a manager begins.',
                body: 'We help your managers shift from individual contributor to manager, and build the clarity and confidence to lead themselves before they lead others.',
                icon: '🔥',
              },
              {
                phase: 'Phase 2',
                title: 'CONNECT',
                subtitle: 'Leading one-to-one',
                summary: 'Relationships — how managers unlock potential in others.',
                body: 'We strengthen how your managers connect, coach and build trust. The result: developing talent, fostering ownership, accelerating performance.',
                icon: '🤝',
              },
              {
                phase: 'Phase 3',
                title: 'AMPLIFY',
                subtitle: 'Leading the collective',
                summary: 'Culture — where managers scale and multiply their impact.',
                body: 'We equip your managers to embed the team norms and rituals that build psychological safety, cohesion, and turn your values into visible everyday behaviours.',
                icon: '✨',
              },
            ].map((p, i) => (
              <div
                key={i}
                className="rounded-2xl p-7 relative overflow-hidden"
                style={{ backgroundColor: 'white', border: `1px solid ${BRAND.tealSoft}`, boxShadow: '0 2px 20px rgba(10,46,42,0.05)' }}
              >
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: BRAND.greyLight }}>
                      {p.phase}
                    </p>
                    <p className="text-2xl font-black mt-1" style={{ color: BRAND.darkGreen }}>{p.title}</p>
                    <p className="text-xs font-semibold" style={{ color: BRAND.inkSoft }}>{p.subtitle}</p>
                  </div>
                  <span className="text-3xl" aria-hidden>{p.icon}</span>
                </div>
                <p className="text-sm font-semibold mb-2.5" style={{ color: BRAND.ink, lineHeight: 1.5 }}>
                  {p.summary}
                </p>
                <p className="text-sm" style={{ color: BRAND.grey, lineHeight: 1.65 }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section
        className="py-20 sm:py-28 px-6"
        style={{ backgroundColor: BRAND.mint }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.18em] mb-3" style={{ color: BRAND.inkSoft }}>
              How it works
            </p>
            <h2
              className="font-black tracking-tight mb-5"
              style={{ fontSize: 'clamp(1.875rem, 4vw, 2.75rem)', lineHeight: 1.15, color: BRAND.ink }}
            >
              Designed for depth.<br />Built for reality.
            </h2>
            <p className="text-base sm:text-lg max-w-2xl mx-auto" style={{ color: BRAND.grey, lineHeight: 1.7 }}>
              Long enough to embed change, short enough to sustain momentum.
              Led by your priorities, driven by our expertise, co-created in the room.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
            {/* Programme inclusions */}
            <div className="rounded-2xl p-8" style={{ backgroundColor: 'white', border: `1px solid ${BRAND.tealSoft}` }}>
              <p className="text-xs font-bold uppercase tracking-[0.15em] mb-4" style={{ color: BRAND.inkSoft }}>
                What&apos;s included
              </p>
              <h3 className="text-xl font-black mb-5" style={{ color: BRAND.ink }}>
                The programme
              </h3>
              <ul className="space-y-3.5">
                {[
                  'Pre-calls with your leadership team and every delegate',
                  'Three × 2-hour group coaching workshops',
                  'Three × 1-hour one-to-one coaching sessions per delegate',
                  'Final 2-hour workshop (including your leadership team)',
                  'Action learning sets so your managers keep developing each other',
                  'The MQ app — diagnostic, daily coaching, practice tools',
                  'Customised Impact Dashboard tracking measurable ROI',
                  '360 feedback & psychometrics (optional)',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm" style={{ color: BRAND.ink }}>
                    <span
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                      style={{ backgroundColor: BRAND.teal }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={BRAND.darkGreen} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </span>
                    <span style={{ lineHeight: 1.55 }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* The process */}
            <div className="rounded-2xl p-8" style={{ backgroundColor: 'white', border: `1px solid ${BRAND.tealSoft}` }}>
              <p className="text-xs font-bold uppercase tracking-[0.15em] mb-4" style={{ color: BRAND.inkSoft }}>
                Our process
              </p>
              <h3 className="text-xl font-black mb-5" style={{ color: BRAND.ink }}>
                From start to lasting change
              </h3>
              <div className="space-y-5">
                {[
                  {
                    n: '01',
                    title: 'Co-creation',
                    body: 'We start by deeply understanding your business, culture and goals — context is everything. The programme is shaped around your priorities and people.',
                  },
                  {
                    n: '02',
                    title: 'Delivery',
                    body: 'A hybrid programme — dynamic workshops, 1:1 coaching and action learning. Coaching-led, always anchored in real challenges from the role.',
                  },
                  {
                    n: '03',
                    title: 'Evaluation',
                    body: 'We measure what matters — real change, not attendance or satisfaction. Comprehensive pre/post data demonstrates ROI across people and business metrics.',
                  },
                ].map((p, i) => (
                  <div key={i} className="flex gap-4">
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black"
                      style={{ backgroundColor: BRAND.darkGreen, color: BRAND.teal }}
                    >
                      {p.n}
                    </div>
                    <div>
                      <p className="font-bold mb-1" style={{ color: BRAND.ink }}>{p.title}</p>
                      <p className="text-sm" style={{ color: BRAND.grey, lineHeight: 1.6 }}>{p.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm font-semibold" style={{ color: BRAND.inkSoft }}>
              Programme length flexes to your needs — 8–12 weeks on average.
            </p>
          </div>
        </div>
      </section>

      {/* ── WHY WE'RE DIFFERENT ────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.18em] mb-3" style={{ color: BRAND.inkSoft }}>
              Why we&apos;re different
            </p>
            <h2
              className="font-black tracking-tight mb-5"
              style={{ fontSize: 'clamp(1.875rem, 4vw, 2.75rem)', lineHeight: 1.15, color: BRAND.ink }}
            >
              Most manager training doesn&apos;t stick.<br />Ours does.
            </h2>
            <p className="text-base sm:text-lg max-w-2xl mx-auto" style={{ color: BRAND.grey, lineHeight: 1.7 }}>
              The world of work has fundamentally shifted. Manager training hasn&apos;t. We built MQ to change that.
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden" style={{ border: `1px solid ${BRAND.tealSoft}` }}>
            {/* Table header */}
            <div className="grid grid-cols-2">
              <div className="px-6 py-4 text-xs font-bold uppercase tracking-[0.15em]" style={{ backgroundColor: '#F9FAFB', color: BRAND.greyLight }}>
                Traditional training
              </div>
              <div className="px-6 py-4 text-xs font-bold uppercase tracking-[0.15em]" style={{ backgroundColor: BRAND.darkGreen, color: BRAND.teal }}>
                The MQ way
              </div>
            </div>
            {[
              { trad: 'One-off workshop', mq: 'A 3+ month programme that embeds change' },
              { trad: 'Teaching at delegates', mq: 'Dynamic, interactive, coaching-led sessions' },
              { trad: 'Skills-first', mq: 'Mindset-first. Skills are built on top.' },
              { trad: 'Generic content for everyone', mq: 'Personalised at company and individual level' },
              { trad: 'Silence on culture', mq: 'Values and behaviours coached and embedded' },
              { trad: 'Trainers who teach theory', mq: 'Practitioners who\'ve done the role' },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-2" style={{ borderTop: `1px solid ${BRAND.tealSoft}` }}>
                <div className="px-6 py-4 text-sm flex items-start gap-2.5" style={{ backgroundColor: 'white', color: BRAND.grey }}>
                  <span className="flex-shrink-0 mt-0.5" style={{ color: '#EF4444' }}>✕</span>
                  <span style={{ textDecoration: 'line-through', textDecorationColor: 'rgba(156,163,175,0.5)' }}>{row.trad}</span>
                </div>
                <div className="px-6 py-4 text-sm font-semibold flex items-start gap-2.5" style={{ backgroundColor: BRAND.mintPale, color: BRAND.ink }}>
                  <span className="flex-shrink-0 mt-0.5" style={{ color: BRAND.inkSoft }}>✓</span>
                  <span>{row.mq}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE APP ─────────────────────────────────────────────────────────── */}
      <section
        id="the-app"
        className="py-20 sm:py-28 px-6 relative overflow-hidden"
        style={{ background: `linear-gradient(180deg, ${BRAND.darkGreen} 0%, #0d3830 100%)` }}
      >
        <div
          aria-hidden
          className="absolute rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ width: 640, height: 640, top: -140, left: -140, background: BRAND.teal }}
        />

        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.18em] mb-3" style={{ color: BRAND.teal }}>
              Enhanced by the MQ app
            </p>
            <h2
              className="font-black tracking-tight mb-5 text-white"
              style={{ fontSize: 'clamp(1.875rem, 4vw, 2.75rem)', lineHeight: 1.15 }}
            >
              Development that continues between sessions.
            </h2>
            <p className="text-base sm:text-lg max-w-2xl mx-auto" style={{ color: 'rgba(185,248,221,0.8)', lineHeight: 1.7 }}>
              The app is not the product. The programme is. But the app is how we extend coaching into the 99% of the
              time we&apos;re not in the room with your managers — and how we measure whether the programme actually
              moved the needle.
            </p>
          </div>

          {/* Video placeholder */}
          <div
            className="relative max-w-3xl mx-auto mb-14 rounded-2xl overflow-hidden"
            style={{ aspectRatio: '16/9', backgroundColor: 'rgba(10,46,42,0.6)', border: `1px solid rgba(10,243,205,0.2)` }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
                style={{ backgroundColor: BRAND.teal }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill={BRAND.darkGreen} aria-hidden>
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
              <p className="text-sm font-bold text-white">Walk-through coming soon</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(185,248,221,0.6)' }}>We&apos;re finishing the product tour</p>
            </div>
          </div>

          {/* Four pillars */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[
              {
                icon: '🧭',
                title: 'Self-awareness',
                body: 'A diagnostic that gives every manager a personal MQ score across seven dimensions. Focus on real weaknesses, not a generic curriculum.',
              },
              {
                icon: '🎯',
                title: 'Tailoring',
                body: 'Data-driven insight lets us personalise workshops and coaching beyond what people self-report. We bring evidence, not assumptions.',
              },
              {
                icon: '📈',
                title: 'Progress tracking',
                body: 'Measurement over time for the individual, the cohort, and the business. Finally, proof the programme moved the numbers.',
              },
              {
                icon: '💬',
                title: 'Embedding',
                body: 'Daily Spark, Coaching Room, Mindset Gym, Culture Lab, and 24 skill guides extend the programme well past session day.',
              },
            ].map((p, i) => (
              <div
                key={i}
                className="rounded-2xl p-6"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: `1px solid rgba(10,243,205,0.15)`, backdropFilter: 'blur(10px)' }}
              >
                <div className="text-2xl mb-3" aria-hidden>{p.icon}</div>
                <p className="text-sm font-bold text-white mb-2">{p.title}</p>
                <p className="text-xs" style={{ color: 'rgba(185,248,221,0.7)', lineHeight: 1.65 }}>{p.body}</p>
              </div>
            ))}
          </div>

          {/* Feature strip */}
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] mb-4" style={{ color: BRAND.teal }}>
              What&apos;s in the app
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['MQ Diagnostic', 'Daily Spark', 'Coaching Room', 'Mindset Gym', 'Culture Lab', '24 Skill Guides', '360 Feedback', 'Impact Dashboard'].map((f, i) => (
                <span
                  key={i}
                  className="text-xs font-semibold px-3.5 py-1.5 rounded-full"
                  style={{ backgroundColor: 'rgba(10,243,205,0.1)', color: BRAND.teal, border: `1px solid rgba(10,243,205,0.25)` }}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── OUTCOMES ────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.18em] mb-3" style={{ color: BRAND.inkSoft }}>
              The outcomes
            </p>
            <h2
              className="font-black tracking-tight mb-5"
              style={{ fontSize: 'clamp(1.875rem, 4vw, 2.75rem)', lineHeight: 1.15, color: BRAND.ink }}
            >
              Stronger managers.<br />Better businesses.
            </h2>
            <p className="text-base sm:text-lg max-w-2xl mx-auto" style={{ color: BRAND.grey, lineHeight: 1.7 }}>
              We coach managers like Execs — so they start showing up like leaders before they have the title.
              Here&apos;s what the research says happens when they do.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { n: '69%', l: 'increased engagement' },
              { n: '66%', l: 'increased commitment' },
              { n: '73%', l: 'enhanced leadership development' },
              { n: '85%', l: 'outperform peers in resilience and agility' },
            ].map((s, i) => (
              <div
                key={i}
                className="rounded-2xl p-5 text-center"
                style={{ backgroundColor: BRAND.mint, border: `1px solid ${BRAND.tealSoft}` }}
              >
                <p
                  className="font-black leading-none mb-2"
                  style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: BRAND.darkGreen }}
                >
                  {s.n}
                </p>
                <p className="text-xs" style={{ color: BRAND.grey, lineHeight: 1.5 }}>{s.l}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-center" style={{ color: BRAND.greyLight }}>
            Research across coached manager cohorts.
          </p>
        </div>
      </section>

      {/* ── MEET THE PRACTITIONERS ──────────────────────────────────────────── */}
      <section
        className="py-20 sm:py-28 px-6"
        style={{ backgroundColor: BRAND.mint }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.18em] mb-3" style={{ color: BRAND.inkSoft }}>
              Who we are
            </p>
            <h2
              className="font-black tracking-tight mb-5"
              style={{ fontSize: 'clamp(1.875rem, 4vw, 2.75rem)', lineHeight: 1.15, color: BRAND.ink }}
            >
              Practitioners, not trainers.
            </h2>
            <p className="text-base sm:text-lg max-w-2xl mx-auto" style={{ color: BRAND.grey, lineHeight: 1.7 }}>
              Two People people who believe that creating the conditions for your team to thrive is a must-have,
              not a nice-to-have. As seasoned operators, we&apos;ve led through pressure and know what it takes.
              That&apos;s the edge we bring, and the one we unlock in others.
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden mb-10" style={{ boxShadow: '0 20px 60px rgba(10,46,42,0.12)' }}>
            <div className="relative" style={{ aspectRatio: '3/2' }}>
              <Image
                src="/founders.jpg"
                alt="Richard Album and Maria Orphanides, founders of MQ"
                fill
                sizes="(max-width: 768px) 100vw, 1200px"
                style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
                priority={false}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Maria */}
            <div className="rounded-2xl p-7" style={{ backgroundColor: 'white', border: `1px solid ${BRAND.tealSoft}` }}>
              <p className="text-xl font-black mb-1" style={{ color: BRAND.ink }}>Maria Orphanides</p>
              <p className="text-xs font-bold uppercase tracking-[0.15em] mb-4" style={{ color: BRAND.inkSoft }}>
                Co-founder · People & Talent
              </p>
              <p className="text-sm" style={{ color: BRAND.grey, lineHeight: 1.7 }}>
                A seasoned People & Talent leader and executive coach with 20 years of experience, including five as
                HR Director at Atomico. Maria brings sharp strategic insight and operational depth from building
                high-performing teams in high-pressure VC and PE environments. Her coaching combines neuroscience
                and behavioural psychology to shift mindsets, break limiting patterns, and transform how people think,
                lead, and perform.
              </p>
            </div>

            {/* Richard */}
            <div className="rounded-2xl p-7" style={{ backgroundColor: 'white', border: `1px solid ${BRAND.tealSoft}` }}>
              <p className="text-xl font-black mb-1" style={{ color: BRAND.ink }}>Richard Album</p>
              <p className="text-xs font-bold uppercase tracking-[0.15em] mb-4" style={{ color: BRAND.inkSoft }}>
                Co-founder · Learning & Coaching
              </p>
              <p className="text-sm" style={{ color: BRAND.grey, lineHeight: 1.7 }}>
                An award-winning L&D leader, executive coach, and world-class facilitator with decades of experience
                across law, finance, healthcare, real estate and tech. A former City lawyer and board member,
                Richard brings sharp commercial acumen and leadership experience. He has delivered thousands of hours
                of workshops and coaching, and is renowned for his ability to read the room and shift group dynamics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <div
            className="relative rounded-3xl overflow-hidden p-10 sm:p-16 text-center"
            style={{ background: `linear-gradient(135deg, ${BRAND.darkGreen} 0%, #0d3830 60%, #0f443a 100%)` }}
          >
            <div
              aria-hidden
              className="absolute rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ width: 420, height: 420, top: -120, right: -80, background: BRAND.teal }}
            />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.18em] mb-4" style={{ color: BRAND.teal }}>
                Ready when you are
              </p>
              <h2
                className="font-black tracking-tight mb-5 text-white"
                style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', lineHeight: 1.15 }}
              >
                Let&apos;s talk about your managers.
              </h2>
              <p className="text-base mb-8 max-w-xl mx-auto" style={{ color: 'rgba(185,248,221,0.8)', lineHeight: 1.7 }}>
                Book a 30-minute discovery call. We&apos;ll talk through your team, your context, and whether the Accelerator
                is the right fit. No pitch deck, no pressure.
              </p>
              <a
                href={bookCallHref}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
                style={{ backgroundColor: BRAND.teal, color: BRAND.darkGreen, boxShadow: '0 10px 30px rgba(10,243,205,0.25)' }}
              >
                Book a discovery call
                <span aria-hidden>→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer
        className="py-10 px-6"
        style={{
          backgroundColor: BRAND.darkGreen,
          color: 'rgba(185,248,221,0.7)',
          // Extend footer to absorb the 5rem bottom-margin trick above —
          // keeps the dark-green section flush to the viewport bottom.
          paddingBottom: 'calc(2.5rem + 5rem)',
        }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black tracking-tight"
              style={{ backgroundColor: 'rgba(10,243,205,0.1)', color: 'white' }}
            >
              M<span style={{ color: BRAND.teal }}>Q</span>
            </div>
            <p className="text-xs">
              Mindset Quotient<sup className="text-[8px]">®</sup> · The Manager Mindset Accelerator
            </p>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <a href="https://www.mindsetquo.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 opacity-80 transition-opacity">
              mindsetquo.com
            </a>
            <Link href="/privacy" className="hover:opacity-100 opacity-80 transition-opacity">
              Privacy
            </Link>
            <Link href="/login" className="hover:opacity-100 opacity-80 transition-opacity">
              App login
            </Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
