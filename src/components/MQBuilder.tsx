'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Session {
  id:            string
  title:         string
  created_at:    string
  updated_at:    string
  message_count: number
}

interface Message {
  id?:      string
  role:     'user' | 'assistant'
  content:  string
  pending?: boolean
}

interface MQBuilderProps {
  token:          string
  firstName:      string
  onClose:        () => void
  dimScores?:     (number | null)[]
  prevDimScores?: (number | null)[]
}

// ── Dimension config ───────────────────────────────────────────────────────────

const DIMENSIONS = [
  {
    id: 1, name: 'Self-awareness', color: '#fdcb5e', bg: '#FEF5D9',
    tagline: 'The ability to see yourself clearly in real time.',
    what: 'Self-awareness is the capacity to notice your own thoughts, feelings, assumptions and behavioural patterns as they arise — without being swept along by them. It\'s the internal observer that watches how you\'re showing up.',
    high: 'You have a strong internal observer. You catch your own triggers before they escalate and tend to seek honest feedback rather than avoid it.',
    low: 'You may find yourself reacting before choosing your response, or discovering your impact on others after the fact rather than in the moment.',
    science: 'Tasha Eurich\'s research found that while 95% of people believe they are self-aware, only 10–15% actually are. Goleman\'s emotional intelligence work identifies self-awareness as the foundational pillar on which all other leadership capacities rest — you cannot regulate what you cannot see. Neuroscientifically, genuine self-awareness requires active integration between the prefrontal cortex and the brain\'s Default Mode Network. Daniel Siegel calls this capacity "mindsight" — the brain\'s ability to observe its own activity as it happens.',
  },
  {
    id: 2, name: 'Ego & identity', color: '#EC4899', bg: '#FCE7F3',
    tagline: 'Leading from strength, not from the need for approval.',
    what: 'Ego & identity describes the degree to which your leadership is driven by genuine values versus the unconscious need to protect your image, status, or sense of self. It\'s the difference between leading from strength and leading from fear of looking bad.',
    high: 'You can receive feedback without becoming defensive, admit mistakes without it threatening your identity, and share credit without feeling diminished.',
    low: 'You may notice a pull towards protecting your image — perhaps avoiding feedback, over-explaining mistakes, or becoming defensive when challenged.',
    science: 'Kegan and Lahey\'s research on "Immunity to Change" found that most leadership development failures are caused by hidden commitments to protecting self-image, not lack of skill. Neuroscience confirms that social threat activates the same fight-or-flight response as physical danger — shutting down the very capacities leaders need most. Brené Brown\'s research connects this to vulnerability: leaders who can\'t tolerate being wrong consistently create cultures of self-protection around them.',
  },
  {
    id: 3, name: 'Emotional regulation', color: '#ff7b7a', bg: '#FFE8E8',
    tagline: 'Letting emotions inform you rather than run you.',
    what: 'Emotional regulation is the ability to manage your emotional responses — especially under pressure — so they serve your goals rather than derail them. This isn\'t about suppressing emotion; it\'s about processing it so you can respond wisely.',
    high: 'You stay grounded under pressure. Others likely experience you as steady and safe to bring problems to.',
    low: 'Emotional intensity may sometimes hijack your thinking or limit your presence in high-stakes moments.',
    science: 'Amy Arnsten\'s research shows that even moderate stress takes the prefrontal cortex offline, reducing your capacity for clear thinking and sound judgment. Joseph LeDoux documented how the amygdala can hijack the whole system in milliseconds. Viktor Frankl captured the core insight: between stimulus and response there is a space — and that space is what emotional regulation lets you access.',
  },
  {
    id: 4, name: 'Cognitive flexibility', color: '#ff9f43', bg: '#FFF0E0',
    tagline: 'The capacity to think in multiple directions at once.',
    what: 'Cognitive flexibility is the ability to hold several perspectives simultaneously, update your thinking when new information arrives, and move between different mental models. It\'s the opposite of rigid, either/or thinking.',
    high: 'You readily update your mental models, entertain contradictory ideas, and are seen by others as open-minded and intellectually curious.',
    low: 'You may default to familiar frameworks even when the situation calls for fresh thinking, or find it uncomfortable when others challenge your interpretation.',
    science: 'Carol Dweck\'s growth mindset research shows that believing capabilities are developable is one of the strongest predictors of learning and leadership effectiveness. Kahneman\'s work on System 1 and System 2 thinking reveals how much decision-making is governed by fast, automatic, pattern-based thinking. Neuroscience adds a critical insight: cognitive flexibility depends directly on prefrontal cortex function — the same system that goes offline under stress — which is why we default to rigid thinking precisely when we most need fresh perspectives.',
  },
  {
    id: 5, name: 'Values & purpose', color: '#00c9a7', bg: '#D4F5EF',
    tagline: "Knowing what you stand for — and where you're going.",
    what: 'Values & purpose is about knowing what you genuinely believe in and having a clear sense of direction that motivates your leadership beyond personal gain. It\'s the alignment between your stated principles, your lived behaviour, and your sense of meaningful contribution.',
    high: 'Your decisions are anchored by a clear internal compass. Others experience you as consistent and trustworthy — they know what you stand for because your behaviour demonstrates it.',
    low: 'You may hold values you believe in but haven\'t fully translated into consistent, visible behaviour. The gap between intention and action may be wider than you\'d like.',
    science: 'Viktor Frankl established that meaning and purpose are primary human motivators — and that clarity of purpose is what sustains people through adversity. Self-determination theory (Deci and Ryan) identifies values alignment as a core driver of intrinsic motivation. Brené Brown\'s research shows that values-driven leaders — who act from what they stand for rather than fear of judgment — consistently build higher-trust, higher-performance cultures.',
  },
  {
    id: 6, name: 'Relational mindset', color: '#2d4a8a', bg: '#E0E6F5',
    tagline: 'The quality of presence you bring to every interaction.',
    what: 'Relational mindset describes the intention and quality of attention you bring to your relationships — whether you genuinely seek to understand others, or primarily see people through the lens of what they can do for you.',
    high: 'You approach relationships with genuine curiosity and care. People feel seen and heard by you, which builds loyalty and creates conditions where others do their best work.',
    low: 'Under pressure, you may shift into transactional mode, treating relationships as means to an end, or giving people less real attention than they need to feel genuinely valued.',
    science: 'Amy Edmondson\'s Harvard research identified psychological safety as the single biggest determinant of team effectiveness. Daniel Siegel\'s interpersonal neurobiology shows that genuine attunement has measurable neurological effects — reducing the threat response in those being led. Mirror neuron research confirms that a leader\'s internal emotional state is literally contagious, spreading through a team below the level of conscious awareness.',
  },
  {
    id: 7, name: 'Adaptive resilience', color: '#a78bfa', bg: '#EDE9FE',
    tagline: 'Bouncing forward, not just back.',
    what: 'Adaptive resilience is the ability to sustain performance under sustained pressure, recover from setbacks, and find meaning in adversity rather than being destabilised by it. It\'s not toughness — it\'s flexibility under load.',
    high: 'You have strong internal resources for navigating difficulty. Setbacks tend to become learning rather than defeat, and you likely recover your equilibrium faster than most.',
    low: 'Sustained pressure may be depleting your capacity in ways that affect your thinking, relationships, and decision-making. Rest and recovery may not be getting the attention they need.',
    science: 'Richard Davidson\'s neuroscience research confirms that the brain\'s capacity for regulation and recovery is genuinely plastic — it can be strengthened through deliberate practice. Martin Seligman\'s learned optimism research shows that how people explain adversity to themselves is highly predictive of long-term resilience. Ann Masten reframes resilience as "ordinary magic" — not a rare quality, but a set of everyday capacities that can be deliberately built.',
  },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function getScoreBandLabel(score: number): string {
  if (score >= 90) return 'Exceptional'
  if (score >= 75) return 'Strong'
  if (score >= 60) return 'Solid'
  if (score >= 40) return 'Developing'
  return 'Growth area'
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return d.toLocaleDateString('en-GB', { weekday: 'long' })
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function MQBuilder({ token, firstName, onClose, dimScores, prevDimScores }: MQBuilderProps) {
  const [view,           setView]           = useState<'home' | 'overview' | 'chat'>('home')
  const [selectedDimId,  setSelectedDimId]  = useState<number | null>(null)
  const [sessions,       setSessions]       = useState<Session[]>([])
  const [activeSession,  setActiveSession]  = useState<Session | null>(null)
  const [messages,       setMessages]       = useState<Message[]>([])
  const [input,          setInput]          = useState('')
  const [loading,        setLoading]        = useState(false)
  const [sessionsLoaded, setSessionsLoaded] = useState(false)
  const [msgLoaded,      setMsgLoaded]      = useState(false)
  const [deletingId,     setDeletingId]     = useState<string | null>(null)
  const [hoveredDim,     setHoveredDim]     = useState<number | null>(null)
  const [autoStarted,    setAutoStarted]    = useState(false)

  // Lowest-scoring dimension = focus
  const focusDimId: number | null = dimScores
    ? dimScores.map((s, i) => ({ s: s ?? 999, i })).sort((a, b) => a.s - b.s)[0].i + 1
    : null

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  // ── Load sessions ───────────────────────────────────────────────────────────
  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/coaching-room?type=mq_builder', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) { const d = await res.json(); setSessions(d.sessions ?? []) }
    } finally { setSessionsLoaded(true) }
  }, [token])

  useEffect(() => { loadSessions() }, [loadSessions])

  // ── Load messages ───────────────────────────────────────────────────────────
  const loadMessages = useCallback(async (sessionId: string) => {
    setMsgLoaded(false)
    try {
      const res = await fetch(`/api/coaching-room?sessionId=${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) { const d = await res.json(); setMessages(d.messages ?? []) }
    } finally { setMsgLoaded(true) }
  }, [token])

  // ── Scroll to bottom ────────────────────────────────────────────────────────
  useEffect(() => {
    if (view === 'chat') {
      bottomRef.current?.scrollIntoView({ behavior: msgLoaded ? 'smooth' : 'instant' })
    }
  }, [messages, msgLoaded, view])

  // ── Focus input ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (view === 'chat') setTimeout(() => inputRef.current?.focus(), 150)
  }, [view])

  // ── Auto-start: send kick-off message on new sessions ───────────────────────
  useEffect(() => {
    if (
      view === 'chat' &&
      msgLoaded &&
      messages.length === 0 &&
      activeSession &&
      selectedDimId &&
      !autoStarted
    ) {
      setAutoStarted(true)
      const dim = DIMENSIONS[selectedDimId - 1]
      triggerOpeningMessage(activeSession.id, selectedDimId, dim.name)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, msgLoaded, messages.length, activeSession, selectedDimId, autoStarted])

  async function triggerOpeningMessage(sessionId: string, dimId: number, dimName: string) {
    const triggerMsg = `Help me build my ${dimName.toLowerCase()}`
    setLoading(true)
    setMessages([{ role: 'assistant', content: '', pending: true }])
    try {
      const res = await fetch('/api/coaching-room', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ message: triggerMsg, sessionId, focusDimensionId: dimId, hideTrigger: true }),
      })
      const data = await res.json()
      const reply = res.ok && data.reply ? data.reply : 'Something went wrong. Please try again.'
      setMessages([{ role: 'assistant', content: reply }])
      setSessions(prev => prev.map(s =>
        s.id === sessionId ? { ...s, title: dimName } : s
      ))
      setActiveSession(prev => prev ? { ...prev, title: dimName } : prev)
    } catch {
      setMessages([{ role: 'assistant', content: 'Something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  // ── Open a past session ──────────────────────────────────────────────────────
  async function openSession(session: Session) {
    setActiveSession(session)
    setMessages([])
    setAutoStarted(true) // don't re-trigger auto-start for existing sessions
    setView('chat')
    await loadMessages(session.id)
  }

  // ── Select dimension and go to overview ─────────────────────────────────────
  function selectDimension(dimId: number) {
    setSelectedDimId(dimId)
    setView('overview')
  }

  // ── Start session from overview ──────────────────────────────────────────────
  async function startSession() {
    const prevSessionId = sessions[0]?.id
    const res = await fetch('/api/coaching-room', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body:    JSON.stringify({ action: 'new_session', prevSessionId, sessionType: 'mq_builder' }),
    })
    if (res.ok) {
      const { session } = await res.json()
      if (!session) return
      setActiveSession(session)
      setMessages([])
      setMsgLoaded(true)
      setAutoStarted(false) // will trigger auto-start
      setView('chat')
      setSessions(prev => [session, ...prev])
    }
  }

  // ── Send message ─────────────────────────────────────────────────────────────
  async function send() {
    const text = input.trim()
    if (!text || loading || !activeSession) return
    setInput('')
    setLoading(true)
    setMessages(prev => [
      ...prev,
      { role: 'user',      content: text, pending: false },
      { role: 'assistant', content: '',   pending: true  },
    ])
    try {
      const res = await fetch('/api/coaching-room', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ message: text, sessionId: activeSession.id, focusDimensionId: selectedDimId }),
      })
      const data = await res.json()
      const reply = res.ok && data.reply ? data.reply : 'Something went wrong. Please try again.'
      setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  // ── Delete session ───────────────────────────────────────────────────────────
  async function deleteSession(sessionId: string, e: React.MouseEvent) {
    e.stopPropagation()
    setDeletingId(sessionId)
    try {
      await fetch(`/api/coaching-room?sessionId=${sessionId}`, {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setSessions(prev => prev.filter(s => s.id !== sessionId))
    } finally { setDeletingId(null) }
  }

  // ── Back to home ─────────────────────────────────────────────────────────────
  function backToHome() {
    setView('home')
    setActiveSession(null)
    setMessages([])
    setAutoStarted(false)
    loadSessions()
  }

  // ── Active dim info ──────────────────────────────────────────────────────────
  const activeDim = selectedDimId ? DIMENSIONS[selectedDimId - 1] : null

  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: '#F4FDF9' }}>

      {/* ── HOME VIEW ───────────────────────────────────────────────────────── */}
      {view === 'home' && (
        <>
          {/* Header */}
          <div style={{ backgroundColor: '#0A2E2A' }}>
            <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                     style={{ backgroundColor: '#0AF3CD' }}>🧠</div>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'white' }}>MQ Builder</p>
                  <p className="text-xs" style={{ color: '#B9F8DD' }}>Develop your 7 dimensions</p>
                </div>
              </div>
              <button onClick={onClose}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                      style={{ color: '#B9F8DD', border: '1px solid rgba(185,248,221,0.3)' }}>×</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-6 py-5">

              {/* Intro */}
              <p className="text-sm font-semibold mb-1" style={{ color: '#0A2E2A' }}>
                Which dimension do you want to work on?
              </p>
              {focusDimId ? (
                <p className="text-xs mb-5" style={{ color: '#05A88E' }}>
                  Your focus dimension is highlighted — your lowest score. It's a good place to start.
                </p>
              ) : (
                <p className="text-xs mb-5" style={{ color: '#05A88E' }}>
                  Each session focuses on one dimension with a structured coaching conversation.
                </p>
              )}

              {/* Dimension cards */}
              <div className="grid grid-cols-1 gap-2.5 mb-8">
                {DIMENSIONS.map(dim => {
                  const score     = dimScores?.[dim.id - 1] ?? null
                  const prevScore = prevDimScores?.[dim.id - 1] ?? null
                  const delta     = score !== null && prevScore !== null ? score - prevScore : null
                  const isFocus   = focusDimId === dim.id
                  return (
                    <button
                      key={dim.id}
                      onClick={() => selectDimension(dim.id)}
                      onMouseEnter={() => setHoveredDim(dim.id)}
                      onMouseLeave={() => setHoveredDim(null)}
                      className="w-full flex items-start gap-3 px-4 py-3.5 rounded-xl text-left transition-all"
                      style={{
                        backgroundColor: isFocus ? dim.bg : hoveredDim === dim.id ? dim.bg : 'white',
                        border: `2px solid ${isFocus ? dim.color : hoveredDim === dim.id ? dim.color + '80' : '#E8F4F0'}`,
                        boxShadow: isFocus ? `0 0 0 1px ${dim.color}30` : 'none',
                      }}
                    >
                      <span className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
                            style={{ backgroundColor: dim.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold" style={{ color: '#0A2E2A' }}>
                            {dim.name}
                          </span>
                          {isFocus && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                                  style={{ backgroundColor: dim.color + '25', color: dim.color }}>
                              focus
                            </span>
                          )}
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{dim.tagline}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                        {delta !== null && delta !== 0 && (
                          <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: delta > 0 ? '#D1FAE5' : '#FEE2E2',
                                  color:           delta > 0 ? '#065F46' : '#991B1B',
                                  fontSize: '10px',
                                }}>
                            {delta > 0 ? '+' : ''}{delta}
                          </span>
                        )}
                        {score !== null && (
                          <span className="text-sm font-bold" style={{ color: isFocus ? dim.color : '#9CA3AF' }}>
                            {score}
                          </span>
                        )}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                             stroke={isFocus ? dim.color : '#9CA3AF'} strokeWidth="2.5" strokeLinecap="round">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Past sessions */}
              {sessionsLoaded && sessions.length > 0 && (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wider pb-3" style={{ color: '#9CA3AF' }}>
                    Past sessions
                  </p>
                  <div className="space-y-2">
                    {sessions.map(session => (
                      <button
                        key={session.id}
                        onClick={() => openSession(session)}
                        className="w-full text-left rounded-2xl p-4 flex items-start justify-between gap-3 hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: 'white', border: '1px solid #E8FDF7', boxShadow: '0 2px 8px rgba(10,46,42,0.06)' }}
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-sm"
                               style={{ backgroundColor: '#0A2E2A' }}>🧠</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: '#0A2E2A' }}>
                              {session.title}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                              {formatDate(session.updated_at)}
                              {session.message_count > 0 && ` · ${session.message_count} messages`}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => deleteSession(session.id, e)}
                          disabled={deletingId === session.id}
                          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-100 opacity-40 transition-opacity mt-0.5"
                          style={{ backgroundColor: '#FEE2E2' }}
                          aria-label="Delete session"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                            <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                          </svg>
                        </button>
                      </button>
                    ))}
                  </div>
                </>
              )}

            </div>
          </div>
        </>
      )}

      {/* ── OVERVIEW VIEW ───────────────────────────────────────────────────── */}
      {view === 'overview' && activeDim && (
        <>
          {/* Header */}
          <div style={{ backgroundColor: '#0A2E2A' }}>
            <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
              <button onClick={() => setView('home')}
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 hover:opacity-80"
                      style={{ color: '#B9F8DD', border: '1px solid rgba(185,248,221,0.3)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: 'white' }}>{activeDim.name}</p>
                <p className="text-xs" style={{ color: '#B9F8DD' }}>MQ Builder</p>
              </div>
              <button onClick={onClose}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                      style={{ color: '#B9F8DD', border: '1px solid rgba(185,248,221,0.3)' }}>×</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-6 py-6">

              {/* Dimension header card */}
              <div className="rounded-2xl p-5 mb-5" style={{ backgroundColor: activeDim.bg }}>
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: activeDim.color }} />
                  <p className="text-base font-bold" style={{ color: '#0A2E2A' }}>{activeDim.name}</p>
                  {(() => {
                    const score = dimScores?.[activeDim.id - 1] ?? null
                    if (score === null) return null
                    const label = getScoreBandLabel(score)
                    return (
                      <div className="ml-auto flex items-center gap-2">
                        <span className="text-xs font-semibold" style={{ color: activeDim.color }}>{label}</span>
                        <span className="text-lg font-black" style={{ color: activeDim.color }}>{score}</span>
                      </div>
                    )
                  })()}
                </div>
                <p className="text-sm italic mb-0" style={{ color: '#374151' }}>"{activeDim.tagline}"</p>
              </div>

              {/* What it is */}
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#9CA3AF' }}>
                  What it is
                </p>
                <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>{activeDim.what}</p>
              </div>

              {/* Score context */}
              {(() => {
                const score = dimScores?.[activeDim.id - 1] ?? null
                if (score === null) return null
                const isLow  = score < 60
                const text   = isLow ? activeDim.low : activeDim.high
                const label  = isLow ? 'Where you are now' : 'Your current strength'
                const bg     = isLow ? '#FFF7ED' : '#F0FDF4'
                const col    = isLow ? '#D97706' : '#059669'
                return (
                  <div className="rounded-2xl p-4 mb-6" style={{ backgroundColor: bg }}>
                    <p className="text-xs font-bold mb-1.5" style={{ color: col }}>{label}</p>
                    <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>{text}</p>
                  </div>
                )
              })()}

              {/* What to expect */}
              <div className="rounded-2xl p-4 mb-6" style={{ backgroundColor: 'white', border: '1px solid #E8FDF7' }}>
                <p className="text-xs font-bold mb-1.5" style={{ color: '#05A88E' }}>What to expect in this session</p>
                <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                  Your coach will open with a short explanation of what {activeDim.name.toLowerCase()} means, then ask you a specific question to explore where you are with it right now. From there you'll work through practical strategies tailored to what you share.
                </p>
              </div>

              {/* CTA */}
              <button
                onClick={startSession}
                className="w-full py-4 rounded-2xl text-sm font-bold hover:opacity-90 transition-opacity"
                style={{ backgroundColor: activeDim.color, color: '#0A2E2A' }}
              >
                Start session — {activeDim.name} →
              </button>

            </div>
          </div>
        </>
      )}

      {/* ── CHAT VIEW ───────────────────────────────────────────────────────── */}
      {view === 'chat' && activeSession && activeDim && (
        <>
          {/* Header */}
          <div style={{ backgroundColor: '#0A2E2A' }}>
            <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
              <button onClick={backToHome}
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 hover:opacity-80"
                      style={{ color: '#B9F8DD', border: '1px solid rgba(185,248,221,0.3)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: activeDim.color }} />
                  <p className="text-sm font-bold truncate" style={{ color: 'white' }}>{activeDim.name}</p>
                </div>
                <p className="text-xs mt-0.5" style={{ color: '#B9F8DD' }}>MQ Builder</p>
              </div>
              <button onClick={onClose}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                      style={{ color: '#B9F8DD', border: '1px solid rgba(185,248,221,0.3)' }}>×</button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-6 py-6 space-y-4">

              {/* Evidence card — teaching insert, always shown at top of chat */}
              <div className="rounded-2xl p-4" style={{
                backgroundColor: activeDim.bg,
                border: `1px solid ${activeDim.color}40`,
              }}>
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ fontSize: 13 }}>🔬</span>
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: activeDim.color }}>
                    The evidence
                  </p>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                  {activeDim.science}
                </p>
              </div>

              {/* Loading state for auto-start */}
              {!msgLoaded && messages.length === 0 && (
                <div className="flex justify-center py-8">
                  <div className="flex gap-1.5">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                           style={{ backgroundColor: activeDim.color, animationDelay: `${i*0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={msg.id ?? i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-sm"
                         style={{ backgroundColor: activeDim.color }}>🧠</div>
                  )}
                  <div className="max-w-sm rounded-2xl px-4 py-3 text-sm leading-relaxed"
                       style={msg.role === 'user'
                         ? { backgroundColor: '#0A2E2A', color: 'white',   borderBottomRightRadius: 4 }
                         : { backgroundColor: 'white',   color: '#0A2E2A', borderBottomLeftRadius: 4, border: `1px solid ${activeDim.color}40` }}>
                    {msg.pending ? (
                      <div className="flex gap-1 items-center py-1">
                        {[0,1,2].map(j => (
                          <div key={j} className="w-2 h-2 rounded-full animate-bounce"
                               style={{ backgroundColor: activeDim.color, animationDelay: `${j*0.15}s` }} />
                        ))}
                      </div>
                    ) : (
                      msg.content.split('\n\n').map((para, p) => (
                        <p key={p} className={p > 0 ? 'mt-3' : ''}>{para}</p>
                      ))
                    )}
                  </div>
                </div>
              ))}

              <div ref={bottomRef} />
            </div>
          </div>

          {/* Input */}
          <div style={{ backgroundColor: 'white', borderTop: `1px solid ${activeDim.color}40` }}>
            <div className="max-w-2xl mx-auto px-4 py-3 flex gap-3 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Respond to your coach…"
                rows={1}
                disabled={loading}
                className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none resize-none disabled:opacity-50"
                style={{ border: `2px solid ${activeDim.color}60`, backgroundColor: activeDim.bg, color: '#0A2E2A', maxHeight: 120 }}
                onInput={e => {
                  const el = e.currentTarget
                  el.style.height = 'auto'
                  el.style.height = `${Math.min(el.scrollHeight, 120)}px`
                }}
              />
              <button onClick={send} disabled={!input.trim() || loading}
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-opacity"
                      style={{ backgroundColor: activeDim.color, color: '#0A2E2A' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
            <p className="text-center text-xs pb-3" style={{ color: '#9CA3AF' }}>
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </>
      )}

    </div>
  )
}
