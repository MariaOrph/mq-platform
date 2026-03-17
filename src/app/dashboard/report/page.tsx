'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

const DIMS = [
  { id: 1, name: 'Self-awareness',        color: '#fdcb5e', bg: '#FEF5D9' },
  { id: 2, name: 'Cognitive flexibility', color: '#ff9f43', bg: '#FFF0E0' },
  { id: 3, name: 'Emotional regulation',  color: '#ff7b7a', bg: '#FFE8E8' },
  { id: 4, name: 'Values clarity',        color: '#00c9a7', bg: '#D4F5EF' },
  { id: 5, name: 'Relational mindset',    color: '#2d4a8a', bg: '#E0E6F5' },
  { id: 6, name: 'Adaptive resilience',   color: '#a78bfa', bg: '#EDE9FE' },
]

const DIM_DESCRIPTIONS: Record<number, { tagline: string; what: string; high: string; low: string }> = {
  1: {
    tagline: 'The ability to see yourself clearly — in real time.',
    what: 'The capacity to notice your own thoughts, feelings, assumptions and behavioural patterns as they arise, without being swept along by them.',
    high: 'Strong internal observer. You notice patterns in your thinking, catch your own triggers early, and tend to seek honest feedback.',
    low: 'May react before choosing your response — or discover your impact on others after the fact rather than in the moment.',
  },
  2: {
    tagline: 'The capacity to think in multiple directions at once.',
    what: 'The ability to hold several perspectives simultaneously, update your thinking when new information arrives, and move fluidly between different mental models.',
    high: 'Readily updates mental models, entertains contradictory ideas, and avoids black-and-white thinking.',
    low: 'May default to familiar frameworks even when the situation calls for fresh thinking.',
  },
  3: {
    tagline: 'Letting emotions inform you rather than run you.',
    what: 'The ability to manage your emotional responses — especially under pressure — so they serve your goals rather than derail them.',
    high: 'Stays grounded under pressure. Others experience you as steady and safe to bring problems to.',
    low: 'Emotional intensity may sometimes hijack thinking or limit presence in high-stakes moments.',
  },
  4: {
    tagline: 'Knowing what you stand for — and acting like it.',
    what: 'Knowing what you actually believe in — and whether your decisions and day-to-day behaviour genuinely reflect those values.',
    high: 'Decisions anchored by a clear internal compass. Others experience you as consistent and trustworthy.',
    low: 'May hold values not yet fully translated into consistent, visible behaviours.',
  },
  5: {
    tagline: 'The quality of presence you bring to every interaction.',
    what: 'The intention and quality of attention you bring to your relationships — whether you genuinely seek to understand others.',
    high: 'Approaches relationships with genuine curiosity and care. People feel seen and heard.',
    low: 'Under pressure, may shift into transactional mode — giving people less real attention than they need.',
  },
  6: {
    tagline: 'Bouncing forward, not just back.',
    what: 'The ability to sustain performance under pressure, recover from setbacks, and find meaning in adversity rather than being destabilised by it.',
    high: 'Strong internal resources for navigating difficulty. Setbacks become learning rather than defeat.',
    low: 'Sustained pressure may be depleting capacity in ways that affect thinking and relationships.',
  },
}

function getScoreBand(score: number): { label: string; colour: string } {
  if (score >= 90) return { label: 'Exceptional', colour: '#00c9a7' }
  if (score >= 75) return { label: 'Strong',      colour: '#05A88E' }
  if (score >= 60) return { label: 'Solid',       colour: '#fdcb5e' }
  if (score >= 40) return { label: 'Developing',  colour: '#ff9f43' }
  return              { label: 'Growth area',    colour: '#ff7b7a' }
}

function getDimScore(a: Record<string, number | null>, dimId: number): number | null {
  return a[`d${dimId}_score`] as number | null
}

interface Profile { full_name: string | null; email: string }
interface Assessment {
  overall_score: number | null
  d1_score: number | null; d2_score: number | null; d3_score: number | null
  d4_score: number | null; d5_score: number | null; d6_score: number | null
  completed_at: string | null
  participant_role: string | null
}
interface CompanyValue { id: string; value_name: string; behaviours: string[] }
type RatingsMap = Record<string, number>

const RATING_LABELS: Record<number, { label: string; colour: string; bg: string }> = {
  1: { label: 'Rarely',       colour: '#ff7b7a', bg: '#FFF0F0' },
  2: { label: 'Sometimes',    colour: '#ff9f43', bg: '#FFF5EB' },
  3: { label: 'Usually',      colour: '#fdcb5e', bg: '#FFFAE8' },
  4: { label: 'Consistently', colour: '#00c9a7', bg: '#E8FDF7' },
}
const VALUE_COLOURS = ['#fdcb5e','#ff9f43','#ff7b7a','#00c9a7','#2d4a8a','#a78bfa']

