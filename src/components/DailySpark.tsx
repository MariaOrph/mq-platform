'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────────

interface SparkCard {
  id: string
  card_number: number
  dimension_id: number | null
  title: string | null
  teaser: string | null
  reflection: string | null
  exercise: string | null
  insight: string | null
  status: 'active' | 'complete'
  assigned_date: string
  completed_date: string | null
  notes: string | null
}

interface DailySparkProps {
  token: string
  onOpenCoachingRoom?: () => void
}

// ── Config ─────────────────────────────────────────────────────────────────────

const DIMS: Record<number, { name: string; color: string; bg: string; emoji: string }> = {
  1: { name: 'Self-awareness',        color: '#fdcb5e', bg: '#FEF5D9', emoji: '🪞' },
  2: { name: 'Ego & identity',        color: '#EC4899', bg: '#FCE7F3', emoji: '🛡️' },
  3: { name: 'Emotional regulation',  color: '#ff7b7a', bg: '#FFE8E8', emoji: '🌊' },
  4: { name: 'Cognitive flexibility', color: '#ff9f43', bg: '#FFF0E0', emoji: '🧩' },
  5: { name: 'Values & purpose',      color: '#00c9a7', bg: '#D4F5EF', emoji: '🧭' },
  6: { name: 'Relational mindset',    color: '#2d4a8a', bg: '#E0E6F5', emoji: '🤝' },
  7: { name: 'Adaptive resilience',   color: '#a78bfa', bg: '#EDE9FE', emoji: '⚡' },
}

const VALUES_DIM = { name: 'Company Value', color: '#f59e0b', bg: '#FEF3C7', emoji: '⭐' }

function isValuesCard(card: SparkCard): boolean {
  return card.dimension_id === null
}

