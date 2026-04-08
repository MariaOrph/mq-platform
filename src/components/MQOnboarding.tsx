'use client'

import { useState } from 'react'

// ── Slide definitions ──────────────────────────────────────────────────────────

const SLIDES = [
  {
    id: 'welcome',
    tag: 'Welcome to MQ',
    title: 'The best managers and leaders share one thing: they know how their mind works.',
    subtitle: '',
    body: 'MQ is the only development platform that combines rigorous mindset science and psychology with practical skills development, and personalised coaching. Most training tells you what to do. MQ builds your capacity to actually do it, under pressure, in the moments that matter.',
    visual: (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, width: '100%' }}>
        {/* Hero lockup */}
        <div style={{
          width: '100%', borderRadius: 20, padding: '28px 24px',
          background: 'linear-gradient(135deg, #0A2E2A 0%, #0d3830 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', backgroundColor: 'transparent',
            border: '2px solid rgba(10,243,205,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img src="/Favicon_White.png" alt="MQ" style={{ width: 50, height: 50, objectFit: 'contain' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: 'rgba(185,248,221,0.85)', margin: 0, lineHeight: 1.7 }}>
              MQ — Mindset Quotient® — measures your capacity to notice your own thoughts, beliefs and emotional patterns, and to consciously choose how you respond rather than being driven by them automatically. It&apos;s the foundation of self-directed, effective leadership. Without it, skills stay theoretical. With it, everything changes.
            </p>
          </div>
        </div>
      </div>
    ),
  },

  {
    id: 'dimensions',
    tag: 'The Science',
    title: 'Seven dimensions. Decades of research behind every one.',
    subtitle: '',
    body: 'MQ maps the seven dimensions of your inner world most directly linked to how you manage and lead. All grounded in evidence from psychology, neuroscience, and leadership research.\n\nAnd unlike psychometrics that measure your type and leave you there, MQ measures your capacity for effective leadership, and then helps you build it.',
    visual: (() => {
      const dims = [
        { lines: ['Self-', 'awareness'],       color: '#fdcb5e', textColor: '#0A2E2A' },
        { lines: ['Ego &', 'identity'],        color: '#EC4899', textColor: '#ffffff' },
        { lines: ['Emotional', 'regulation'],  color: '#ff7b7a', textColor: '#0A2E2A' },
        { lines: ['Cognitive', 'flexibility'], color: '#ff9f43', textColor: '#0A2E2A' },
        { lines: ['Values &', 'purpose'],      color: '#00c9a7', textColor: '#0A2E2A' },
        { lines: ['Relational', 'mindset'],    color: '#2d4a8a', textColor: '#ffffff' },
        { lines: ['Adaptive', 'resilience'],   color: '#a78bfa', textColor: '#0A2E2A' },
      ]
      const cx = 130, cy = 130, R = 118, r = 50
      const gapRad = 0.035
      const segAngle = (2 * Math.PI) / dims.length
      const startOff = -Math.PI / 2
      const midRad = (R + r) / 2

      const p2c = (radius: number, angle: number) => ({
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      })

      const arcPath = (a1: number, a2: number) => {
        const s1 = p2c(r, a1), s2 = p2c(R, a1)
        const e1 = p2c(R, a2), e2 = p2c(r, a2)
        return `M${s1.x.toFixed(2)},${s1.y.toFixed(2)} L${s2.x.toFixed(2)},${s2.y.toFixed(2)} A${R},${R},0,0,1,${e1.x.toFixed(2)},${e1.y.toFixed(2)} L${e2.x.toFixed(2)},${e2.y.toFixed(2)} A${r},${r},0,0,0,${s1.x.toFixed(2)},${s1.y.toFixed(2)}Z`
      }

      const textRot = (mid: number) => {
        let rot = (mid * 180 / Math.PI) + 90
        while (rot > 180) rot -= 360
        while (rot < -180) rot += 360
        if (rot > 90 || rot < -90) rot += 180
        return rot
      }

      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '100%' }}>
          <svg viewBox="0 0 260 260" style={{ width: '100%', maxWidth: 260, height: 'auto' }}>
            {dims.map((dim, i) => {
              const a1 = startOff + i * segAngle + gapRad
              const a2 = startOff + (i + 1) * segAngle - gapRad
              const mid = startOff + (i + 0.5) * segAngle
              const tp = p2c(midRad, mid)
              const rot = textRot(mid)
              return (
                <g key={i}>
                  <path d={arcPath(a1, a2)} fill={dim.color} />
                  <text
                    transform={`translate(${tp.x.toFixed(1)},${tp.y.toFixed(1)}) rotate(${rot.toFixed(1)})`}
                    textAnchor="middle"
                    fill={dim.textColor}
                    fontSize="7.5"
                    fontWeight="800"
                  >
                    {dim.lines.map((line, li) => (
                      <tspan key={li} x="0" dy={li === 0 ? `${-(dim.lines.length - 1) * 0.55}em` : '1.1em'}>
                        {line}
                      </tspan>
                    ))}
                  </text>
                </g>
              )
            })}
            <circle cx={cx} cy={cy} r={r - 4} fill="white" />
            <text x={cx} y={cy - 4} textAnchor="middle" fill="#0A2E2A" fontSize="17" fontWeight="900">MQ</text>
            <text x={cx} y={cy + 11} textAnchor="middle" fill="rgba(10,46,42,0.4)" fontSize="6.5" fontWeight="700" style={{ letterSpacing: '0.08em' }}>7 DIMENSIONS</text>
          </svg>
        </div>
      )
    })(),
  },

  {
    id: 'platform',
    tag: 'Your Journey',
    title: 'Three steps. A lifetime of better leadership.',
    subtitle: '',
    body: 'Everything in MQ flows from a clear picture of where you actually are — and a structured path to get where you want to be.',
    visual: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
        {([
          {
            step: '1',
            label: 'Get your MQ profile',
            desc: 'Take the MQ Assessment (~15 mins) and get a personalised score across the 7 MQ dimensions, as well as how fully you are living your company\'s values. Your baseline — and the start of everything. Invite colleagues for a 360 view.',
            color: '#0AF3CD',
          },
          {
            step: '2',
            label: 'Start building',
            desc: 'Daily challenges targeted to your profile, delivered to your dashboard. Plus three coaching zones available 24/7 — the Coaching Room, Mindset Gym, and Culture Lab — all completely confidential, and tailored to you.',
            color: '#fdcb5e',
          },
          {
            step: '3',
            label: 'Track your growth',
            desc: 'Reassess over time to see how your scores shift — and notice how you show up differently when it counts.',
            color: '#a78bfa',
          },
        ] as const).map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '11px 14px', borderRadius: 14,
            backgroundColor: `${item.color}12`, border: `1px solid ${item.color}35`,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              backgroundColor: item.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 900, color: '#0A2E2A',
            }}>
              {item.step}
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#0A2E2A', margin: '0 0 3px' }}>{item.label}</p>
              <p style={{ fontSize: 10, color: 'rgba(10,46,42,0.55)', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },

  {
    id: 'privacy',
    tag: 'Your Privacy',
    title: 'This only works if it feels safe.',
    subtitle: '',
    body: '',
    visual: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
        {([
          {
            icon: '🔒',
            label: 'Your coaching conversations are private',
            desc: 'Nobody else can read them — not your employer, not your HR team, not us.',
            color: '#0AF3CD',
          },
          {
            icon: '📊',
            label: 'Your individual scores are confidential',
            desc: 'Your MQ results belong to you. Never shared with your organisation without your explicit consent.',
            color: '#a78bfa',
          },
          {
            icon: '👥',
            label: 'Organisations see aggregated data only',
            desc: 'Your employer receives cohort-level reporting — averages across the group — never anything that identifies you individually.',
            color: '#fdcb5e',
          },
        ] as const).map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            padding: '10px 12px', borderRadius: 12,
            backgroundColor: `${item.color}10`, border: `1px solid ${item.color}28`,
          }}>
            <span style={{ fontSize: 18, flexShrink: 0, lineHeight: '1.4' }}>{item.icon}</span>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#0A2E2A', margin: '0 0 3px' }}>{item.label}</p>
              <p style={{ fontSize: 10, color: 'rgba(10,46,42,0.55)', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          </div>
        ))}
        <p style={{ fontSize: 10, color: 'rgba(10,46,42,0.4)', textAlign: 'center', margin: '4px 0 0', lineHeight: 1.5 }}>
          Read our full{' '}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#05A88E', textDecoration: 'underline' }}>Privacy Policy</a>
          {' '}to learn more about how we handle your data.
        </p>
      </div>
    ),
  },
]

