'use client'

import { useState, useEffect } from 'react'

const SLIDES = [
  {
    id: 'welcome',
    tag: 'Welcome',
    title: 'Welcome to MQ',
    subtitle: 'Your leadership development journey starts here.',
    body: 'MQ — Mindset Quotient — is a leadership development platform built around a simple but powerful idea: the most effective leaders aren\'t just technically skilled. They understand themselves, manage their inner world, and bring that awareness into how they lead others.',
    visual: (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ position: 'relative', width: 120, height: 120 }}>
          <div style={{ width: 120, height: 120, borderRadius: '50%', backgroundColor: '#0AF3CD', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(10,243,205,0.4)' }}>
            <span style={{ fontSize: 48, fontWeight: 900, color: '#0A2E2A' }}>MQ</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'what-is-mq',
    tag: 'What is MQ?',
    title: 'Mindset Quotient',
    subtitle: 'The ability to choose how you respond.',
    body: 'MQ is defined as the ability to notice your own thoughts, beliefs and emotional triggers — and choose how you respond to them, rather than being unconsciously driven by them. It\'s the difference between reacting on autopilot and leading with intention.',
    visual: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
        {[
          { label: 'Stimulus', icon: '⚡', color: '#ff7b7a' },
          { label: 'Awareness', icon: '👁', color: '#0AF3CD' },
          { label: 'Choice', icon: '✦', color: '#fdcb5e' },
          { label: 'Response', icon: '→', color: '#00c9a7' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: `${item.color}20`, border: `1.5px solid ${item.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              {item.icon}
            </div>
            <span style={{ fontSize: 10, fontWeight: 600, color: item.color }}>{item.label}</span>
            {i < 3 && <div style={{ width: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.2)' }} />}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'model',
    tag: 'The MQ Model',
    title: 'Three layers of leadership',
    subtitle: 'Mindset → Relationships → Culture',
    body: 'Great leadership begins inside. It starts with how a leader manages their own mind (Mindset), deepens through the quality of their relationships (Relationships), and ultimately shapes the culture of the teams and organisations they lead (Culture).',
    visual: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
        {[
          { label: 'Culture', sub: 'What you shape', color: '#a78bfa', width: '100%' },
          { label: 'Relationships', sub: 'How you connect', color: '#0AF3CD', width: '80%' },
          { label: 'Mindset', sub: 'Who you are', color: '#fdcb5e', width: '55%' },
        ].map((layer, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: layer.width, padding: '10px 16px', borderRadius: 12, backgroundColor: `${layer.color}20`, border: `1.5px solid ${layer.color}40`, textAlign: 'center' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: layer.color, margin: 0 }}>{layer.label}</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', margin: 0 }}>{layer.sub}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'dimensions',
    tag: 'The 6 Dimensions',
    title: 'Six dimensions of MQ',
    subtitle: 'Together they map the full landscape of your leadership mindset.',
    body: '',
    visual: (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%' }}>
        {[
          { name: 'Self-awareness',        color: '#fdcb5e', icon: '👁' },
          { name: 'Cognitive flexibility', color: '#ff9f43', icon: '🔄' },
          { name: 'Emotional regulation',  color: '#ff7b7a', icon: '⚖️' },
          { name: 'Values clarity',        color: '#00c9a7', icon: '🧭' },
          { name: 'Relational mindset',    color: '#2d4a8a', icon: '🤝' },
          { name: 'Adaptive resilience',   color: '#a78bfa', icon: '🌱' },
        ].map((d, i) => (
          <div key={i} style={{ padding: '10px 12px', borderRadius: 12, backgroundColor: `${d.color}15`, border: `1px solid ${d.color}30` }}>
            <div style={{ fontSize: 16, marginBottom: 4 }}>{d.icon}</div>
            <p style={{ fontSize: 11, fontWeight: 600, color: d.color, margin: 0, lineHeight: 1.3 }}>{d.name}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'mindset-dims',
    tag: 'Mindset',
    title: 'The Mindset dimensions',
    subtitle: 'How you manage your inner world.',
    body: '',
    visual: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
        {[
          { name: 'Self-awareness', color: '#fdcb5e', desc: 'Noticing your thoughts, feelings and patterns as they arise.' },
          { name: 'Cognitive flexibility', color: '#ff9f43', desc: 'Holding multiple perspectives and updating your thinking.' },
          { name: 'Emotional regulation', color: '#ff7b7a', desc: 'Managing emotional responses so they serve rather than derail you.' },
        ].map((d, i) => (
          <div key={i} style={{ padding: '12px 14px', borderRadius: 14, backgroundColor: `${d.color}15`, border: `1px solid ${d.color}30` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: d.color, flexShrink: 0 }} />
              <p style={{ fontSize: 12, fontWeight: 700, color: d.color, margin: 0 }}>{d.name}</p>
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.5 }}>{d.desc}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'rel-culture-dims',
    tag: 'Relationships & Culture',
    title: 'How you connect and shape culture',
    subtitle: 'Leadership happens through people.',
    body: '',
    visual: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
        {[
          { name: 'Values clarity', color: '#00c9a7', desc: 'Knowing what you stand for — and acting like it.' },
          { name: 'Relational mindset', color: '#2d4a8a', desc: 'The quality of presence and attention you bring to every interaction.' },
          { name: 'Adaptive resilience', color: '#a78bfa', desc: 'Sustaining performance under pressure and shaping a resilient culture.' },
        ].map((d, i) => (
          <div key={i} style={{ padding: '12px 14px', borderRadius: 14, backgroundColor: `${d.color}20`, border: `1px solid ${d.color}40` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: d.color, flexShrink: 0 }} />
              <p style={{ fontSize: 12, fontWeight: 700, color: d.color, margin: 0 }}>{d.name}</p>
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.5 }}>{d.desc}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'journey',
    tag: "What's next",
    title: "Your MQ journey",
    subtitle: 'Four things that work together.',
    body: '',
    visual: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
        {[
          { step: '01', label: 'MQ Assessment', desc: '~10 minutes. Measures your 6 dimensions.', color: '#0AF3CD' },
          { step: '02', label: 'Your Results', desc: 'A personal profile with scores and explanations.', color: '#fdcb5e' },
          { step: '03', label: 'Daily Spark', desc: 'A short practice each day, tailored to your focus area.', color: '#ff9f43' },
          { step: '04', label: 'Coaching Room', desc: 'Your personal AI coach — always in context.', color: '#a78bfa' },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 14px', borderRadius: 14, backgroundColor: `${s.color}12`, border: `1px solid ${s.color}25` }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: s.color, flexShrink: 0, marginTop: 2 }}>{s.step}</span>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: s.color, margin: '0 0 2px' }}>{s.label}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', margin: 0 }}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
]

const STORAGE_KEY = 'mq_onboarding_complete'

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
      backgroundColor: 'rgba(10,46,42,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
      opacity: exiting ? 0 : 1,
      transition: 'opacity 0.3s ease',
    }}>
      <div style={{
        width: '100%', maxWidth: 460,
        backgroundColor: '#0A2E2A',
        borderRadius: 24,
        border: '1px solid rgba(10,243,205,0.2)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        overflow: 'hidden',
      }}>
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(10,243,205,0.1)' }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0AF3CD' }}>
            {current.tag}
          </span>
          <button onClick={finish} style={{ fontSize: 11, color: 'rgba(185,248,221,0.4)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            Skip intro
          </button>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 5, justifyContent: 'center', padding: '14px 0 0' }}>
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)}
              style={{ width: i === slide ? 20 : 6, height: 6, borderRadius: 3, border: 'none', cursor: 'pointer',
                       backgroundColor: i === slide ? '#0AF3CD' : i < slide ? 'rgba(10,243,205,0.4)' : 'rgba(255,255,255,0.15)',
                       transition: 'all 0.3s ease', padding: 0 }} />
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '20px 24px 8px' }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: 'white', margin: '0 0 4px', lineHeight: 1.2 }}>
            {current.title}
          </h2>
          <p style={{ fontSize: 13, color: '#0AF3CD', margin: '0 0 12px', fontWeight: 500 }}>
            {current.subtitle}
          </p>
          {current.body && (
            <p style={{ fontSize: 13, color: 'rgba(185,248,221,0.75)', lineHeight: 1.7, margin: 0 }}>
              {current.body}
            </p>
          )}
        </div>

        {/* Visual area */}
        <div style={{ padding: '16px 24px', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {current.visual}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 10, padding: '0 24px 24px' }}>
          {slide > 0 && (
            <button onClick={prev}
              style={{ flex: '0 0 auto', padding: '12px 20px', borderRadius: 14, border: '1px solid rgba(10,243,205,0.2)',
                       backgroundColor: 'transparent', color: 'rgba(185,248,221,0.6)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              ← Back
            </button>
          )}
          <button onClick={next}
            style={{ flex: 1, padding: '14px 20px', borderRadius: 14, border: 'none',
                     backgroundColor: '#0AF3CD', color: '#0A2E2A', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
            {isLast ? "Let's go →" : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Helper to check if onboarding should show
export function shouldShowOnboarding(): boolean {
  try { return !localStorage.getItem(STORAGE_KEY) } catch { return false }
}
