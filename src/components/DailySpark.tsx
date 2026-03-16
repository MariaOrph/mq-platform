'use client'

import { useEffect, useState, useCallback } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────────

interface SparkCard {
  id: string
  card_number: number
  dimension_id: number
  title: string | null
  teaser: string | null
  reflection: string | null
  exercise: string | null
  insight: string | null
  status: 'active' | 'complete'
  assigned_date: string
  completed_date: string | null
}

interface DailySparkProps {
  token: string
}

// ── Config ─────────────────────────────────────────────────────────────────────

const DIMS: Record<number, { name: string; color: string; bg: string; emoji: string }> = {
  1: { name: 'Self-awareness',       color: '#fdcb5e', bg: '#FEF5D9', emoji: '🪞' },
  2: { name: 'Cognitive flexibility', color: '#ff9f43', bg: '#FFF0E0', emoji: '🧩' },
  3: { name: 'Emotional regulation',  color: '#ff7b7a', bg: '#FFE8E8', emoji: '🌊' },
  4: { name: 'Values clarity',        color: '#00c9a7', bg: '#D4F5EF', emoji: '🧭' },
  5: { name: 'Relational mindset',    color: '#2d4a8a', bg: '#E0E6F5', emoji: '🤝' },
  6: { name: 'Adaptive resilience',   color: '#a78bfa', bg: '#EDE9FE', emoji: '⚡' },
}

