'use client'

import { useState } from 'react'

// ── Slide definitions ──────────────────────────────────────────────────────────

const SLIDES = [
  {
    id: 'welcome',
    tag: 'Why MQ Exists',
    title: 'Become the leader you\'re capable of being.',
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
              MQ — Mindset Quotient — measures your capacity to notice your own thoughts, beliefs and emotional patterns, and to consciously choose how you respond rather than being driven by them automatically. It&apos;s the foundation of self-directed, effective leadership. Without it, skills stay theoretical. With it, everything changes.
            </p>
          </div>
        </div>
      </div>
    ),
  },

  {
    id: 'model',
    tag: 'The Missing Piece',
    title: 'The foundation other programmes overlook.',
    subtitle: '',
    body: 'Every other development programme focuses on what you do as a leader. MQ works on the layer beneath — the inner operating system that determines whether your skills actually show up when it matters.',
    visual: (
      <svg viewBox="0 0 300 192" style={{ width: '100%', height: 'auto' }}>
        {/* Mindset — top tier */}
        <polygon points="90,0 210,0 235,60 65,60"
          fill="rgba(10,243,205,0.10)" stroke="#0A2E2A" strokeWidth="1.5"/>
        <text x="150" y="25" textAnchor="middle" fill="#0AF3CD" fontSize="12" fontWeight="800">Mindset</text>
        <text x="150" y="43" textAnchor="middle" fill="rgba(10,46,42,0.55)" fontSize="9">Mastering how you lead yourself</text>

        {/* Relationships — middle tier */}
        <polygon points="65,64 235,64 265,124 35,124"
          fill="rgba(10,243,205,0.07)" stroke="#0A2E2A" strokeWidth="1.5"/>
        <text x="150" y="89" textAnchor="middle" fill="#0AF3CD" fontSize="12" fontWeight="800">Relationships</text>
        <text x="150" y="107" textAnchor="middle" fill="rgba(10,46,42,0.55)" fontSize="9">How you connect with others and build trust</text>

        {/* Culture — bottom tier */}
        <polygon points="35,128 265,128 300,192 0,192"
          fill="rgba(10,243,205,0.04)" stroke="#0A2E2A" strokeWidth="1.5"/>
        <text x="150" y="155" textAnchor="middle" fill="#0AF3CD" fontSize="12" fontWeight="800">Culture</text>
        <text x="150" y="173" textAnchor="middle" fill="rgba(10,46,42,0.55)" fontSize="9">How you bring values to life and shape the environment</text>
      </svg>
    ),
  },

  {
    id: 'dimensions',
    tag: 'The Science',
    title: 'Seven dimensions. Decades of research behind every one.',
    subtitle: '',
    body: 'MQ maps the seven dimensions of your inner world most directly linked to how you manage and lead. Grounded in evidence from psychology, neuroscience, and leadership research. And unlike psychometrics that measure your type and leave you there, MQ measures your capacity for effective leadership — and then helps you build it.',
    visual: (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          {
            layer: 'Mindset', color: '#fdcb5e',
            dims: [
              { name: 'Self-awareness',        color: '#fdcb5e' },
              { name: 'Ego & identity',         color: '#EC4899' },
              { name: 'Emotional regulation',   color: '#ff7b7a' },
              { name: 'Cognitive flexibility',  color: '#ff9f43' },
            ],
          },
          {
            layer: 'Relationships & Culture', color: '#0AF3CD',
            dims: [
              { name: 'Values & purpose',   color: '#00c9a7' },
              { name: 'Relational mindset', color: '#2d4a8a' },
              { name: 'Adaptive resilience', color: '#a78bfa' },
            ],
          },
        ].map((group, gi) => (
          <div key={gi}>
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
              textTransform: 'uppercase' as const,
              color: 'rgba(10,46,42,0.5)', margin: '0 0 6px', paddingLeft: 2,
            }}>
              {group.layer}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 5 }}>
              {group.dims.map((d, di) => (
                <div key={di} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 10px', borderRadius: 20,
                  backgroundColor: `${d.color}18`, border: `1px solid ${d.color}45`,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#0A2E2A' }}>{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    ),
  },

  {
    id: 'platform',
    tag: 'Your Journey',
    title: 'Not a course. A personalised development journey.',
    subtitle: '',
    body: 'MQ starts with an assessment of where you actually are across all seven dimensions. Everything that follows is built around your specific profile and development opportunities.',
    visual: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, width: '100%' }}>
        {([
          { icon: '📊', label: 'Start with the assessment',    desc: 'Measure your 7 MQ dimensions. The foundation everything else is built on.',  color: '#0AF3CD' },
          { icon: '⚡', label: 'Complete Daily Spark each day', desc: 'One short daily practice, tailored to your specific development areas.',           color: '#fdcb5e' },
          { icon: '💬', label: 'Access on-demand personalised coaching', desc: 'Bring any real management situation to a coach that knows your profile deeply.',                    color: '#0AF3CD' },
          { icon: '🧠', label: 'Grow with MQ Builder',         desc: 'Guided development across all 7 dimensions, to help you build your capacity to lead.',                               color: '#a78bfa' },
          { icon: '🧪', label: 'Build with the Culture Lab',   desc: 'Get tailored coaching support to help you build values, psychological safety, accountability and inclusion in your team.',  color: '#F59E0B' },
          { icon: '📚', label: 'Explore the Resource Centre',  desc: 'Bite-size management and leadership skill guides, built for the real world.',              color: '#ff7b7a' },
        ] as const).map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            padding: '9px 12px', borderRadius: 12,
            backgroundColor: `${item.color}10`, border: `1px solid ${item.color}28`,
          }}>
            <span style={{ fontSize: 16, flexShrink: 0, lineHeight: '1.5' }}>{item.icon}</span>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#0A2E2A', margin: '0 0 2px' }}>{item.label}</p>
              <p style={{ fontSize: 10, color: 'rgba(10,46,42,0.55)', margin: 0, lineHeight: 1.45 }}>{item.desc}</p>
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
            <p style={{ fontSize: 13, color: 'rgba(10,46,42,0.65)', lineHeight: 1.7, margin: 0 }}>
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
