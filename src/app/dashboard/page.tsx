'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import CoachingRoom from '@/components/CoachingRoom'
import DailySpark from '@/components/DailySpark'

// ── Dimension config ───────────────────────────────────────────────────────────

const DIMS = [
  { id: 1, name: 'Self-awareness',       color: '#fdcb5e', bg: '#FEF5D9' },
  { id: 2, name: 'Cognitive flexibility', color: '#ff9f43', bg: '#FFF0E0' },
  { id: 3, name: 'Emotional regulation',  color: '#ff7b7a', bg: '#FFE8E8' },
  { id: 4, name: 'Values clarity',        color: '#00c9a7', bg: '#D4F5EF' },
  { id: 5, name: 'Relational mindset',    color: '#2d4a8a', bg: '#E0E6F5' },
  { id: 6, name: 'Adaptive resilience',   color: '#a78bfa', bg: '#EDE9FE' },
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
  completed_at:     string | null
  participant_role: string | null
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function getFirstName(full: string | null, email?: string) {
  if (full?.trim()) return full.trim().split(' ')[0]
  if (email) return email.split('@')[0].split('.')[0].replace(/^\w/, c => c.toUpperCase())
  return ''
}

function getJourneyDay(completedAt: string | null) {
  if (!completedAt) return null
  const start = new Date(completedAt)
  const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const today     = new Date()
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const diffDays  = Math.floor((todayDate.getTime() - startDate.getTime()) / 86400000)
  return diffDays + 1
}

function getFocusDimension(a: Assessment): number {
  const scores = [a.d1_score, a.d2_score, a.d3_score, a.d4_score, a.d5_score, a.d6_score]
  const valid  = scores.map((s, i) => ({ s: s ?? 999, i }))
  valid.sort((a, b) => a.s - b.s)
  return valid[0].i + 1
}

function getDimScore(a: Assessment, dimId: number): number | null {
  const map: Record<number, keyof Assessment> = {
    1: 'd1_score', 2: 'd2_score', 3: 'd3_score',
    4: 'd4_score', 5: 'd5_score', 6: 'd6_score',
  }
  return a[map[dimId]] as number | null
}

// ── Logo component ─────────────────────────────────────────────────────────────

function MQLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const [logoError, setLogoError] = useState(false)
  const dims = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-20 h-20' : 'w-12 h-12'
  const text = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-2xl' : 'text-sm'
  return !logoError ? (
    <img src="/logo.png" alt="MQ" className={`${dims} object-contain rounded-xl`}
         onError={() => setLogoError(true)} />
  ) : (
    <div className={`${dims} rounded-xl flex items-center justify-center`}
         style={{ backgroundColor: '#0AF3CD' }}>
      <span className={`font-black ${text}`} style={{ color: '#0A2E2A' }}>MQ</span>
    </div>
  )
}

