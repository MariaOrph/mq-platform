'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import CoachingRoom from '@/components/CoachingRoom'
import DailySpark from '@/components/DailySpark'

// ── Dimension config ───────────────────────────────────────────────────────────

const DIMS = [
  { id: 1, name: 'Self-awareness',        color: '#fdcb5e', bg: '#FEF5D9' },
  { id: 2, name: 'Cognitive flexibility', color: '#ff9f43', bg: '#FFF0E0' },
  { id: 3, name: 'Emotional regulation',  color: '#ff7b7a', bg: '#FFE8E8' },
  { id: 4, name: 'Values clarity',        color: '#00c9a7', bg: '#D4F5EF' },
  { id: 5, name: 'Relational mindset',    color: '#2d4a8a', bg: '#E0E6F5' },
  { id: 6, name: 'Adaptive resilience',   color: '#a78bfa', bg: '#EDE9FE' },
]

const DIM_DETAIL: Record<number, {
  tagline: string
  what: string
  why: string
  high: string
  low: string
}> = {
  1: {
    tagline: 'The ability to see yourself clearly — in real time.',
    what: 'Self-awareness is the capacity to notice your own thoughts, feelings, assumptions and behavioural patterns as they arise, without being swept along by them. It\'s the internal observer that watches how you\'re showing up.',
    why: 'Leaders who lack self-awareness act on unconscious biases, react impulsively under pressure, and misread how they\'re landing on others. Self-aware leaders can pause before reacting, understand what\'s driving them, and choose how to respond rather than defaulting to autopilot. Research consistently shows self-awareness as one of the strongest predictors of leadership effectiveness.',
    high: 'You have a strong internal observer. You notice patterns in your thinking, catch your own triggers before they escalate, and tend to seek honest feedback rather than avoid it.',
    low: 'You may find yourself reacting before you\'ve had a chance to choose your response — or discovering your impact on others after the fact rather than in the moment.',
  },
  2: {
    tagline: 'The capacity to think in multiple directions at once.',
    what: 'Cognitive flexibility is the ability to hold several perspectives simultaneously, update your thinking when new information arrives, and move fluidly between different mental models. It\'s the opposite of rigid, either/or thinking.',
    why: 'Rigid thinking is one of the most common causes of leadership blind spots. The world rarely fits the frameworks we already have. Cognitively flexible leaders can revise their assumptions, see the same situation from multiple angles, and avoid the trap of \'I already know how this works.\' In fast-moving environments, this is a survival skill.',
    high: 'You readily update your mental models, entertain contradictory ideas, and avoid black-and-white thinking. People likely experience you as open-minded and intellectually curious.',
    low: 'You may default to familiar frameworks even when the situation calls for fresh thinking — or find it uncomfortable when others challenge your interpretation of events.',
  },
  3: {
    tagline: 'Letting emotions inform you rather than run you.',
    what: 'Emotional regulation is the ability to manage your emotional responses — especially under pressure — so they serve your goals rather than derail them. This isn\'t about suppressing emotion; it\'s about processing it so you can respond wisely.',
    why: 'Emotions are contagious in teams. A leader who stays grounded under pressure creates psychological safety; one who doesn\'t spreads anxiety. Your emotional state directly shapes the emotional climate of the people around you. Leaders with strong emotional regulation make better decisions under stress, hold difficult conversations more effectively, and recover faster from setbacks.',
    high: 'You stay grounded under pressure and can experience emotional intensity without being controlled by it. Others likely experience you as steady and safe to bring problems to.',
    low: 'Emotional intensity may sometimes hijack your thinking or limit your presence in high-stakes moments. You might notice you regret things you said under pressure, or that you shut down when things get difficult.',
  },
  4: {
    tagline: 'Knowing what you stand for — and acting like it.',
    what: 'Values clarity is about knowing what you actually believe in — and more importantly, whether your decisions and day-to-day behaviour genuinely reflect those values. It\'s the alignment between your stated principles and your lived ones.',
    why: 'Values are the invisible architecture of leadership. When leaders act consistently with their values, they build deep trust. When there\'s a gap between what they say they value and how they actually behave, people notice — even if they can\'t articulate it. Values-clear leaders make faster decisions, attract aligned talent, and create cultures of integrity.',
    high: 'Your decisions are anchored by a clear internal compass. Others experience you as consistent and trustworthy — they know what you stand for because your behaviour demonstrates it.',
    low: 'You may hold values you believe in but haven\'t fully translated into consistent, visible behaviours. The gap between intention and action may be wider than you\'d like.',
  },
  5: {
    tagline: 'The quality of presence you bring to every interaction.',
    what: 'Relational mindset describes the intention and quality of attention you bring to your relationships — whether you genuinely seek to understand others, or primarily see people through the lens of what they can do for you.',
    why: 'Leadership happens in relationship. The way you listen, the assumptions you hold about people, and the quality of your presence in conversations directly shape team performance, trust, and psychological safety. Transactional leadership produces compliance; relational leadership produces commitment.',
    high: 'You approach relationships with genuine curiosity and care. People feel seen and heard by you, which builds loyalty and creates conditions where others do their best work.',
    low: 'Under pressure, you may shift into transactional mode — treating relationships as means to an end, or giving people less real attention than they need to feel genuinely valued.',
  },
  6: {
    tagline: 'Bouncing forward, not just back.',
    what: 'Adaptive resilience is the ability to sustain performance under sustained pressure, recover from setbacks, and find meaning in adversity rather than being destabilised by it. It\'s not toughness — it\'s flexibility under load.',
    why: 'Leadership is inherently uncertain, often difficult, and sometimes brutal. Resilient leaders don\'t just survive hard times — they model equanimity for their teams, make better decisions under stress, and treat difficulty as developmental. This profoundly affects team culture: teams take their cue from how leaders handle adversity.',
    high: 'You have strong internal resources for navigating difficulty. Setbacks tend to become learning rather than defeat, and you likely recover your equilibrium faster than most.',
    low: 'Sustained pressure may be depleting your capacity in ways that affect your thinking, your relationships, and your decision-making. Rest and recovery may not be getting the attention they need.',
  },
}

