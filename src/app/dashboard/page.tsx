'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import CoachingRoom from '@/components/CoachingRoom'
import MQBuilder from '@/components/MQBuilder'
import DailySpark from '@/components/DailySpark'
import MQOnboarding, { shouldShowOnboarding, resetOnboarding } from '@/components/MQOnboarding'
import Notes from '@/components/Notes'
import FeedbackSection from '@/components/FeedbackSection'

// ── Dimension config ───────────────────────────────────────────────────────────

const DIMS = [
  { id: 1, name: 'Self-awareness',        color: '#fdcb5e', bg: '#FEF5D9' },
  { id: 2, name: 'Ego & identity',        color: '#EC4899', bg: '#FCE7F3' },
  { id: 3, name: 'Emotional regulation',  color: '#ff7b7a', bg: '#FFE8E8' },
  { id: 4, name: 'Cognitive flexibility', color: '#ff9f43', bg: '#FFF0E0' },
  { id: 5, name: 'Values & purpose',      color: '#00c9a7', bg: '#D4F5EF' },
  { id: 6, name: 'Relational mindset',    color: '#2d4a8a', bg: '#E0E6F5' },
  { id: 7, name: 'Adaptive resilience',   color: '#a78bfa', bg: '#EDE9FE' },
]

const DIM_DETAIL: Record<number, {
  tagline: string
  what: string
  why: string
  high: string
  low: string
}> = {
  1: {
    tagline: 'The ability to see yourself clearly in real time.',
    what: 'Self-awareness is the capacity to notice your own thoughts, feelings, assumptions and behavioural patterns as they arise, without being swept along by them. It\'s the internal observer that watches how you\'re showing up.',
    why: 'Leaders who lack self-awareness act on unconscious biases, react impulsively under pressure, and misread how they\'re landing on others. Self-aware leaders can pause before reacting, understand what\'s driving them, and choose how to respond rather than defaulting to autopilot. Research consistently shows self-awareness as one of the strongest predictors of leadership effectiveness.',
    high: 'You have a strong internal observer. You notice patterns in your thinking, catch your own triggers before they escalate, and tend to seek honest feedback rather than avoid it.',
    low: 'You may find yourself reacting before you\'ve had a chance to choose your response, or discovering your impact on others after the fact rather than in the moment.',
  },
  2: {
    tagline: 'Leading from strength, not from the need for approval.',
    what: 'Ego & identity describes the degree to which your leadership is driven by genuine values versus by the unconscious need to protect your image, status, or sense of self. It\'s the difference between leading from strength and leading from fear of looking bad.',
    why: 'When ego needs are running the show, leaders defend bad decisions, avoid feedback, over-control their teams, and struggle to acknowledge mistakes. The research is clear: psychological ego defences are one of the most common — and least examined — causes of poor leadership. Leaders who have done this work lead with far greater openness, courage, and authenticity.',
    high: 'You lead from a relatively secure sense of self. You can receive feedback without becoming defensive, admit mistakes without it threatening your identity, and share credit without feeling diminished.',
    low: 'You may notice a pull towards protecting your image in certain situations — perhaps avoiding feedback, over-explaining mistakes, or becoming defensive when challenged. This is normal, and it\'s the most important edge to develop.',
  },
  3: {
    tagline: 'Letting emotions inform you rather than run you.',
    what: 'Emotional regulation is the ability to manage your emotional responses (especially under pressure) so they serve your goals rather than derail them. This isn\'t about suppressing emotion; it\'s about processing it so you can respond wisely.',
    why: 'Emotions are contagious in teams. A leader who stays grounded under pressure creates psychological safety; one who doesn\'t spreads anxiety. Your emotional state directly shapes the emotional climate of the people around you. Leaders with strong emotional regulation make better decisions under stress, hold difficult conversations more effectively, and recover faster from setbacks.',
    high: 'You stay grounded under pressure and can experience emotional intensity without being controlled by it. Others likely experience you as steady and safe to bring problems to.',
    low: 'Emotional intensity may sometimes hijack your thinking or limit your presence in high-stakes moments. You might notice you regret things you said under pressure, or that you shut down when things get difficult.',
  },
  4: {
    tagline: 'The capacity to think in multiple directions at once.',
    what: 'Cognitive flexibility is the ability to hold several perspectives simultaneously, update your thinking when new information arrives, and move fluidly between different mental models. It\'s the opposite of rigid, either/or thinking.',
    why: 'Rigid thinking is one of the most common causes of leadership blind spots. The world rarely fits the frameworks we already have. Cognitively flexible leaders can revise their assumptions, see the same situation from multiple angles, and avoid the trap of \'I already know how this works.\' In fast-moving environments, this is a survival skill.',
    high: 'You readily update your mental models, entertain contradictory ideas, and avoid black-and-white thinking. People likely experience you as open-minded and intellectually curious.',
    low: 'You may default to familiar frameworks even when the situation calls for fresh thinking, or find it uncomfortable when others challenge your interpretation of events.',
  },
  5: {
    tagline: 'Knowing what you stand for — and where you\'re going.',
    what: 'Values & purpose is about knowing what you genuinely believe in and having a clear sense of direction that motivates your leadership beyond personal gain. It\'s the alignment between your stated principles, your lived behaviour, and your sense of meaningful contribution.',
    why: 'Purpose-driven leaders make faster decisions, sustain their energy through difficulty, attract aligned talent, and create cultures of integrity. Values are the invisible architecture of leadership: when they\'re clear and consistently acted on, people feel they can trust you. When there\'s a gap between what you say you value and how you behave under pressure, people notice — even if they can\'t articulate it.',
    high: 'Your decisions are anchored by a clear internal compass and a sense of what you\'re building. Others experience you as consistent and trustworthy; they know what you stand for because your behaviour demonstrates it.',
    low: 'You may hold values you believe in but haven\'t fully translated into consistent, visible behaviour. Or your day-to-day work may feel disconnected from a larger sense of purpose. The gap between intention and action may be wider than you\'d like.',
  },
  6: {
    tagline: 'The quality of presence you bring to every interaction.',
    what: 'Relational mindset describes the intention and quality of attention you bring to your relationships, whether you genuinely seek to understand others, or primarily see people through the lens of what they can do for you.',
    why: 'Leadership happens in relationship. The way you listen, the assumptions you hold about people, and the quality of your presence in conversations directly shape team performance, trust, and psychological safety. Transactional leadership produces compliance; relational leadership produces commitment.',
    high: 'You approach relationships with genuine curiosity and care. People feel seen and heard by you, which builds loyalty and creates conditions where others do their best work.',
    low: 'Under pressure, you may shift into transactional mode, treating relationships as means to an end, or giving people less real attention than they need to feel genuinely valued.',
  },
  7: {
    tagline: 'Bouncing forward, not just back.',
    what: 'Adaptive resilience is the ability to sustain performance under sustained pressure, recover from setbacks, and find meaning in adversity rather than being destabilised by it. It\'s not toughness; it\'s flexibility under load.',
    why: 'Leadership is inherently uncertain, often difficult, and sometimes brutal. Resilient leaders don\'t just survive hard times; they model equanimity for their teams, make better decisions under stress, and treat difficulty as developmental. This profoundly affects team culture: teams take their cue from how leaders handle adversity.',
    high: 'You have strong internal resources for navigating difficulty. Setbacks tend to become learning rather than defeat, and you likely recover your equilibrium faster than most.',
    low: 'Sustained pressure may be depleting your capacity in ways that affect your thinking, your relationships, and your decision-making. Rest and recovery may not be getting the attention they need.',
  },
}

