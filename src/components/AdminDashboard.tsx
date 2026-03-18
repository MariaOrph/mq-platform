'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DIMENSIONS, getScoreLabel } from '@/lib/assessment/data'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Profile {
  id: string
  full_name: string | null
  email: string
  role: string
  company_id: string | null
}

interface Company {
  id: string
  name: string
}

interface Cohort {
  id: string
  company_id: string
  name: string
  type: string
  status: string
  created_at: string
  company_name?: string
  participant_count: number
  completed_count: number
  company_values?: string | null
}

interface CohortParticipant {
  id: string
  email: string
  invited_at: string | null
  participant_id: string | null
  full_name: string | null
  participant_role: string | null
  overall_score: number | null
  d1_score: number | null
  d2_score: number | null
  d3_score: number | null
  d4_score: number | null
  d5_score: number | null
  d6_score: number | null
  completed_at: string | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreBadge(score: number | null) {
  if (score === null) return { label: 'Pending', bg: '#F3F4F6', text: '#6B7280' }
  if (score >= 80) return { label: 'High MQ',        bg: '#D1FAE5', text: '#065F46' }
  if (score >= 60) return { label: 'Developing MQ',  bg: '#CFFAFE', text: '#0E7490' }
  if (score >= 40) return { label: 'Emerging MQ',    bg: '#FEF3C7', text: '#92400E' }
  return                   { label: 'Early MQ',      bg: '#FEE2E2', text: '#991B1B' }
}

function dimScores(participants: CohortParticipant[]) {
  const completed = participants.filter(p => p.overall_score !== null)
  if (completed.length === 0) return DIMENSIONS.map(() => null as number | null)
  return DIMENSIONS.map((_, i) => {
    const key = `d${i + 1}_score` as keyof CohortParticipant
    const vals = completed.map(p => p[key] as number | null).filter(v => v !== null) as number[]
    return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null
  })
}

function avgOverall(participants: CohortParticipant[]) {
  const completed = participants.filter(p => p.overall_score !== null)
  if (completed.length === 0) return null
  return Math.round(completed.reduce((s, p) => s + (p.overall_score ?? 0), 0) / completed.length)
}

// ── Overview Tab ──────────────────────────────────────────────────────────────

function OverviewTab({
  participants,
  cohortId,
  cohortName,
  companyName,
}: {
  participants:  CohortParticipant[]
  cohortId:      string
  cohortName:    string
  companyName:   string
}) {
  const completed = participants.filter(p => p.overall_score !== null)
  const avg  = avgOverall(participants)
  const dims = dimScores(participants)
  const rate = participants.length > 0
    ? Math.round((completed.length / participants.length) * 100)
    : 0

  // ── AI insight state ──────────────────────────────────────────────────────
  const [insight, setInsight]           = useState<string | null>(null)
  const [insightLoading, setInsightLoading] = useState(false)
  const [insightError, setInsightError] = useState(false)

  useEffect(() => {
    if (completed.length === 0 || !cohortId) return

    setInsightLoading(true)
    setInsightError(false)

    const scores = {
      d1:      dims[0],
      d2:      dims[1],
      d3:      dims[2],
      d4:      dims[3],
      d5:      dims[4],
      d6:      dims[5],
      overall: avg,
    }

    fetch('/api/insight', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ cohortId, cohortName, companyName, scores }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.insight) setInsight(data.insight)
        else setInsightError(true)
      })
      .catch(() => setInsightError(true))
      .finally(() => setInsightLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cohortId, completed.length])

  if (participants.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-sm" style={{ color: '#05A88E' }}>No participants in this cohort yet.</p>
        <p className="text-xs mt-2 text-gray-500">Go to the All Cohorts tab to invite participants.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Avg MQ Score', value: avg !== null ? String(avg) : '—', sub: avg !== null ? getScoreLabel(avg) : 'No completions yet' },
          { label: 'Invited',      value: String(participants.length), sub: 'participants' },
          { label: 'Completed',    value: String(completed.length),    sub: 'assessments' },
          { label: 'Completion',   value: `${rate}%`,                  sub: 'of invited' },
        ].map(card => (
          <div key={card.label} className="rounded-xl p-5" style={{ backgroundColor: 'white', border: '1px solid #B9F8DD' }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#05A88E' }}>{card.label}</p>
            <p className="text-3xl font-bold mt-1" style={{ color: '#0A2E2A' }}>{card.value}</p>
            <p className="text-xs mt-1 text-gray-400">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Dimension bars */}
      {completed.length > 0 && (
        <div className="rounded-xl p-6" style={{ backgroundColor: 'white', border: '1px solid #B9F8DD' }}>
          <h3 className="text-sm font-semibold mb-5" style={{ color: '#0A2E2A' }}>Team averages by dimension</h3>
          <div className="space-y-4">
            {DIMENSIONS.map((dim, i) => {
              const val = dims[i]
              return (
                <div key={dim.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: '#0A2E2A' }}>{dim.name}</span>
                    <span className="font-bold" style={{ color: dim.color }}>{val ?? '—'}</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ backgroundColor: '#E8FDF7' }}>
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{ width: val !== null ? `${val}%` : '0%', backgroundColor: dim.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* AI-generated team insight */}
      {completed.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ border: '2px solid #0AF3CD' }}>
          {/* Header bar */}
          <div className="px-6 py-3 flex items-center gap-2" style={{ backgroundColor: '#0AF3CD' }}>
            <span className="text-base">✦</span>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#0A2E2A' }}>
              Team insight
            </p>
          </div>

          {/* Body */}
          <div className="px-6 py-5" style={{ backgroundColor: '#E8FDF7' }}>
            {insightLoading && (
              <div className="space-y-2 animate-pulse">
                <div className="h-3 rounded-full w-full"  style={{ backgroundColor: '#B9F8DD' }} />
                <div className="h-3 rounded-full w-5/6"   style={{ backgroundColor: '#B9F8DD' }} />
                <div className="h-3 rounded-full w-4/6"   style={{ backgroundColor: '#B9F8DD' }} />
              </div>
            )}

            {!insightLoading && insightError && (
              <p className="text-sm italic" style={{ color: '#05A88E' }}>
                Your team insight is being generated. Refresh in a moment.
              </p>
            )}

            {!insightLoading && insight && (
              <p className="text-sm leading-relaxed" style={{ color: '#0A2E2A' }}>
                {insight}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Download cohort report */}
      {completed.length > 0 && cohortId && (
        <a
          href={`/admin/cohort-report/${cohortId}`}
          target="_blank"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#0A2E2A', color: '#0AF3CD', border: '1px solid rgba(10,243,205,0.2)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download cohort report
        </a>
      )}
    </div>
  )
}

// ── Cohort View Tab ───────────────────────────────────────────────────────────

function CohortViewTab({ participants, isMqAdmin }: { participants: CohortParticipant[], isMqAdmin: boolean }) {
  if (participants.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-sm" style={{ color: '#05A88E' }}>No participants in this cohort yet.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #B9F8DD' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: '#0A2E2A' }}>
            <tr>
              <th className="text-left py-3 px-4 font-semibold" style={{ color: '#0AF3CD' }}>Name</th>
              <th className="text-left py-3 px-4 font-semibold" style={{ color: '#B9F8DD' }}>Role</th>
              <th className="text-left py-3 px-4 font-semibold" style={{ color: '#B9F8DD' }}>MQ Score</th>
              {isMqAdmin && DIMENSIONS.map(d => (
                <th key={d.id} className="text-center py-3 px-2 font-semibold text-xs" style={{ color: d.color }}>
                  {d.name.split(' ')[0]}
                </th>
              ))}
              <th className="text-left py-3 px-4 font-semibold" style={{ color: '#B9F8DD' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p, i) => {
              const badge = scoreBadge(p.overall_score)
              const isComplete = p.overall_score !== null
              return (
                <tr key={p.id} style={{
                  borderBottom: '1px solid #E8FDF7',
                  backgroundColor: i % 2 === 0 ? 'white' : '#F7FEFC',
                }}>
                  <td className="py-3 px-4 font-medium" style={{ color: '#0A2E2A' }}>
                    {p.full_name ?? p.email}
                    {p.full_name && <span className="ml-1 text-xs text-gray-400">({p.email})</span>}
                  </td>
                  <td className="py-3 px-4 text-gray-500 capitalize">{p.participant_role ?? '—'}</td>
                  <td className="py-3 px-4">
                    {isComplete ? (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base" style={{ color: '#0A2E2A' }}>{p.overall_score}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: badge.bg, color: badge.text }}>
                          {badge.label}
                        </span>
                      </div>
                    ) : '—'}
                  </td>
                  {isMqAdmin && (
                    [p.d1_score, p.d2_score, p.d3_score, p.d4_score, p.d5_score, p.d6_score].map((score, di) => (
                      <td key={di} className="py-3 px-2 text-center font-semibold text-xs"
                        style={{ color: score !== null ? DIMENSIONS[di].color : '#D1D5DB' }}>
                        {score ?? '—'}
                      </td>
                    ))
                  )}
                  <td className="py-3 px-4">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                      backgroundColor: isComplete ? '#D1FAE5' : p.invited_at ? '#FEF3C7' : '#F3F4F6',
                      color:           isComplete ? '#065F46' : p.invited_at ? '#92400E' : '#6B7280',
                    }}>
                      {isComplete ? 'Completed' : p.invited_at ? 'Invited' : 'Pending'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Before & After Tab ────────────────────────────────────────────────────────

function BeforeAfterTab({
  cohorts,
  fetchParticipants,
}: {
  cohorts: Cohort[]
  fetchParticipants: (cohortId: string) => Promise<CohortParticipant[]>
}) {
  const baselineCohorts = cohorts.filter(c => c.type === 'Baseline')
  const postCohorts     = cohorts.filter(c => c.type === 'Post-programme')

  const [baselineId, setBaselineId]     = useState('')
  const [postId, setPostId]             = useState('')
  const [loading, setLoading]           = useState(false)
  const [hasCompared, setHasCompared]   = useState(false)
  const [matchedBase, setMatchedBase]   = useState<CohortParticipant[]>([])
  const [matchedPost, setMatchedPost]   = useState<CohortParticipant[]>([])

  async function compare() {
    if (!baselineId || !postId) return
    setLoading(true)
    const [base, post] = await Promise.all([
      fetchParticipants(baselineId),
      fetchParticipants(postId),
    ])
    // Only participants who completed BOTH assessments, matched by email
    const baseCompleted = base.filter(p => p.overall_score !== null)
    const postCompleted = post.filter(p => p.overall_score !== null)
    const sharedEmails  = new Set(
      baseCompleted.map(p => p.email).filter(e => postCompleted.some(p2 => p2.email === e))
    )
    setMatchedBase(baseCompleted.filter(p => sharedEmails.has(p.email)))
    setMatchedPost(postCompleted.filter(p => sharedEmails.has(p.email)))
    setHasCompared(true)
    setLoading(false)
  }

  function getDimAvg(parts: CohortParticipant[], dimIndex: number): number | null {
    const key  = `d${dimIndex + 1}_score` as keyof CohortParticipant
    const vals = parts.map(p => p[key] as number | null).filter(v => v !== null) as number[]
    return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null
  }

  const baselineCohort = cohorts.find(c => c.id === baselineId)
  const postCohort     = cohorts.find(c => c.id === postId)
  const avgBase        = matchedBase.length > 0
    ? Math.round(matchedBase.reduce((s, p) => s + (p.overall_score ?? 0), 0) / matchedBase.length)
    : null
  const avgPost        = matchedPost.length > 0
    ? Math.round(matchedPost.reduce((s, p) => s + (p.overall_score ?? 0), 0) / matchedPost.length)
    : null
  const overallDelta   = avgBase !== null && avgPost !== null ? avgPost - avgBase : null

  const dimDeltas = DIMENSIONS.map((_, i) => {
    const b = getDimAvg(matchedBase, i)
    const p = getDimAvg(matchedPost, i)
    return b !== null && p !== null ? p - b : null
  })
  const validDeltas         = dimDeltas.filter(d => d !== null) as number[]
  const avgDimImprovement   = validDeltas.length > 0
    ? Math.round(validDeltas.reduce((a, b) => a + b, 0) / validDeltas.length)
    : null

  function buildSummary(): string {
    if (matchedBase.length === 0) return ''
    const lines: string[] = []
    const n = matchedBase.length
    lines.push(
      `This comparison is based on ${n} participant${n === 1 ? '' : 's'} who completed both assessments.`
    )
    if (overallDelta !== null) {
      if (overallDelta > 0) {
        lines.push(
          `Overall, the team's average MQ score improved by ${overallDelta} point${overallDelta === 1 ? '' : 's'}: from ${avgBase} to ${avgPost}.`
        )
      } else if (overallDelta < 0) {
        lines.push(
          `Overall, the team's average MQ score shifted by ${overallDelta} points: from ${avgBase} to ${avgPost}.`
        )
      } else {
        lines.push(`The team's overall MQ score held steady at ${avgBase}.`)
      }
    }
    let maxDelta = -Infinity; let maxIdx = -1
    let minDelta = Infinity;  let minIdx = -1
    dimDeltas.forEach((d, i) => {
      if (d === null) return
      if (d > maxDelta) { maxDelta = d; maxIdx = i }
      if (d < minDelta) { minDelta = d; minIdx = i }
    })
    if (maxIdx >= 0 && maxDelta > 0) {
      lines.push(`${DIMENSIONS[maxIdx].name} showed the greatest improvement (+${maxDelta} pts).`)
    }
    if (minIdx >= 0 && minDelta < 0) {
      lines.push(
        `${DIMENSIONS[minIdx].name} showed a decline (${minDelta} pts), which may be worth exploring further.`
      )
    } else if (minIdx >= 0 && minIdx !== maxIdx && minDelta >= 0 && minDelta < maxDelta) {
      lines.push(
        `${DIMENSIONS[minIdx].name} had the smallest gain (+${minDelta} pts) and may benefit from continued focus.`
      )
    }
    return lines.join(' ')
  }

  // Empty state: no post-programme cohorts exist yet
  if (postCohorts.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
             style={{ backgroundColor: 'white', border: '1px solid #B9F8DD' }}>
          <span className="text-2xl">📊</span>
        </div>
        <p className="text-base font-semibold mb-2" style={{ color: '#0A2E2A' }}>
          No post-programme cohorts yet
        </p>
        <p className="text-sm max-w-sm mx-auto" style={{ color: '#05A88E' }}>
          Once you run a post-programme assessment, create a cohort of type{' '}
          <strong>Post-programme</strong> and you&apos;ll be able to compare results here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Cohort selectors */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block" style={{ color: '#0A2E2A' }}>
            Before: Baseline cohort
          </label>
          <select
            value={baselineId}
            onChange={e => { setBaselineId(e.target.value); setHasCompared(false) }}
            className="w-full rounded-lg px-3 py-2 text-sm border"
            style={{ borderColor: '#B9F8DD', color: '#0A2E2A', backgroundColor: 'white' }}
          >
            <option value="">Select a baseline cohort…</option>
            {baselineCohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block" style={{ color: '#0A2E2A' }}>
            After: Post-programme cohort
          </label>
          <select
            value={postId}
            onChange={e => { setPostId(e.target.value); setHasCompared(false) }}
            className="w-full rounded-lg px-3 py-2 text-sm border"
            style={{ borderColor: '#B9F8DD', color: '#0A2E2A', backgroundColor: 'white' }}
          >
            <option value="">Select a post-programme cohort…</option>
            {postCohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <button
        onClick={compare}
        disabled={!baselineId || !postId || loading}
        className="px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-40"
        style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}
      >
        {loading ? 'Comparing…' : 'Compare cohorts'}
      </button>

      {/* No matched participants */}
      {hasCompared && matchedBase.length === 0 && (
        <div className="rounded-xl p-8 text-center" style={{ backgroundColor: 'white', border: '1px solid #B9F8DD' }}>
          <p className="text-sm font-semibold mb-1" style={{ color: '#0A2E2A' }}>
            No matched participants found
          </p>
          <p className="text-sm" style={{ color: '#05A88E' }}>
            We couldn&apos;t find any participants who completed assessments in both cohorts.
            Make sure the same email addresses appear in both.
          </p>
        </div>
      )}

      {hasCompared && matchedBase.length > 0 && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label:      'Before: avg MQ',
                value:      avgBase !== null ? String(avgBase) : '—',
                sub:        baselineCohort?.name ?? 'Baseline',
                valueColor: '#0A2E2A',
              },
              {
                label:      'After: avg MQ',
                value:      avgPost !== null ? String(avgPost) : '—',
                sub:        postCohort?.name ?? 'Post-programme',
                valueColor: '#0A2E2A',
              },
              {
                label:      'Overall change',
                value:      overallDelta !== null
                  ? (overallDelta > 0 ? `+${overallDelta}` : String(overallDelta))
                  : '—',
                sub:        'MQ score points',
                valueColor: overallDelta === null ? '#0A2E2A'
                          : overallDelta > 0      ? '#3B6D11'
                          : overallDelta < 0      ? '#993C1D'
                          :                         '#0A2E2A',
              },
              {
                label:      'Matched participants',
                value:      String(matchedBase.length),
                sub:        'completed both',
                valueColor: '#0A2E2A',
              },
            ].map(card => (
              <div key={card.label} className="rounded-xl p-5" style={{ backgroundColor: 'white', border: '1px solid #B9F8DD' }}>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#05A88E' }}>{card.label}</p>
                <p className="text-3xl font-bold mt-1" style={{ color: card.valueColor }}>{card.value}</p>
                <p className="text-xs mt-1 text-gray-400">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Dimension comparison table */}
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #B9F8DD' }}>
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: '#0A2E2A' }}>
                <tr>
                  <th className="text-left py-3 px-5 font-semibold" style={{ color: '#0AF3CD' }}>Dimension</th>
                  <th className="text-center py-3 px-4 font-semibold" style={{ color: '#B9F8DD' }}>
                    Before
                  </th>
                  <th className="text-center py-3 px-4 font-semibold" style={{ color: '#B9F8DD' }}>
                    After
                  </th>
                  <th className="text-center py-3 px-4 font-semibold" style={{ color: '#0AF3CD' }}>Change</th>
                </tr>
              </thead>
              <tbody>
                {DIMENSIONS.map((dim, i) => {
                  const b     = getDimAvg(matchedBase, i)
                  const p     = getDimAvg(matchedPost, i)
                  const delta = b !== null && p !== null ? p - b : null
                  const isPos = delta !== null && delta > 0
                  const isNeg = delta !== null && delta < 0
                  return (
                    <tr key={dim.id} style={{
                      borderBottom:    '1px solid #E8FDF7',
                      backgroundColor: i % 2 === 0 ? 'white' : '#F7FEFC',
                    }}>
                      <td className="py-3 px-5 font-medium" style={{ color: dim.color }}>{dim.name}</td>
                      <td className="py-3 px-4 text-center font-semibold" style={{ color: '#0A2E2A' }}>{b ?? '—'}</td>
                      <td className="py-3 px-4 text-center font-semibold" style={{ color: '#0A2E2A' }}>{p ?? '—'}</td>
                      <td className="py-3 px-4 text-center">
                        {delta === null ? (
                          <span className="text-gray-400">—</span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold" style={{
                            backgroundColor: isPos ? '#EAF3DE' : isNeg ? '#FAECE7' : '#F3F4F6',
                            color:           isPos ? '#3B6D11' : isNeg ? '#993C1D' : '#6B7280',
                          }}>
                            {isPos ? `+${delta}` : String(delta)}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}

                {/* Avg dimension improvement row */}
                {avgDimImprovement !== null && (
                  <tr style={{ borderTop: '2px solid #B9F8DD', backgroundColor: '#F7FEFC' }}>
                    <td className="py-3 px-5 text-xs font-semibold uppercase tracking-wider" style={{ color: '#05A88E' }}>
                      Avg dimension improvement
                    </td>
                    <td colSpan={2} />
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold" style={{
                        backgroundColor: avgDimImprovement > 0 ? '#EAF3DE' : avgDimImprovement < 0 ? '#FAECE7' : '#F3F4F6',
                        color:           avgDimImprovement > 0 ? '#3B6D11' : avgDimImprovement < 0 ? '#993C1D' : '#6B7280',
                      }}>
                        {avgDimImprovement > 0 ? `+${avgDimImprovement}` : String(avgDimImprovement)}
                      </span>
                    </td>
                  </tr>
                )}

                {/* Overall MQ row */}
                <tr style={{ backgroundColor: '#0A2E2A' }}>
                  <td className="py-3 px-5 font-bold" style={{ color: '#0AF3CD' }}>Overall MQ</td>
                  <td className="py-3 px-4 text-center font-bold" style={{ color: 'white' }}>{avgBase ?? '—'}</td>
                  <td className="py-3 px-4 text-center font-bold" style={{ color: 'white' }}>{avgPost ?? '—'}</td>
                  <td className="py-3 px-4 text-center">
                    {overallDelta === null ? (
                      <span style={{ color: '#9CA3AF' }}>—</span>
                    ) : (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold" style={{
                        backgroundColor: overallDelta > 0 ? '#EAF3DE' : overallDelta < 0 ? '#FAECE7' : 'rgba(255,255,255,0.1)',
                        color:           overallDelta > 0 ? '#3B6D11' : overallDelta < 0 ? '#993C1D' : '#9CA3AF',
                      }}>
                        {overallDelta > 0 ? `+${overallDelta}` : String(overallDelta)}
                      </span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Narrative programme summary */}
          <div className="rounded-xl p-6" style={{ backgroundColor: '#0A2E2A' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#0AF3CD' }}>
              Programme summary
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#B9F8DD' }}>
              {buildSummary()}
            </p>
          </div>
        </>
      )}

    </div>
  )
}

// ── All Cohorts Tab ───────────────────────────────────────────────────────────

function AllCohortsTab({
  cohorts,
  companies,
  isMqAdmin,
  userCompanyId,
  onViewCohort,
  onRefresh,
}: {
  cohorts: Cohort[]
  companies: Company[]
  isMqAdmin: boolean
  userCompanyId: string | null
  onViewCohort: (cohortId: string) => void
  onRefresh: () => void
}) {
  const supabase = createClient()

  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('Baseline')
  const [newCompanyId, setNewCompanyId] = useState(userCompanyId ?? '')
  const [newCompanyValues, setNewCompanyValues] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [editingValuesId, setEditingValuesId] = useState<string | null>(null)
  const [editingValuesText, setEditingValuesText] = useState('')
  const [savingValues, setSavingValues] = useState(false)

  const [inviteCohortId, setInviteCohortId] = useState<string | null>(null)
  const [inviteEmails, setInviteEmails] = useState('')
  const [inviteRole, setInviteRole] = useState('participant')
  const [inviting, setInviting] = useState(false)
  const [inviteMsg, setInviteMsg] = useState('')

  async function createCohort() {
    if (!newName.trim()) return
    const compId = isMqAdmin ? newCompanyId : (userCompanyId ?? '')
    if (!compId) { setCreateError('Please select a company.'); return }
    setCreating(true)
    setCreateError('')
    const { error } = await supabase.from('cohorts').insert({
      name:           newName.trim(),
      type:           newType,
      status:         'Draft',
      company_id:     compId,
      company_values: newCompanyValues.trim() || null,
    })
    setCreating(false)
    if (error) { setCreateError(error.message); return }
    setShowNew(false)
    setNewName('')
    setNewCompanyValues('')
    onRefresh()
  }

  async function saveCompanyValues(cohortId: string) {
    setSavingValues(true)
    await supabase.from('cohorts').update({
      company_values: editingValuesText.trim() || null,
    }).eq('id', cohortId)
    setSavingValues(false)
    setEditingValuesId(null)
    onRefresh()
  }

  async function sendInvites() {
    if (!inviteCohortId || !inviteEmails.trim()) return
    setInviting(true)
    setInviteMsg('')

    const emails = inviteEmails
      .split(/[\n,]+/)
      .map(e => e.trim().toLowerCase())
      .filter(e => e.length > 0)

    // Work out which company this cohort belongs to
    const cohort = cohorts.find(c => c.id === inviteCohortId)
    const companyId = cohort?.company_id ?? userCompanyId ?? ''

    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cohortId: inviteCohortId, emails, role: inviteRole, companyId }),
      })
      const data = await res.json()
      if (res.ok) {
        setInviteMsg(`✓ Sent ${data.invited} invitation(s)${data.errors?.length > 0 ? ` (${data.errors.length} error(s))` : ''}`)
        setInviteEmails('')
        onRefresh()
      } else {
        setInviteMsg(`Error: ${data.error ?? 'Something went wrong'}`)
      }
    } catch {
      setInviteMsg('Error: Could not reach invitation service')
    }
    setInviting(false)
  }

  const inviteCohort = cohorts.find(c => c.id === inviteCohortId)

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{cohorts.length} cohort{cohorts.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => { setShowNew(!showNew); setCreateError('') }}
          className="px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}
        >
          + New cohort
        </button>
      </div>

      {/* New cohort form */}
      {showNew && (
        <div className="rounded-xl p-6 space-y-4" style={{ backgroundColor: 'white', border: '2px solid #0AF3CD' }}>
          <h3 className="text-sm font-bold" style={{ color: '#0A2E2A' }}>Create new cohort</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#05A88E' }}>Cohort name *</label>
              <input
                type="text"
                placeholder="e.g. Leadership team — Q1 2025"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createCohort()}
                className="w-full rounded-lg px-3 py-2 text-sm border outline-none focus:ring-2"
                style={{ borderColor: '#B9F8DD', color: '#0A2E2A' }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#05A88E' }}>Type</label>
              <select
                value={newType}
                onChange={e => setNewType(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm border"
                style={{ borderColor: '#B9F8DD', color: '#0A2E2A', backgroundColor: 'white' }}
              >
                <option>Baseline</option>
                <option>Post-programme</option>
                <option>Sales discovery</option>
              </select>
            </div>
            {isMqAdmin && (
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#05A88E' }}>Company *</label>
                <select
                  value={newCompanyId}
                  onChange={e => setNewCompanyId(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm border"
                  style={{ borderColor: '#B9F8DD', color: '#0A2E2A', backgroundColor: 'white' }}
                >
                  <option value="">Select company…</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#05A88E' }}>
              Company values <span className="font-normal text-gray-400">(optional — used to personalise coaching)</span>
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Integrity, Courage, Collaboration, Customer-first, Innovation"
              value={newCompanyValues}
              onChange={e => setNewCompanyValues(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm border outline-none focus:ring-2 resize-none"
              style={{ borderColor: '#B9F8DD', color: '#0A2E2A' }}
            />
            <p className="text-xs text-gray-400 mt-1">If provided, coaching moments for the Values Clarity dimension will reference these company values instead of generic personal values.</p>
          </div>
          {createError && <p className="text-xs text-red-500">{createError}</p>}
          <div className="flex gap-3 pt-1">
            <button
              onClick={createCohort}
              disabled={creating || !newName.trim()}
              className="px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-40"
              style={{ backgroundColor: '#0A2E2A', color: '#0AF3CD' }}
            >
              {creating ? 'Creating…' : 'Create cohort'}
            </button>
            <button
              onClick={() => setShowNew(false)}
              className="px-5 py-2 rounded-lg text-sm text-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Cohorts table */}
      {cohorts.length === 0 ? (
        <p className="text-center py-12 text-sm text-gray-400">No cohorts yet. Create your first one above.</p>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #B9F8DD' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: '#0A2E2A' }}>
                <tr>
                  <th className="text-left py-3 px-5 font-semibold" style={{ color: '#0AF3CD' }}>Cohort name</th>
                  {isMqAdmin && <th className="text-left py-3 px-4 font-semibold" style={{ color: '#B9F8DD' }}>Company</th>}
                  <th className="text-left py-3 px-4 font-semibold" style={{ color: '#B9F8DD' }}>Type</th>
                  <th className="text-left py-3 px-4 font-semibold" style={{ color: '#B9F8DD' }}>Status</th>
                  <th className="text-center py-3 px-4 font-semibold" style={{ color: '#B9F8DD' }}>Progress</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {cohorts.map((cohort, i) => (
                  <tr key={cohort.id} style={{
                    borderBottom: '1px solid #E8FDF7',
                    backgroundColor: i % 2 === 0 ? 'white' : '#F7FEFC',
                  }}>
                    <td className="py-3 px-5 font-medium" style={{ color: '#0A2E2A' }}>{cohort.name}</td>
                    {isMqAdmin && <td className="py-3 px-4 text-gray-500">{cohort.company_name ?? '—'}</td>}
                    <td className="py-3 px-4 text-gray-500">{cohort.type}</td>
                    <td className="py-3 px-4">
                      <select
                        value={cohort.status}
                        onChange={async e => {
                          await supabase
                            .from('cohorts')
                            .update({ status: e.target.value })
                            .eq('id', cohort.id)
                          onRefresh()
                        }}
                        className="text-xs px-2 py-1 rounded-full font-medium border-0 outline-none cursor-pointer"
                        style={{
                          backgroundColor: cohort.status === 'Active'   ? '#D1FAE5'
                                         : cohort.status === 'Complete' ? '#CFFAFE'
                                         :                                '#F3F4F6',
                          color:           cohort.status === 'Active'   ? '#065F46'
                                         : cohort.status === 'Complete' ? '#0E7490'
                                         :                                '#6B7280',
                        }}
                      >
                        <option value="Draft">Draft</option>
                        <option value="Active">Active</option>
                        <option value="Complete">Complete</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-500 text-xs">
                      {cohort.completed_count}/{cohort.participant_count} done
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => { setInviteCohortId(cohort.id); setInviteMsg('') }}
                          className="text-xs px-3 py-1.5 rounded-md font-medium"
                          style={{ backgroundColor: '#E8FDF7', color: '#05A88E', border: '1px solid #B9F8DD' }}
                        >
                          Invite
                        </button>
                        <button
                          onClick={() => {
                            setEditingValuesId(cohort.id)
                            setEditingValuesText(cohort.company_values ?? '')
                          }}
                          className="text-xs px-3 py-1.5 rounded-md font-medium"
                          style={{ backgroundColor: cohort.company_values ? '#D0FAF3' : '#F3F4F6', color: cohort.company_values ? '#05A88E' : '#6B7280', border: '1px solid #B9F8DD' }}
                          title="Edit company values"
                        >
                          {cohort.company_values ? 'Values ✓' : 'Values'}
                        </button>
                        <button
                          onClick={() => onViewCohort(cohort.id)}
                          className="text-xs px-3 py-1.5 rounded-md font-semibold"
                          style={{ backgroundColor: '#0A2E2A', color: '#0AF3CD' }}
                        >
                          View →
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Company values edit panel */}
      {editingValuesId && (() => {
        const cohort = cohorts.find(c => c.id === editingValuesId)
        return (
          <div className="rounded-xl p-6 space-y-4" style={{ backgroundColor: 'white', border: '2px solid #0AF3CD' }}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold" style={{ color: '#0A2E2A' }}>Company values</h3>
                <p className="text-xs mt-0.5 text-gray-500">{cohort?.name}</p>
              </div>
              <button onClick={() => setEditingValuesId(null)} className="text-gray-400 text-xl leading-none">×</button>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#05A88E' }}>
                Values <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <textarea
                rows={4}
                placeholder="e.g. Integrity, Courage, Collaboration, Customer-first, Innovation"
                value={editingValuesText}
                onChange={e => setEditingValuesText(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm border outline-none focus:ring-2 resize-none"
                style={{ borderColor: '#B9F8DD', color: '#0A2E2A' }}
              />
              <p className="text-xs text-gray-400 mt-1">When set, coaching moments for the Values Clarity dimension will reference these company values instead of generic personal values.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => saveCompanyValues(editingValuesId)}
                disabled={savingValues}
                className="px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-40"
                style={{ backgroundColor: '#0A2E2A', color: '#0AF3CD' }}
              >
                {savingValues ? 'Saving…' : 'Save values'}
              </button>
              <button onClick={() => setEditingValuesId(null)} className="px-5 py-2 rounded-lg text-sm text-gray-500">
                Cancel
              </button>
            </div>
          </div>
        )
      })()}

      {/* Invite panel */}
      {inviteCohortId && (
        <div className="rounded-xl p-6 space-y-4" style={{ backgroundColor: 'white', border: '2px solid #B9F8DD' }}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold" style={{ color: '#0A2E2A' }}>Invite participants</h3>
              <p className="text-xs mt-0.5 text-gray-500">{inviteCohort?.name}</p>
            </div>
            <button
              onClick={() => { setInviteCohortId(null); setInviteMsg('') }}
              className="text-gray-400 text-xl leading-none"
            >×</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#05A88E' }}>
                Email addresses (one per line, or comma-separated)
              </label>
              <textarea
                value={inviteEmails}
                onChange={e => setInviteEmails(e.target.value)}
                rows={4}
                placeholder={'sarah@company.com\njames@company.com'}
                className="w-full rounded-lg px-3 py-2 text-sm border outline-none"
                style={{ borderColor: '#B9F8DD', color: '#0A2E2A', resize: 'vertical' }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#05A88E' }}>
                Participant role
              </label>
              <select
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm border"
                style={{ borderColor: '#B9F8DD', color: '#0A2E2A', backgroundColor: 'white' }}
              >
                <option value="participant">Participant (manager / leader)</option>
                <option value="client_admin">Client Admin (HR / L&D lead)</option>
              </select>
              <p className="text-xs mt-2 text-gray-400">
                Participants complete the assessment. Client Admins can see their team&apos;s results.
              </p>
            </div>
          </div>
          {inviteMsg && (
            <p className="text-sm font-medium" style={{
              color: inviteMsg.startsWith('✓') ? '#059669' : '#DC2626',
            }}>
              {inviteMsg}
            </p>
          )}
          <button
            onClick={sendInvites}
            disabled={inviting || !inviteEmails.trim()}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-40"
            style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}
          >
            {inviting ? 'Sending invitations…' : 'Send invitations'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Values & Behaviours Tab ───────────────────────────────────────────────────

interface CompanyValue {
  id: string
  value_name: string
  value_order: number
  behaviours: string[]
}

function ValuesTab({
  companyId,
  isMqAdmin,
  companies,
}: {
  companyId: string | null
  isMqAdmin: boolean
  companies: Company[]
}) {
  const supabase = createClient()

  const [values,        setValues]        = useState<CompanyValue[]>([])
  const [loadingValues, setLoadingValues] = useState(true)
  const [selectedCompanyId, setSelectedCompanyId] = useState(companyId ?? '')

  // Form state — adding / editing a value
  const [editing,       setEditing]       = useState<string | null>(null)  // id or 'new'
  const [valueName,     setValueName]     = useState('')
  const [behaviours,    setBehaviours]    = useState<string[]>(['', '', ''])
  const [saving,        setSaving]        = useState(false)
  const [saveError,     setSaveError]     = useState('')

  const activeCompanyId = isMqAdmin ? selectedCompanyId : (companyId ?? '')

  async function loadValues() {
    if (!activeCompanyId) { setValues([]); setLoadingValues(false); return }
    setLoadingValues(true)
    const { data } = await supabase
      .from('company_value_behaviours')
      .select('id, value_name, value_order, behaviours')
      .eq('company_id', activeCompanyId)
      .order('value_order')
    setValues((data ?? []).map(r => ({ ...r, behaviours: r.behaviours as string[] })))
    setLoadingValues(false)
  }

  useEffect(() => { loadValues() }, [activeCompanyId])

  function openNew() {
    setEditing('new')
    setValueName('')
    setBehaviours(['', '', ''])
    setSaveError('')
  }

  function openEdit(v: CompanyValue) {
    setEditing(v.id)
    setValueName(v.value_name)
    const padded = [...v.behaviours]
    while (padded.length < 3) padded.push('')
    setBehaviours(padded)
    setSaveError('')
  }

  function cancelEdit() {
    setEditing(null)
    setValueName('')
    setBehaviours(['', '', ''])
    setSaveError('')
  }

  function updateBehaviour(i: number, val: string) {
    setBehaviours(prev => prev.map((b, idx) => idx === i ? val : b))
  }

  function addBehaviourRow() {
    if (behaviours.length < 6) setBehaviours(prev => [...prev, ''])
  }

  function removeBehaviourRow(i: number) {
    if (behaviours.length > 1) setBehaviours(prev => prev.filter((_, idx) => idx !== i))
  }

  async function saveValue() {
    if (!valueName.trim()) { setSaveError('Please enter a value name.'); return }
    const clean = behaviours.map(b => b.trim()).filter(Boolean)
    if (clean.length === 0) { setSaveError('Add at least one behaviour.'); return }
    if (!activeCompanyId) { setSaveError('No company selected.'); return }
    setSaving(true)
    setSaveError('')

    if (editing === 'new') {
      const nextOrder = values.length > 0 ? Math.max(...values.map(v => v.value_order)) + 1 : 0
      const { error } = await supabase.from('company_value_behaviours').insert({
        company_id:  activeCompanyId,
        value_name:  valueName.trim(),
        value_order: nextOrder,
        behaviours:  clean,
      })
      if (error) { setSaveError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('company_value_behaviours').update({
        value_name: valueName.trim(),
        behaviours: clean,
        updated_at: new Date().toISOString(),
      }).eq('id', editing!)
      if (error) { setSaveError(error.message); setSaving(false); return }
    }
    setSaving(false)
    cancelEdit()
    await loadValues()
  }

  async function deleteValue(id: string) {
    if (!confirm('Delete this value and all its behaviours?')) return
    await supabase.from('company_value_behaviours').delete().eq('id', id)
    await loadValues()
  }

  const VALUE_COLOURS = ['#fdcb5e','#ff9f43','#ff7b7a','#00c9a7','#2d4a8a','#a78bfa','#0AF3CD','#f472b6']

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-bold" style={{ color: '#0A2E2A' }}>Values &amp; Behaviours</h2>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
            Define the observable behaviours that bring each company value to life.
            These power the participant Values in Action check-in and personalise coaching.
          </p>
        </div>
        {editing === null && (
          <button
            onClick={openNew}
            disabled={!activeCompanyId}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40"
            style={{ backgroundColor: '#0A2E2A', color: '#0AF3CD' }}
          >
            <span className="text-lg leading-none">+</span> Add value
          </button>
        )}
      </div>

      {/* MQ Admin: company picker */}
      {isMqAdmin && (
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold" style={{ color: '#05A88E' }}>Company:</label>
          <select
            value={selectedCompanyId}
            onChange={e => setSelectedCompanyId(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm border"
            style={{ borderColor: '#B9F8DD', color: '#0A2E2A', backgroundColor: 'white' }}
          >
            <option value="">Select company…</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      {/* Empty state */}
      {!loadingValues && values.length === 0 && editing === null && (
        <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: 'white', border: '2px dashed #B9F8DD' }}>
          <p className="text-sm font-semibold mb-1" style={{ color: '#0A2E2A' }}>No values defined yet</p>
          <p className="text-sm mb-4" style={{ color: '#9CA3AF' }}>
            Add your company values and the specific behaviours that bring them to life.
          </p>
          <button
            onClick={openNew}
            disabled={!activeCompanyId}
            className="px-5 py-2 rounded-xl text-sm font-semibold disabled:opacity-40"
            style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}
          >
            + Add first value
          </button>
        </div>
      )}

      {/* Existing values */}
      {!loadingValues && values.length > 0 && (
        <div className="space-y-3">
          {values.map((v, vi) => (
            <div key={v.id} className="rounded-2xl overflow-hidden"
                 style={{ backgroundColor: 'white', border: '1px solid #E8FDF7', boxShadow: '0 1px 8px rgba(10,46,42,0.06)' }}>
              <div className="flex items-center justify-between px-5 py-4"
                   style={{ borderBottom: v.behaviours.length > 0 ? '1px solid #F3F4F6' : 'none' }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: VALUE_COLOURS[vi % VALUE_COLOURS.length], flexShrink: 0 }} />
                  <span className="font-bold text-sm" style={{ color: '#0A2E2A' }}>{v.value_name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                    {v.behaviours.length} behaviour{v.behaviours.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(v)}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium"
                          style={{ backgroundColor: '#E8FDF7', color: '#05A88E', border: '1px solid #B9F8DD' }}>
                    Edit
                  </button>
                  <button onClick={() => deleteValue(v.id)}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium"
                          style={{ backgroundColor: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA' }}>
                    Delete
                  </button>
                </div>
              </div>
              {v.behaviours.length > 0 && (
                <div className="px-5 py-3 space-y-2">
                  {v.behaviours.map((b, bi) => (
                    <div key={bi} className="flex gap-2 items-start">
                      <span style={{ color: VALUE_COLOURS[vi % VALUE_COLOURS.length], fontSize: 12, marginTop: 2, flexShrink: 0 }}>→</span>
                      <p className="text-sm" style={{ color: '#4B5563' }}>{b}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit form */}
      {editing !== null && (
        <div className="rounded-2xl p-6 space-y-5"
             style={{ backgroundColor: 'white', border: '2px solid #0AF3CD', boxShadow: '0 4px 20px rgba(10,243,205,0.1)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold" style={{ color: '#0A2E2A' }}>
              {editing === 'new' ? 'Add a value' : 'Edit value'}
            </h3>
            <button onClick={cancelEdit} className="text-gray-400 text-xl leading-none">×</button>
          </div>

          {/* Value name */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#05A88E' }}>
              Value name
            </label>
            <input
              type="text"
              placeholder="e.g. Integrity"
              value={valueName}
              onChange={e => setValueName(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm border outline-none focus:ring-2"
              style={{ borderColor: '#B9F8DD', color: '#0A2E2A' }}
            />
          </div>

          {/* Behaviours */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold" style={{ color: '#05A88E' }}>
                Observable behaviours <span className="font-normal text-gray-400">(how this value shows up in practice)</span>
              </label>
            </div>
            <div className="space-y-2">
              {behaviours.map((b, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="text-xs font-bold w-5 text-right flex-shrink-0" style={{ color: '#9CA3AF' }}>{i + 1}.</span>
                  <input
                    type="text"
                    placeholder={`e.g. ${['I give honest feedback even when it\'s uncomfortable','I flag problems early rather than hoping they resolve','I follow through on commitments even when inconvenient','I speak up when I see something that conflicts with our values','I own my mistakes openly and learn from them'][i] ?? 'Describe the behaviour…'}`}
                    value={b}
                    onChange={e => updateBehaviour(i, e.target.value)}
                    className="flex-1 rounded-xl px-4 py-2 text-sm border outline-none focus:ring-2"
                    style={{ borderColor: '#B9F8DD', color: '#0A2E2A' }}
                  />
                  {behaviours.length > 1 && (
                    <button onClick={() => removeBehaviourRow(i)}
                            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
                            style={{ backgroundColor: '#F3F4F6', color: '#9CA3AF' }}>
                      −
                    </button>
                  )}
                </div>
              ))}
            </div>
            {behaviours.length < 6 && (
              <button onClick={addBehaviourRow}
                      className="mt-2 text-xs font-medium flex items-center gap-1"
                      style={{ color: '#05A88E' }}>
                <span>+</span> Add another behaviour
              </button>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Tip: write behaviours in first person ("I…") — they read more naturally in the participant experience.
            </p>
          </div>

          {saveError && <p className="text-xs" style={{ color: '#EF4444' }}>{saveError}</p>}

          <div className="flex gap-3">
            <button
              onClick={saveValue}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40"
              style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}
            >
              {saving ? 'Saving…' : editing === 'new' ? 'Save value' : 'Update value'}
            </button>
            <button onClick={cancelEdit} className="px-5 py-2.5 rounded-xl text-sm text-gray-500">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Change Password Button ────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChangePasswordButton({ supabase }: { supabase: any }) {
  const [open, setOpen]           = useState(false)
  const [pw, setPw]               = useState('')
  const [confirm, setConfirm]     = useState('')
  const [saving, setSaving]       = useState(false)
  const [msg, setMsg]             = useState('')

  async function save() {
    if (pw.length < 8)    { setMsg('Must be at least 8 characters.'); return }
    if (pw !== confirm)   { setMsg("Passwords don't match."); return }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: pw })
    setSaving(false)
    if (error) { setMsg(error.message); return }
    setMsg('✓ Password updated!')
    setPw(''); setConfirm('')
    setTimeout(() => { setOpen(false); setMsg('') }, 1500)
  }

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(!open); setMsg('') }}
        className="text-xs px-3 py-1.5 rounded-lg"
        style={{ color: '#B9F8DD', border: '1px solid rgba(185,248,221,0.3)' }}
      >
        Change password
      </button>
      {open && (
        <div className="absolute right-0 top-9 w-72 rounded-xl p-4 shadow-xl z-50 space-y-3"
             style={{ backgroundColor: '#0A2E2A', border: '1px solid rgba(185,248,221,0.3)' }}>
          <p className="text-xs font-semibold" style={{ color: '#0AF3CD' }}>Set new password</p>
          <input
            type="password" placeholder="New password" value={pw}
            onChange={e => setPw(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(185,248,221,0.3)' }}
          />
          <input
            type="password" placeholder="Confirm password" value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(185,248,221,0.3)' }}
          />
          {msg && <p className="text-xs" style={{ color: msg.startsWith('✓') ? '#0AF3CD' : '#F87171' }}>{msg}</p>}
          <div className="flex gap-2">
            <button onClick={save} disabled={saving}
              className="flex-1 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40"
              style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => setOpen(false)}
              className="px-3 py-1.5 rounded-lg text-xs"
              style={{ color: '#B9F8DD' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isMqAdmin, setIsMqAdmin] = useState(false)
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [userCompanyName, setUserCompanyName] = useState('')
  const [selectedCohortId, setSelectedCohortId] = useState('')
  const [participants, setParticipants] = useState<CohortParticipant[]>([])
  const [participantsLoading, setParticipantsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'cohort-view' | 'before-after' | 'all-cohorts' | 'values'>('all-cohorts')

  // ── Auth ────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login'; return }

      const { data: prof } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, company_id')
        .eq('id', session.user.id)
        .single()

      if (!prof || (prof.role !== 'mq_admin' && prof.role !== 'client_admin')) {
        window.location.href = '/unauthorised'
        return
      }
      setProfile(prof)
      setIsMqAdmin(prof.role === 'mq_admin')
      setLoading(false)
    }
    init()
  }, [])

  // ── Load cohorts ────────────────────────────────────────────────────────
  const loadCohorts = useCallback(async () => {
    if (!profile) return

    // Load cohorts
    let cohortQuery = supabase
      .from('cohorts')
      .select('id, company_id, name, type, status, created_at, company_values')
      .order('created_at', { ascending: false })

    if (!isMqAdmin && profile.company_id) {
      cohortQuery = cohortQuery.eq('company_id', profile.company_id)
    }
    const { data: cohortRows } = await cohortQuery
    if (!cohortRows) return

    // Load participant counts per cohort
    const cohortIds = cohortRows.map(c => c.id)
    let counts: Record<string, { total: number, completed: number }> = {}
    if (cohortIds.length > 0) {
      const { data: cpRows } = await supabase
        .from('cohort_participants')
        .select('cohort_id, assessment_id')
        .in('cohort_id', cohortIds)
      if (cpRows) {
        cohortIds.forEach(id => {
          const rows = cpRows.filter(r => r.cohort_id === id)
          counts[id] = {
            total:     rows.length,
            completed: rows.filter(r => r.assessment_id !== null).length,
          }
        })
      }
    }

    // Optionally enrich with company names (MQ Admin only)
    let compMap: Record<string, string> = {}
    if (isMqAdmin) {
      const { data: comps } = await supabase.from('companies').select('id, name')
      compMap = Object.fromEntries((comps ?? []).map(c => [c.id, c.name]))
    }

    setCohorts(cohortRows.map(c => ({
      ...c,
      participant_count: counts[c.id]?.total     ?? 0,
      completed_count:   counts[c.id]?.completed ?? 0,
      company_name:      isMqAdmin ? compMap[c.company_id] : undefined,
    })))
  }, [profile, isMqAdmin, supabase])

  useEffect(() => {
    if (profile) loadCohorts()
  }, [profile, loadCohorts])

  // Load companies (MQ Admin) + own company name (all admins)
  useEffect(() => {
    if (!profile) return
    if (isMqAdmin) {
      supabase.from('companies').select('id, name').order('name').then(({ data }) => {
        setCompanies(data ?? [])
      })
    }
    // Fetch this user's own company name for the insight prompt
    if (profile.company_id) {
      supabase
        .from('companies')
        .select('name')
        .eq('id', profile.company_id)
        .single()
        .then(({ data }) => { if (data) setUserCompanyName(data.name) })
    }
  }, [isMqAdmin, profile, supabase])

  // ── Fetch participants for a cohort ─────────────────────────────────────
  const fetchParticipants = useCallback(async (cohortId: string): Promise<CohortParticipant[]> => {
    const { data } = await supabase
      .from('cohort_participants')
      .select(`
        id, email, invited_at, participant_id,
        profiles:participant_id ( full_name ),
        assessments:assessment_id ( participant_role, overall_score, d1_score, d2_score, d3_score, d4_score, d5_score, d6_score, completed_at )
      `)
      .eq('cohort_id', cohortId)

    if (!data) return []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((row: any) => ({
      id:               row.id,
      email:            row.email,
      invited_at:       row.invited_at,
      participant_id:   row.participant_id,
      full_name:        row.profiles?.full_name ?? null,
      participant_role: row.assessments?.participant_role ?? null,
      overall_score:    row.assessments?.overall_score    ?? null,
      d1_score:         row.assessments?.d1_score         ?? null,
      d2_score:         row.assessments?.d2_score         ?? null,
      d3_score:         row.assessments?.d3_score         ?? null,
      d4_score:         row.assessments?.d4_score         ?? null,
      d5_score:         row.assessments?.d5_score         ?? null,
      d6_score:         row.assessments?.d6_score         ?? null,
      completed_at:     row.assessments?.completed_at     ?? null,
    }))
  }, [supabase])

  // ── Select cohort → switch to Overview tab ──────────────────────────────
  async function viewCohort(cohortId: string) {
    setSelectedCohortId(cohortId)
    setParticipantsLoading(true)
    const data = await fetchParticipants(cohortId)
    setParticipants(data)
    setParticipantsLoading(false)
    setActiveTab('overview')
  }

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E8FDF7' }}>
      <p style={{ color: '#05A88E' }}>Loading…</p>
    </main>
  )

  const selectedCohort = cohorts.find(c => c.id === selectedCohortId)

  const tabs = [
    { id: 'overview'     as const, label: 'Overview'      },
    { id: 'cohort-view'  as const, label: 'Cohort view'   },
    { id: 'before-after' as const, label: 'Before & After' },
    { id: 'all-cohorts'  as const, label: 'All cohorts'   },
    { id: 'values'       as const, label: 'Values'        },
  ]

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#E8FDF7' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#0A2E2A' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold" style={{ color: '#0AF3CD' }}>MQ Platform</h1>
            <p className="text-xs mt-0.5" style={{ color: '#B9F8DD' }}>
              {isMqAdmin ? 'MQ Admin' : 'Client Admin'} · {profile?.full_name ?? profile?.email}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {selectedCohort && (
              <div className="text-right">
                <p className="text-sm font-semibold" style={{ color: 'white' }}>{selectedCohort.name}</p>
                <p className="text-xs" style={{ color: '#B9F8DD' }}>{selectedCohort.type} · {selectedCohort.status}</p>
              </div>
            )}
            <ChangePasswordButton supabase={supabase} />
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                window.location.href = '/login'
              }}
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{ color: '#B9F8DD', border: '1px solid rgba(185,248,221,0.3)' }}
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="max-w-6xl mx-auto px-6 flex" style={{ borderTop: '1px solid rgba(185,248,221,0.15)' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-5 py-3 text-sm font-medium transition-colors"
              style={{
                color:        activeTab === tab.id ? '#0AF3CD' : '#B9F8DD',
                borderBottom: activeTab === tab.id ? '2px solid #0AF3CD' : '2px solid transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* All cohorts */}
        {activeTab === 'all-cohorts' && (
          <AllCohortsTab
            cohorts={cohorts}
            companies={companies}
            isMqAdmin={isMqAdmin}
            userCompanyId={profile?.company_id ?? null}
            onViewCohort={viewCohort}
            onRefresh={loadCohorts}
          />
        )}

        {/* Overview */}
        {activeTab === 'overview' && (
          selectedCohortId
            ? participantsLoading
              ? <p className="text-center py-12" style={{ color: '#05A88E' }}>Loading…</p>
              : <OverviewTab
                  participants={participants}
                  cohortId={selectedCohortId}
                  cohortName={selectedCohort?.name ?? ''}
                  companyName={selectedCohort?.company_name ?? userCompanyName}
                />
            : <NoCohortSelected onGoToAll={() => setActiveTab('all-cohorts')} />
        )}

        {/* Cohort view */}
        {activeTab === 'cohort-view' && (
          selectedCohortId
            ? participantsLoading
              ? <p className="text-center py-12" style={{ color: '#05A88E' }}>Loading…</p>
              : <CohortViewTab participants={participants} isMqAdmin={isMqAdmin} />
            : <NoCohortSelected onGoToAll={() => setActiveTab('all-cohorts')} />
        )}

        {/* Before & After */}
        {activeTab === 'before-after' && (
          <BeforeAfterTab cohorts={cohorts} fetchParticipants={fetchParticipants} />
        )}

        {/* Values & Behaviours */}
        {activeTab === 'values' && (
          <ValuesTab
            companyId={profile?.company_id ?? null}
            isMqAdmin={isMqAdmin}
            companies={companies}
          />
        )}

      </div>
    </main>
  )
}

function NoCohortSelected({ onGoToAll }: { onGoToAll: () => void }) {
  return (
    <div className="text-center py-16">
      <p className="text-sm" style={{ color: '#05A88E' }}>No cohort selected.</p>
      <button onClick={onGoToAll} className="mt-3 text-sm underline" style={{ color: '#05A88E' }}>
        Go to All Cohorts to select one
      </button>
    </div>
  )
}
