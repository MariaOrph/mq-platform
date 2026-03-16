'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import CoachingRoom from '@/components/CoachingRoom'

// ── Dimension config ───────────────────────────────────────────────────────────

const DIMS = [
  { id: 1, name: 'Self-awareness',       color: '#0AF3CD', bg: '#D0FAF3' },
  { id: 2, name: 'Cognitive flexibility', color: '#05A88E', bg: '#CCEFEA' },
  { id: 3, name: 'Emotional regulation',  color: '#F97316', bg: '#FEE9D7' },
  { id: 4, name: 'Values clarity',        color: '#3B82F6', bg: '#DBEAFE' },
  { id: 5, name: 'Relational mindset',    color: '#8B5CF6', bg: '#EDE9FE' },
  { id: 6, name: 'Adaptive resilience',   color: '#F59E0B', bg: '#FEF3C7' },
]

const CONTEXT_CHIPS = [
  'Team disengagement',
  'Difficult conversation',
  'Feeling overwhelmed',
  'Struggling to delegate',
  'Managing a friend or peer',
  'Team uncertainty',
  'Giving difficult feedback',
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

interface SessionSummary {
  id:           string
  session_date: string
  dimension_id: number
  status:       string
  heading:      string | null
}

type View = 'loading' | 'home' | 'context' | 'generating'

// ── Helpers ────────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function getFirstName(full: string | null) {
  if (!full) return 'there'
  return full.split(' ')[0]
}

function getJourneyDay(completedAt: string | null) {
  if (!completedAt) return null
  const start = new Date(completedAt)
  const today = new Date()
  return Math.max(1, Math.floor((today.getTime() - start.getTime()) / 86400000) + 1)
}

function getFocusDimension(a: Assessment): number {
  const scores = [a.d1_score, a.d2_score, a.d3_score, a.d4_score, a.d5_score, a.d6_score]
  const valid  = scores.map((s, i) => ({ s: s ?? 999, i }))
  valid.sort((a, b) => a.s - b.s)
  return valid[0].i + 1
}

function computeWeekAndStreak(sessions: SessionSummary[]) {
  const completedDates = new Set(
    sessions.filter(s => s.status === 'complete').map(s => s.session_date)
  )
  const today = new Date()
  const week: { date: string; label: string; done: boolean }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    week.push({
      date:  dateStr,
      label: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][d.getDay()],
      done:  completedDates.has(dateStr),
    })
  }
  let streak = 0
  const startIdx = week[6].done ? 6 : 5
  for (let i = startIdx; i >= 0; i--) {
    if (week[i].done) streak++
    else break
  }
  return { week, streak }
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
  const dims = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-14 h-14' : 'w-9 h-9'
  const text = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-xl' : 'text-sm'
  return !logoError ? (
    <img
      src="/logo.png"
      alt="MQ"
      className={`${dims} object-contain rounded-xl`}
      onError={() => setLogoError(true)}
    />
  ) : (
    <div className={`${dims} rounded-xl flex items-center justify-center`}
         style={{ backgroundColor: '#0AF3CD' }}>
      <span className={`font-black ${text}`} style={{ color: '#0A2E2A' }}>MQ</span>
    </div>
  )
}

// ── Card wrapper ───────────────────────────────────────────────────────────────

