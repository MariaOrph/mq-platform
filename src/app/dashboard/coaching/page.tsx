'use client'

import { Suspense, useEffect, useState, useRef, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// ── Dimension config ──────────────────────────────────────────────────────────

const DIMS = [
  { id: 1, name: 'Self-awareness',        color: '#fdcb5e', bg: '#FEF5D9' },
  { id: 2, name: 'Ego & identity',        color: '#EC4899', bg: '#FCE7F3' },
  { id: 3, name: 'Emotional regulation',  color: '#ff7b7a', bg: '#FFE8E8' },
  { id: 4, name: 'Cognitive flexibility', color: '#ff9f43', bg: '#FFF0E0' },
  { id: 5, name: 'Values & purpose',      color: '#00c9a7', bg: '#D4F5EF' },
  { id: 6, name: 'Relational mindset',    color: '#2d4a8a', bg: '#E0E6F5' },
  { id: 7, name: 'Adaptive resilience',   color: '#a78bfa', bg: '#EDE9FE' },
]

const NEXT_DIM_TEASER: Record<number, string> = {
  1: 'Ego & identity',
  2: 'Emotional regulation',
  3: 'Cognitive flexibility',
  4: 'Values & purpose',
  5: 'Relational mindset',
  6: 'Adaptive resilience',
  7: 'Self-awareness',
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface CoachingSession {
  id:               string
  session_date:     string
  dimension_id:     number
  context_provided: string | null
  heading:          string | null
  reflection_ai:    string | null
  practice_title:   string | null
  practice_body:    string | null
  insight_body:     string | null
  insight_quote:    string | null
  user_reflection:  string | null
  status:           string
}

type View = 'loading' | 'reading' | 'complete'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

function getFirstName(full: string | null) {
  if (!full) return 'there'
  return full.split(' ')[0]
}

// ── Inner component (needs Suspense for useSearchParams) ──────────────────────

function CoachingContent() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const supabase     = createClient()

  const sessionId = searchParams.get('session')

  const [view,           setView]           = useState<View>('loading')
  const [session,        setSession]        = useState<CoachingSession | null>(null)
  const [firstName,      setFirstName]      = useState('there')
  const [userReflection, setUserReflection] = useState('')
  const [saving,         setSaving]         = useState(false)
  const [completing,     setCompleting]     = useState(false)

  // Debounced autosave ref
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // ── Load session ──────────────────────────────────────────────────────────
  const loadSession = useCallback(async () => {
    if (!sessionId) { router.push('/dashboard'); return }

    const { data: { session: authSession } } = await supabase.auth.getSession()
    if (!authSession) { window.location.href = '/login'; return }

    // Load profile for first name
    const { data: prof } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', authSession.user.id)
      .single()

    setFirstName(getFirstName(prof?.full_name ?? null))

    // Load coaching session
    const { data: sess } = await supabase
      .from('coaching_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('participant_id', authSession.user.id)
      .single()

    if (!sess) { router.push('/dashboard'); return }

    setSession(sess)
    setUserReflection(sess.user_reflection ?? '')
    setView(sess.status === 'complete' ? 'complete' : 'reading')
  }, [sessionId, supabase, router])

  useEffect(() => { loadSession() }, [loadSession])

  // ── Autosave reflection ───────────────────────────────────────────────────
  function handleReflectionChange(text: string) {
    setUserReflection(text)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      setSaving(true)
      await supabase
        .from('coaching_sessions')
        .update({ user_reflection: text })
        .eq('id', sessionId)
      setSaving(false)
    }, 800)
  }

  // ── Mark as complete ──────────────────────────────────────────────────────
  async function markComplete() {
    if (!sessionId) return
    setCompleting(true)
    // Save reflection first
    clearTimeout(saveTimer.current)
    await supabase
      .from('coaching_sessions')
      .update({
        user_reflection: userReflection,
        status:          'complete',
        completed_at:    new Date().toISOString(),
      })
      .eq('id', sessionId)
    setCompleting(false)
    setView('complete')
  }

  // ── Save for later ────────────────────────────────────────────────────────
  async function saveForLater() {
    if (!sessionId) return
    await supabase
      .from('coaching_sessions')
      .update({ status: 'saved_for_later', user_reflection: userReflection })
      .eq('id', sessionId)
    router.push('/dashboard')
  }

  const dim = session ? DIMS[session.dimension_id - 1] : DIMS[0]

  // ── Loading ───────────────────────────────────────────────────────────────
  if (view === 'loading' || !session) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E8FDF7' }}>
        <div className="space-y-2 w-64 animate-pulse">
          {[100, 80, 60].map((w, i) => (
            <div key={i} className="h-3 rounded-full"
                 style={{ width: `${w}%`, backgroundColor: '#B9F8DD' }} />
          ))}
        </div>
      </main>
    )
  }

  // ── Completion screen ─────────────────────────────────────────────────────
  if (view === 'complete') {
    const nextDim = NEXT_DIM_TEASER[session.dimension_id]
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6"
            style={{ backgroundColor: '#0A2E2A' }}>
        <div className="text-center max-w-sm">
          {/* Tick circle */}
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
               style={{ backgroundColor: '#0AF3CD' }}>
            <span className="text-4xl" style={{ color: '#0A2E2A' }}>✓</span>
          </div>

          <h1 className="text-2xl font-bold mb-3" style={{ color: 'white' }}>
            Well done, {firstName}.
          </h1>

          <p className="text-sm leading-relaxed mb-2" style={{ color: '#B9F8DD' }}>
            You've completed today's <strong style={{ color: '#0AF3CD' }}>{dim.name}</strong> coaching moment.
            Taking time to reflect like this is exactly what develops your MQ, one moment at a time.
          </p>

          <p className="text-sm mb-8" style={{ color: '#B9F8DD' }}>
            Tomorrow's focus will explore <strong style={{ color: '#0AF3CD' }}>{nextDim}</strong>.
          </p>

          <button
            onClick={() => router.push('/dashboard')}
            className="px-8 py-3 rounded-xl text-sm font-bold"
            style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}
          >
            Back to home
          </button>
        </div>
      </main>
    )
  }

  // ── Reading screen ────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen animate-fadeIn" style={{ backgroundColor: '#E8FDF7' }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30" style={{ backgroundColor: '#0A2E2A' }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                 style={{ backgroundColor: '#0AF3CD' }}>
              <span className="text-xs font-black" style={{ color: '#0A2E2A' }}>MQ</span>
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 20, lineHeight: 1 }}
          >×</button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-7 space-y-6">

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <div>
          {/* Dimension badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
               style={{ backgroundColor: dim.bg }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dim.color }} />
            <span className="text-xs font-bold" style={{ color: dim.color }}>
              {dim.name}
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold leading-snug mb-3" style={{ color: '#0A2E2A' }}>
            {session.heading}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full"
                  style={{ backgroundColor: 'white', color: '#05A88E', border: '1px solid #B9F8DD' }}>
              {formatDate(session.session_date)}
            </span>
            {session.context_provided && (
              <span className="text-xs px-3 py-1 rounded-full max-w-xs truncate"
                    style={{ backgroundColor: dim.bg, color: dim.color }}>
                Based on: &ldquo;{session.context_provided}&rdquo;
              </span>
            )}
          </div>
        </div>

        {/* ── Reflection section ─────────────────────────────────────────── */}
        <div className="rounded-xl p-6" style={{ backgroundColor: 'white', border: '1px solid #B9F8DD' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#05A88E' }}>
            Reflection
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#0A2E2A' }}>
            {session.reflection_ai}
          </p>
        </div>

        {/* ── Private reflection textarea ─────────────────────────────────── */}
        <div className="rounded-xl overflow-hidden" style={{ border: '2px solid #0AF3CD' }}>
          <div className="px-5 py-3 flex items-center justify-between"
               style={{ backgroundColor: '#0AF3CD' }}>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#0A2E2A' }}>
              Your reflection
            </p>
            <p className="text-xs" style={{ color: 'rgba(10,46,42,0.6)' }}>
              {saving ? 'Saving…' : 'Private: only visible to you'}
            </p>
          </div>
          <div style={{ backgroundColor: '#E8FDF7' }}>
            <textarea
              value={userReflection}
              onChange={e => handleReflectionChange(e.target.value)}
              placeholder="Write a few thoughts here…"
              rows={4}
              className="w-full px-5 py-4 text-sm outline-none resize-none bg-transparent"
              style={{ color: '#0A2E2A' }}
            />
          </div>
        </div>

        {/* ── Practice section ───────────────────────────────────────────── */}
        <div className="rounded-xl overflow-hidden"
             style={{ border: '1px solid #B9F8DD', borderLeft: `4px solid ${dim.color}` }}>
          <div className="px-6 py-5" style={{ backgroundColor: '#E8FDF7' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#05A88E' }}>
              Practice
            </p>
            <p className="text-base font-bold mb-3" style={{ color: '#0A2E2A' }}>
              {session.practice_title}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#0A2E2A' }}>
              {session.practice_body}
            </p>
          </div>
        </div>

        {/* ── MQ Insight section ─────────────────────────────────────────── */}
        <div className="rounded-xl overflow-hidden"
             style={{ border: '1px solid rgba(10,243,205,0.3)', borderLeft: `4px solid #0AF3CD` }}>
          <div className="px-6 py-5" style={{ backgroundColor: '#0A2E2A' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#0AF3CD' }}>
              MQ Insight
            </p>
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#B9F8DD' }}>
              {session.insight_body}
            </p>
            {session.insight_quote && (
              <div className="pl-4" style={{ borderLeft: '2px solid rgba(10,243,205,0.4)' }}>
                <p className="text-sm italic leading-relaxed" style={{ color: '#0AF3CD' }}>
                  {session.insight_quote}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Action buttons ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 pb-8">
          <button
            onClick={markComplete}
            disabled={completing}
            className="w-full py-3.5 rounded-xl text-sm font-bold disabled:opacity-60"
            style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}
          >
            {completing ? 'Saving…' : 'Mark as complete ✓'}
          </button>
          <button
            onClick={saveForLater}
            className="w-full py-3 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: 'white', color: '#05A88E', border: '1px solid #B9F8DD' }}
          >
            Save for later
          </button>
        </div>

      </div>
    </main>
  )
}

// ── Page export (Suspense wrapper required for useSearchParams) ───────────────

export default function CoachingPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E8FDF7' }}>
        <p style={{ color: '#05A88E' }}>Loading…</p>
      </main>
    }>
      <CoachingContent />
    </Suspense>
  )
}
