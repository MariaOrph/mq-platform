'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'

// ── Types ───────────────────────────────────────────────────────────────────

interface DimAnalysis {
  interpretation: string
  risks: string[]
  opportunities: string[]
}

interface ValuesAlignment {
  id: string
  value_name: string
  behaviours: { text: string; avgRating: number | null; ratingCount: number }[]
}

interface ReportData {
  cohortId: string
  cohortName: string
  companyName: string
  cohortType: string
  totalInvited: number
  completed: number
  scores: {
    overall: number | null
    d1: number | null; d2: number | null; d3: number | null
    d4: number | null; d5: number | null; d6: number | null; d7: number | null
  }
  analysis: {
    executive_summary: string
    dimensions: Record<string, DimAnalysis>
  } | null
  valuesAlignment: ValuesAlignment[]
}

// ── Dimension config ─────────────────────────────────────────────────────────

const DIMS = [
  { key: 'd1', name: 'Self-awareness',        color: '#fdcb5e', bg: '#FEF5D9' },
  { key: 'd2', name: 'Ego & identity',        color: '#EC4899', bg: '#FCE7F3' },
  { key: 'd3', name: 'Emotional regulation',  color: '#ff7b7a', bg: '#FFE8E8' },
  { key: 'd4', name: 'Cognitive flexibility', color: '#ff9f43', bg: '#FFF0E0' },
  { key: 'd5', name: 'Values & purpose',      color: '#00c9a7', bg: '#D4F5EF' },
  { key: 'd6', name: 'Relational mindset',    color: '#2d4a8a', bg: '#E0E6F5' },
  { key: 'd7', name: 'Adaptive resilience',   color: '#a78bfa', bg: '#EDE9FE' },
]

