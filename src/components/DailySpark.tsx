'use client'

import { useEffect, useState, useCallback } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────────

interface SparkCard {
  id: string
  card_number: number
  dimension_id: number | null   // null = company values card
  title: string | null
  teaser: string | null
  reflection: string | null     // stores value_name for values cards
  exercise: string | null
  insight: string | null
  status: 'active' | 'complete'
  assigned_date: string
  completed_date: string | null
}

interface DailySparkProps {
  token: string
  onOpenCoachingRoom?: () => void
}

// ── Config ─────────────────────────────────────────────────────────────────────

const DIMS: Record<number, { name: string; color: string; bg: string; emoji: string }> = {
  1: { name: 'Self-awareness',       color: '#fdcb5e', bg: '#FEF5D9', emoji: '🪞' },
  2: { name: 'Ego & identity',       color: '#EC4899', bg: '#FCE7F3', emoji: '🛡️' },
  3: { name: 'Emotional regulation', color: '#ff7b7a', bg: '#FFE8E8', emoji: '🌊' },
  4: { name: 'Cognitive flexibility',color: '#ff9f43', bg: '#FFF0E0', emoji: '🧩' },
  5: { name: 'Values & purpose',     color: '#00c9a7', bg: '#D4F5EF', emoji: '🧭' },
  6: { name: 'Relational mindset',   color: '#2d4a8a', bg: '#E0E6F5', emoji: '🤝' },
  7: { name: 'Adaptive resilience',  color: '#a78bfa', bg: '#EDE9FE', emoji: '⚡' },
}

// Amber/gold theme for company values cards
const VALUES_DIM = { name: 'Company Value', color: '#f59e0b', bg: '#FEF3C7', emoji: '⭐' }

function isValuesCard(card: SparkCard): boolean {
  return card.dimension_id === null
}

function getCardDim(card: SparkCard): { name: string; color: string; bg: string; emoji: string } {
  if (isValuesCard(card)) return VALUES_DIM
  return DIMS[card.dimension_id as number] ?? VALUES_DIM
}

// ── Milestone sets ─────────────────────────────────────────────────────────────

const MILESTONES_28: Record<number, { label: string; emoji: string; message: string }> = {
  4:  { label: 'First dimension complete!', emoji: '🔥', message: 'You\'ve completed your first 4 practices. Your mindset is already shifting.' },
  8:  { label: 'Building momentum!',        emoji: '⚡', message: 'Eight practices in. You\'re building a real daily habit.' },
  12: { label: 'Nearly halfway!',           emoji: '✨', message: 'Twelve practices complete. Three dimensions explored — you\'re finding your rhythm.' },
  16: { label: 'Halfway there!',            emoji: '🎯', message: 'You\'ve hit the halfway point of your MQ journey. This is where real shifts happen.' },
  20: { label: 'In the zone!',              emoji: '🌟', message: 'Twenty practices complete. Five dimensions explored. Keep going — you\'re close.' },
  24: { label: 'Almost there!',             emoji: '💫', message: 'Six dimensions done. Just one to go — finish what you\'ve started.' },
  28: { label: 'Full cycle complete!',      emoji: '🏆', message: 'You\'ve completed all 28 Daily Spark practices across all 7 MQ dimensions. Time to see how much you\'ve grown.' },
}