function getScoreBand(score: number): { label: string; description: string; colour: string } {
  if (score >= 90) return {
    label: 'Exceptional',
    description: 'This dimension is a genuine standout in your leadership. You\'re operating at a level that most leaders aspire to. The opportunity now is to leverage this strength intentionally: model it for others, mentor, and consider where this capacity can have its greatest impact.',
    colour: '#00c9a7',
  }
  if (score >= 75) return {
    label: 'Strong',
    description: 'This is a real asset in your leadership toolkit. You demonstrate consistent capability here, and others likely notice and benefit from it. There\'s still meaningful depth to explore, but you\'re building from a position of genuine strength.',
    colour: '#0AF3CD',
  }
  if (score >= 60) return {
    label: 'Solid',
    description: 'You\'re already performing well here — this is a genuine strength. With a little more intentional focus, this dimension has the potential to become one of your standout superpowers. The practices in your Daily Spark are well-suited to helping you take it to the next level.',
    colour: '#fdcb5e',
  }
  if (score >= 40) return {
    label: 'Developing',
    description: 'You\'re in the zone of active development here. The awareness itself is valuable; many leaders never see clearly where their edges are. This is where the most meaningful growth often happens, and your Daily Spark practices are specifically calibrated to support you here.',
    colour: '#ff9f43',
  }
  return {
    label: 'Growth area',
    description: 'This dimension represents a significant growth opportunity for you right now. That\'s not a judgement — it\'s a starting point. Leaders who develop in areas like this often describe it as unlocking something that was quietly limiting them for years. Your coaching and practices are focused here for good reason.',
    colour: '#ff7b7a',
  }
}

function getOverallScoreDescription(score: number): string {
  if (score >= 90) return 'Your MQ profile reflects exceptional inner leadership capacity. You demonstrate deep self-awareness, strong emotional regulation and the ability to lead from your values under pressure. The opportunity now is to leverage this intentionally — modelling it for others and using it to create lasting impact around you.'
  if (score >= 75) return 'Your MQ profile reflects strong inner leadership capacity. You demonstrate consistent self-awareness, emotional stability and purposeful leadership across the board. With continued focus, you have the foundations to lead exceptionally well — and to build those capacities in the people around you.'
  if (score >= 60) return 'Your MQ profile shows real capability — you\'re already leading with meaningful self-awareness and intentionality. With focused development across your profile, you have strong potential to take your inner leadership capacity to the next level. Your Daily Spark practices are calibrated to help you do exactly that.'
  if (score >= 40) return 'Your MQ profile shows you\'re actively developing your inner leadership capacity. The awareness you now have of where you are is genuinely valuable — many leaders never see their profile clearly. This is where the most meaningful growth happens, and your practices are specifically calibrated to support you.'
  return 'Your MQ profile highlights real opportunities to develop your inner leadership capacity. This is an honest starting point — and the most valuable kind. The awareness you\'re building now is the foundation for everything that follows. Your Daily Spark practices are designed to help you build from here.'
}