const cardStyle = {
  backgroundColor: 'white',
  border: '1px solid #E8FDF7',
  boxShadow: '0 2px 12px rgba(10,46,42,0.07)',
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function ParticipantDashboard() {
  const router   = useRouter()
  const supabase = createClient()

  const [view,             setView]             = useState<View>('loading')
  const [profile,          setProfile]          = useState<{ id: string; full_name: string | null; email: string } | null>(null)
  const [assessment,       setAssessment]       = useState<Assessment | null>(null)
  const [sessions,         setSessions]         = useState<SessionSummary[]>([])
  const [context,          setContext]          = useState('')
  const [genError,         setGenError]         = useState('')
  const [showCoachingRoom, setShowCoachingRoom] = useState(false)
  const [authToken,        setAuthToken]        = useState<string | null>(null)

  // ── Load data ───────────────────────────────────────────────────────────────
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

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    const { data: sess } = await supabase
      .from('coaching_sessions')
      .select('id, session_date, dimension_id, status, heading')
      .eq('participant_id', authSession.user.id)
      .gte('session_date', sevenDaysAgo.toISOString().split('T')[0])
      .order('session_date', { ascending: false })

    setSessions(sess ?? [])
    setView('home')
  }, [supabase])

  useEffect(() => { loadData() }, [loadData])

  // ── Generate coaching moment ────────────────────────────────────────────────
  async function generate(ctx: string) {
    if (!profile || !assessment) return
    setView('generating')
    setGenError('')

    const focusDimId    = getFocusDimension(assessment)
    const dimScore      = getDimScore(assessment, focusDimId) ?? 50
    const firstName     = getFirstName(profile.full_name)
    const role          = assessment.participant_role ?? 'leader'

    const { data: { session: authSession } } = await supabase.auth.getSession()
    const token = authSession?.access_token

    try {
      const res  = await fetch('/api/coaching-moment', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name:           firstName,
          role,
          dimensionId:    focusDimId,
          dimensionScore: dimScore,
          context:        ctx,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.sessionId) {
        setGenError('Something went wrong. Please try again.')
        setView('home')
        return
      }

      router.push(`/dashboard/coaching?session=${data.sessionId}`)
    } catch {
      setGenError('Could not reach the coaching service. Please try again.')
      setView('home')
    }
  }

  // ── Sign out ────────────────────────────────────────────────────────────────
  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  // ── Derived values ──────────────────────────────────────────────────────────
  const firstName    = getFirstName(profile?.full_name ?? null)
  const journeyDay   = getJourneyDay(assessment?.completed_at ?? null)
  const focusDimId   = assessment ? getFocusDimension(assessment) : 1
  const focusDim     = DIMS[focusDimId - 1]
  const todayStr     = new Date().toISOString().split('T')[0]
  const todaySession = sessions.find(s => s.session_date === todayStr) ?? null
  const { week, streak } = computeWeekAndStreak(sessions)

  // ── Generating screen ───────────────────────────────────────────────────────
  if (view === 'generating') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6"
            style={{ backgroundColor: '#0A2E2A' }}>
        {/* Decorative glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none"
             style={{ backgroundColor: 'rgba(10,243,205,0.08)' }} />
        <div className="relative z-10 text-center max-w-sm">
          <div className="flex justify-center mb-8">
            <MQLogo size="lg" />
          </div>
          <p className="text-lg font-semibold mb-3" style={{ color: '#0AF3CD' }}>
            Creating your coaching moment…
          </p>
          <p className="text-sm italic mb-8" style={{ color: '#B9F8DD' }}>
            {context.trim() ? `"${context.trim()}"` : 'Tailoring a session for you…'}
          </p>
          <div className="space-y-3">
            {[100, 80, 60].map((w, i) => (
              <div key={i} className="h-1.5 rounded-full mx-auto animate-pulse"
                   style={{ width: `${w}%`, backgroundColor: 'rgba(10,243,205,0.2)' }} />
            ))}
          </div>
        </div>
      </main>
    )
  }

  // ── Context question screen ─────────────────────────────────────────────────
  if (view === 'context') {
    return (
      <main className="min-h-screen flex flex-col" style={{ backgroundColor: '#F4FDF9' }}>
        {/* Header */}
        <div style={{ backgroundColor: '#0A2E2A' }}>
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
            <button onClick={() => setView('home')} className="text-sm" style={{ color: '#B9F8DD' }}>
              ← Back
            </button>
            <MQLogo size="sm" />
          </div>
        </div>

        <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-6 py-10">
          {/* Focus badge */}
          <div className="inline-flex items-center gap-2 mb-6 self-start px-3 py-1.5 rounded-full"
               style={{ backgroundColor: focusDim.bg }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: focusDim.color }} />
            <span className="text-xs font-semibold" style={{ color: focusDim.color }}>
              Today's focus: {focusDim.name}
            </span>
          </div>

          <h1 className="text-2xl font-bold mb-2" style={{ color: '#0A2E2A' }}>
            What's one thing on your mind at work this week?
          </h1>
          <p className="text-sm mb-6" style={{ color: '#05A88E' }}>
            The more specific you are, the more relevant today's session will be.
          </p>

          <textarea
            value={context}
            onChange={e => setContext(e.target.value)}
            placeholder="e.g. I have a one-to-one coming up with someone who's been disengaged…"
            rows={4}
            className="w-full rounded-2xl px-4 py-3 text-sm outline-none mb-4 resize-none"
            style={{ border: '2px solid #B9F8DD', backgroundColor: 'white', color: '#0A2E2A', boxShadow: '0 2px 8px rgba(10,46,42,0.05)' }}
          />

          <div className="flex flex-wrap gap-2 mb-8">
            {CONTEXT_CHIPS.map(chip => (
              <button
                key={chip}
                onClick={() => setContext(chip)}
                className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                style={{
                  backgroundColor: context === chip ? '#0AF3CD' : 'white',
                  color:           context === chip ? '#0A2E2A' : '#05A88E',
                  border:          `1px solid ${context === chip ? '#0AF3CD' : '#B9F8DD'}`,
                  boxShadow:       context === chip ? 'none' : '0 1px 3px rgba(10,46,42,0.06)',
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          <button
            onClick={() => generate(context)}
            className="w-full py-3 rounded-xl text-sm font-bold mb-3 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}
          >
            Get my coaching moment →
          </button>
          <button
            onClick={() => generate('')}
            className="w-full text-sm py-2"
            style={{ color: '#05A88E' }}
          >
            Skip — give me a general session today
          </button>
        </div>
      </main>
    )
  }

  // ── Loading screen ──────────────────────────────────────────────────────────
  if (view === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F4FDF9' }}>
        <p className="text-sm" style={{ color: '#05A88E' }}>Loading…</p>
      </main>
    )
  }

  // ── Home screen ─────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F4FDF9' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ backgroundColor: '#0A2E2A' }}>
        {/* Decorative glow */}
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

        {/* ── Error banner ─────────────────────────────────────────────────── */}
        {genError && (
          <div className="rounded-2xl px-5 py-3 text-sm" style={{ backgroundColor: '#FAECE7', color: '#993C1D' }}>
            {genError}
          </div>
        )}

        {/* ── No assessment state ──────────────────────────────────────────── */}
        {!assessment && (
          <div className="rounded-2xl p-6 text-center" style={{ ...cardStyle, border: '2px solid #0AF3CD' }}>
            <p className="text-base font-semibold mb-1" style={{ color: '#0A2E2A' }}>
              Start with your MQ assessment
            </p>
            <p className="text-sm mb-4" style={{ color: '#05A88E' }}>
              Your coaching moments are personalised to your results. Take the assessment first — it takes about 10 minutes.
            </p>
            <a href="/assessment"
               className="inline-block px-6 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
               style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}>
              Take my assessment →
            </a>
          </div>
        )}

        {/* ── Today's coaching moment card ─────────────────────────────────── */}
        {assessment && (
          <div className="rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(10,46,42,0.12)', border: '1.5px solid rgba(10,243,205,0.4)' }}>
            {/* Card header */}
            <div className="px-5 py-3.5 flex items-center justify-between"
                 style={{ backgroundColor: '#0A2E2A' }}>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#0AF3CD' }}>
                {todaySession?.status === 'complete' ? '✓ Today\'s session complete' : 'Today\'s coaching moment'}
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold"
                    style={{ backgroundColor: focusDim.bg, color: focusDim.color }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: focusDim.color }} />
                {focusDim.name}
              </span>
            </div>

            {/* Card body */}
            <div className="px-5 py-5" style={{ backgroundColor: 'white' }}>
              {todaySession?.heading ? (
                <>
                  <p className="text-base font-semibold mb-1 leading-snug" style={{ color: '#0A2E2A' }}>
                    {todaySession.heading}
                  </p>
                  <p className="text-xs mb-4" style={{ color: '#05A88E' }}>
                    {todaySession.status === 'complete' ? '✓ Completed · Great work today' : 'In progress'}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-base font-semibold mb-1" style={{ color: '#0A2E2A' }}>
                    Your session is ready
                  </p>
                  <p className="text-sm mb-4" style={{ color: '#05A88E' }}>
                    10 minutes · personalised to your profile
                  </p>
                </>
              )}

              {todaySession ? (
                <button
                  onClick={() => router.push(`/dashboard/coaching?session=${todaySession.id}`)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}
                >
                  {todaySession.status === 'complete' ? 'Review session →' : 'Continue session →'}
                </button>
              ) : (
                <button
                  onClick={() => setView('context')}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}
                >
                  Start today's coaching moment →
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Stats row ────────────────────────────────────────────────────── */}
        {assessment && (
          <div className="grid grid-cols-3 gap-3">

            {/* MQ Score */}
            <div className="rounded-2xl p-4 flex flex-col items-center justify-center" style={cardStyle}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-1.5"
                   style={{ backgroundColor: '#0AF3CD' }}>
                <span className="text-xl font-black" style={{ color: '#0A2E2A' }}>
                  {assessment.overall_score ?? '—'}
                </span>
              </div>
              <p className="text-xs text-center font-semibold" style={{ color: '#05A88E' }}>
                MQ Score
              </p>
            </div>

            {/* Focus area */}
            <div className="rounded-2xl p-4 flex flex-col justify-center" style={cardStyle}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9CA3AF' }}>
                Focus
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: focusDim.color }} />
                <p className="text-xs font-bold leading-tight" style={{ color: '#0A2E2A' }}>
                  {focusDim.name}
                </p>
              </div>
            </div>

            {/* Streak */}
            <div className="rounded-2xl p-4 flex flex-col items-center justify-center" style={cardStyle}>
              <p className="text-3xl font-black leading-none mb-1" style={{ color: streak > 0 ? '#F59E0B' : '#D1D5DB' }}>
                {streak}
              </p>
              <p className="text-xs font-semibold" style={{ color: '#05A88E' }}>
                day streak
              </p>
            </div>
          </div>
        )}

        {/* ── 7-day streak tracker ─────────────────────────────────────────── */}
        {assessment && (
          <div className="rounded-2xl px-5 py-4" style={cardStyle}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#9CA3AF' }}>
              This week
            </p>
            <div className="flex justify-between">
              {week.map((day, i) => {
                const isToday = i === 6
                return (
                  <div key={day.date} className="flex flex-col items-center gap-1.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                         style={{
                           backgroundColor: day.done ? '#0AF3CD' : isToday ? 'transparent' : '#F3F4F6',
                           border: isToday && !day.done ? '2px solid #0AF3CD' : 'none',
                         }}>
                      {day.done && (
                        <span className="text-xs font-bold" style={{ color: '#0A2E2A' }}>✓</span>
                      )}
                    </div>
                    <span className="text-xs" style={{
                      color: isToday ? '#05A88E' : '#9CA3AF',
                      fontWeight: isToday ? 700 : 400,
                    }}>
                      {day.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── MQ profile bars ───────────────────────────────────────────────── */}
        {assessment && (
          <div className="rounded-2xl p-5" style={cardStyle}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#9CA3AF' }}>
              Your MQ profile
            </p>
            <div className="space-y-3.5">
              {DIMS.map(dim => {
                const score = getDimScore(assessment, dim.id)
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
                      <span className="text-xs font-bold" style={{ color: dim.color }}>
                        {score ?? '—'}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ backgroundColor: '#F3F4F6' }}>
                      <div
                        className="h-1.5 rounded-full transition-all duration-700"
                        style={{
                          width:           score !== null ? `${score}%` : '0%',
                          backgroundColor: dim.color,
                        }}
                      />
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
          {/* Glow */}
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
            <a href="/assessment" className="text-xs" style={{ color: '#9CA3AF' }}>
              Retake assessment
            </a>
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