// ── Storage ────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'mq_onboarding_complete'

// ── Component ──────────────────────────────────────────────────────────────────

export default function MQOnboarding({ onComplete }: { onComplete: () => void }) {
  const [slide, setSlide] = useState(0)
  const [exiting, setExiting] = useState(false)

  function finish() {
    setExiting(true)
    try { localStorage.setItem(STORAGE_KEY, '1') } catch { /* */ }
    setTimeout(onComplete, 300)
  }

  function next() {
    if (slide < SLIDES.length - 1) setSlide(s => s + 1)
    else finish()
  }

  function prev() {
    if (slide > 0) setSlide(s => s - 1)
  }

  const current = SLIDES[slide]
  const isLast  = slide === SLIDES.length - 1

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      backgroundColor: 'rgba(10,46,42,0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
      opacity: exiting ? 0 : 1,
      transition: 'opacity 0.3s ease',
    }}>
      <div style={{
        width: '100%', maxWidth: 440,
        backgroundColor: 'white',
        borderRadius: 28,
        boxShadow: '0 32px 80px rgba(10,46,42,0.35)',
        overflow: 'hidden',
      }}>

        {/* Top bar */}
        <div style={{
          background: 'linear-gradient(135deg, #0A2E2A, #0d3830)',
          padding: '16px 20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0AF3CD' }}>
            {current.tag}
          </span>
          <button onClick={finish} style={{
            fontSize: 11, color: '#0AF3CD',
            background: 'none', border: '1px solid rgba(10,243,205,0.4)', cursor: 'pointer', fontFamily: 'inherit',
            borderRadius: 20, padding: '4px 10px',
          }}>
            Skip intro
          </button>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 5, justifyContent: 'center', padding: '14px 0 0' }}>
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} style={{
              width: i === slide ? 20 : 6, height: 6, borderRadius: 3,
              border: 'none', cursor: 'pointer', padding: 0,
              backgroundColor: i === slide ? '#0AF3CD' : i < slide ? 'rgba(10,243,205,0.5)' : 'rgba(10,46,42,0.12)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>

        {/* Text content */}
        <div style={{ padding: '18px 24px 8px' }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0A2E2A', margin: '0 0 4px', lineHeight: 1.2 }}>
            {current.title}
          </h2>
          {current.subtitle && (
            <p style={{ fontSize: 12, color: '#0AF3CD', margin: '0 0 10px', fontWeight: 600 }}>
              {current.subtitle}
            </p>
          )}
          {current.body && (
            <p style={{ fontSize: 13, color: 'rgba(10,46,42,0.65)', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>
              {current.body}
            </p>
          )}
        </div>

        {/* Visual area */}
        <div style={{
          padding: '16px 24px',
          minHeight: 190,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {current.visual}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 10, padding: '0 24px 24px' }}>
          {slide > 0 && (
            <button onClick={prev} style={{
              flex: '0 0 auto', padding: '12px 20px', borderRadius: 14,
              border: '1px solid rgba(10,46,42,0.15)',
              backgroundColor: 'white', color: 'rgba(10,46,42,0.5)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              ← Back
            </button>
          )}
          <button onClick={next} style={{
            flex: 1, padding: '14px 20px', borderRadius: 14, border: 'none',
            backgroundColor: '#0AF3CD', color: '#0A2E2A',
            fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            {isLast ? "Let's go →" : 'Next →'}
          </button>
        </div>

      </div>
    </div>
  )
}

// ── Helper ─────────────────────────────────────────────────────────────────────

export function shouldShowOnboarding(): boolean {
  try { return !localStorage.getItem(STORAGE_KEY) } catch { return false }
}

export function resetOnboarding(): void {
  try { localStorage.removeItem(STORAGE_KEY) } catch { /* */ }
}