const cardStyle = {
  backgroundColor: 'white',
  border: '1px solid #E8FDF7',
  boxShadow: '0 2px 12px rgba(10,46,42,0.07)',
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function ParticipantDashboard() {
  const supabase = createClient()

  const [loading,          setLoading]          = useState(true)
  const [profile,          setProfile]          = useState<{ id: string; full_name: string | null; email: string } | null>(null)
  const [assessment,       setAssessment]       = useState<Assessment | null>(null)
  const [showCoachingRoom, setShowCoachingRoom] = useState(false)
  const [authToken,        setAuthToken]        = useState<string | null>(null)

  const loadData = useCallback(async () => {
    const { data: { session: authSession } } = await supabase.auth.getSession()
    if (!authSession) { window.location.href = '/login'; return }
    setAuthToken(authSession.access_token)

    const { data: prof } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .eq('id', authSession.user.id)
      .single()

    if (!prof || prof.role !== 'participant') {
      window.location.href = '/unauthorised'; return
    }

    setProfile({ id: prof.id, full_name: prof.full_name, email: prof.email })

    const { data: assessments } = await supabase
      .from('assessments')
      .select('overall_score, d1_score, d2_score, d3_score, d4_score, d5_score, d6_score, completed_at, participant_role')
      .eq('participant_id', authSession.user.id)
      .not('overall_score', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(1)

    if (assessments?.[0]) setAssessment(assessments[0])
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadData() }, [loadData])

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const firstName  = getFirstName(profile?.full_name ?? null, profile?.email)
  const journeyDay = getJourneyDay(assessment?.completed_at ?? null)
  const focusDimId = assessment ? getFocusDimension(assessment) : 1
  const focusDim   = DIMS[focusDimId - 1]

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F4FDF9' }}>
        <p className="text-sm" style={{ color: '#05A88E' }}>Loading…</p>
      </main>
    )
  }

  // ── Home ────────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F4FDF9' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ backgroundColor: '#0A2E2A' }}>
        <div className="absolute top-0 right-0 w-64 h-32 rounded-full blur-3xl pointer-events-none"
             style={{ backgroundColor: 'rgba(10,243,205,0.07)' }} />
        <div className="absolute bottom-0 left-1/4 w-32 h-16 rounded-full blur-2xl pointer-events-none"
             style={{ backgroundColor: 'rgba(5,168,142,0.1)' }} />
        <div className="relative max-w-2xl mx-auto px-6 py-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <MQLogo size="md" />
            <div>
              <h1 className="text-lg font-bold leading-tight" style={{ color: 'white' }}>
                {getGreeting()}, {firstName}.
              </h1>
              {journeyDay && (
                <p className="text-xs mt-0.5" style={{ color: '#B9F8DD' }}>
                  Day {journeyDay} of your MQ journey
                </p>
              )}
            </div>
          </div>
          <button
            onClick={signOut}
            className="text-xs px-3 py-1.5 rounded-lg flex-shrink-0 hover:opacity-80 transition-opacity"
            style={{ color: '#B9F8DD', border: '1px solid rgba(185,248,221,0.25)' }}
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-4">

        {/* ── No assessment ────────────────────────────────────────────────── */}
        {!assessment && (
          <div className="rounded-2xl p-6 text-center" style={{ ...cardStyle, border: '2px solid #0AF3CD' }}>
            <p className="text-base font-semibold mb-1" style={{ color: '#0A2E2A' }}>
              Start with your MQ assessment
            </p>
            <p className="text-sm mb-4" style={{ color: '#05A88E' }}>
              Your Daily Spark practices are personalised to your results. Take the assessment first — it takes about 10 minutes.
            </p>
            <a href="/assessment"
               className="inline-block px-6 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
               style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}>
              Take my assessment →
            </a>
          </div>
        )}

        {/* ── Stats row ────────────────────────────────────────────────────── */}
        {assessment && (
          <div className="grid grid-cols-2 gap-3">
            {/* MQ Score */}
            <div className="rounded-2xl p-4 flex flex-col items-center justify-center" style={cardStyle}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-1.5"
                   style={{ backgroundColor: '#0AF3CD' }}>
                <span className="text-xl font-black" style={{ color: '#0A2E2A' }}>
                  {assessment.overall_score ?? '—'}
                </span>
              </div>
              <p className="text-xs text-center font-semibold" style={{ color: '#05A88E' }}>MQ Score</p>
            </div>

            {/* Focus dimension */}
            <div className="rounded-2xl p-4 flex flex-col justify-center" style={cardStyle}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9CA3AF' }}>
                Focus
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: focusDim.color }} />
                <p className="text-xs font-bold leading-tight" style={{ color: '#0A2E2A' }}>{focusDim.name}</p>
              </div>
            </div>

          </div>
        )}

        {/* ── Daily Spark ──────────────────────────────────────────────────── */}
        {assessment && authToken && (
          <DailySpark token={authToken} />
        )}

        {/* ── MQ profile bars ───────────────────────────────────────────────── */}
        {assessment && (
          <div className="rounded-2xl p-5" style={cardStyle}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#9CA3AF' }}>
              Your MQ profile
            </p>
            <div className="space-y-3.5">
              {DIMS.map(dim => {
                const score   = getDimScore(assessment, dim.id)
                const isFocus = dim.id === focusDimId
                return (
                  <div key={dim.id}>
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dim.color }} />
                        <span className="text-xs font-medium" style={{ color: isFocus ? dim.color : '#374151' }}>
                          {dim.name}
                          {isFocus && (
                            <span className="ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full"
                                  style={{ backgroundColor: dim.bg, color: dim.color }}>
                              focus
                            </span>
                          )}
                        </span>
                      </div>
                      <span className="text-xs font-bold" style={{ color: dim.color }}>{score ?? '—'}</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ backgroundColor: '#F3F4F6' }}>
                      <div className="h-1.5 rounded-full transition-all duration-700"
                           style={{ width: score !== null ? `${score}%` : '0%', backgroundColor: dim.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── The Coaching Room ─────────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-5 flex items-center justify-between relative overflow-hidden"
          style={{ backgroundColor: '#0A2E2A', boxShadow: '0 4px 20px rgba(10,46,42,0.15)' }}
        >
          <div className="absolute right-0 top-0 w-32 h-full rounded-full blur-3xl pointer-events-none"
               style={{ backgroundColor: 'rgba(10,243,205,0.06)' }} />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xl"
                 style={{ backgroundColor: 'rgba(10,243,205,0.12)' }}>
              🧠
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: 'white' }}>The Coaching Room</p>
              <p className="text-xs mt-0.5" style={{ color: '#B9F8DD' }}>
                Unlimited coaching · any challenge · anytime
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCoachingRoom(true)}
            className="text-xs px-4 py-2 rounded-xl font-bold flex-shrink-0 ml-3 relative z-10 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}
          >
            Open →
          </button>
        </div>

        {/* Retake link */}
        {assessment && (
          <div className="text-center pb-4">
            <a href="/assessment" className="text-xs" style={{ color: '#9CA3AF' }}>Retake assessment</a>
          </div>
        )}

      </div>

      {/* ── Coaching Room overlay ──────────────────────────────────────────── */}
      {showCoachingRoom && authToken && (
        <CoachingRoom
          token={authToken}
          firstName={firstName}
          onClose={() => setShowCoachingRoom(false)}
        />
      )}

    </main>
  )
}