export default function ReportPage() {
  const supabase = createClient()
  const [profile,      setProfile]      = useState<Profile | null>(null)
  const [assessment,   setAssessment]   = useState<Assessment | null>(null)
  const [companyValues, setCompanyValues] = useState<CompanyValue[]>([])
  const [ratings,      setRatings]      = useState<RatingsMap>({})
  const [loading,      setLoading]      = useState(true)

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.href = '/login'; return }

    const [{ data: prof }, { data: assessments }] = await Promise.all([
      supabase.from('profiles').select('full_name, email').eq('id', session.user.id).single(),
      supabase.from('assessments')
        .select('overall_score, d1_score, d2_score, d3_score, d4_score, d5_score, d6_score, completed_at, participant_role')
        .eq('participant_id', session.user.id)
        .not('overall_score', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(1),
    ])

    if (prof) setProfile({ full_name: prof.full_name, email: prof.email })
    if (assessments?.[0]) setAssessment(assessments[0])

    // Fetch values + ratings via API
    try {
      const res = await fetch('/api/values-checkin', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = await res.json()
      setCompanyValues(data.values ?? [])
      const flat: RatingsMap = {}
      for (const [key, val] of Object.entries(data.ratings ?? {})) {
        flat[key] = (val as { rating: number }).rating
      }
      setRatings(flat)
    } catch { /* no values */ }

    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F4FDF9' }}>
        <p style={{ color: '#05A88E' }}>Loading your report…</p>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F4FDF9' }}>
        <p style={{ color: '#374151' }}>No assessment found. <a href="/assessment" style={{ color: '#05A88E' }}>Take your assessment →</a></p>
      </div>
    )
  }

  const name       = profile?.full_name || profile?.email?.split('@')[0] || 'Participant'
  const role       = assessment.participant_role || 'Leader'
  const date       = assessment.completed_at ? new Date(assessment.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
  const overall    = assessment.overall_score ?? 0
  const overallBand = getScoreBand(overall)
  const focusDimId = DIMS.map(d => ({ id: d.id, s: getDimScore(assessment as unknown as Record<string, number | null>, d.id) ?? 999 }))
    .sort((a, b) => a.s - b.s)[0].id

  return (
    <>
      {/* Print / save button — hidden when printing */}
      <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          style={{ backgroundColor: '#0A2E2A', color: '#0AF3CD' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Save as PDF
        </button>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { margin: 0.75in; size: A4; }
        }
      `}</style>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-8" style={{ backgroundColor: 'white', minHeight: '100vh' }}>

        {/* ── Cover header ──────────────────────────────────────────────────── */}
        <div className="rounded-2xl p-8 relative overflow-hidden"
             style={{ background: 'linear-gradient(135deg, #0A2E2A 0%, #0d3830 100%)' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(10,243,205,0.12) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: -30, left: -20, width: 150, height: 150, borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(10,243,205,0.08) 0%, transparent 70%)' }} />
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#0AF3CD' }}>
              MQ Assessment Report
            </p>
            <h1 className="text-3xl font-black mb-1" style={{ color: 'white' }}>{name}</h1>
            <p className="text-sm mb-6" style={{ color: 'rgba(185,248,221,0.7)' }}>{role} · {date}</p>

            {/* Overall score */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0"
                   style={{ backgroundColor: '#0AF3CD' }}>
                <span className="text-3xl font-black" style={{ color: '#0A2E2A' }}>{overall}</span>
              </div>
              <div>
                <p className="text-2xl font-black" style={{ color: 'white' }}>MQ Score</p>
                <p className="text-base font-semibold" style={{ color: overallBand.colour }}>{overallBand.label}</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(185,248,221,0.6)' }}>out of 100</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── What is MQ ────────────────────────────────────────────────────── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#9CA3AF' }}>About MQ</p>
          <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
            MQ — Mindset Quotient — measures your capacity to notice your own thoughts, beliefs and emotional patterns,
            and to consciously choose how you respond rather than being driven by them automatically. It is measured
            across six dimensions that together define the internal landscape of effective leadership.
          </p>
        </div>

        {/* ── Dimension profiles ────────────────────────────────────────────── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#9CA3AF' }}>Your MQ Profile</p>
          <div className="space-y-5">
            {DIMS.map(dim => {
              const score   = getDimScore(assessment as unknown as Record<string, number | null>, dim.id)
              const band    = score !== null ? getScoreBand(score) : null
              const desc    = DIM_DESCRIPTIONS[dim.id]
              const isFocus = dim.id === focusDimId
              return (
                <div key={dim.id} className="rounded-2xl p-5" style={{ backgroundColor: dim.bg, border: `1px solid ${dim.color}33` }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: dim.color }} />
                        <p className="text-sm font-bold" style={{ color: '#0A2E2A' }}>{dim.name}</p>
                        {isFocus && (
                          <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                                style={{ backgroundColor: dim.color, color: '#0A2E2A' }}>focus</span>
                        )}
                      </div>
                      <p className="text-xs ml-4" style={{ color: '#6B7280' }}>{desc.tagline}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <span className="text-2xl font-black" style={{ color: dim.color }}>{score ?? '—'}</span>
                      {band && <p className="text-xs font-semibold" style={{ color: dim.color }}>{band.label}</p>}
                    </div>
                  </div>

                  {/* Score bar */}
                  <div className="h-2 rounded-full mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.6)' }}>
                    <div className="h-2 rounded-full transition-all"
                         style={{ width: score !== null ? `${score}%` : '0%', backgroundColor: dim.color }} />
                  </div>

                  <p className="text-xs leading-relaxed mb-3" style={{ color: '#374151' }}>{desc.what}</p>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl p-3" style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}>
                      <p className="text-xs font-bold mb-1" style={{ color: '#059669' }}>When high</p>
                      <p className="text-xs leading-relaxed" style={{ color: '#374151' }}>{desc.high}</p>
                    </div>
                    <div className="rounded-xl p-3" style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}>
                      <p className="text-xs font-bold mb-1" style={{ color: '#D97706' }}>When low</p>
                      <p className="text-xs leading-relaxed" style={{ color: '#374151' }}>{desc.low}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Score guide ───────────────────────────────────────────────────── */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#9CA3AF' }}>Score guide</p>
          <div className="space-y-2">
            {[
              { range: '90–100', label: 'Exceptional', desc: 'A standout strength. Leverage and model this for others.', col: '#00c9a7' },
              { range: '75–89',  label: 'Strong',      desc: 'A real asset. Build from a position of genuine capability.', col: '#05A88E' },
              { range: '60–74',  label: 'Solid',       desc: 'A foundation, not a gap. Focused development builds this into a strength.', col: '#fdcb5e' },
              { range: '40–59',  label: 'Developing',  desc: 'Active growth edge. Awareness here unlocks meaningful development.', col: '#ff9f43' },
              { range: '0–39',   label: 'Growth area', desc: 'Significant opportunity. Many leaders describe this as unlocking something previously hidden.', col: '#ff7b7a' },
            ].map(row => (
              <div key={row.range} className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: row.col }} />
                <div>
                  <span className="text-xs font-bold" style={{ color: '#0A2E2A' }}>{row.range} — {row.label}: </span>
                  <span className="text-xs" style={{ color: '#6B7280' }}>{row.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Values in Action ──────────────────────────────────────────────── */}
        {companyValues.length > 0 && Object.keys(ratings).length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#9CA3AF' }}>Values in Action</p>
            <div className="space-y-4">
              {companyValues.map((v, vi) => {
                const ratedBehaviours = v.behaviours.map((b, bi) => ({
                  behaviour: b,
                  rating: ratings[`${v.id}_${bi}`] ?? 0,
                })).filter(r => r.rating > 0)
                if (ratedBehaviours.length === 0) return null
                const avgRating = ratedBehaviours.reduce((s, r) => s + r.rating, 0) / ratedBehaviours.length
                const avgLabel = RATING_LABELS[Math.round(avgRating)]
                return (
                  <div key={v.id} className="rounded-2xl overflow-hidden"
                       style={{ border: `1px solid ${VALUE_COLOURS[vi % VALUE_COLOURS.length]}33` }}>
                    <div className="px-5 py-3 flex items-center justify-between"
                         style={{ backgroundColor: `${VALUE_COLOURS[vi % VALUE_COLOURS.length]}12`, borderBottom: `1px solid ${VALUE_COLOURS[vi % VALUE_COLOURS.length]}20` }}>
                      <div className="flex items-center gap-2">
                        <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: VALUE_COLOURS[vi % VALUE_COLOURS.length] }} />
                        <span className="text-sm font-bold" style={{ color: '#0A2E2A' }}>{v.value_name}</span>
                      </div>
                      {avgLabel && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                              style={{ backgroundColor: avgLabel.bg, color: avgLabel.colour }}>
                          Avg: {avgLabel.label}
                        </span>
                      )}
                    </div>
                    <div className="divide-y" style={{ borderColor: '#F9FAFB' }}>
                      {ratedBehaviours.map((r, i) => {
                        const rl = RATING_LABELS[r.rating]
                        return (
                          <div key={i} className="px-5 py-3 flex items-start justify-between gap-4">
                            <p className="text-xs leading-relaxed flex-1" style={{ color: '#374151' }}>{r.behaviour}</p>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: rl.bg, color: rl.colour }}>
                              {rl.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <div className="text-center pb-4">
          <p className="text-xs" style={{ color: '#9CA3AF' }}>
            Generated by MQ Platform · {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

      </div>
    </>
  )
}