// ── Types ──────────────────────────────────────────────────────────────────────

const REASSESS_DAYS = 30

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
  const scores = [a.d1_score, a.d2_score, a.d3_score, a.d4_score, a.d5_score, a.d6_score, a.d7_score]
  const valid  = scores.map((s, i) => ({ s: s ?? 999, i }))
  valid.sort((a, b) => a.s - b.s)
  return valid[0].i + 1
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

function daysSince(dateStr: string | null): number {
  if (!dateStr) return 0
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

// ── Logo component ─────────────────────────────────────────────────────────────

function MQLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const [logoError, setLogoError] = useState(false)
  const dims = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-20 h-20' : 'w-14 h-14'
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

// ── Daily quote ────────────────────────────────────────────────────────────────

const DAILY_QUOTES = [
  { text: 'Between stimulus and response there is a space. In that space is our power to choose our response.', author: 'Viktor Frankl' },
  { text: 'You cannot manage others well if you cannot manage yourself.', author: 'Peter Drucker' },
  { text: 'The most common form of despair is not being who you are.', author: 'Søren Kierkegaard' },
  { text: 'Leadership is not about being in charge. It is about taking care of those in your charge.', author: 'Simon Sinek' },
  { text: 'What lies behind us and what lies before us are tiny matters compared to what lies within us.', author: 'Ralph Waldo Emerson' },
  { text: 'The quality of your thinking determines the quality of your leadership.', author: 'MQ' },
  { text: 'Knowing yourself is the beginning of all wisdom.', author: 'Aristotle' },
  { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein' },
  { text: 'Great leaders don\'t set out to be a leader. They set out to make a difference.', author: 'Lisa Haisha' },
  { text: 'The mind is everything. What you think, you become.', author: 'Buddha' },
  { text: 'An unexamined life is not worth living.', author: 'Socrates' },
  { text: 'Your values are the architecture of your leadership. Build them consciously.', author: 'MQ' },
  { text: 'It is not the strongest species that survives, nor the most intelligent — it is the most adaptable.', author: 'Charles Darwin' },
  { text: 'People don\'t care how much you know until they know how much you care.', author: 'Theodore Roosevelt' },
  { text: 'The measure of intelligence is the ability to change.', author: 'Albert Einstein' },
  { text: 'Do not wait for extraordinary circumstances to do good; try to use ordinary situations.', author: 'Jean Paul Richter' },
  { text: 'Clarity is kindness. The clearest thing you can do for someone is tell them the truth, well.', author: 'MQ' },
  { text: 'We cannot solve our problems with the same thinking we used when we created them.', author: 'Albert Einstein' },
  { text: 'The curious paradox is that when I accept myself just as I am, then I can change.', author: 'Carl Rogers' },
  { text: 'Resilience is not about bouncing back to where you were. It\'s about growing forward.', author: 'MQ' },
  { text: 'Being nice avoids discomfort. Being kind does what the person actually needs. They are not always the same thing.', author: 'MQ' },
  { text: 'To lead people, walk beside them.', author: 'Lao Tzu' },
  { text: 'Almost everything will work again if you unplug it for a few minutes — including you.', author: 'Anne Lamott' },
  { text: 'The privilege of a lifetime is to become who you truly are.', author: 'Carl Jung' },
  { text: 'Leadership is practised not so much in words as in attitude and in actions.', author: 'Harold S. Geneen' },
  { text: 'You manage things; you lead people.', author: 'Grace Murray Hopper' },
  { text: 'Strength does not come from physical capacity. It comes from an indomitable will.', author: 'Mahatma Gandhi' },
  { text: 'The real voyage of discovery consists not in seeking new landscapes, but in having new eyes.', author: 'Marcel Proust' },
  { text: 'A good leader takes a little more than their share of the blame and a little less than their share of the credit.', author: 'Arnold H. Glasow' },
  { text: 'Mindset is the lens through which everything is filtered. Choose it carefully.', author: 'MQ' },
  { text: 'Between who you are and who you could be lies the work you are willing to do on yourself.', author: 'MQ' },
]

function getDailyQuote() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length]
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function ParticipantDashboard() {
  const supabase = createClient()

  const [loading,           setLoading]          = useState(true)
  const [profile,           setProfile]          = useState<{ id: string; full_name: string | null; email: string } | null>(null)
  const [assessment,        setAssessment]       = useState<Assessment | null>(null)
  const [prevAssessment,    setPrevAssessment]   = useState<Assessment | null>(null)
  const [showCoachingRoom,  setShowCoachingRoom] = useState(false)
  const [showMQBuilder,     setShowMQBuilder]    = useState(false)
  const [showNotes,         setShowNotes]        = useState(false)
  const [mqBuilderDimId,    setMQBuilderDimId]   = useState<number | undefined>(undefined)
  const [showOnboarding,    setShowOnboarding]   = useState(false)
  const [authToken,         setAuthToken]        = useState<string | null>(null)
  const [dimModal,          setDimModal]         = useState<{ dimId: number; mode: 'about' | 'score' } | null>(null)
  const [showMQModal,       setShowMQModal]      = useState(false)
  const [valuesStatus,      setValuesStatus]     = useState<{ total: number; rated: number; avgRating: number } | null>(null)
  const [showEditProfile,   setShowEditProfile]  = useState(false)
  const [editJobTitle,      setEditJobTitle]     = useState('')
  const [editCompanyType,   setEditCompanyType]  = useState('')
  const [editSaving,        setEditSaving]       = useState(false)
  const [editSaved,         setEditSaved]        = useState(false)

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
      .select('overall_score, d1_score, d2_score, d3_score, d4_score, d5_score, d6_score, d7_score, completed_at, participant_role, job_title, company_type')
      .eq('participant_id', authSession.user.id)
      .not('overall_score', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(2)

    if (assessments?.[0]) setAssessment(assessments[0])
    if (assessments?.[1]) setPrevAssessment(assessments[1])

    // Fetch values check-in status
    try {
      const valuesRes = await fetch('/api/values-checkin', {
        headers: { Authorization: `Bearer ${authSession.access_token}` },
      })
      if (valuesRes.ok) {
        const { values, ratings } = await valuesRes.json()
        if (values && values.length > 0) {
          let total = 0
          let rated = 0
          let ratingSum = 0
          for (const v of values) {
            const behaviours = (v.behaviours as string[]) ?? []
            total += behaviours.length
            for (let i = 0; i < behaviours.length; i++) {
              const r = ratings[`${v.id}_${i}`]
              if (r) { rated++; ratingSum += r.rating }
            }
          }
          if (total > 0) setValuesStatus({ total, rated, avgRating: rated > 0 ? ratingSum / rated : 0 })
        }
      }
    } catch { /* no values data */ }

    setLoading(false)
  }, [supabase])

  useEffect(() => { loadData() }, [loadData])
  useEffect(() => { setShowOnboarding(shouldShowOnboarding()) }, [])

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  function openEditProfile() {
    setEditJobTitle(assessment?.job_title ?? '')
    setEditCompanyType(assessment?.company_type ?? '')
    setEditSaved(false)
    setShowEditProfile(true)
  }

  async function saveEditProfile() {
    if (!profile) return
    setEditSaving(true)
    // Get the ID of the most recent completed assessment
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
    // Reload assessment data so UI reflects the change
    await loadData()
    setEditSaving(false)
    setEditSaved(true)
    setTimeout(() => setShowEditProfile(false), 900)
  }

  const firstName       = getFirstName(profile?.full_name ?? null, profile?.email)
  const journeyDay      = getJourneyDay(assessment?.completed_at ?? null)
  const focusDimId      = assessment ? getFocusDimension(assessment) : 1
  const focusDim        = DIMS[focusDimId - 1]
  const dailyQuote      = getDailyQuote()
  const daysSinceAssess = daysSince(assessment?.completed_at ?? null)
  const canReassess     = assessment !== null && daysSinceAssess >= REASSESS_DAYS
  const daysToReassess  = assessment ? Math.max(0, REASSESS_DAYS - daysSinceAssess) : 0
  const overallDelta    = assessment && prevAssessment
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

  // ── Home ────────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F4FDF9' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ backgroundColor: '#0A2E2A' }}>
        <div className="absolute top-0 right-0 w-64 h-32 rounded-full blur-3xl pointer-events-none"
             style={{ backgroundColor: 'rgba(10,243,205,0.07)' }} />
        <div className="absolute bottom-0 left-1/4 w-32 h-16 rounded-full blur-2xl pointer-events-none"
             style={{ backgroundColor: 'rgba(5,168,142,0.1)' }} />
        <div className="relative max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MQLogo size="md" />
            <div>
              <h1 className="text-lg font-bold leading-tight" style={{ color: 'white' }}>
                {getGreeting()}, {firstName}.
              </h1>
              <p className="text-xs mt-1 italic leading-snug" style={{ color: 'rgba(185,248,221,0.75)', maxWidth: 520 }}>
                "{dailyQuote.text}"
                <span className="not-italic font-semibold ml-1" style={{ color: 'rgba(185,248,221,0.5)' }}>
                  — {dailyQuote.author}
                </span>
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <button
              onClick={() => { resetOnboarding(); setShowOnboarding(true) }}
              className="text-xs px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity"
              style={{ color: '#B9F8DD', border: '1px solid rgba(185,248,221,0.25)' }}
            >
              MQ intro
            </button>
            {assessment && (
              <button
                onClick={openEditProfile}
                className="text-xs px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity"
                style={{ color: '#B9F8DD', border: '1px solid rgba(185,248,221,0.25)' }}
              >
                Edit profile
              </button>
            )}
            <button
              onClick={signOut}
              className="text-xs px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity"
              style={{ color: '#B9F8DD', border: '1px solid rgba(185,248,221,0.25)' }}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">

        {/* ── No assessment ────────────────────────────────────────────────── */}
        {!assessment && (
          <div className="max-w-2xl mx-auto rounded-2xl p-6 text-center" style={{ ...cardStyle, border: '2px solid #0AF3CD' }}>
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

        {/* ── MQ Score card — mobile only (shown above grid) ───────────────── */}
        {assessment && (
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setShowMQModal(true)}
              className="w-full rounded-2xl overflow-hidden hover:opacity-90 transition-opacity relative"
              style={{ background: 'linear-gradient(135deg, #0A2E2A 0%, #0d3830 100%)', boxShadow: '0 4px 20px rgba(10,46,42,0.2)' }}
            >
              {(() => {
                const cx = 55, cy = 55, maxR = 43
                const scores = [1,2,3,4,5,6].map(id => getDimScore(assessment, id))
                const angles = [-90, -30, 30, 90, 150, 210].map(a => a * Math.PI / 180)
                const gridLevels = [0.33, 0.66, 1.0]
                const gridPaths = gridLevels.map(level =>
                  angles.map(a => `${cx + maxR * level * Math.cos(a)},${cy + maxR * level * Math.sin(a)}`).join(' ')
                )
                const scorePts = scores.map((s, i) => {
                  const r = ((s ?? 50) / 100) * maxR
                  return `${cx + r * Math.cos(angles[i])},${cy + r * Math.sin(angles[i])}`
                }).join(' ')
                const dotColours = ['#fdcb5e','#ff9f43','#ff7b7a','#00c9a7','#7ba3ea','#a78bfa']
                return (
                  <svg style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', filter: 'drop-shadow(0 0 8px rgba(10,243,205,0.35))' }}
                       width="110" height="110" viewBox="0 0 110 110" fill="none">
                    {gridPaths.map((pts, i) => (
                      <polygon key={i} points={pts} stroke={`rgba(10,243,205,${0.1 + i * 0.07})`} strokeWidth="0.75" fill="none" />
                    ))}
                    {angles.map((a, i) => (
                      <line key={i} x1={cx} y1={cy} x2={cx + maxR * Math.cos(a)} y2={cy + maxR * Math.sin(a)} stroke="rgba(10,243,205,0.12)" strokeWidth="0.75" />
                    ))}
                    <polygon points={scorePts} fill="rgba(10,243,205,0.18)" stroke="rgba(10,243,205,0.75)" strokeWidth="1.5" strokeLinejoin="round" />
                    {scores.map((s, i) => {
                      const r = ((s ?? 50) / 100) * maxR
                      return <circle key={i} cx={cx + r * Math.cos(angles[i])} cy={cy + r * Math.sin(angles[i])} r="3" fill={dotColours[i]} />
                    })}
                  </svg>
                )
              })()}
              <div className="relative z-10 p-5 flex items-center gap-5">
                <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#0AF3CD' }}>
                  <span className="text-2xl font-black" style={{ color: '#0A2E2A' }}>{assessment.overall_score ?? '—'}</span>
                </div>
                <div className="text-left">
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
                  <p className="text-xs mt-1" style={{ color: 'rgba(185,248,221,0.5)', textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: '3px' }}>what does this mean?</p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* ── Two-column layout (desktop) / single column (mobile) ─────────── */}
        {assessment && (
          <div className="lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start space-y-4 lg:space-y-0">

          {/* ── LEFT COLUMN ──────────────────────────────────────────────── */}
          <div className="space-y-4">

        {/* ── Daily Spark ──────────────────────────────────────────────────── */}
        {authToken && (
          <DailySpark token={authToken} onOpenCoachingRoom={() => setShowCoachingRoom(true)} />
        )}

        {/* ── AI Coaching (unified tile) ────────────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden"
             style={{ backgroundColor: 'white', border: '1px solid #D1FAE5', boxShadow: '0 2px 12px rgba(10,46,42,0.07)' }}>
          {/* Header */}
          <div className="px-5 py-3 flex items-center gap-2" style={{ backgroundColor: '#E8FDF7', borderBottom: '1px solid #D1FAE5' }}>
            <span className="text-base">🤖</span>
            <p className="text-sm font-bold" style={{ color: '#0A2E2A' }}>AI Coaching</p>
          </div>
          {/* Three options */}
          <div className="divide-y" style={{ borderColor: '#F3F4F6' }}>
            {/* Coaching Room */}
            <div className="px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">💬</span>
                <div>
                  <p className="text-xs font-bold" style={{ color: '#0A2E2A' }}>The Coaching Room</p>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>Any challenge or situation</p>
                </div>
              </div>
              <button
                onClick={() => setShowCoachingRoom(true)}
                className="text-xs px-3 py-1.5 rounded-lg font-bold flex-shrink-0 ml-3 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}
              >
                Open →
              </button>
            </div>
            {/* MQ Builder */}
            <div className="px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">🧠</span>
                <div>
                  <p className="text-xs font-bold" style={{ color: '#0A2E2A' }}>MQ Builder</p>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>Develop your 7 MQ dimensions</p>
                </div>
              </div>
              <button
                onClick={() => setShowMQBuilder(true)}
                className="text-xs px-3 py-1.5 rounded-lg font-bold flex-shrink-0 ml-3 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#a78bfa', color: '#0A2E2A' }}
              >
                Open →
              </button>
            </div>
            {/* Culture Lab */}
            <div className="px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">🧪</span>
                <div>
                  <p className="text-xs font-bold" style={{ color: '#0A2E2A' }}>Culture Lab</p>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>Build a high-performing team culture</p>
                </div>
              </div>
              <a
                href="/dashboard/culture-lab"
                className="text-xs px-3 py-1.5 rounded-lg font-bold flex-shrink-0 ml-3 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#F59E0B', color: '#0A2E2A' }}
              >
                Open →
              </a>
            </div>
          </div>
        </div>

        {/* ── Resource Centre + Notes (compact) ────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden"
             style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}>
          <a
            href="/dashboard/resources"
            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
            style={{ borderBottom: '1px solid #F3F4F6' }}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">📚</span>
              <p className="text-xs font-semibold" style={{ color: '#0A2E2A' }}>Resource Centre</p>
              <span className="text-xs" style={{ color: '#9CA3AF' }}>25 guides</span>
            </div>
            <span className="text-xs" style={{ color: '#9CA3AF' }}>Browse →</span>
          </a>
          <button
            onClick={() => setShowNotes(true)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">📓</span>
              <p className="text-xs font-semibold" style={{ color: '#0A2E2A' }}>My Notes</p>
              <span className="text-xs" style={{ color: '#9CA3AF' }}>Private journal</span>
            </div>
            <span className="text-xs" style={{ color: '#9CA3AF' }}>Open →</span>
          </button>
        </div>

          </div>{/* end left column */}

          {/* ── RIGHT COLUMN ─────────────────────────────────────────────── */}
          <div className="space-y-4">

        {/* ── MQ Score card — desktop only (hidden on mobile, shown in right column) */}
        <div className="hidden lg:block">
          <div className="rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(10,46,42,0.2)' }}>
          <button
            onClick={() => setShowMQModal(true)}
            className="w-full overflow-hidden hover:opacity-90 transition-opacity relative"
            style={{ background: 'linear-gradient(135deg, #0A2E2A 0%, #0d3830 100%)' }}
          >
            {/* Mini radar chart — user's actual 7-dimension profile */}
            {(() => {
              const cx = 55, cy = 55, maxR = 43
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
                <svg
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none',
                           filter: 'drop-shadow(0 0 8px rgba(10,243,205,0.35))' }}
                  width="110" height="110" viewBox="0 0 110 110" fill="none"
                >
                  {/* Grid rings */}
                  {gridPaths.map((pts, i) => (
                    <polygon key={i} points={pts}
                             stroke={`rgba(10,243,205,${0.1 + i * 0.07})`} strokeWidth="0.75" fill="none" />
                  ))}
                  {/* Axis spokes */}
                  {angles.map((a, i) => (
                    <line key={i} x1={cx} y1={cy}
                          x2={cx + maxR * Math.cos(a)} y2={cy + maxR * Math.sin(a)}
                          stroke="rgba(10,243,205,0.12)" strokeWidth="0.75" />
                  ))}
                  {/* Score area */}
                  <polygon points={scorePts} fill="rgba(10,243,205,0.18)" stroke="rgba(10,243,205,0.75)" strokeWidth="1.5" strokeLinejoin="round" />
                  {/* Dimension dots */}
                  {scores.map((s, i) => {
                    const r = ((s ?? 50) / 100) * maxR
                    return (
                      <circle key={i}
                              cx={cx + r * Math.cos(angles[i])}
                              cy={cy + r * Math.sin(angles[i])}
                              r="3" fill={dotColours[i]} />
                    )
                  })}
                </svg>
              )
            })()}
            <div className="relative z-10 p-5 flex items-center gap-5">
              <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                   style={{ backgroundColor: '#0AF3CD' }}>
                <span className="text-2xl font-black" style={{ color: '#0A2E2A' }}>
                  {assessment.overall_score ?? '—'}
                </span>
              </div>
              <div className="text-left">
                <p className="text-base font-black" style={{ color: 'white' }}>MQ Score</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-sm font-semibold" style={{ color: '#0AF3CD' }}>{getScoreBand(assessment.overall_score ?? 0).label}</p>
                  {overallDelta !== null && overallDelta !== 0 && (
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: overallDelta > 0 ? 'rgba(209,250,229,0.2)' : 'rgba(254,226,226,0.2)',
                            color: overallDelta > 0 ? '#6EE7B7' : '#FCA5A5',
                          }}>
                      {overallDelta > 0 ? '+' : ''}{overallDelta}
                    </span>
                  )}
                </div>
                <p className="text-xs mt-1" style={{ color: 'rgba(185,248,221,0.5)', textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: '3px' }}>what does this mean?</p>
              </div>
            </div>
          </button>
          {/* Report + Reassess — tucked into card footer */}
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
              <span className="text-xs" style={{ color: 'rgba(185,248,221,0.4)' }}>
                Reassess in {daysToReassess}d
              </span>
            )}
          </div>
          </div>
        </div>

        {/* ── MQ profile bars ───────────────────────────────────────────────── */}
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
                          className="text-xs font-medium text-left flex items-center gap-1"
                          style={{ color: isFocus ? dim.color : '#374151', textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: '3px', textDecorationColor: isFocus ? dim.color : '#9CA3AF' }}
                        >
                          {dim.name}
                          {isFocus && (
                            <span className="ml-1 text-xs font-bold px-1.5 py-0.5 rounded-full"
                                  style={{ backgroundColor: dim.bg, color: dim.color }}>
                              focus
                            </span>
                          )}
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {(() => {
                          const delta = getDelta(assessment, prevAssessment, dim.id)
                          if (delta === null || delta === 0) return null
                          return (
                            <span className="text-xs font-bold px-1 py-0.5 rounded-full"
                                  style={{
                                    backgroundColor: delta > 0 ? '#D1FAE5' : '#FEE2E2',
                                    color: delta > 0 ? '#065F46' : '#991B1B',
                                    fontSize: '10px',
                                  }}>
                              {delta > 0 ? '+' : ''}{delta}
                            </span>
                          )
                        })()}
                        <button
                          onClick={() => score !== null && setDimModal({ dimId: dim.id, mode: 'score' })}
                          className="text-xs font-bold flex items-center gap-0.5"
                          style={{ color: dim.color, cursor: score !== null ? 'pointer' : 'default', textDecoration: score !== null ? 'underline' : 'none', textDecorationStyle: 'dotted', textUnderlineOffset: '3px', textDecorationColor: dim.color }}
                        >
                          {score ?? '—'}
                        </button>
                      </div>
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

        {/* ── Values in Action card ────────────────────────────────────────── */}
        {valuesStatus && valuesStatus.total > 0 && (() => {
          const { total, rated, avgRating } = valuesStatus
          const isComplete  = rated === total
          const isStarted   = rated > 0
          const ratingLabel = avgRating >= 3.5 ? 'Consistently' : avgRating >= 2.5 ? 'Usually' : avgRating >= 1.5 ? 'Sometimes' : 'Rarely'
          const statusText  = !isStarted  ? 'Rate how your behaviours reflect your company values'
                            : !isComplete ? `${rated} of ${total} behaviours rated`
                            : `All ${total} behaviours rated`
          const ctaText     = !isStarted ? 'Start →' : 'Update →'
          return (
            <a
              href="/dashboard/values"
              className="w-full rounded-2xl p-5 flex items-center justify-between hover:opacity-90 transition-opacity relative overflow-hidden"
              style={{ backgroundColor: 'white', border: '1px solid #E8FDF7', boxShadow: '0 2px 12px rgba(10,46,42,0.06)' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                     style={{ backgroundColor: '#EDE9FE' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#0A2E2A' }}>Values in Action</p>
                  <p className="text-xs mt-0.5" style={{ color: isComplete ? '#a78bfa' : '#9CA3AF' }}>
                    {statusText}
                  </p>
                  {isStarted && !isComplete && (
                    <div className="mt-1.5 h-1.5 rounded-full overflow-hidden w-32" style={{ backgroundColor: '#EDE9FE' }}>
                      <div className="h-full rounded-full" style={{ width: `${(rated / total) * 100}%`, backgroundColor: '#a78bfa' }} />
                    </div>
                  )}
                </div>
              </div>
              <span className="text-sm font-semibold flex-shrink-0 ml-3" style={{ color: '#a78bfa' }}>{ctaText}</span>
            </a>
          )
        })()}

        {/* ── 360 Feedback ─────────────────────────────────────────────────── */}
        {authToken && assessment && (
          <FeedbackSection
            token={authToken}
            selfScores={[
              assessment.d1_score, assessment.d2_score, assessment.d3_score,
              assessment.d4_score, assessment.d5_score, assessment.d6_score,
              assessment.d7_score,
            ]}
          />
        )}

          </div>
          </div>
        )}

      </div>

      {/* ── MQ Score modal ─────────────────────────────────────────────────── */}
      {showMQModal && assessment && (() => {
        const score = assessment.overall_score ?? 0
        const band  = getScoreBand(score)
        return (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            style={{ backgroundColor: 'rgba(10,46,42,0.55)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowMQModal(false)}
          >
            <div
              className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden"
              style={{ backgroundColor: 'white', maxHeight: '85vh' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 pt-5 pb-4" style={{ background: 'linear-gradient(135deg, #0A2E2A, #0d3830)' }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#0AF3CD' }}>Your result</p>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                           style={{ backgroundColor: '#0AF3CD' }}>
                        <span className="text-2xl font-black" style={{ color: '#0A2E2A' }}>{score}</span>
                      </div>
                      <div>
                        <p className="text-xl font-black" style={{ color: 'white' }}>MQ Score</p>
                        <p className="text-sm font-semibold" style={{ color: '#0AF3CD' }}>{band.label}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMQModal(false)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-lg flex-shrink-0 ml-3"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}
                  >×</button>
                </div>
              </div>

              {/* Body */}
              <div className="overflow-y-auto px-6 py-5 space-y-4" style={{ maxHeight: '60vh' }}>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9CA3AF' }}>What is MQ?</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                    MQ — Mindset Quotient — measures your capacity to notice your own thoughts, beliefs and emotional patterns, and to consciously choose how you respond rather than being driven by them automatically. It's the foundation of self-directed, effective leadership.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9CA3AF' }}>What your score means</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>{getOverallScoreDescription(score)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#9CA3AF' }}>Your dimension breakdown</p>
                  <div className="space-y-2">
                    {DIMS.map(dim => {
                      const s = getDimScore(assessment, dim.id)
                      return (
                        <div key={dim.id} className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 w-36 flex-shrink-0">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dim.color }} />
                            <span className="text-xs" style={{ color: '#374151' }}>{dim.name}</span>
                          </div>
                          <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: '#F3F4F6' }}>
                            <div className="h-2 rounded-full" style={{ width: s !== null ? `${s}%` : '0%', backgroundColor: dim.color }} />
                          </div>
                          <span className="text-xs font-bold w-6 text-right flex-shrink-0" style={{ color: '#374151' }}>{s ?? '—'}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
                {/* Score guide */}
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
                      <span className="text-xs font-medium" style={{ color: '#374151' }}>{row.label}</span>
                      {score >= parseInt(row.range) && score <= parseInt(row.range.split('–')[1] ?? '100') && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full font-bold ml-auto"
                              style={{ backgroundColor: '#E8FDF7', color: '#05A88E' }}>you</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Coaching Room overlay ──────────────────────────────────────────── */}
      {showCoachingRoom && authToken && (
        <CoachingRoom
          token={authToken}
          firstName={firstName}
          onClose={() => setShowCoachingRoom(false)}
        />
      )}

      {/* ── MQ Builder overlay ─────────────────────────────────────────────── */}
      {showMQBuilder && authToken && (
        <MQBuilder
          token={authToken}
          firstName={firstName}
          onClose={() => { setShowMQBuilder(false); setMQBuilderDimId(undefined) }}
          initialDimId={mqBuilderDimId}
          dimScores={assessment ? [
            assessment.d1_score, assessment.d2_score, assessment.d3_score,
            assessment.d4_score, assessment.d5_score, assessment.d6_score,
            assessment.d7_score,
          ] : undefined}
          prevDimScores={prevAssessment ? [
            prevAssessment.d1_score, prevAssessment.d2_score, prevAssessment.d3_score,
            prevAssessment.d4_score, prevAssessment.d5_score, prevAssessment.d6_score,
            prevAssessment.d7_score,
          ] : undefined}
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

                    {/* Strengthen CTA */}
                    <button
                      onClick={() => {
                        setDimModal(null)
                        setMQBuilderDimId(dimModal.dimId)
                        setShowMQBuilder(true)
                      }}
                      className="w-full py-3 rounded-2xl text-sm font-semibold transition-opacity hover:opacity-90"
                      style={{ backgroundColor: dim.color, color: '#0A2E2A' }}
                    >
                      Strengthen {dim.name} in MQ Builder →
                    </button>
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

                    {/* Work on this dimension CTA */}
                    <button
                      onClick={() => {
                        setDimModal(null)
                        setMQBuilderDimId(dimModal.dimId)
                        setShowMQBuilder(true)
                      }}
                      className="w-full py-3 rounded-2xl text-sm font-semibold transition-opacity hover:opacity-90"
                      style={{ backgroundColor: dim.color, color: '#0A2E2A' }}
                    >
                      Strengthen {dim.name} in MQ Builder →
                    </button>
                  </>
                )}

              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Notes overlay ────────────────────────────────────────────────── */}
      {showNotes && authToken && (
        <Notes
          token={authToken}
          onClose={() => setShowNotes(false)}
          mode="fullscreen"
        />
      )}

      {/* ── Onboarding carousel ──────────────────────────────────────────── */}
      {showOnboarding && (
        <MQOnboarding onComplete={() => setShowOnboarding(false)} />
      )}

      {/* ── Edit profile modal ───────────────────────────────────────────── */}
      {showEditProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(10,46,42,0.6)', backdropFilter: 'blur(4px)' }}
             onClick={e => { if (e.target === e.currentTarget) setShowEditProfile(false) }}>
          <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl" style={{ backgroundColor: 'white' }}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold" style={{ color: '#0A2E2A' }}>Edit your profile</h2>
              <button onClick={() => setShowEditProfile(false)}
                className="text-sm hover:opacity-60 transition-opacity"
                style={{ color: '#9CA3AF' }}>✕</button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: '#0A2E2A' }}>
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

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: '#0A2E2A' }}>
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
              onClick={saveEditProfile}
              disabled={editSaving}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
              style={{ backgroundColor: editSaved ? '#B9F8DD' : '#0AF3CD', color: '#0A2E2A', opacity: editSaving ? 0.6 : 1 }}
            >
              {editSaved ? '✓ Saved' : editSaving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      )}

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div className="text-center py-6 mt-4">
        <a
          href="/dashboard/methodology"
          className="text-xs hover:underline transition-opacity hover:opacity-70"
          style={{ color: '#9CA3AF' }}
        >
          The Research Behind MQ
        </a>
        <span className="mx-2 text-xs" style={{ color: '#D1D5DB' }}>·</span>
        <a
          href="/privacy"
          className="text-xs hover:underline transition-opacity hover:opacity-70"
          style={{ color: '#9CA3AF' }}
        >
          Privacy Policy
        </a>
        <span className="mx-2 text-xs" style={{ color: '#D1D5DB' }}>·</span>
        <span className="text-xs" style={{ color: '#9CA3AF' }}>© {new Date().getFullYear()} Mindset Quotient</span>
      </div>

    </main>
  )
}