function getCardDim(card: SparkCard) {
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
  5:  { label: 'First set complete!',  emoji: '🔥', message: 'Four MQ practices and your first company value explored. You\'re building real momentum.' },
  10: { label: 'Building momentum!',   emoji: '⚡', message: 'Ten practices in. You\'re developing both MQ skills and your grasp of what this company stands for.' },
  15: { label: 'Nearly halfway!',      emoji: '✨', message: 'Fifteen practices in. Three dimensions and three values explored — you\'re finding your rhythm.' },
  20: { label: 'Halfway there!',       emoji: '🎯', message: 'Twenty practices complete. Halfway through your full MQ journey.' },
  25: { label: 'In the zone!',         emoji: '🌟', message: 'Twenty-five practices in. Five dimensions, five values. You\'re in the groove now.' },
  30: { label: 'Final stretch!',       emoji: '💫', message: 'Thirty practices complete. All seven dimensions explored — just the last values to go.' },
  34: { label: 'Full cycle complete!', emoji: '🏆', message: 'You\'ve completed all 34 practices — all 7 MQ dimensions and all your company values. Remarkable.' },
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function DailySpark({ token, onOpenCoachingRoom }: DailySparkProps) {
  const [currentCard,     setCurrentCard]     = useState<SparkCard | null>(null)
  const [completedSparks, setCompletedSparks] = useState<SparkCard[]>([])
  const [totalCompleted,  setTotalCompleted]  = useState(0)
  const [totalCards,      setTotalCards]      = useState(28)
  const [loading,         setLoading]         = useState(true)
  const [completing,      setCompleting]      = useState(false)
  const [milestone,       setMilestone]       = useState<{ label: string; emoji: string; message: string } | null>(null)
  const [showHistory,     setShowHistory]     = useState(false)
  const [noAssessment,    setNoAssessment]    = useState(false)
  const [selectedSpark,   setSelectedSpark]   = useState<SparkCard | null>(null)
  const [notes,           setNotes]           = useState('')
  const [notesSaved,      setNotesSaved]      = useState(false)
  const [expanded,        setExpanded]        = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const saveNotes = useCallback(async (cardId: string, text: string) => {
    await fetch('/api/daily-spark', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ cardId, notes: text }),
    })
    setNotesSaved(true)
    setTimeout(() => setNotesSaved(false), 2000)
  }, [token])

  function handleNotesChange(cardId: string, text: string) {
    setNotes(text)
    setNotesSaved(false)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => saveNotes(cardId, text), 1500)
  }

  const loadSparks = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/daily-spark', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (data.noAssessment) { setNoAssessment(true); setLoading(false); return }
      setCurrentCard(data.currentCard ?? null)
      setNotes(data.currentCard?.notes ?? '')
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ cardId: currentCard.id }),
      })
      const data = await res.json()
      const resolvedTotal = data.totalCards ?? totalCards
      if (data.totalCards) setTotalCards(data.totalCards)
      const milestoneMap = resolvedTotal === 34 ? MILESTONES_34 : MILESTONES_28
      if (data.isMilestone || data.isComplete) {
        setMilestone(milestoneMap[data.totalCompleted] ?? null)
      }
      await loadSparks()
    } catch (err) {
      console.error('Failed to complete spark:', err)
    }
    setCompleting(false)
  }

  if (loading) {
    return (
      <div className="rounded-2xl p-6 flex items-center justify-center"
           style={{ backgroundColor: 'white', border: '1px solid #E8FDF7', minHeight: 140 }}>
        <div className="flex gap-1.5">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                 style={{ backgroundColor: '#0AF3CD', animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    )
  }

  if (noAssessment) return null

  const dim         = currentCard ? getCardDim(currentCard) : null
  const progress    = Math.round((totalCompleted / totalCards) * 100)
  const allComplete = totalCompleted === totalCards
  const isCurrentValues = currentCard ? isValuesCard(currentCard) : false

  return (
    <div className="space-y-3">

      {/* ── Milestone celebration ──────────────────────────────────────────── */}
      {milestone && (
        <div className="rounded-2xl p-6 text-center"
             style={{ backgroundColor: '#0A2E2A' }}>
          <div className="text-3xl mb-2">{milestone.emoji}</div>
          <p className="font-bold text-sm mb-1.5" style={{ color: '#0AF3CD' }}>{milestone.label}</p>
          <p className="text-sm mb-4" style={{ color: '#B9F8DD' }}>{milestone.message}</p>
          <button onClick={() => setMilestone(null)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold"
                  style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}>
            {totalCompleted === totalCards ? 'Retake Assessment →' : 'Keep going →'}
          </button>
        </div>
      )}

      {/* ── Main card ─────────────────────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden"
           style={{ backgroundColor: 'white', border: '1px solid #E8FDF7', boxShadow: '0 2px 12px rgba(10,46,42,0.07)' }}>

        {/* Header: title + progress */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">✨</span>
              <div>
                <p className="text-sm font-bold" style={{ color: '#0A2E2A' }}>Daily Spark</p>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>Your daily leadership challenge</p>
              </div>
            </div>
            <p className="text-xs font-semibold" style={{ color: '#9CA3AF' }}>
              {totalCompleted} / {totalCards} complete
            </p>
          </div>
          <div className="h-1.5 rounded-full" style={{ backgroundColor: '#F3F4F6' }}>
            <div className="h-1.5 rounded-full transition-all duration-700"
                 style={{ width: `${progress}%`, backgroundColor: dim?.color ?? '#0AF3CD' }} />
          </div>
        </div>

        {/* Card body */}
        {allComplete ? (
          <div className="px-5 pb-6 text-center" style={{ borderTop: '1px solid #F3F4F6' }}>
            <div className="text-3xl mb-3 mt-4">🏆</div>
            <p className="font-bold text-sm mb-1" style={{ color: '#0A2E2A' }}>
              All {totalCards} practices complete!
            </p>
            <p className="text-xs mb-4" style={{ color: '#9CA3AF' }}>Ready to see how much you&apos;ve grown?</p>
            <a href="/assessment"
               className="inline-block px-6 py-2.5 rounded-xl text-sm font-bold"
               style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}>
              Retake Assessment →
            </a>
          </div>

        ) : currentCard && dim ? (
          <div className="px-5 pb-5 space-y-4" style={{ borderTop: `1px solid ${dim.color}22` }}>

            {/* Dimension badge */}
            <div className="pt-4">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: dim.bg, color: dim.color }}>
                {dim.emoji} {isCurrentValues ? (currentCard.reflection ?? 'Company Value') : dim.name}
              </span>
            </div>

            {/* Title */}
            <p className="text-base font-black leading-snug" style={{ color: '#0A2E2A' }}>
              {currentCard.title}
            </p>

            {/* Collapsed: teaser + start button */}
            {!expanded && (
              <div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: '#6B7280' }}>
                  {currentCard.teaser}
                </p>
                <button
                  onClick={() => setExpanded(true)}
                  className="w-full text-sm font-bold px-4 py-2.5 rounded-xl transition-all"
                  style={{ backgroundColor: dim.bg, color: dim.color, border: `1.5px solid ${dim.color}40` }}
                >
                  Start today&apos;s challenge →
                </button>
              </div>
            )}

            {/* Expanded: full challenge */}
            {expanded && (
              <>
                {/* Full practice */}
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#374151' }}>
                  {currentCard.exercise}
                </p>

                {/* Insight — subtle, inline */}
                {currentCard.insight && (
                  <p className="text-xs leading-relaxed"
                     style={{ color: '#9CA3AF', borderLeft: `3px solid ${dim.color}55`, paddingLeft: 12 }}>
                    {currentCard.insight}
                  </p>
                )}
              </>
            )}

            {/* Notes */}
            {expanded && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>
                    Your reflection
                  </p>
                  {notesSaved && (
                    <p className="text-xs font-semibold" style={{ color: '#10B981' }}>Saved ✓</p>
                  )}
                </div>
                <textarea
                  value={notes}
                  onChange={e => handleNotesChange(currentCard.id, e.target.value)}
                  placeholder="Write your thoughts, what you noticed, or what you'll do differently…"
                  rows={3}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
                  style={{
                    border: `1.5px solid ${dim.color}50`,
                    backgroundColor: dim.bg,
                    color: '#374151',
                    lineHeight: 1.6,
                  }}
                  onInput={e => {
                    const el = e.currentTarget
                    el.style.height = 'auto'
                    el.style.height = `${el.scrollHeight}px`
                  }}
                />
              </div>
            )}

            {/* Complete */}
            {expanded && (
              <div className="space-y-2">
                <button
                  onClick={handleComplete}
                  disabled={completing}
                  className="w-full py-3 rounded-xl text-sm font-bold disabled:opacity-50 hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: dim.color, color: 'rgba(0,0,0,0.75)' }}
                >
                  {completing ? 'Saving…' : '✓ Done for today'}
                </button>
                <button
                  onClick={() => setExpanded(false)}
                  className="w-full py-2 rounded-xl text-xs font-medium hover:opacity-70 transition-opacity"
                  style={{ color: '#9CA3AF' }}
                >
                  ← Back
                </button>
              </div>
            )}
          </div>

        ) : (
          <div className="px-5 pb-5 pt-4 text-center" style={{ borderTop: '1px solid #F3F4F6' }}>
            <div className="text-2xl mb-2">🌙</div>
            <p className="text-sm font-semibold mb-0.5" style={{ color: '#0A2E2A' }}>Your next spark arrives tomorrow</p>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>Check back tomorrow for your next practice.</p>
          </div>
        )}
      </div>

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
              <div className="px-5 pt-5 pb-4" style={{ backgroundColor: d.bg }}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{d.emoji}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${d.color}25`, color: d.color }}>
                        {isVal ? (selectedSpark.reflection ?? 'Company Value') : d.name}
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
              </div>
              <div className="overflow-y-auto px-5 py-4 space-y-4" style={{ maxHeight: '60vh' }}>
                <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                  {selectedSpark.exercise}
                </p>
                {selectedSpark.insight && (
                  <p className="text-xs leading-relaxed"
                     style={{ color: '#9CA3AF', borderLeft: `3px solid ${d.color}55`, paddingLeft: 12 }}>
                    {selectedSpark.insight}
                  </p>
                )}
                {selectedSpark.notes && (
                  <div className="rounded-xl p-4" style={{ backgroundColor: d.bg, border: `1px solid ${d.color}30` }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: d.color }}>
                      Your reflection
                    </p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#374151' }}>
                      {selectedSpark.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })()}

    </div>
  )
}