function getScoreBand(score: number): { label: string; description: string; colour: string } {
  if (score >= 90) return {
    label: 'Exceptional',
    description: 'This dimension is a genuine standout in your leadership. You\'re operating at a level that most leaders aspire to. The opportunity now is to leverage this strength intentionally — to model it for others, to mentor, and to consider where this capacity can have its greatest impact.',
    colour: '#00c9a7',
  }
  if (score >= 75) return {
    label: 'Strong',
    description: 'This is a real asset in your leadership toolkit. You demonstrate consistent capability here, and others likely notice and benefit from it. There\'s still meaningful depth to explore, but you\'re building from a position of genuine strength.',
    colour: '#0AF3CD',
  }
  if (score >= 60) return {
    label: 'Solid',
    description: 'You have meaningful capacity here — this isn\'t a gap, it\'s a foundation. With focused development, this dimension can become a genuine strength. The practices in your Daily Spark are well-suited to helping you build on what\'s already working.',
    colour: '#fdcb5e',
  }
  if (score >= 40) return {
    label: 'Developing',
    description: 'You\'re in the zone of active development here. The awareness itself is valuable — many leaders never see clearly where their edges are. This is where the most meaningful growth often happens, and your Daily Spark practices are specifically calibrated to support you here.',
    colour: '#ff9f43',
  }
  return {
    label: 'Growth area',
    description: 'This dimension represents a significant growth edge for you right now. That\'s not a judgement — it\'s a starting point. Leaders who develop in areas like this often describe it as unlocking something that was quietly limiting them for years. Your coaching and practices are focused here for good reason.',
    colour: '#ff7b7a',
  }
}

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
  const [dimModal,         setDimModal]         = useState<{ dimId: number; mode: 'about' | 'score' } | null>(null)

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
                        <button
                          onClick={() => setDimModal({ dimId: dim.id, mode: 'about' })}
                          className="text-xs font-medium text-left hover:underline"
                          style={{ color: isFocus ? dim.color : '#374151' }}
                        >
                          {dim.name}
                          {isFocus && (
                            <span className="ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full"
                                  style={{ backgroundColor: dim.bg, color: dim.color }}>
                              focus
                            </span>
                          )}
                        </button>
                      </div>
                      <button
                        onClick={() => score !== null && setDimModal({ dimId: dim.id, mode: 'score' })}
                        className="text-xs font-bold hover:opacity-70 transition-opacity"
                        style={{ color: dim.color, cursor: score !== null ? 'pointer' : 'default' }}
                      >
                        {score ?? '—'}
                      </button>
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
                Always personalised to you
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

      {/* ── Dimension modal ────────────────────────────────────────────────── */}
      {dimModal && assessment && (() => {
        const dim    = DIMS[dimModal.dimId - 1]
        const detail = DIM_DETAIL[dimModal.dimId]
        const score  = getDimScore(assessment, dimModal.dimId)
        const band   = score !== null ? getScoreBand(score) : null
        return (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            style={{ backgroundColor: 'rgba(10,46,42,0.55)', backdropFilter: 'blur(4px)' }}
            onClick={() => setDimModal(null)}
          >
            <div
              className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden"
              style={{ backgroundColor: 'white', maxHeight: '85vh' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Colour stripe header */}
              <div className="px-6 pt-5 pb-4 relative" style={{ backgroundColor: dim.bg }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: dim.color }} />
                    <div>
                      <p className="text-base font-bold" style={{ color: '#0A2E2A' }}>{dim.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#374151' }}>{detail.tagline}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDimModal(null)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-lg flex-shrink-0 ml-3"
                    style={{ backgroundColor: 'rgba(10,46,42,0.1)', color: '#0A2E2A' }}
                  >×</button>
                </div>

                {/* Tab switcher */}
                <div className="flex gap-2 mt-4">
                  {(['about', 'score'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setDimModal(m => m ? { ...m, mode: tab } : m)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                      style={dimModal.mode === tab
                        ? { backgroundColor: dim.color, color: '#0A2E2A' }
                        : { backgroundColor: 'rgba(10,46,42,0.08)', color: '#374151' }}
                    >
                      {tab === 'about' ? 'About this dimension' : `Your score: ${score ?? '—'}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div className="overflow-y-auto px-6 py-5 space-y-4" style={{ maxHeight: '55vh' }}>

                {dimModal.mode === 'about' && (
                  <>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9CA3AF' }}>What it is</p>
                      <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>{detail.what}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9CA3AF' }}>Why it matters in leadership</p>
                      <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>{detail.why}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl p-3.5" style={{ backgroundColor: '#F0FDF4' }}>
                        <p className="text-xs font-bold mb-1" style={{ color: '#059669' }}>When high</p>
                        <p className="text-xs leading-relaxed" style={{ color: '#374151' }}>{detail.high}</p>
                      </div>
                      <div className="rounded-2xl p-3.5" style={{ backgroundColor: '#FFF7ED' }}>
                        <p className="text-xs font-bold mb-1" style={{ color: '#D97706' }}>When low</p>
                        <p className="text-xs leading-relaxed" style={{ color: '#374151' }}>{detail.low}</p>
                      </div>
                    </div>
                  </>
                )}

                {dimModal.mode === 'score' && band && score !== null && (
                  <>
                    {/* Score display */}
                    <div className="flex items-center gap-4 rounded-2xl p-4" style={{ backgroundColor: dim.bg }}>
                      <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                           style={{ backgroundColor: dim.color }}>
                        <span className="text-2xl font-black" style={{ color: '#0A2E2A' }}>{score}</span>
                      </div>
                      <div>
                        <p className="text-base font-bold" style={{ color: '#0A2E2A' }}>{band.label}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          {[0,1,2,3,4].map(i => (
                            <div key={i} className="h-1.5 w-8 rounded-full"
                                 style={{ backgroundColor: score >= (i + 1) * 20 ? dim.color : '#E5E7EB' }} />
                          ))}
                        </div>
                        <p className="text-xs mt-1" style={{ color: '#6B7280' }}>out of 100</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9CA3AF' }}>What this means</p>
                      <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>{band.description}</p>
                    </div>

                    {/* Score scale */}
                    <div className="rounded-2xl p-4" style={{ backgroundColor: '#F9FAFB', border: '1px solid #F3F4F6' }}>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#9CA3AF' }}>Score guide</p>
                      {[
                        { range: '90–100', label: 'Exceptional', col: '#00c9a7' },
                        { range: '75–89',  label: 'Strong',      col: '#0AF3CD' },
                        { range: '60–74',  label: 'Solid',       col: '#fdcb5e' },
                        { range: '40–59',  label: 'Developing',  col: '#ff9f43' },
                        { range: '0–39',   label: 'Growth area', col: '#ff7b7a' },
                      ].map(row => (
                        <div key={row.range} className="flex items-center gap-2.5 mb-2 last:mb-0">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: row.col }} />
                          <span className="text-xs w-14 flex-shrink-0" style={{ color: '#6B7280' }}>{row.range}</span>
                          <span className="text-xs font-medium" style={{ color: score >= parseInt(row.range) ? '#0A2E2A' : '#9CA3AF',
                            fontWeight: score >= parseInt(row.range) && score <= parseInt(row.range.split('–')[1] ?? '100') ? 700 : 500 }}>
                            {row.label}
                          </span>
                          {score >= parseInt(row.range) && score <= parseInt(row.range.split('–')[1] ?? '100') && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full font-bold ml-auto"
                                  style={{ backgroundColor: dim.bg, color: dim.color }}>you</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}

              </div>
            </div>
          </div>
        )
      })()}

    </main>
  )
}
