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

// ── Dimension config ───────────────────────────────────────────────────────────

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
  16: { label: 'In the zone!',              emoji: '🎯', message: 'Sixteen practices complete. This is where the real breakthroughs happen.' },
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
      <div className="rounded-2xl p-6 flex items-center justify-center" style={{ backgroundColor: 'white', border: '1px solid #E8FDF7', boxShadow: '0 2px 12px rgba(10,46,42,0.07)', minHeight: 200 }}>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#0AF3CD', animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    )
  }

  if (noAssessment) return null

  const dim = currentCard ? DIMS[currentCard.dimension_id] : null
  const progress = Math.round((totalCompleted / 24) * 100)
  const allComplete = totalCompleted === 24

  return (
    <div className="space-y-4">

      {/* ── Milestone celebration ───────────────────────────────────────── */}
      {milestone && (
        <div
          className="rounded-2xl p-5 text-center relative overflow-hidden"
          style={{ backgroundColor: '#0A2E2A', boxShadow: '0 4px 20px rgba(10,46,42,0.15)' }}
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
               style={{ fontSize: 120, opacity: 0.06 }}>
            {milestone.emoji}
          </div>
          <div className="relative z-10">
            <div className="text-4xl mb-2">{milestone.emoji}</div>
            <p className="font-bold text-base mb-1" style={{ color: '#0AF3CD' }}>{milestone.label}</p>
            <p className="text-sm mb-4" style={{ color: '#B9F8DD' }}>{milestone.message}</p>
            <button
              onClick={() => setMilestone(null)}
              className="px-5 py-2 rounded-xl text-sm font-bold"
              style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}
            >
              {totalCompleted === 24 ? 'Retake my assessment →' : 'Keep going →'}
            </button>
          </div>
        </div>
      )}

      {/* ── Header + progress ───────────────────────────────────────────── */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: 'white', border: '1px solid #E8FDF7', boxShadow: '0 2px 12px rgba(10,46,42,0.07)' }}>
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
          <div
            className="h-2 rounded-full transition-all duration-700"
            style={{
              width: `${progress}%`,
              background: dim
                ? `linear-gradient(90deg, ${dim.color}, ${dim.color}cc)`
                : 'linear-gradient(90deg, #0AF3CD, #05A88E)',
            }}
          />
        </div>

        {/* Milestone markers */}
        <div className="flex justify-between px-0.5">
          {[4, 8, 12, 16, 20, 24].map(n => (
            <div key={n} className="flex flex-col items-center gap-0.5">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: totalCompleted >= n ? (dim?.color ?? '#0AF3CD') : '#E5E7EB' }}
              />
              <span className="text-xs" style={{ color: totalCompleted >= n ? '#6B7280' : '#D1D5DB', fontSize: 9 }}>{n}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Current card ────────────────────────────────────────────────── */}
      {allComplete ? (
        <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: 'white', border: '2px solid #0AF3CD', boxShadow: '0 4px 20px rgba(10,46,42,0.08)' }}>
          <div className="text-4xl mb-3">🏆</div>
          <p className="font-bold text-base mb-1" style={{ color: '#0A2E2A' }}>You've completed all 24 practices!</p>
          <p className="text-sm mb-4" style={{ color: '#05A88E' }}>You've worked through every dimension of your MQ profile. Ready to see how much you've grown?</p>
          <a href="/assessment"
             className="inline-block px-6 py-2.5 rounded-xl text-sm font-bold"
             style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}>
            Retake my assessment →
          </a>
        </div>
      ) : currentCard && dim ? (
        <div>
          {/* Flip card */}
          <div style={{ perspective: '1200px', minHeight: 320 }}>
            <div
              style={{
                transformStyle: 'preserve-3d',
                transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                position: 'relative',
                minHeight: 320,
              }}
            >
              {/* ── Card front ─────────────────────────────────── */}
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden cursor-pointer"
                style={{
                  backfaceVisibility: 'hidden',
                  background: `linear-gradient(135deg, ${dim.color} 0%, ${dim.color}bb 100%)`,
                  boxShadow: `0 8px 30px ${dim.color}44`,
                }}
                onClick={() => setIsFlipped(true)}
              >
                {/* Decorative circles */}
                <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20"
                     style={{ backgroundColor: 'rgba(255,255,255,0.4)' }} />
                <div className="absolute -bottom-12 -left-8 w-48 h-48 rounded-full opacity-10"
                     style={{ backgroundColor: 'rgba(255,255,255,0.4)' }} />

                <div className="relative z-10 p-6 flex flex-col h-full justify-between" style={{ minHeight: 320 }}>
                  {/* Top: card number + dim badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: 'rgba(255,255,255,0.25)', color: 'rgba(0,0,0,0.7)' }}>
                      Practice #{currentCard.card_number}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: 'rgba(255,255,255,0.25)', color: 'rgba(0,0,0,0.7)' }}>
                      {dim.emoji} {dim.name}
                    </span>
                  </div>

                  {/* Centre: emoji + title + teaser */}
                  <div className="text-center py-4">
                    <div className="text-5xl mb-4">{dim.emoji}</div>
                    <h2 className="text-2xl font-black mb-2 leading-tight" style={{ color: 'rgba(0,0,0,0.85)' }}>
                      {currentCard.title}
                    </h2>
                    <p className="text-sm font-medium" style={{ color: 'rgba(0,0,0,0.6)' }}>
                      {currentCard.teaser}
                    </p>
                  </div>

                  {/* Bottom: flip hint */}
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full animate-bounce"
                           style={{ backgroundColor: 'rgba(0,0,0,0.35)', animationDelay: '0s' }} />
                      <div className="w-1.5 h-1.5 rounded-full animate-bounce"
                           style={{ backgroundColor: 'rgba(0,0,0,0.35)', animationDelay: '0.15s' }} />
                      <div className="w-1.5 h-1.5 rounded-full animate-bounce"
                           style={{ backgroundColor: 'rgba(0,0,0,0.35)', animationDelay: '0.3s' }} />
                    </div>
                    <span className="text-xs font-semibold" style={{ color: 'rgba(0,0,0,0.45)' }}>
                      Tap to reveal your practice
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Card back ──────────────────────────────────── */}
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  backgroundColor: 'white',
                  border: `2px solid ${dim.color}44`,
                  boxShadow: `0 8px 30px ${dim.color}22`,
                }}
              >
                <div className="p-5 flex flex-col gap-4" style={{ minHeight: 320 }}>
                  {/* Dim badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: dim.bg, color: dim.color }}>
                      {dim.emoji} {dim.name}
                    </span>
                    <button
                      onClick={() => setIsFlipped(false)}
                      className="text-xs px-2.5 py-1 rounded-full"
                      style={{ color: '#9CA3AF', backgroundColor: '#F9FAFB' }}
                    >
                      ← flip back
                    </button>
                  </div>

                  {/* Reflection */}
                  <div className="rounded-xl p-4" style={{ backgroundColor: '#F9FAFB' }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#9CA3AF' }}>
                      💭 Reflect
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                      {currentCard.reflection}
                    </p>
                  </div>

                  {/* Exercise */}
                  <div className="rounded-xl p-4" style={{ backgroundColor: dim.bg }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: dim.color }}>
                      🎯 Practice
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                      {currentCard.exercise}
                    </p>
                  </div>

                  {/* Insight */}
                  <div className="rounded-xl p-4" style={{ backgroundColor: '#F9FAFB' }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#9CA3AF' }}>
                      💡 Insight
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                      {currentCard.insight}
                    </p>
                  </div>

                  {/* Complete button */}
                  <button
                    onClick={handleComplete}
                    disabled={completing}
                    className="w-full py-3 rounded-xl text-sm font-bold disabled:opacity-50 hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: dim.color, color: 'rgba(0,0,0,0.8)' }}
                  >
                    {completing ? 'Saving…' : '✓ Mark as complete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Waiting for tomorrow */
        <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: 'white', border: '1px solid #E8FDF7', boxShadow: '0 2px 12px rgba(10,46,42,0.07)' }}>
          <div className="text-3xl mb-3">🌙</div>
          <p className="font-semibold text-sm mb-1" style={{ color: '#0A2E2A' }}>Today's spark is coming tomorrow</p>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>Complete yesterday's practice first, or check back tomorrow for a new one.</p>
        </div>
      )}

      {/* ── Completed cards history ──────────────────────────────────────── */}
      {completedSparks.length > 0 && (
        <div>
          <button
            onClick={() => setShowHistory(v => !v)}
            className="w-full flex items-center justify-between py-2 px-1"
            style={{ color: '#6B7280' }}
          >
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
                  <div
                    key={spark.id}
                    className="rounded-xl p-3 flex flex-col gap-1"
                    style={{ backgroundColor: d.bg, border: `1px solid ${d.color}33` }}
                  >
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
