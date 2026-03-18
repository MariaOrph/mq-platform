'use client'

import { useState, useEffect } from 'react'

const SLIDES = [
  {
    id: 'welcome',
    tag: 'Welcome',
    title: 'Welcome to MQ',
    subtitle: 'Your leadership development journey starts here.',
    body: 'MQ (Mindset Quotient) is a leadership development platform built around a simple but powerful idea: the most effective leaders aren\'t just technically skilled. They understand themselves, manage their inner world, and bring that awareness into how they lead others.',
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
    body: 'MQ is defined as the ability to notice your own thoughts, beliefs and emotional triggers, and choose how you respond to them, rather than being unconsciously driven by them. It\'s the difference between reacting on autopilot and leading with intention.',
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
            {i < 3 && <div style={{ width: 1, height: 8, backgroundColor: 'rgba(10,46,42,0.12)' }} />}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'mindset-dims',
    tag: 'Inner World',
    title: 'Managing your inner world',
    subtitle: 'The 4 Inner World dimensions.',
    body: '',
    visual: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
        {[
          { name: 'Self-awareness',       color: '#0AF3CD', desc: 'Noticing your thoughts, feelings and patterns as they arise.' },
          { name: 'Ego & identity',       color: '#EC4899', desc: 'Leading from values and strength, not from ego protection.' },
          { name: 'Emotional regulation', color: '#F97316', desc: 'Managing emotional responses so they serve rather than derail you.' },
          { name: 'Cognitive flexibility', color: '#05A88E', desc: 'Holding multiple perspectives and updating your thinking.' },
        ].map((d, i) => (
          <div key={i} style={{ padding: '10px 14px', borderRadius: 14, backgroundColor: `${d.color}15`, border: `1px solid ${d.color}30` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: d.color, flexShrink: 0 }} />
              <p style={{ fontSize: 12, fontWeight: 700, color: d.color, margin: 0 }}>{d.name}</p>
            </div>
            <p style={{ fontSize: 11, color: 'rgba(10,46,42,0.6)', margin: 0, lineHeight: 1.5 }}>{d.desc}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'rel-culture-dims',
    tag: 'Leading Outward',
    title: 'Leading others and shaping culture',
    subtitle: 'The 3 Leading Outward dimensions.',
    body: '',
    visual: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
        {[
          { name: 'Values & purpose',   color: '#3B82F6', desc: 'Knowing what you stand for and leading with a sense of direction.' },
          { name: 'Relational mindset', color: '#8B5CF6', desc: 'The quality of presence and attention you bring to every interaction.' },
          { name: 'Adaptive resilience',color: '#F59E0B', desc: 'Sustaining performance under pressure and shaping a resilient culture.' },
        ].map((d, i) => (
          <div key={i} style={{ padding: '12px 14px', borderRadius: 14, backgroundColor: `${d.color}15`, border: `1px solid ${d.color}30` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: d.color, flexShrink: 0 }} />
              <p style={{ fontSize: 12, fontWeight: 700, color: d.color, margin: 0 }}>{d.name}</p>
            </div>
            <p style={{ fontSize: 11, color: 'rgba(10,46,42,0.6)', margin: 0, lineHeight: 1.5 }}>{d.desc}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'model',
    tag: 'The MQ Model',
    title: 'Three layers of leadership',
    subtitle: 'Mindset → Connecting with Others → Culture',
    body: 'Great leadership begins inside. It starts with how a leader manages their own mind (Mindset), deepens through the quality of their relationships (Connecting with Others), and ultimately shapes the culture of the teams and organisations they lead (Culture).',
    visual: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
        {[
          { label: 'Culture', sub: 'What you shape', color: '#a78bfa', width: '100%' },
          { label: 'Connecting with Others', sub: 'How you lead through people', color: '#0AF3CD', width: '80%' },
          { label: 'Mindset', sub: 'Who you are', color: '#fdcb5e', width: '55%' },
        ].map((layer, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: layer.width, padding: '10px 16px', borderRadius: 12, backgroundColor: `${layer.color}20`, border: `1.5px solid ${layer.color}40`, textAlign: 'center' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: layer.color, margin: 0 }}>{layer.label}</p>
              <p style={{ fontSize: 10, color: 'rgba(10,46,42,0.5)', margin: 0 }}>{layer.sub}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'journey',
    tag: "Your Journey",
    title: "How it all works",
    subtitle: 'Five steps to building your MQ.',
    body: '',
    visual: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
        {[
          { step: 1, label: 'Complete the MQ Assessment',       desc: 'Measures your 7 dimensions — takes around 10 minutes.',                           color: '#0AF3CD' },
          { step: 2, label: 'Complete Values in Action',        desc: 'Rate how consistently you lead by example through your company\'s values.', color: '#fdcb5e' },
          { step: 3, label: 'Build your MQ with Daily Spark',   desc: 'One short practice each day, tailored to your focus dimension.',   color: '#ff9f43' },
          { step: 4, label: 'Get support in the Coaching Room', desc: 'Your personal AI coach — bring any challenge you\'re sitting with.', color: '#a78bfa' },
          { step: 5, label: 'Explore the Resource Library',     desc: '25 practical guides covering management and leadership skills.',   color: '#00c9a7' },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '9px 12px', borderRadius: 12, backgroundColor: `${s.color}10`, border: `1px solid ${s.color}25` }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#0A2E2A' }}>{s.step}</span>
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#0A2E2A', margin: '0 0 1px' }}>{s.label}</p>
              <p style={{ fontSize: 10, color: 'rgba(10,46,42,0.55)', margin: 0, lineHeight: 1.4 }}>{s.desc}</p>
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
      backgroundColor: 'rgba(230,248,244,0.92)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
      opacity: exiting ? 0 : 1,
      transition: 'opacity 0.3s ease',
    }}>
      <div style={{
        width: '100%', maxWidth: 460,
        backgroundColor: '#f0faf6',
        borderRadius: 24,
        border: '1px solid rgba(10,46,42,0.1)',
        boxShadow: '0 24px 80px rgba(10,46,42,0.15)',
        overflow: 'hidden',
      }}>
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(10,46,42,0.08)' }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0AF3CD' }}>
            {current.tag}
          </span>
          <button onClick={finish} style={{ fontSize: 11, color: 'rgba(10,46,42,0.4)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            Skip intro
          </button>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 5, justifyContent: 'center', padding: '14px 0 0' }}>
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)}
              style={{ width: i === slide ? 20 : 6, height: 6, borderRadius: 3, border: 'none', cursor: 'pointer',
                       backgroundColor: i === slide ? '#0AF3CD' : i < slide ? 'rgba(10,243,205,0.6)' : 'rgba(10,46,42,0.15)',
                       transition: 'all 0.3s ease', padding: 0 }} />
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '20px 24px 8px' }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0A2E2A', margin: '0 0 4px', lineHeight: 1.2 }}>
            {current.title}
          </h2>
          <p style={{ fontSize: 13, color: '#0AF3CD', margin: '0 0 12px', fontWeight: 500 }}>
            {current.subtitle}
          </p>
          {current.body && (
            <p style={{ fontSize: 13, color: 'rgba(10,46,42,0.65)', lineHeight: 1.7, margin: 0 }}>
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
              style={{ flex: '0 0 auto', padding: '12px 20px', borderRadius: 14, border: '1px solid rgba(10,46,42,0.15)',
                       backgroundColor: 'white', color: 'rgba(10,46,42,0.5)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
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