function getScoreBand(score: number | null): { label: string; colour: string } {
  if (score === null) return { label: 'Pending', colour: '#9CA3AF' }
  if (score >= 90) return { label: 'Exceptional', colour: '#00c9a7' }
  if (score >= 75) return { label: 'Strong',      colour: '#0AF3CD' }
  if (score >= 60) return { label: 'Solid',       colour: '#fdcb5e' }
  if (score >= 40) return { label: 'Developing',  colour: '#ff9f43' }
  return               { label: 'Growth area',    colour: '#ff7b7a' }
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CohortReportPage() {
  const supabase = createClient()
  const params   = useParams()
  const cohortId = params.cohortId as string

  const [report,  setReport]  = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login'; return }

      const res = await fetch(`/api/cohort-report?cohortId=${cohortId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.error ?? 'Failed to load report')
        setLoading(false)
        return
      }

      const data = await res.json()
      setReport(data)
      setLoading(false)
    }
    load()
  }, [cohortId, supabase])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F4FDF9' }}>
        <div className="text-center">
          <p className="text-sm mb-2" style={{ color: '#05A88E' }}>Generating your cohort report…</p>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>This may take a few seconds</p>
        </div>
      </main>
    )
  }

  if (error || !report) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F4FDF9' }}>
        <p className="text-sm" style={{ color: '#ff7b7a' }}>{error ?? 'Something went wrong'}</p>
      </main>
    )
  }

  if (report.completed === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F4FDF9' }}>
        <div className="text-center max-w-sm">
          <p className="text-base font-semibold mb-2" style={{ color: '#0A2E2A' }}>No completed assessments yet</p>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            This report will be available once at least one participant in {report.cohortName} completes their MQ assessment.
          </p>
        </div>
      </main>
    )
  }

  const overallBand = getScoreBand(report.scores.overall)
  const generatedDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <>
      {/* Print / PDF styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page-break { page-break-before: always; }
        }
        @page { size: A4; margin: 15mm 12mm; }
      `}</style>

      <main style={{ backgroundColor: '#F4FDF9', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>

        {/* ── Save as PDF button ── */}
        <div className="no-print sticky top-0 z-50 flex justify-end px-6 py-3"
             style={{ backgroundColor: 'rgba(244,253,249,0.95)', borderBottom: '1px solid #E8FDF7', backdropFilter: 'blur(8px)' }}>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Save as PDF
          </button>
        </div>

        <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 64px' }}>

          {/* ── Cover header ── */}
          <div className="rounded-2xl overflow-hidden mb-8"
               style={{ background: 'linear-gradient(135deg, #0A2E2A 0%, #0d3830 100%)', boxShadow: '0 4px 24px rgba(10,46,42,0.2)' }}>
            <div style={{ padding: '36px 40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24 }}>

                {/* Left: label + cohort name */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#0AF3CD' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(10,243,205,0.7)' }}>
                      MQ Cohort Report
                    </span>
                  </div>
                  <h1 style={{ fontSize: 26, fontWeight: 900, color: 'white', margin: 0, lineHeight: 1.2 }}>
                    {report.cohortName}
                  </h1>
                  <p style={{ fontSize: 14, color: 'rgba(185,248,221,0.7)', marginTop: 6 }}>
                    {report.companyName} · {report.cohortType}
                  </p>
                  <p style={{ fontSize: 12, color: 'rgba(185,248,221,0.45)', marginTop: 4 }}>
                    {report.completed} of {report.totalInvited} participants completed · Generated {generatedDate}
                  </p>
                </div>

                {/* Right: overall score */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 88, height: 88, borderRadius: '50%', backgroundColor: '#0AF3CD',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                    <span style={{ fontSize: 30, fontWeight: 900, color: '#0A2E2A' }}>
                      {report.scores.overall ?? '—'}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#0AF3CD', marginTop: 8 }}>Team MQ Score</p>
                  <p style={{ fontSize: 11, color: 'rgba(185,248,221,0.6)', marginTop: 2 }}>{overallBand.label}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Confidentiality notice ── */}
          <div className="rounded-xl mb-8" style={{ backgroundColor: '#FEF9E7', border: '1px solid #fde68a', padding: '12px 16px' }}>
            <p style={{ fontSize: 12, color: '#92400e', margin: 0 }}>
              <strong>Confidential.</strong> This report contains aggregate group data only. No individual scores are shown or can be inferred from this document. Please handle accordingly.
            </p>
          </div>

          {/* ── Executive summary ── */}
          {report.analysis?.executive_summary && (
            <div className="rounded-2xl mb-8" style={{ backgroundColor: 'white', border: '1px solid #E8FDF7', boxShadow: '0 2px 12px rgba(10,46,42,0.06)', padding: '28px 32px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 12 }}>
                Executive Summary
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.75, color: '#1F2937', margin: 0 }}>
                {report.analysis.executive_summary}
              </p>
            </div>
          )}

          {/* ── Scores overview ── */}
          <div className="rounded-2xl mb-8" style={{ backgroundColor: 'white', border: '1px solid #E8FDF7', boxShadow: '0 2px 12px rgba(10,46,42,0.06)', padding: '28px 32px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 20 }}>
              Dimension Scores at a Glance
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {DIMS.map(dim => {
                const score = report.scores[dim.key as keyof typeof report.scores] as number | null
                const band  = getScoreBand(score)
                return (
                  <div key={dim.key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: dim.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{dim.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: band.colour,
                                       backgroundColor: `${band.colour}18`, padding: '2px 8px', borderRadius: 20 }}>
                          {band.label}
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: dim.color, minWidth: 32, textAlign: 'right' }}>
                          {score ?? '—'}
                        </span>
                      </div>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, backgroundColor: '#F3F4F6' }}>
                      <div style={{ height: 8, borderRadius: 4, backgroundColor: dim.color, width: score !== null ? `${score}%` : '0%', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Dimension deep dives ── */}
          <div className="page-break" />
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 16 }}>
            Dimension Analysis
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {DIMS.map(dim => {
              const score   = report.scores[dim.key as keyof typeof report.scores] as number | null
              const band    = getScoreBand(score)
              const dimData = report.analysis?.dimensions?.[dim.key]
              return (
                <div key={dim.key} className="rounded-2xl" style={{ backgroundColor: 'white', border: '1px solid #E8FDF7', boxShadow: '0 2px 12px rgba(10,46,42,0.06)', overflow: 'hidden' }}>

                  {/* Dimension header */}
                  <div style={{ padding: '18px 24px 16px', borderBottom: '1px solid #F3F4F6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: dim.color }} />
                        <span style={{ fontSize: 16, fontWeight: 800, color: '#0A2E2A' }}>{dim.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: band.colour,
                                       backgroundColor: `${band.colour}18`, padding: '3px 10px', borderRadius: 20 }}>
                          {band.label}
                        </span>
                        <span style={{ fontSize: 22, fontWeight: 900, color: dim.color }}>{score ?? '—'}</span>
                        <span style={{ fontSize: 12, color: '#9CA3AF' }}>/100</span>
                      </div>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, backgroundColor: '#F3F4F6' }}>
                      <div style={{ height: 6, borderRadius: 3, backgroundColor: dim.color, width: score !== null ? `${score}%` : '0%' }} />
                    </div>
                  </div>

                  {/* Interpretation */}
                  {dimData?.interpretation && (
                    <div style={{ padding: '16px 24px 12px' }}>
                      <p style={{ fontSize: 14, lineHeight: 1.7, color: '#374151', margin: 0 }}>
                        {dimData.interpretation}
                      </p>
                    </div>
                  )}

                  {/* Risks + Opportunities */}
                  {dimData && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, borderTop: '1px solid #F3F4F6' }}>

                      {/* Risks */}
                      <div style={{ padding: '16px 20px 20px', borderRight: '1px solid #F3F4F6', backgroundColor: '#FAFAFA' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#ff7b7a' }} />
                          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#ff7b7a' }}>
                            Risks if unaddressed
                          </span>
                        </div>
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {dimData.risks.map((risk, i) => (
                            <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                              <span style={{ color: '#ff7b7a', fontSize: 12, marginTop: 2, flexShrink: 0 }}>→</span>
                              <span style={{ fontSize: 13, lineHeight: 1.5, color: '#4B5563' }}>{risk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Opportunities */}
                      <div style={{ padding: '16px 20px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#0AF3CD' }} />
                          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#05A88E' }}>
                            Development opportunities
                          </span>
                        </div>
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {dimData.opportunities.map((opp, i) => (
                            <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                              <span style={{ color: '#0AF3CD', fontSize: 12, marginTop: 2, flexShrink: 0 }}>✦</span>
                              <span style={{ fontSize: 13, lineHeight: 1.5, color: '#4B5563' }}>{opp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* ── Values in Action ── */}
          {report.valuesAlignment && report.valuesAlignment.length > 0 && report.valuesAlignment.some(v => v.behaviours.some(b => b.ratingCount > 0)) && (
            <>
              <div className="page-break" />
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 16 }}>
                Values in Action: Team Alignment
              </p>
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20, lineHeight: 1.6 }}>
                Average self-ratings across participants who completed the Values in Action check-in.
                Scores reflect how consistently the team collectively demonstrates each behaviour.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {report.valuesAlignment.map((v, vi) => {
                  const ratedBehaviours = v.behaviours.filter(b => b.ratingCount > 0)
                  if (ratedBehaviours.length === 0) return null
                  const overallAvg = ratedBehaviours.reduce((s, b) => s + (b.avgRating ?? 0), 0) / ratedBehaviours.length
                  const RATING_BG: Record<string, string> = { '1': '#FFF0F0', '2': '#FFF5EB', '3': '#FFFAE8', '4': '#E8FDF7' }
                  const RATING_COL: Record<string, string> = { '1': '#ff7b7a', '2': '#ff9f43', '3': '#fdcb5e', '4': '#00c9a7' }
                  const RATING_LABEL: Record<string, string> = { '1': 'Rarely', '2': 'Sometimes', '3': 'Usually', '4': 'Consistently' }
                  const avgKey = String(Math.round(overallAvg))
                  const VALUE_COLOURS = ['#fdcb5e','#ff9f43','#ff7b7a','#00c9a7','#2d4a8a','#a78bfa']
                  const vColour = VALUE_COLOURS[vi % VALUE_COLOURS.length]
                  return (
                    <div key={v.id} className="rounded-2xl" style={{ backgroundColor: 'white', border: '1px solid #E8FDF7', boxShadow: '0 2px 12px rgba(10,46,42,0.06)', overflow: 'hidden' }}>
                      <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: vColour }} />
                          <span style={{ fontSize: 15, fontWeight: 800, color: '#0A2E2A' }}>{v.value_name}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 11, color: '#9CA3AF' }}>{ratedBehaviours[0].ratingCount} participant{ratedBehaviours[0].ratingCount !== 1 ? 's' : ''} rated</span>
                          {RATING_COL[avgKey] && (
                            <span style={{ fontSize: 11, fontWeight: 600, color: RATING_COL[avgKey], backgroundColor: RATING_BG[avgKey], padding: '3px 10px', borderRadius: 20 }}>
                              Avg: {RATING_LABEL[avgKey]}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        {ratedBehaviours.map((b, bi) => {
                          const bKey = String(Math.round(b.avgRating ?? 0))
                          const barWidth = b.avgRating !== null ? `${(b.avgRating / 4) * 100}%` : '0%'
                          return (
                            <div key={bi} style={{ padding: '12px 20px', borderBottom: bi < ratedBehaviours.length - 1 ? '1px solid #F9FAFB' : 'none' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 6 }}>
                                <p style={{ fontSize: 12, color: '#4B5563', margin: 0, lineHeight: 1.5, flex: 1 }}>{b.text}</p>
                                {RATING_COL[bKey] && (
                                  <span style={{ fontSize: 11, fontWeight: 600, color: RATING_COL[bKey], backgroundColor: RATING_BG[bKey], padding: '2px 8px', borderRadius: 16, flexShrink: 0 }}>
                                    {b.avgRating?.toFixed(1)} — {RATING_LABEL[bKey]}
                                  </span>
                                )}
                              </div>
                              <div style={{ height: 5, borderRadius: 3, backgroundColor: '#F3F4F6' }}>
                                <div style={{ height: 5, borderRadius: 3, backgroundColor: RATING_COL[bKey] ?? vColour, width: barWidth }} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Values rating guide */}
              <div className="rounded-2xl mt-4" style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', padding: '16px 20px' }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 10 }}>Values rating scale</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {[['1', 'Rarely', '#ff7b7a'], ['2', 'Sometimes', '#ff9f43'], ['3', 'Usually', '#fdcb5e'], ['4', 'Consistently', '#00c9a7']].map(([n, label, col]) => (
                    <div key={n} style={{ textAlign: 'center', padding: '8px', borderRadius: 8, backgroundColor: `${col}12`, border: `1px solid ${col}30` }}>
                      <p style={{ fontSize: 13, fontWeight: 800, color: col, margin: '0 0 2px' }}>{n}</p>
                      <p style={{ fontSize: 10, color: '#6B7280', margin: 0 }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── Score guide ── */}
          <div className="rounded-2xl mt-8" style={{ backgroundColor: 'white', border: '1px solid #E8FDF7', boxShadow: '0 2px 12px rgba(10,46,42,0.06)', padding: '24px 28px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 14 }}>
              Score Guide
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              {[
                { range: '90–100', label: 'Exceptional', colour: '#00c9a7' },
                { range: '75–89',  label: 'Strong',      colour: '#0AF3CD' },
                { range: '60–74',  label: 'Solid',       colour: '#fdcb5e' },
                { range: '40–59',  label: 'Developing',  colour: '#ff9f43' },
                { range: '0–39',   label: 'Growth area', colour: '#ff7b7a' },
              ].map(b => (
                <div key={b.label} style={{ textAlign: 'center', padding: '10px 8px', borderRadius: 10,
                                            backgroundColor: `${b.colour}12`, border: `1px solid ${b.colour}30` }}>
                  <p style={{ fontSize: 13, fontWeight: 800, color: b.colour, margin: '0 0 3px' }}>{b.range}</p>
                  <p style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>{b.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Footer ── */}
          <div style={{ marginTop: 40, textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: '#9CA3AF' }}>
              MQ Platform · Confidential · Aggregate data only · {generatedDate}
            </p>
          </div>

        </div>
      </main>
    </>
  )
}
