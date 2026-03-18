'use client'

import { useState } from 'react'

// ── Slide definitions ──────────────────────────────────────────────────────────

const SLIDES = [
  {
    id: 'welcome',
    tag: 'Welcome',
    title: 'Welcome to MQ',
    subtitle: '',
    body: '',
    visual: (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, width: '100%' }}>
        {/* Hero lockup */}
        <div style={{
          width: '100%', borderRadius: 20, padding: '28px 24px',
          background: 'linear-gradient(135deg, #0A2E2A 0%, #0d3830 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 76, height: 76, borderRadius: '50%', backgroundColor: '#0AF3CD',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(10,243,205,0.5)',
          }}>
            <img src="/logo.png" alt="MQ" style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 10 }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: 'white', margin: '0 0 4px', letterSpacing: '0.02em' }}>
              Mindset Quotient
            </p>
            <p style={{ fontSize: 11, color: 'rgba(10,243,205,0.7)', margin: 0, lineHeight: 1.5 }}>
              Your capacity to notice your thoughts, beliefs and emotional patterns — and consciously choose how you respond.
            </p>
          </div>
        </div>
        {/* Tagline */}
        <p style={{ fontSize: 12, color: 'rgba(10,46,42,0.45)', textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
          The inner foundation that all effective leadership is built on.
        </p>
      </div>
    ),
  },

  {
    id: 'model',
    tag: 'The MQ Model',
    title: 'Three foundations of great leadership',
    subtitle: 'Mindset · Relationships · Culture',
    body: 'Great leadership develops in three layers — beginning with how you manage your inner world, building through the relationships you cultivate with others, and scaling through the culture you help shape around you.',
    visual: (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {([
          {
            label: 'Mindset',       sub: 'How you lead yourself',
            desc: 'The foundation of all great leadership — mastering how you lead yourself before you can truly lead others.',
            color: '#fdcb5e', indent: 0,
          },
          {
            label: 'Relationships', sub: 'How you lead others',
            desc: 'The trust, presence and intention you bring to every interaction and conversation.',
            color: '#0AF3CD', indent: 14,
          },
          {
            label: 'Culture',       sub: 'What you shape',
            desc: 'The values, norms, psychological safety and environment you create as a leader.',
            color: '#a78bfa', indent: 28,
          },
        ] as const).map((layer, i) => (
          <div key={i} style={{ marginLeft: layer.indent }}>
            <div style={{
              padding: '11px 14px', borderRadius: 14,
              backgroundColor: `${layer.color}18`, border: `1.5px solid ${layer.color}55`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: layer.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 800, color: layer.color }}>{layer.label}</span>
                <span style={{ fontSize: 10, color: 'rgba(10,46,42,0.4)', marginLeft: 2 }}>— {layer.sub}</span>
              </div>
              <p style={{ fontSize: 11, color: 'rgba(10,46,42,0.6)', margin: 0, lineHeight: 1.55, paddingLeft: 15 }}>
                {layer.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    ),
  },

  {
    id: 'dimensions',
    tag: 'The 7 Dimensions',
    title: 'Your 7 MQ dimensions',
    subtitle: '',
    body: '',
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
              color: group.color, margin: '0 0 6px', paddingLeft: 2,
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
    tag: 'The Platform',
    title: "Here's how to use the MQ app",
    subtitle: '',
    body: '',
    visual: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, width: '100%' }}>
        {([
          { icon: '📊', label: 'Start with the assessments',    color: '#0AF3CD' },
          { icon: '⚡', label: 'Complete Daily Spark each day', color: '#fdcb5e' },
          { icon: '💬', label: 'Anytime personalised coaching', color: '#0AF3CD' },
          { icon: '🧠', label: 'Grow with MQ Builder',         color: '#a78bfa' },
          { icon: '🧪', label: 'Build with the Culture Lab',    color: '#F59E0B' },
          { icon: '📚', label: 'Explore the Resource Centre',  color: '#ff7b7a' },
        ] as const).map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 12,
            backgroundColor: `${item.color}10`, border: `1px solid ${item.color}28`,
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#0A2E2A', margin: 0 }}>{item.label}</p>
          </div>
        ))}
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
    try { sessionStorage.setItem(STORAGE_KEY, '1') } catch { /* */ }
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
            fontSize: 11, color: 'rgba(185,248,221,0.45)',
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
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
  try { return !sessionStorage.getItem(STORAGE_KEY) } catch { return false }
}
