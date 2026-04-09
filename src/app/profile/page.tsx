'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import MQOnboarding, { resetOnboarding } from '@/components/MQOnboarding'

// ── Dimension config ───────────────────────────────────────────────────────────

const DIMS = [
  { id: 1, name: 'Self-awareness',           color: '#fdcb5e', bg: '#FEF5D9' },
  { id: 2, name: 'Ego management',           color: '#EC4899', bg: '#FCE7F3' },
  { id: 3, name: 'Emotional regulation',     color: '#ff7b7a', bg: '#FFE8E8' },
  { id: 4, name: 'Clarity & communication',  color: '#ff9f43', bg: '#FFF0E0' },
  { id: 5, name: 'Trust & development',      color: '#00c9a7', bg: '#D4F5EF' },
  { id: 6, name: 'Standards & accountability', color: '#2d4a8a', bg: '#E0E6F5' },
  { id: 7, name: 'Relational intelligence',  color: '#a78bfa', bg: '#EDE9FE' },
]

// ── Types ──────────────────────────────────────────────────────────────────────

interface Assessment {
  overall_score:    number | null
  d1_score:         number | null
  d2_score:         number | null
  d3_score:         number | null
  d4_score:         number | null
  d5_score:         number | null
  d6_score:         number | null
  d7_score:         number | null
  completed_at:     string | null
  participant_role: string | null
  job_title:        string | null
  company_type:     string | null
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getFirstName(full: string | null, email?: string) {
  if (full?.trim()) return full.trim().split(' ')[0]
  if (email) return email.split('@')[0].split('.')[0].replace(/^\w/, c => c.toUpperCase())
  return ''
}

function getDimScore(a: Assessment, dimId: number): number | null {
  const map: Record<number, keyof Assessment> = {
    1: 'd1_score', 2: 'd2_score', 3: 'd3_score',
    4: 'd4_score', 5: 'd5_score', 6: 'd6_score', 7: 'd7_score',
  }
  return a[map[dimId]] as number | null
}

function getDelta(current: Assessment, prev: Assessment | null, dimId: number): number | null {
  if (!prev) return null
  const cur = getDimScore(current, dimId)
  const old = getDimScore(prev, dimId)
  if (cur === null || old === null) return null
  return cur - old
}

function getFocusDimension(a: Assessment): number {
  const scores = [a.d1_score, a.d2_score, a.d3_score, a.d4_score, a.d5_score, a.d6_score, a.d7_score]
  const valid  = scores.map((s, i) => ({ s: s ?? 999, i }))
  valid.sort((a, b) => a.s - b.s)
  return valid[0].i + 1
}

function getScoreBand(score: number): { label: string; colour: string } {
  if (score >= 90) return { label: 'Exceptional', colour: '#00c9a7' }
  if (score >= 75) return { label: 'Strong',      colour: '#0AF3CD' }
  if (score >= 60) return { label: 'Solid',       colour: '#fdcb5e' }
  if (score >= 40) return { label: 'Developing',  colour: '#ff9f43' }
  return { label: 'Growth area', colour: '#ff7b7a' }
}

function daysSince(dateStr: string | null): number {
  if (!dateStr) return 0
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

function fmtDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

// ── Component ──────────────────────────────────────────────────────────────────

const REASSESS_DAYS = 30

export default function ProfilePage() {
  const supabase = createClient()

  const [loading,         setLoading]        = useState(true)
  const [profile,         setProfile]        = useState<{ id: string; full_name: string | null; email: string } | null>(null)
  const [assessment,      setAssessment]     = useState<Assessment | null>(null)
  const [prevAssessment,  setPrevAssessment] = useState<Assessment | null>(null)
  const [allAssessments,  setAllAssessments] = useState<Assessment[]>([])
  const [editMode,        setEditMode]       = useState(false)
  const [editJobTitle,    setEditJobTitle]   = useState('')
  const [editCompanyType, setEditCompanyType] = useState('')
  const [saving,          setSaving]         = useState(false)
  const [saved,           setSaved]          = useState(false)
  const [showOnboarding,  setShowOnboarding] = useState(false)

  const loadData = useCallback(async () => {
    const { data: { session: authSession } } = await supabase.auth.getSession()
    if (!authSession) { window.location.href = '/login'; return }

    const { data: prof } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .eq('id', authSession.user.id)
      .single()

    if (!prof || prof.role !== 'participant') {
      window.location.href = '/unauthorised'; return
    }

    let resolvedName = prof.full_name
    if (!resolvedName?.trim()) {
      const { data: nameRow } = await supabase
        .from('assessments')
        .select('first_name')
        .eq('participant_id', authSession.user.id)
        .not('first_name', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (nameRow?.first_name?.trim()) resolvedName = nameRow.first_name.trim()
    }

    setProfile({ id: prof.id, full_name: resolvedName, email: prof.email })

    const { data: assessments } = await supabase
      .from('assessments')
      .select('overall_score, d1_score, d2_score, d3_score, d4_score, d5_score, d6_score, d7_score, completed_at, participant_role, job_title, company_type')
      .eq('participant_id', authSession.user.id)
      .not('overall_score', 'is', null)
      .order('completed_at', { ascending: false })

    if (assessments?.[0]) {
      setAssessment(assessments[0])
      setEditJobTitle(assessments[0].job_title ?? '')
      setEditCompanyType(assessments[0].company_type ?? '')
    }
    if (assessments?.[1]) setPrevAssessment(assessments[1])
    if (assessments && assessments.length > 0) setAllAssessments(assessments)

    setLoading(false)
  }, [supabase])

  useEffect(() => { loadData() }, [loadData])

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  async function saveProfile() {
    if (!profile) return
    setSaving(true)
    const { data: rows } = await supabase
      .from('assessments')
      .select('id')
      .eq('participant_id', profile.id)
      .not('overall_score', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(1)
    const assessmentId = rows?.[0]?.id
    if (assessmentId) {
      await supabase.from('assessments')
        .update({ job_title: editJobTitle.trim() || null, company_type: editCompanyType || null })
        .eq('id', assessmentId)
    }
    await loadData()
    setSaving(false)
    setSaved(true)
    setTimeout(() => { setSaved(false); setEditMode(false) }, 1200)
  }

  const firstName      = getFirstName(profile?.full_name ?? null, profile?.email)
  const focusDimId     = assessment ? getFocusDimension(assessment) : 1
  const daysSinceAssess = daysSince(assessment?.completed_at ?? null)
  const canReassess    = assessment !== null && daysSinceAssess >= REASSESS_DAYS
  const daysToReassess = assessment ? Math.max(0, REASSESS_DAYS - daysSinceAssess) : 0
  const overallDelta   = assessment && prevAssessment
    ? (assessment.overall_score ?? 0) - (prevAssessment.overall_score ?? 0)
    : null

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F4FDF9' }}>
        <p className="text-sm" style={{ color: '#05A88E' }}>Loading…</p>
      </main>
    )
  }

  // ── Radar chart renderer ────────────────────────────────────────────────────
  function renderRadar(size: number) {
    if (!assessment) return null
    const cx = size / 2, cy = size / 2, maxR = size * 0.39
    const scores = [1,2,3,4,5,6,7].map(id => getDimScore(assessment, id))
    const angles = Array.from({ length: 7 }, (_, i) => (-90 + i * (360 / 7)) * Math.PI / 180)
    const gridLevels = [0.33, 0.66, 1.0]
    const gridPaths = gridLevels.map(level =>
      angles.map(a => `${cx + maxR * level * Math.cos(a)},${cy + maxR * level * Math.sin(a)}`).join(' ')
    )
    const scorePts = scores.map((s, i) => {
      const r = ((s ?? 50) / 100) * maxR
      return `${cx + r * Math.cos(angles[i])},${cy + r * Math.sin(angles[i])}`
    }).join(' ')
    const dotColours = ['#fdcb5e','#EC4899','#ff7b7a','#ff9f43','#00c9a7','#2d4a8a','#a78bfa']
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
        {gridPaths.map((pts, i) => (
          <polygon key={i} points={pts} stroke={`rgba(10,243,205,${0.1 + i * 0.07})`} strokeWidth="0.75" fill="none" />
        ))}
        {angles.map((a, i) => (
          <line key={i} x1={cx} y1={cy} x2={cx + maxR * Math.cos(a)} y2={cy + maxR * Math.sin(a)} stroke="rgba(10,243,205,0.12)" strokeWidth="0.75" />
        ))}
        <polygon points={scorePts} fill="rgba(10,243,205,0.18)" stroke="rgba(10,243,205,0.75)" strokeWidth="1.5" strokeLinejoin="round" />
        {scores.map((s, i) => {
          const r = ((s ?? 50) / 100) * maxR
          return <circle key={i} cx={cx + r * Math.cos(angles[i])} cy={cy + r * Math.sin(angles[i])} r="3.5" fill={dotColours[i]} />
        })}
      </svg>
    )
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen animate-fadeIn" style={{ backgroundColor: '#F4FDF9' }}>

      {/* ── Name banner ──────────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg, #0A2E2A 0%, #0d3830 100%)' }}>
        <div className="max-w-lg mx-auto px-6 py-6 flex items-center gap-4">
          {/* Avatar circle */}
          <div className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #0AF3CD, #00c9a7)', boxShadow: '0 0 20px rgba(10,243,205,0.3)' }}>
            <span className="text-lg font-black" style={{ color: '#0A2E2A' }}>
              {(profile?.full_name ?? profile?.email ?? '?').charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'white' }}>{profile?.full_name || firstName}</h1>
            {assessment?.job_title && (
              <p className="text-xs mt-0.5" style={{ color: 'rgba(185,248,221,0.65)' }}>{assessment.job_title}</p>
            )}
            {assessment?.company_type && (
              <p className="text-xs" style={{ color: 'rgba(185,248,221,0.4)' }}>{assessment.company_type}</p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-6 space-y-5">

        {/* ── MQ Score card ───────────────────────────────────────────────── */}
        {assessment && (
          <div className="rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(10,46,42,0.15)' }}>
            {/* Score header */}
            <div className="relative overflow-hidden p-5" style={{ background: 'linear-gradient(135deg, #0A2E2A 0%, #0d3830 100%)' }}>
              {/* Radar background */}
              <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', opacity: 0.85, pointerEvents: 'none', filter: 'drop-shadow(0 0 8px rgba(10,243,205,0.35))' }}>
                {renderRadar(120)}
              </div>
              <div className="relative z-10 flex items-center gap-5">
                <div className="w-18 h-18 rounded-full flex items-center justify-center flex-shrink-0"
                     style={{ width: 72, height: 72, backgroundColor: '#0AF3CD' }}>
                  <span className="text-2xl font-black" style={{ color: '#0A2E2A' }}>{assessment.overall_score ?? '—'}</span>
                </div>
                <div>
                  <p className="text-base font-black" style={{ color: 'white' }}>MQ Score</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-sm font-semibold" style={{ color: '#0AF3CD' }}>{getScoreBand(assessment.overall_score ?? 0).label}</p>
                    {overallDelta !== null && overallDelta !== 0 && (
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: overallDelta > 0 ? 'rgba(209,250,229,0.2)' : 'rgba(254,226,226,0.2)', color: overallDelta > 0 ? '#6EE7B7' : '#FCA5A5' }}>
                        {overallDelta > 0 ? '+' : ''}{overallDelta}
                      </span>
                    )}
                  </div>
                  {assessment.completed_at && (
                    <p className="text-xs mt-1" style={{ color: 'rgba(185,248,221,0.45)' }}>
                      Assessed {fmtDate(assessment.completed_at)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Report + Reassess strip */}
            <div className="flex items-center justify-between px-5 py-2.5" style={{ backgroundColor: '#0d3830', borderTop: '1px solid rgba(10,243,205,0.15)' }}>
              <a
                href="/dashboard/report"
                target="_blank"
                className="flex items-center gap-1.5 text-xs font-semibold hover:opacity-70 transition-opacity"
                style={{ color: 'rgba(185,248,221,0.7)' }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download report
              </a>
              {canReassess ? (
                <a
                  href="/assessment"
                  className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-lg hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4"/>
                  </svg>
                  Reassess now
                </a>
              ) : (
                <span className="text-xs" style={{ color: 'rgba(185,248,221,0.75)' }}>
                  Reassess in {daysToReassess}d
                </span>
              )}
            </div>

            {/* Dimension bars */}
            <div className="p-5" style={{ backgroundColor: 'white' }}>
              <div className="space-y-3.5">
                {DIMS.map(dim => {
                  const score   = getDimScore(assessment, dim.id)
                  const delta   = getDelta(assessment, prevAssessment, dim.id)
                  const isFocus = dim.id === focusDimId
                  return (
                    <div key={dim.id}>
                      <div className="flex items-center mb-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dim.color }} />
                        <span className="text-xs font-medium ml-2 flex items-center gap-1"
                              style={{ color: isFocus ? dim.color : '#374151' }}>
                          {dim.name}
                          {isFocus && (
                            <span className="ml-1 text-xs font-bold px-1.5 py-0.5 rounded-full"
                                  style={{ backgroundColor: dim.bg, color: dim.color }}>
                              focus
                            </span>
                          )}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, position: 'relative', height: 6, borderRadius: 3 }}>
                          <div style={{ position: 'absolute', inset: 0, borderRadius: 3, backgroundColor: `${dim.color}22` }} />
                          <div style={{
                            position: 'absolute', left: 0, top: 0, bottom: 0,
                            borderRadius: 3,
                            width: score !== null ? `${score}%` : '0%',
                            backgroundColor: dim.color,
                            transition: 'width 0.7s ease',
                          }} />
                          {score !== null && (
                            <div style={{
                              position: 'absolute', top: '50%', left: `${score}%`,
                              transform: 'translate(-50%, -50%)',
                              width: 22, height: 22, borderRadius: '50%',
                              backgroundColor: dim.color, color: 'white',
                              fontSize: 9, fontWeight: 800,
                              border: '2px solid white', boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              zIndex: 2,
                            }}>
                              {score}
                            </div>
                          )}
                          {score !== null && delta !== null && delta !== 0 && (
                            <div style={{
                              position: 'absolute', top: '50%', left: `calc(${score}% + 14px)`,
                              transform: 'translateY(-50%)',
                              fontSize: 9, fontWeight: 700,
                              color: delta > 0 ? '#059669' : '#DC2626',
                              zIndex: 1, whiteSpace: 'nowrap', lineHeight: 1,
                            }}>
                              {delta > 0 ? `+${delta}` : `${delta}`}
                            </div>
                          )}
                        </div>
                        <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 500, flexShrink: 0 }}>100</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Score history ──────────────────────────────────────────────── */}
        {allAssessments.length > 1 && (
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'white', border: '1px solid #E8FDF7', boxShadow: '0 2px 12px rgba(10,46,42,0.07)' }}>
            <div className="px-5 py-3.5" style={{ borderBottom: '1px solid #F3F4F6' }}>
              <p className="text-sm font-semibold" style={{ color: '#0A2E2A' }}>Score history</p>
            </div>
            <div className="px-5 py-4">
              <div className="space-y-0">
                {allAssessments.map((a, idx) => {
                  const isLatest = idx === 0
                  const isLast = idx === allAssessments.length - 1
                  const prev = allAssessments[idx + 1]
                  const delta = prev && a.overall_score !== null && prev.overall_score !== null
                    ? (a.overall_score - prev.overall_score)
                    : null
                  const band = getScoreBand(a.overall_score ?? 0)
                  return (
                    <div key={idx} className="flex gap-3" style={{ minHeight: 56 }}>
                      {/* Timeline line + dot */}
                      <div className="flex flex-col items-center" style={{ width: 20 }}>
                        <div className="flex-shrink-0 rounded-full border-2"
                             style={{
                               width: isLatest ? 14 : 10,
                               height: isLatest ? 14 : 10,
                               backgroundColor: isLatest ? '#0AF3CD' : 'white',
                               borderColor: isLatest ? '#0AF3CD' : '#D1D5DB',
                               marginTop: isLatest ? 2 : 4,
                             }} />
                        {!isLast && (
                          <div className="flex-1" style={{ width: 2, backgroundColor: '#E5E7EB', minHeight: 24 }} />
                        )}
                      </div>
                      {/* Content */}
                      <div className="flex-1 pb-4" style={{ paddingTop: isLatest ? 0 : 1 }}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black" style={{ color: isLatest ? '#0A2E2A' : '#6B7280' }}>
                            {a.overall_score ?? '—'}
                          </span>
                          <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                                style={{ backgroundColor: band.colour + '22', color: band.colour }}>
                            {band.label}
                          </span>
                          {delta !== null && delta !== 0 && (
                            <span className="text-xs font-bold"
                                  style={{ color: delta > 0 ? '#059669' : '#DC2626' }}>
                              {delta > 0 ? '+' : ''}{delta}
                            </span>
                          )}
                          {isLatest && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                                  style={{ backgroundColor: '#E8FDF7', color: '#05A88E' }}>
                              Latest
                            </span>
                          )}
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                          {fmtDate(a.completed_at)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── No assessment CTA ───────────────────────────────────────────── */}
        {!assessment && (
          <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: 'white', border: '2px solid #0AF3CD', boxShadow: '0 2px 12px rgba(10,46,42,0.07)' }}>
            <p className="text-base font-semibold mb-1" style={{ color: '#0A2E2A' }}>Take your MQ assessment</p>
            <p className="text-sm mb-4" style={{ color: '#6B7280' }}>Get your baseline scores across 7 dimensions of leadership mindset.</p>
            <a href="/assessment" className="inline-block px-6 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
               style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}>
              Start assessment →
            </a>
          </div>
        )}

        {/* ── Edit profile ────────────────────────────────────────────────── */}
        {assessment && (
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'white', border: '1px solid #E8FDF7', boxShadow: '0 2px 12px rgba(10,46,42,0.07)' }}>
            <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid #F3F4F6' }}>
              <p className="text-sm font-semibold" style={{ color: '#0A2E2A' }}>Profile details</p>
              {!editMode ? (
                <button onClick={() => { setSaved(false); setEditMode(true) }}
                        className="text-xs font-medium hover:opacity-70 transition-opacity"
                        style={{ color: '#05A88E' }}>
                  Edit
                </button>
              ) : (
                <button onClick={() => setEditMode(false)}
                        className="text-xs font-medium hover:opacity-70 transition-opacity"
                        style={{ color: '#9CA3AF' }}>
                  Cancel
                </button>
              )}
            </div>

            {!editMode ? (
              <div className="px-5 py-4 space-y-3">
                <div>
                  <p className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Role</p>
                  <p className="text-sm mt-0.5" style={{ color: '#0A2E2A' }}>
                    {assessment.participant_role === 'manager' ? 'Manager' : assessment.participant_role === 'leader' ? 'Leader' : assessment.participant_role || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Job title</p>
                  <p className="text-sm mt-0.5" style={{ color: '#0A2E2A' }}>{assessment.job_title || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Organisation type</p>
                  <p className="text-sm mt-0.5" style={{ color: '#0A2E2A' }}>{assessment.company_type || '—'}</p>
                </div>
              </div>
            ) : (
              <div className="px-5 py-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A2E2A' }}>
                    Job title <span className="font-normal" style={{ color: '#9CA3AF' }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={editJobTitle}
                    onChange={e => setEditJobTitle(e.target.value)}
                    placeholder="e.g. Head of Product, Partner, SVP Engineering"
                    className="w-full px-4 py-3 rounded-xl border bg-white text-sm outline-none"
                    style={{ borderColor: '#B9F8DD', color: '#0A2E2A' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A2E2A' }}>
                    Organisation type <span className="font-normal" style={{ color: '#9CA3AF' }}>(optional)</span>
                  </label>
                  <select
                    value={editCompanyType}
                    onChange={e => setEditCompanyType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border bg-white text-sm outline-none appearance-none"
                    style={{ borderColor: '#B9F8DD', color: editCompanyType ? '#0A2E2A' : '#9CA3AF' }}
                  >
                    <option value="">Select your organisation type</option>
                    <option value="Corporate / Large enterprise">Corporate / Large enterprise</option>
                    <option value="Scale-up (Series B+)">Scale-up (Series B+)</option>
                    <option value="Early-stage startup">Early-stage startup</option>
                    <option value="Professional services (consulting, legal, accounting)">Professional services (consulting, legal, accounting)</option>
                    <option value="Financial services (banking, investment, PE/VC)">Financial services (banking, investment, PE/VC)</option>
                    <option value="Public sector / Government">Public sector / Government</option>
                    <option value="Non-profit / Social enterprise">Non-profit / Social enterprise</option>
                    <option value="Healthcare / Life sciences">Healthcare / Life sciences</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{ backgroundColor: saved ? '#B9F8DD' : '#0AF3CD', color: '#0A2E2A', opacity: saving ? 0.6 : 1 }}
                >
                  {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Account actions ─────────────────────────────────────────────── */}
        <div className="space-y-3">
          {/* MQ intro */}
          <button
            onClick={() => { resetOnboarding(); setShowOnboarding(true) }}
            className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'white', border: '1px solid #E8FDF7', boxShadow: '0 2px 12px rgba(10,46,42,0.07)' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-base">📖</span>
              <span className="text-sm font-medium" style={{ color: '#0A2E2A' }}>What is MQ?</span>
            </div>
            <span className="text-xs" style={{ color: '#9CA3AF' }}>→</span>
          </button>

          {/* Privacy policy */}
          <a
            href="/privacy"
            className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'white', border: '1px solid #E8FDF7', boxShadow: '0 2px 12px rgba(10,46,42,0.07)', display: 'flex' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-base">🔒</span>
              <span className="text-sm font-medium" style={{ color: '#0A2E2A' }}>Privacy policy</span>
            </div>
            <span className="text-xs" style={{ color: '#9CA3AF' }}>→</span>
          </a>

          {/* Sign out */}
          <button
            onClick={signOut}
            className="w-full py-3 rounded-2xl text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ color: '#DC2626', border: '1px solid #FEE2E2' }}
          >
            Sign out
          </button>
        </div>

      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div className="text-center pb-28 pt-4">
        <img src="/MQ Favicon.png" alt="MQ" className="h-8 w-auto mx-auto mb-2" />
        <p className="text-[10px] font-medium" style={{ color: '#D1D5DB' }}>
          © {new Date().getFullYear()} Mindset Quotient®
        </p>
      </div>

      {/* ── Onboarding overlay ──────────────────────────────────────────── */}
      {showOnboarding && (
        <MQOnboarding onComplete={() => setShowOnboarding(false)} />
      )}

    </main>
  )
}