const MILESTONES: Record<number, { label: string; emoji: string; message: string }> = {
  4:  { label: 'First dimension complete!', emoji: '🔥', message: 'You\'ve completed your first 4 practices. Your mindset is already shifting.' },
  8:  { label: 'Building momentum!',        emoji: '⚡', message: 'Eight practices in. You\'re building a real daily habit.' },
  12: { label: 'Halfway there!',            emoji: '✨', message: 'You\'ve reached the halfway point of your MQ journey. Keep going.' },
  16: { label: 'In the zone!',              emoji: '🎯', message: 'Sixteen practices complete. This is where real breakthroughs happen.' },
  20: { label: 'Almost there!',             emoji: '🌟', message: 'Four practices left. You\'ve come so far — finish strong.' },
  24: { label: 'Full cycle complete!',      emoji: '🏆', message: 'You\'ve completed all 24 Daily Spark practices. Time to see how much you\'ve grown.' },
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function DailySpark({ token }: DailySparkProps) {
  const [currentCard,     setCurrentCard]     = useState<SparkCard | null>(null)
  const [completedSparks, setCompletedSparks] = useState<SparkCard[]>([])
  const [totalCompleted,  setTotalCompleted]  = useState(0)
  const [loading,         setLoading]         = useState(true)
  const [isFlipped,       setIsFlipped]       = useState(false)
  const [completing,      setCompleting]      = useState(false)
  const [milestone,       setMilestone]       = useState<typeof MILESTONES[number] | null>(null)
  const [showHistory,     setShowHistory]     = useState(false)
  const [noAssessment,    setNoAssessment]    = useState(false)

  const loadSparks = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/daily-spark', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.noAssessment) { setNoAssessment(true); setLoading(false); return }
      setCurrentCard(data.currentCard ?? null)
      setCompletedSparks(data.completedSparks ?? [])
      setTotalCompleted(data.totalCompleted ?? 0)
    } catch (err) {
      console.error('Failed to load sparks:', err)
    }
    setLoading(false)
  }, [token])

  useEffect(() => { loadSparks() }, [loadSparks])

  async function handleComplete() {
    if (!currentCard || completing) return
    setCompleting(true)
    try {
      const res = await fetch('/api/daily-spark/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cardId: currentCard.id }),
      })
      const data = await res.json()
      if (data.isMilestone || data.isComplete) {
        setMilestone(MILESTONES[data.totalCompleted])
      }
      await loadSparks()
      setIsFlipped(false)
    } catch (err) {
      console.error('Failed to complete spark:', err)
    }
    setCompleting(false)
  }

  if (loading) {
    return (
      <div className="rounded-2xl p-6 flex items-center justify-center"
           style={{ backgroundColor: 'white', border: '1px solid #E8FDF7', boxShadow: '0 2px 12px rgba(10,46,42,0.07)', minHeight: 200 }}>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                 style={{ backgroundColor: '#0AF3CD', animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    )
  }

  if (noAssessment) return null

  const dim      = currentCard ? DIMS[currentCard.dimension_id] : null
  const progress = Math.round((totalCompleted / 24) * 100)
  const allComplete = totalCompleted === 24

  return (
    <div className="space-y-4">

      {/* ── Milestone celebration ─────────────────────────────────────────── */}
      {milestone && (
        <div className="rounded-2xl p-6 text-center relative overflow-hidden"
             style={{ backgroundColor: '#0A2E2A', boxShadow: '0 4px 20px rgba(10,46,42,0.2)' }}>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
               style={{ fontSize: 120, opacity: 0.05 }}>
            {milestone.emoji}
          </div>
          <div className="relative z-10">
            <div className="text-4xl mb-3">{milestone.emoji}</div>
            <p className="font-bold text-base mb-2" style={{ color: '#0AF3CD' }}>{milestone.label}</p>
            <p className="text-sm mb-5" style={{ color: '#B9F8DD' }}>{milestone.message}</p>
            <button onClick={() => setMilestone(null)}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold"
                    style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}>
              {totalCompleted === 24 ? 'Retake my assessment →' : 'Keep going →'}
            </button>
          </div>
        </div>
      )}

      {/* ── Progress header ───────────────────────────────────────────────── */}
      <div className="rounded-2xl p-5"
           style={{ backgroundColor: 'white', border: '1px solid #E8FDF7', boxShadow: '0 2px 12px rgba(10,46,42,0.07)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <div>
              <p className="font-bold text-sm" style={{ color: '#0A2E2A' }}>Daily Spark</p>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>Build your MQ one practice at a time</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-black" style={{ color: '#0A2E2A' }}>{totalCompleted}</p>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>of 24</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 rounded-full mb-2" style={{ backgroundColor: '#F3F4F6' }}>
          <div className="h-2 rounded-full transition-all duration-700"
               style={{
                 width: `${progress}%`,
                 background: dim ? `linear-gradient(90deg, ${dim.color}, ${dim.color}cc)` : 'linear-gradient(90deg, #0AF3CD, #05A88E)',
               }} />
        </div>

        {/* Milestone markers */}
        <div className="flex justify-between px-0.5">
          {[4, 8, 12, 16, 20, 24].map(n => (
            <div key={n} className="flex flex-col items-center gap-0.5">
              <div className="w-1.5 h-1.5 rounded-full"
                   style={{ backgroundColor: totalCompleted >= n ? (dim?.color ?? '#0AF3CD') : '#E5E7EB' }} />
              <span style={{ color: totalCompleted >= n ? '#6B7280' : '#D1D5DB', fontSize: 9 }}>{n}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Current card ──────────────────────────────────────────────────── */}
      {allComplete ? (
        <div className="rounded-2xl p-6 text-center"
             style={{ backgroundColor: 'white', border: '2px solid #0AF3CD', boxShadow: '0 4px 20px rgba(10,46,42,0.08)' }}>
          <div className="text-4xl mb-3">🏆</div>
          <p className="font-bold text-base mb-1" style={{ color: '#0A2E2A' }}>You've completed all 24 practices!</p>
          <p className="text-sm mb-4" style={{ color: '#05A88E' }}>Ready to see how much you've grown?</p>
          <a href="/assessment" className="inline-block px-6 py-2.5 rounded-xl text-sm font-bold"
             style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}>
            Retake my assessment →
          </a>
        </div>
      ) : currentCard && dim ? (
        /* Outer wrapper — relative so the absolute hidden card sits inside it */
        <div style={{ position: 'relative' }}>

          {/* ── CARD FRONT ───────────────────────────────────── */}
          {/* position: relative when visible (takes space), absolute when hidden (takes no space) */}
          <div
            onClick={() => !isFlipped ? setIsFlipped(true) : undefined}
            className="rounded-2xl overflow-hidden cursor-pointer"
            style={{
              position: isFlipped ? 'absolute' : 'relative',
              top: 0, left: 0, right: 0,
              minHeight: 300,
              opacity: isFlipped ? 0 : 1,
              transform: isFlipped
                ? 'perspective(900px) rotateY(-90deg) scale(0.96)'
                : 'perspective(900px) rotateY(0deg) scale(1)',
              transition: 'opacity 0.22s ease, transform 0.22s ease',
              pointerEvents: isFlipped ? 'none' : 'auto',
              zIndex: isFlipped ? 0 : 1,
              boxShadow: `0 8px 32px ${dim.color}33`,
              background: '#0A2E2A',
            }}
          >
            {/* Glow accents */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(ellipse at 80% 20%, ${dim.color}22 0%, transparent 60%),
                           radial-gradient(ellipse at 15% 80%, rgba(10,243,205,0.10) 0%, transparent 50%)`,
            }} />
            {/* Subtle top border line in dim colour */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              height: 3,
              background: `linear-gradient(90deg, transparent, ${dim.color}, transparent)`,
              borderRadius: '16px 16px 0 0',
            }} />

            {/* Content */}
            <div className="relative z-10 p-6 flex flex-col justify-between" style={{ minHeight: 300 }}>
              {/* Top row */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  Practice #{currentCard.card_number}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: `${dim.color}22`, color: dim.color, border: `1px solid ${dim.color}44` }}>
                  {dim.emoji} {dim.name}
                </span>
              </div>

              {/* Centre — title + teaser */}
              <div className="py-6">
                <h2 className="text-2xl font-black mb-3 leading-tight" style={{ color: 'white' }}>
                  {currentCard.title}
                </h2>
                <p className="text-sm font-medium leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  {currentCard.teaser}
                </p>
              </div>

              {/* Bottom hint */}
              <div className="flex items-center gap-1.5">
                <div style={{ width: 20, height: 1, backgroundColor: dim.color, opacity: 0.6 }} />
                <span className="text-xs font-medium" style={{ color: `${dim.color}99` }}>
                  Tap to reveal your practice
                </span>
              </div>
            </div>
          </div>

          {/* ── CARD BACK ────────────────────────────────────── */}
          {/* position: relative when visible (takes space), absolute when hidden (takes no space) */}
          <div
            className="rounded-2xl"
            style={{
              position: isFlipped ? 'relative' : 'absolute',
              top: 0, left: 0, right: 0,
              backgroundColor: 'white',
              border: `1.5px solid ${dim.color}44`,
              boxShadow: `0 8px 32px ${dim.color}18`,
              opacity: isFlipped ? 1 : 0,
              transform: isFlipped
                ? 'perspective(900px) rotateY(0deg) scale(1)'
                : 'perspective(900px) rotateY(90deg) scale(0.96)',
              transition: isFlipped ? 'opacity 0.22s ease 0.18s, transform 0.22s ease 0.18s' : 'none',
              pointerEvents: isFlipped ? 'auto' : 'none',
              zIndex: isFlipped ? 1 : 0,
              overflow: 'hidden',
            }}
          >
            <div className="p-5 space-y-3">
              {/* Back header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: dim.bg, color: dim.color }}>
                  {dim.emoji} {dim.name}
                </span>
                <button onClick={() => setIsFlipped(false)}
                        className="text-xs px-2.5 py-1 rounded-full hover:opacity-80"
                        style={{ color: '#9CA3AF', backgroundColor: '#F9FAFB' }}>
                  ← flip back
                </button>
              </div>

              {/* Title on back */}
              <p className="text-base font-black leading-snug" style={{ color: '#0A2E2A' }}>
                {currentCard.title}
              </p>

              {/* Insight — shown first */}
              <div className="rounded-xl p-4" style={{ backgroundColor: dim.bg, border: `1px solid ${dim.color}33` }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: dim.color }}>
                  💡 Why this matters
                </p>
                <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                  {currentCard.insight}
                </p>
              </div>

              {/* Exercise — practical, structured */}
              <div className="rounded-xl p-4" style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#374151' }}>
                  🎯 Today's practice
                </p>
                <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                  {currentCard.exercise}
                </p>
              </div>

              {/* Complete button */}
              <button
                onClick={handleComplete}
                disabled={completing}
                className="w-full py-3 rounded-xl text-sm font-bold disabled:opacity-50 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: dim.color, color: 'rgba(0,0,0,0.75)' }}
              >
                {completing ? 'Saving…' : '✓ Mark as complete'}
              </button>
            </div>
          </div>

        </div>
      ) : (
        <div className="rounded-2xl p-6 text-center"
             style={{ backgroundColor: 'white', border: '1px solid #E8FDF7', boxShadow: '0 2px 12px rgba(10,46,42,0.07)' }}>
          <div className="text-3xl mb-3">🌙</div>
          <p className="font-semibold text-sm mb-1" style={{ color: '#0A2E2A' }}>Your next spark arrives tomorrow</p>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>Check back tomorrow for your next practice.</p>
        </div>
      )}

      {/* ── Past cards ────────────────────────────────────────────────────── */}
      {completedSparks.length > 0 && (
        <div>
          <button onClick={() => setShowHistory(v => !v)}
                  className="w-full flex items-center justify-between py-2 px-1"
                  style={{ color: '#9CA3AF' }}>
            <span className="text-xs font-semibold uppercase tracking-wider">
              Past practices ({completedSparks.length})
            </span>
            <span className="text-xs">{showHistory ? '▲ hide' : '▼ show'}</span>
          </button>

          {showHistory && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[...completedSparks].reverse().map(spark => {
                const d = DIMS[spark.dimension_id]
                return (
                  <div key={spark.id} className="rounded-xl p-3 flex flex-col gap-1"
                       style={{ backgroundColor: d.bg, border: `1px solid ${d.color}33` }}>
                    <div className="flex items-center justify-between">
                      <span className="text-base">{d.emoji}</span>
                      <span className="text-xs font-bold" style={{ color: d.color }}>#{spark.card_number}</span>
                    </div>
                    <p className="text-xs font-semibold leading-tight" style={{ color: '#374151' }}>
                      {spark.title}
                    </p>
                    <span className="text-xs" style={{ color: d.color }}>✓ done</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

    </div>
  )
}