const MILESTONES_34: Record<number, { label: string; emoji: string; message: string }> = {
  5:  { label: 'First set complete!',    emoji: '🔥', message: 'Four MQ practices and your first company value explored. You\'re building real momentum.' },
  10: { label: 'Building momentum!',     emoji: '⚡', message: 'Ten practices in. You\'re developing both MQ skills and your grasp of what this company stands for.' },
  15: { label: 'Nearly halfway!',        emoji: '✨', message: 'Fifteen practices in. Three dimensions and three values explored — you\'re finding your rhythm.' },
  20: { label: 'Halfway there!',         emoji: '🎯', message: 'Twenty practices complete. Halfway through your full MQ journey.' },
  25: { label: 'In the zone!',           emoji: '🌟', message: 'Twenty-five practices in. Five dimensions, five values. You\'re in the groove now.' },
  30: { label: 'Final stretch!',         emoji: '💫', message: 'Thirty practices complete. All seven dimensions explored — just the last values to go.' },
  34: { label: 'Full cycle complete!',   emoji: '🏆', message: 'You\'ve completed all 34 practices — all 7 MQ dimensions and all your company values. Remarkable.' },
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function DailySpark({ token, onOpenCoachingRoom }: DailySparkProps) {
  const [currentCard,     setCurrentCard]     = useState<SparkCard | null>(null)
  const [completedSparks, setCompletedSparks] = useState<SparkCard[]>([])
  const [totalCompleted,  setTotalCompleted]  = useState(0)
  const [totalCards,      setTotalCards]      = useState(28)
  const [loading,         setLoading]         = useState(true)
  const [isFlipped,       setIsFlipped]       = useState(false)
  const [completing,      setCompleting]      = useState(false)
  const [milestone,       setMilestone]       = useState<{ label: string; emoji: string; message: string } | null>(null)
  const [showHistory,     setShowHistory]     = useState(false)
  const [noAssessment,    setNoAssessment]    = useState(false)
  const [selectedSpark,   setSelectedSpark]   = useState<SparkCard | null>(null)

  const loadSparks = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/daily-spark', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.noAssessment) { setNoAssessment(true); setLoading(false); return }
      setCurrentCard(data.currentCard ?? null)
      setCompletedSparks(data.completedSparks ?? [])
      setTotalCompleted(data.totalCompleted ?? 0)
      setTotalCards(data.totalCards ?? 24)
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
      const res  = await fetch('/api/daily-spark/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cardId: currentCard.id }),
      })
      const data = await res.json()

      const resolvedTotal  = data.totalCards ?? totalCards
      if (data.totalCards) setTotalCards(data.totalCards)

      const milestoneMap = resolvedTotal === 34 ? MILESTONES_34 : MILESTONES_28
      if (data.isMilestone || data.isComplete) {
        setMilestone(milestoneMap[data.totalCompleted] ?? null)
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

  const dim              = currentCard ? getCardDim(currentCard) : null
  const progress         = Math.round((totalCompleted / totalCards) * 100)
  const allComplete      = totalCompleted === totalCards
  const milestoneNumbers = totalCards === 34 ? [5, 10, 15, 20, 25, 30, 34] : [4, 8, 12, 16, 20, 24, 28]
  const isCurrentValues  = currentCard ? isValuesCard(currentCard) : false

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
              {totalCompleted === totalCards ? 'Retake Assessment →' : 'Keep going →'}
            </button>
          </div>
        </div>
      )}

      {/* ── Daily Spark unified tile ─────────────────────────────────────── */}
      <div style={{ borderRadius: 16, overflow: 'hidden', backgroundColor: 'white', border: '1px solid #E8FDF7', boxShadow: '0 2px 12px rgba(10,46,42,0.07)' }}>

        {/* Progress header */}
        <div className="p-5">
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
              <p className="text-xs" style={{ color: '#9CA3AF' }}>of {totalCards}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 rounded-full mb-2" style={{ backgroundColor: '#F3F4F6' }}>
            <div className="h-2 rounded-full transition-all duration-700"
                 style={{
                   width: `${progress}%`,
                   background: dim
                     ? `linear-gradient(90deg, ${dim.color}, ${dim.color}cc)`
                     : 'linear-gradient(90deg, #0AF3CD, #05A88E)',
                 }} />
          </div>

          {/* Milestone markers */}
          <div className="flex justify-between px-0.5">
            {milestoneNumbers.map(n => (
              <div key={n} className="flex flex-col items-center gap-0.5">
                <div className="w-1.5 h-1.5 rounded-full"
                     style={{ backgroundColor: totalCompleted >= n ? (dim?.color ?? '#0AF3CD') : '#E5E7EB' }} />
                <span style={{ color: totalCompleted >= n ? '#6B7280' : '#D1D5DB', fontSize: 9 }}>{n}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Current card ────────────────────────────────────────────────── */}
        {allComplete ? (
          <div className="p-6 text-center"
               style={{ borderTop: '1px solid #E8FDF7' }}>
            <div className="text-4xl mb-3">🏆</div>
            <p className="font-bold text-base mb-1" style={{ color: '#0A2E2A' }}>
              You&apos;ve completed all {totalCards} practices!
            </p>
            <p className="text-sm mb-4" style={{ color: '#05A88E' }}>Ready to see how much you&apos;ve grown?</p>
            <a href="/assessment" className="inline-block px-6 py-2.5 rounded-xl text-sm font-bold"
               style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}>
              Retake Assessment →
            </a>
          </div>

        ) : currentCard && dim ? (
          /* Outer wrapper */
          <div style={{ position: 'relative' }}>

            {/* ── CARD FRONT ───────────────────────────────────── */}
            <div
              onClick={() => !isFlipped ? setIsFlipped(true) : undefined}
              className="cursor-pointer"
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
                background: isCurrentValues
                  ? `linear-gradient(145deg, #fffbf0 0%, ${dim.bg} 100%)`
                  : `linear-gradient(145deg, white 0%, ${dim.bg} 100%)`,
              }}
            >
              {/* Soft colour wash — top right */}
              <div style={{
                position: 'absolute',
                top: -60, right: -60,
                width: 220, height: 220,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${dim.color}22 0%, transparent 70%)`,
                filter: 'blur(12px)',
              }} />

              {/* Large watermark number — bottom right */}
              <div style={{
                position: 'absolute',
                bottom: -16, right: 16,
                fontSize: 130,
                fontWeight: 900,
                color: dim.color,
                opacity: 0.12,
                lineHeight: 1,
                userSelect: 'none',
                letterSpacing: '-4px',
              }}>
                {String(currentCard.card_number).padStart(2, '0')}
              </div>

              {/* Top colour stripe */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                height: 4,
                background: `linear-gradient(90deg, transparent 0%, ${dim.color} 25%, ${dim.color} 75%, transparent 100%)`,
              }} />

              {/* Left accent stripe */}
              <div style={{
                position: 'absolute', top: 24, left: 0, bottom: 24,
                width: 4,
                background: `linear-gradient(180deg, transparent 0%, ${dim.color}88 30%, ${dim.color}88 70%, transparent 100%)`,
                borderRadius: '0 4px 4px 0',
              }} />

              {/* Content */}
              <div className="relative z-10 p-6 pl-8 flex flex-col justify-between" style={{ minHeight: 300 }}>
                {/* Top row */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: 'rgba(0,0,0,0.05)', color: '#6B7280', border: '1px solid rgba(0,0,0,0.07)', letterSpacing: '0.04em' }}>
                    #{currentCard.card_number} of {totalCards}
                  </span>
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full"
                        style={{ backgroundColor: `${dim.color}25`, color: dim.color, border: `1px solid ${dim.color}50` }}>
                    {dim.emoji} {isCurrentValues ? 'Company Value' : dim.name}
                  </span>
                </div>

                {/* Centre — value name pill (values cards only) + title + teaser */}
                <div className="py-5">
                  {isCurrentValues && currentCard.reflection && (
                    <div className="inline-block mb-3 px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase"
                         style={{ backgroundColor: dim.color, color: '#0A2E2A' }}>
                      {currentCard.reflection}
                    </div>
                  )}
                  <h2 className="text-2xl font-black mb-3 leading-tight" style={{ color: '#0A2E2A' }}>
                    {currentCard.title}
                  </h2>
                  <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                    {currentCard.teaser}
                  </p>
                </div>

                {/* Bottom hint */}
                <div className="flex items-center gap-2">
                  <div style={{ width: 24, height: 1.5, background: `linear-gradient(90deg, ${dim.color}, transparent)` }} />
                  <span className="text-xs font-semibold tracking-wide" style={{ color: dim.color }}>
                    Tap to reveal your practice
                  </span>
                </div>
              </div>
            </div>

            {/* ── CARD BACK ────────────────────────────────────── */}
            <div
              style={{
                position: isFlipped ? 'relative' : 'absolute',
                top: 0, left: 0, right: 0,
                backgroundColor: 'white',
                border: `1.5px solid ${dim.color}44`,
                opacity: isFlipped ? 1 : 0,
                transform: isFlipped
                  ? 'perspective(900px) rotateY(0deg) scale(1)'
                  : 'perspective(900px) rotateY(90deg) scale(0.96)',
                transition: isFlipped ? 'opacity 0.22s ease 0.18s, transform 0.22s ease 0.18s' : 'none',
                pointerEvents: isFlipped ? 'auto' : 'none',
                zIndex: isFlipped ? 1 : 0,
              }}
            >
              <div className="p-5 space-y-3">
                {/* Back header */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: dim.bg, color: dim.color }}>
                    {dim.emoji} {isCurrentValues ? (currentCard.reflection ?? 'Company Value') : dim.name}
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

                {/* Insight */}
                <div className="rounded-xl p-4" style={{ backgroundColor: dim.bg, border: `1px solid ${dim.color}33` }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: dim.color }}>
                    💡 Why this matters
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                    {currentCard.insight}
                  </p>
                </div>

                {/* Exercise */}
                <div className="rounded-xl p-4" style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#374151' }}>
                    🎯 Today&apos;s practice
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
          <div className="p-6 text-center"
               style={{ borderTop: '1px solid #E8FDF7' }}>
            <div className="text-3xl mb-3">🌙</div>
            <p className="font-semibold text-sm mb-1" style={{ color: '#0A2E2A' }}>Your next spark arrives tomorrow</p>
            <p className="text-xs mb-4" style={{ color: '#9CA3AF' }}>Check back tomorrow for your next practice.</p>
            <div className="rounded-xl px-4 py-3" style={{ backgroundColor: '#F4FDF9', border: '1px solid #B9F8DD' }}>
              <p className="text-xs leading-relaxed" style={{ color: '#05A88E' }}>
                In the meantime, your <span className="font-semibold">MQ Coaching Room</span> is always open. Bring a current challenge you want to work through or get support building your MQ.
              </p>
            </div>
          </div>
        )}

      </div>{/* end unified tile */}

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
                const d     = getCardDim(spark)
                const isVal = isValuesCard(spark)
                return (
                  <button
                    key={spark.id}
                    onClick={() => setSelectedSpark(spark)}
                    className="rounded-xl p-3 flex flex-col gap-1 text-left hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: d.bg, border: `1px solid ${d.color}33` }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">{d.emoji}</span>
                      <span className="text-xs font-bold" style={{ color: d.color }}>#{spark.card_number}</span>
                    </div>
                    {isVal && spark.reflection && (
                      <span className="text-xs font-bold uppercase tracking-wide leading-tight" style={{ color: d.color }}>
                        {spark.reflection}
                      </span>
                    )}
                    <p className="text-xs font-semibold leading-tight" style={{ color: '#374151' }}>
                      {spark.title}
                    </p>
                    <span className="text-xs font-medium" style={{ color: d.color }}>View →</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Past spark modal ──────────────────────────────────────────────── */}
      {selectedSpark && (() => {
        const d     = getCardDim(selectedSpark)
        const isVal = isValuesCard(selectedSpark)
        return (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            style={{ backgroundColor: 'rgba(10,46,42,0.55)', backdropFilter: 'blur(4px)' }}
            onClick={() => setSelectedSpark(null)}
          >
            <div
              className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden"
              style={{ backgroundColor: 'white', maxHeight: '85vh' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-5 pt-5 pb-4" style={{ backgroundColor: d.bg }}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{d.emoji}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${d.color}25`, color: d.color }}>
                        {isVal ? (selectedSpark.reflection ?? 'Company Value') : d.name}
                      </span>
                      <span className="text-xs font-bold" style={{ color: '#9CA3AF' }}>
                        #{selectedSpark.card_number} of {totalCards}
                      </span>
                    </div>
                    <p className="text-base font-black leading-snug" style={{ color: '#0A2E2A' }}>
                      {selectedSpark.title}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedSpark(null)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-lg flex-shrink-0 ml-3 mt-0.5"
                    style={{ backgroundColor: 'rgba(10,46,42,0.1)', color: '#0A2E2A' }}
                  >×</button>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: `${d.color}30`, color: d.color }}>
                    ✓ Completed
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="overflow-y-auto px-5 py-4 space-y-3" style={{ maxHeight: '60vh' }}>
                <div className="rounded-xl p-4" style={{ backgroundColor: d.bg, border: `1px solid ${d.color}33` }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: d.color }}>
                    💡 Why this matters
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                    {selectedSpark.insight}
                  </p>
                </div>

                <div className="rounded-xl p-4" style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#374151' }}>
                    🎯 The practice
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                    {selectedSpark.exercise}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

    </div>
  )
}
