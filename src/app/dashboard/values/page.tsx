'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// ── Types ────────────────────────────────────────────────────────────────────

interface CompanyValue {
  id: string
  value_name: string
  value_order: number
  behaviours: string[]
}

type RatingsMap = Record<string, { rating: number; rated_at: string }>

// ── Constants ─────────────────────────────────────────────────────────────────

const RATING_LABELS: Record<number, { label: string; colour: string; bg: string }> = {
  1: { label: 'Rarely',       colour: '#ff7b7a', bg: '#FFF0F0' },
  2: { label: 'Sometimes',    colour: '#ff9f43', bg: '#FFF5EB' },
  3: { label: 'Usually',      colour: '#fdcb5e', bg: '#FFFAE8' },
  4: { label: 'Consistently', colour: '#00c9a7', bg: '#E8FDF7' },
}

const VALUE_COLOURS = ['#fdcb5e','#ff9f43','#ff7b7a','#00c9a7','#2d4a8a','#a78bfa','#0AF3CD','#f472b6']

// ── Main component ────────────────────────────────────────────────────────────

export default function ValuesCheckinPage() {
  const supabase = createClient()

  const [loading,   setLoading]   = useState(true)
  const [values,    setValues]    = useState<CompanyValue[]>([])
  const [ratings,   setRatings]   = useState<RatingsMap>({})
  const [draft,     setDraft]     = useState<Record<string, number>>({})  // key: valueId_idx
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [token,     setToken]     = useState<string | null>(null)
  const [hasExisting, setHasExisting] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login'; return }
      setToken(session.access_token)

      const res = await fetch('/api/values-checkin', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = await res.json()
      setValues(data.values ?? [])
      setRatings(data.ratings ?? {})

      // Pre-fill draft with existing ratings
      const existing: Record<string, number> = {}
      for (const [key, val] of Object.entries(data.ratings ?? {})) {
        existing[key] = (val as { rating: number }).rating
      }
      setDraft(existing)
      setHasExisting(Object.keys(data.ratings ?? {}).length > 0)
      setLoading(false)
    }
    load()
  }, [supabase])

  function setRating(valueId: string, behaviourIndex: number, rating: number) {
    const key = `${valueId}_${behaviourIndex}`
    setDraft(prev => ({ ...prev, [key]: rating }))
    setSaved(false)
  }

  function getRating(valueId: string, behaviourIndex: number): number {
    return draft[`${valueId}_${behaviourIndex}`] ?? 0
  }

  function totalBehaviours() {
    return values.reduce((sum, v) => sum + v.behaviours.length, 0)
  }

  function ratedCount() {
    return Object.keys(draft).filter(k => draft[k] > 0).length
  }

  function allRated() {
    return ratedCount() >= totalBehaviours()
  }

  async function submit() {
    if (!token) return
    setSaving(true)

    const rows: { company_value_id: string; behaviour_index: number; rating: number }[] = []
    for (const [key, rating] of Object.entries(draft)) {
      if (rating === 0) continue
      const [valueId, idxStr] = key.split('_')
      rows.push({ company_value_id: valueId, behaviour_index: parseInt(idxStr), rating })
    }

    await fetch('/api/values-checkin', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ratings: rows }),
    })

    setSaving(false)
    setSaved(true)
    setHasExisting(true)

    // Refresh ratings from server
    const res = await fetch('/api/values-checkin', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    setRatings(data.ratings ?? {})
  }

  // ── Average score for a value ─────────────────────────────────────────────
  function valueAverage(valueId: string, behaviourCount: number): number | null {
    const scores = Array.from({ length: behaviourCount }, (_, i) => draft[`${valueId}_${i}`] ?? 0).filter(s => s > 0)
    if (scores.length === 0) return null
    return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F4FDF9' }}>
        <p className="text-sm" style={{ color: '#05A88E' }}>Loading…</p>
      </main>
    )
  }

  if (values.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F4FDF9' }}>
        <div className="text-center max-w-sm px-6">
          <p className="text-base font-semibold mb-2" style={{ color: '#0A2E2A' }}>No values set up yet</p>
          <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
            Your programme team hasn't added company values yet. Check back soon.
          </p>
          <a href="/dashboard" className="text-sm font-semibold" style={{ color: '#05A88E' }}>← Back to dashboard</a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F4FDF9' }}>

      {/* Header */}
      <div style={{ backgroundColor: '#0A2E2A' }}>
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <a href="/dashboard" className="text-xs mb-1 flex items-center gap-1 hover:opacity-70"
               style={{ color: 'rgba(185,248,221,0.6)' }}>
              ← Back to dashboard
            </a>
            <h1 className="text-lg font-bold" style={{ color: 'white' }}>Values in Action</h1>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(185,248,221,0.6)' }}>
              How consistently do your behaviours reflect your company values?
            </p>
          </div>
          {/* Progress */}
          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-black" style={{ color: '#0AF3CD' }}>
              {ratedCount()}<span className="text-sm font-normal opacity-60">/{totalBehaviours()}</span>
            </p>
            <p className="text-xs" style={{ color: 'rgba(185,248,221,0.6)' }}>rated</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">

        {/* Intro card */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: 'white', border: '1px solid #E8FDF7', boxShadow: '0 2px 12px rgba(10,46,42,0.06)' }}>
          <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
            For each behaviour below, rate how consistently you demonstrate it in your day-to-day leadership.
            Be honest: this is for your own development, not a performance review.
            {hasExisting && <span className="font-medium" style={{ color: '#05A88E' }}> You can update your ratings any time.</span>}
          </p>

          {/* Rating scale legend */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {[1,2,3,4].map(r => (
              <div key={r} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                   style={{ backgroundColor: RATING_LABELS[r].bg, color: RATING_LABELS[r].colour }}>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: RATING_LABELS[r].colour }} />
                {r} — {RATING_LABELS[r].label}
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        {values.map((v, vi) => {
          const avg = valueAverage(v.id, v.behaviours.length)
          const avgRating = avg !== null ? RATING_LABELS[Math.round(avg)] : null
          return (
            <div key={v.id} className="rounded-2xl overflow-hidden"
                 style={{ backgroundColor: 'white', border: '1px solid #E8FDF7', boxShadow: '0 2px 12px rgba(10,46,42,0.06)' }}>

              {/* Value header */}
              <div className="px-5 py-4 flex items-center justify-between"
                   style={{ borderBottom: '1px solid #F3F4F6' }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: VALUE_COLOURS[vi % VALUE_COLOURS.length], flexShrink: 0 }} />
                  <span className="font-bold text-base" style={{ color: '#0A2E2A' }}>{v.value_name}</span>
                </div>
                {avg !== null && avgRating && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                       style={{ backgroundColor: avgRating.bg, color: avgRating.colour }}>
                    {avg.toFixed(1)} — {avgRating.label}
                  </div>
                )}
              </div>

              {/* Behaviours */}
              <div className="divide-y" style={{ borderColor: '#F9FAFB' }}>
                {v.behaviours.map((behaviour, bi) => {
                  const current = getRating(v.id, bi)
                  return (
                    <div key={bi} className="px-5 py-4">
                      <p className="text-sm mb-3" style={{ color: '#374151', lineHeight: 1.6 }}>
                        {behaviour}
                      </p>
                      {/* Rating buttons */}
                      <div className="flex gap-2 flex-wrap">
                        {[1,2,3,4].map(r => {
                          const active = current === r
                          const rl = RATING_LABELS[r]
                          return (
                            <button
                              key={r}
                              onClick={() => setRating(v.id, bi, r)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                              style={{
                                backgroundColor: active ? rl.colour : rl.bg,
                                color:           active ? 'white'   : rl.colour,
                                border:          `1.5px solid ${active ? rl.colour : 'transparent'}`,
                                transform:       active ? 'scale(1.05)' : 'scale(1)',
                              }}
                            >
                              {active && <span>✓</span>}
                              {rl.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Submit */}
        <div className="pb-8">
          {saved ? (
            <div className="rounded-2xl p-5 text-center" style={{ backgroundColor: '#E8FDF7', border: '2px solid #0AF3CD' }}>
              <p className="text-base font-bold mb-1" style={{ color: '#0A2E2A' }}>✓ Saved</p>
              <p className="text-sm mb-4" style={{ color: '#05A88E' }}>
                Your Values in Action ratings have been saved. Your coaching room now knows your values profile.
              </p>
              <a href="/dashboard"
                 className="inline-block px-6 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
                 style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}>
                Back to dashboard
              </a>
            </div>
          ) : (
            <button
              onClick={submit}
              disabled={saving || !allRated()}
              className="w-full py-4 rounded-2xl text-sm font-bold disabled:opacity-40 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}
            >
              {saving ? 'Saving…' : !allRated() ? `Rate all behaviours to continue (${ratedCount()}/${totalBehaviours()} done)` : hasExisting ? 'Update my ratings' : 'Save my ratings'}
            </button>
          )}
        </div>

      </div>
    </main>
  )
}
