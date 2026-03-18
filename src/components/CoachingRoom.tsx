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

interface CoachingRoomProps {
  token:          string
  firstName:      string
  onClose:        () => void
  dimScores?:     (number | null)[]   // [d1…d7] current assessment
  prevDimScores?: (number | null)[]   // [d1…d7] previous assessment (if reassessed)
}

// ── Dimension config ───────────────────────────────────────────────────────────

const DIMENSIONS = [
  { id: 1, name: 'Self-awareness',        color: '#fdcb5e', bg: '#FEF5D9' },
  { id: 2, name: 'Ego & identity',        color: '#EC4899', bg: '#FCE7F3' },
  { id: 3, name: 'Emotional regulation',  color: '#ff7b7a', bg: '#FFE8E8' },
  { id: 4, name: 'Cognitive flexibility', color: '#ff9f43', bg: '#FFF0E0' },
  { id: 5, name: 'Values & purpose',      color: '#00c9a7', bg: '#D4F5EF' },
  { id: 6, name: 'Relational mindset',    color: '#2d4a8a', bg: '#E0E6F5' },
  { id: 7, name: 'Adaptive resilience',   color: '#a78bfa', bg: '#EDE9FE' },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7)  return d.toLocaleDateString('en-GB', { weekday: 'long' })
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function CoachingRoom({ token, firstName, onClose, dimScores, prevDimScores }: CoachingRoomProps) {
  const [view,           setView]           = useState<'sessions' | 'dimPicker' | 'chat'>('sessions')
  const [sessions,       setSessions]       = useState<Session[]>([])
  const [activeSession,  setActiveSession]  = useState<Session | null>(null)
  const [messages,       setMessages]       = useState<Message[]>([])
  const [input,          setInput]          = useState('')
  const [loading,        setLoading]        = useState(false)
  const [sessionsLoaded, setSessionsLoaded] = useState(false)
  const [msgLoaded,      setMsgLoaded]      = useState(false)
  const [deletingId,     setDeletingId]     = useState<string | null>(null)
  const [hoveredPrompt,  setHoveredPrompt]  = useState<string | null>(null)
  const [hoveredDim,     setHoveredDim]     = useState<number | null>(null)
  const [selectedDimId,  setSelectedDimId]  = useState<number | null>(null)

  // Derive focus dimension (lowest score) from props
  const focusDimId: number | null = dimScores
    ? dimScores.map((s, i) => ({ s: s ?? 999, i })).sort((a, b) => a.s - b.s)[0].i + 1
    : null

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  // ── Load sessions list ──────────────────────────────────────────────────────
  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/coaching-room', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) { const d = await res.json(); setSessions(d.sessions ?? []) }
    } finally { setSessionsLoaded(true) }
  }, [token])

  useEffect(() => { loadSessions() }, [loadSessions])

  // ── Load messages for active session ───────────────────────────────────────
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

  // ── Focus input ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (view === 'chat') setTimeout(() => inputRef.current?.focus(), 150)
  }, [view])

  // ── Open a session ──────────────────────────────────────────────────────────
  async function openSession(session: Session) {
    setActiveSession(session)
    setMessages([])
    setView('chat')
    await loadMessages(session.id)
  }

  // ── New conversation → go to dim picker first ────────────────────────────────
  function startNewConversation() {
    setSelectedDimId(focusDimId)  // pre-select focus dimension
    setView('dimPicker')
  }

  // ── Confirm dimension and create session ─────────────────────────────────────
  async function confirmAndStart() {
    const prevSessionId = sessions[0]?.id
    const res = await fetch('/api/coaching-room', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body:    JSON.stringify({ action: 'new_session', prevSessionId }),
    })
    if (res.ok) {
      const { session } = await res.json()
      if (!session) return
      setActiveSession(session)
      setMessages([])
      setMsgLoaded(true)
      setView('chat')
      setSessions(prev => [session, ...prev])
    }
  }

  // ── Send message ────────────────────────────────────────────────────────────
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

      // Update session title if this was first message
      if (messages.filter(m => m.role === 'user').length === 0) {
        const newTitle = text.length > 52 ? text.slice(0, 49) + '…' : text
        setActiveSession(prev => prev ? { ...prev, title: newTitle } : prev)
        setSessions(prev => prev.map(s => s.id === activeSession.id ? { ...s, title: newTitle } : s))
      }
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

  // ── Delete session ──────────────────────────────────────────────────────────
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

  // ── Back to sessions ────────────────────────────────────────────────────────
  function backToSessions() {
    setView('sessions')
    setActiveSession(null)
    setMessages([])
    loadSessions()
  }

  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: '#F4FDF9' }}>

      {/* ── SESSIONS VIEW ───────────────────────────────────────────────────── */}
      {view === 'sessions' && (
        <>
          {/* Header */}
          <div style={{ backgroundColor: '#0A2E2A' }}>
            <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                     style={{ backgroundColor: '#0AF3CD' }}>🧠</div>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'white' }}>The Coaching Room</p>
                  <p className="text-xs" style={{ color: '#B9F8DD' }}>
                    Always personalised to you
                  </p>
                </div>
              </div>
              <button onClick={onClose}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                      style={{ color: '#B9F8DD', border: '1px solid rgba(185,248,221,0.3)' }}>×</button>
            </div>
          </div>

          {/* New conversation button */}
          <div className="max-w-2xl mx-auto w-full px-6 pt-5 pb-3">
            <button
              onClick={startNewConversation}
              className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New conversation
            </button>
          </div>

          {/* Sessions list */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-6 pb-6 space-y-2">

              {!sessionsLoaded && (
                <div className="flex justify-center py-12">
                  <div className="flex gap-1.5">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                           style={{ backgroundColor: '#0AF3CD', animationDelay: `${i*0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}

              {sessionsLoaded && sessions.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-4xl mb-4">🧠</div>
                  <p className="text-base font-semibold mb-2" style={{ color: '#0A2E2A' }}>
                    Hey {firstName}, I'm your MQ Coach.
                  </p>
                  <p className="text-sm max-w-xs mx-auto" style={{ color: '#05A88E' }}>
                    Bring me anything: a tricky conversation, a leadership challenge, something you're working through.
                  </p>
                </div>
              )}

              {sessionsLoaded && sessions.length > 0 && (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wider pb-1" style={{ color: '#9CA3AF' }}>
                    Past conversations
                  </p>
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
                        aria-label="Delete conversation"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── DIM PICKER VIEW ─────────────────────────────────────────────────── */}
      {view === 'dimPicker' && (
        <>
          <div style={{ backgroundColor: '#0A2E2A' }}>
            <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
              <button onClick={() => setView('sessions')}
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 hover:opacity-80"
                      style={{ color: '#B9F8DD', border: '1px solid rgba(185,248,221,0.3)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: 'white' }}>New conversation</p>
                <p className="text-xs" style={{ color: '#B9F8DD' }}>Choose your focus dimension</p>
              </div>
              <button onClick={onClose}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                      style={{ color: '#B9F8DD', border: '1px solid rgba(185,248,221,0.3)' }}>×</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-6 py-6">
              <p className="text-sm mb-1" style={{ color: '#0A2E2A', fontWeight: 600 }}>
                What do you want to work on today?
              </p>
              {focusDimId && (
                <p className="text-xs mb-5" style={{ color: '#05A88E' }}>
                  We've pre-selected your focus dimension — your lowest score. Change it if you'd like.
                </p>
              )}
              {!focusDimId && (
                <p className="text-xs mb-5" style={{ color: '#05A88E' }}>
                  Select a dimension to focus on, or leave unselected to explore freely.
                </p>
              )}

              <div className="grid grid-cols-1 gap-2.5 mb-6">
                {DIMENSIONS.map(dim => {
                  const score    = dimScores?.[dim.id - 1] ?? null
                  const prevScore = prevDimScores?.[dim.id - 1] ?? null
                  const delta    = score !== null && prevScore !== null ? score - prevScore : null
                  const isSelected = selectedDimId === dim.id
                  const isFocus  = focusDimId === dim.id
                  return (
                    <button
                      key={dim.id}
                      onClick={() => setSelectedDimId(isSelected ? null : dim.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                      style={{
                        backgroundColor: isSelected ? dim.bg : 'white',
                        border: `2px solid ${isSelected ? dim.color : '#E8F4F0'}`,
                        boxShadow: isSelected ? `0 0 0 1px ${dim.color}40` : 'none',
                      }}
                    >
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: dim.color }} />
                      <span className="flex-1 text-sm font-semibold" style={{ color: '#0A2E2A' }}>
                        {dim.name}
                      </span>
                      {isFocus && !isSelected && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                              style={{ backgroundColor: dim.bg, color: dim.color }}>
                          focus
                        </span>
                      )}
                      {score !== null && (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {delta !== null && delta !== 0 && (
                            <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                                  style={{
                                    backgroundColor: delta > 0 ? '#D1FAE5' : '#FEE2E2',
                                    color: delta > 0 ? '#065F46' : '#991B1B',
                                    fontSize: '10px',
                                  }}>
                              {delta > 0 ? '+' : ''}{delta}
                            </span>
                          )}
                          <span className="text-sm font-bold" style={{ color: isSelected ? dim.color : '#9CA3AF' }}>
                            {score}
                          </span>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* No dimension selected option */}
              <button
                onClick={() => setSelectedDimId(null)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all mb-6"
                style={{
                  backgroundColor: selectedDimId === null ? '#F4FDF9' : 'white',
                  border: `2px solid ${selectedDimId === null ? '#0AF3CD' : '#E8F4F0'}`,
                }}
              >
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: '#9CA3AF' }} />
                <span className="flex-1 text-sm font-semibold" style={{ color: '#0A2E2A' }}>
                  No specific focus — open conversation
                </span>
              </button>

              <button
                onClick={confirmAndStart}
                className="w-full py-4 rounded-2xl text-sm font-bold hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}
              >
                {selectedDimId
                  ? `Start session — ${DIMENSIONS[selectedDimId - 1].name} →`
                  : 'Start conversation →'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── CHAT VIEW ───────────────────────────────────────────────────────── */}
      {view === 'chat' && activeSession && (
        <>
          {/* Header */}
          <div style={{ backgroundColor: '#0A2E2A' }}>
            <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
              <button onClick={backToSessions}
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 hover:opacity-80"
                      style={{ color: '#B9F8DD', border: '1px solid rgba(185,248,221,0.3)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: 'white' }}>
                  {activeSession.title === 'New conversation' ? 'New conversation' : activeSession.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs" style={{ color: '#B9F8DD' }}>MQ Coach</p>
                  {selectedDimId && (() => {
                    const dim = DIMENSIONS[selectedDimId - 1]
                    return (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                            style={{ backgroundColor: dim.color + '30', color: dim.color }}>
                        {dim.name}
                      </span>
                    )
                  })()}
                </div>
              </div>
              <button onClick={onClose}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                      style={{ color: '#B9F8DD', border: '1px solid rgba(185,248,221,0.3)' }}>×</button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-6 py-6 space-y-4">

              {!msgLoaded && (
                <div className="flex justify-center py-8">
                  <div className="flex gap-1.5">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                           style={{ backgroundColor: '#0AF3CD', animationDelay: `${i*0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {msgLoaded && messages.length === 0 && (
                <div className="py-8">
                  <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"
                         style={{ backgroundColor: '#0A2E2A' }}>🧠</div>
                    <p className="text-base font-semibold mb-2" style={{ color: '#0A2E2A' }}>
                      What's on your mind, {firstName}?
                    </p>
                    <p className="text-sm max-w-xs mx-auto" style={{ color: '#05A88E' }}>
                      Bring me a challenge, a decision, or choose one of the 6 MQ dimensions to work on.
                    </p>
                  </div>

                  {/* Situational prompts */}
                  <div className="mb-6">
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-center" style={{ color: '#9CA3AF' }}>
                      Work through something
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {[
                        'I have a difficult conversation coming up',
                        "I'm struggling to motivate my team",
                        "I feel like I'm losing confidence",
                        'I need help managing up',
                      ].map(prompt => (
                        <button key={prompt}
                                onClick={() => {
                                  setInput('')
                                  setLoading(true)
                                  setMessages([
                                    { role: 'user', content: prompt, pending: false },
                                    { role: 'assistant', content: '', pending: true },
                                  ])
                                  fetch('/api/coaching-room', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                    body: JSON.stringify({ message: prompt, sessionId: activeSession!.id, focusDimensionId: selectedDimId }),
                                  }).then(r => r.json()).then(data => {
                                    const reply = data.reply ?? 'Something went wrong. Please try again.'
                                    setMessages([
                                      { role: 'user', content: prompt },
                                      { role: 'assistant', content: reply },
                                    ])
                                    const newTitle = prompt.length > 52 ? prompt.slice(0, 49) + '…' : prompt
                                    setActiveSession(prev => prev ? { ...prev, title: newTitle } : prev)
                                    setSessions(prev => prev.map(s => s.id === activeSession!.id ? { ...s, title: newTitle } : s))
                                  }).catch(() => {
                                    setMessages([
                                      { role: 'user', content: prompt },
                                      { role: 'assistant', content: 'Something went wrong. Please try again.' },
                                    ])
                                  }).finally(() => {
                                    setLoading(false)
                                    setTimeout(() => inputRef.current?.focus(), 50)
                                  })
                                }}
                                onMouseEnter={() => setHoveredPrompt(prompt)}
                                onMouseLeave={() => setHoveredPrompt(null)}
                                className="text-xs px-3 py-1.5 rounded-full transition-all duration-150"
                                style={{
                                  backgroundColor: hoveredPrompt === prompt ? '#E6F9F4' : 'white',
                                  color: '#05A88E',
                                  border: `1px solid ${hoveredPrompt === prompt ? '#05A88E' : '#B9F8DD'}`,
                                  boxShadow: hoveredPrompt === prompt ? '0 2px 8px rgba(10,46,42,0.1)' : 'none',
                                }}>
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live your values */}
                  <div className="mb-6">
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-center" style={{ color: '#9CA3AF' }}>
                      Live your values
                    </p>
                    {(() => {
                      const msg = 'Help me lead by example on our company values'
                      const isHovered = hoveredPrompt === msg
                      return (
                        <button
                          onClick={() => {
                            setInput('')
                            setLoading(true)
                            setMessages([
                              { role: 'user', content: msg, pending: false },
                              { role: 'assistant', content: '', pending: true },
                            ])
                            fetch('/api/coaching-room', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                              body: JSON.stringify({ message: msg, sessionId: activeSession!.id, focusDimensionId: selectedDimId }),
                            }).then(r => r.json()).then(data => {
                              const reply = data.reply ?? 'Something went wrong. Please try again.'
                              setMessages([
                                { role: 'user', content: msg },
                                { role: 'assistant', content: reply },
                              ])
                              setActiveSession(prev => prev ? { ...prev, title: 'Lead by example on our values' } : prev)
                              setSessions(prev => prev.map(s => s.id === activeSession!.id ? { ...s, title: 'Lead by example on our values' } : s))
                            }).catch(() => {
                              setMessages([
                                { role: 'user', content: msg },
                                { role: 'assistant', content: 'Something went wrong. Please try again.' },
                              ])
                            }).finally(() => {
                              setLoading(false)
                              setTimeout(() => inputRef.current?.focus(), 50)
                            })
                          }}
                          onMouseEnter={() => setHoveredPrompt(msg)}
                          onMouseLeave={() => setHoveredPrompt(null)}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-150"
                          style={{
                            backgroundColor: isHovered ? '#FEF3C7' : '#FFFBEB',
                            border: `1px solid ${isHovered ? '#F59E0B' : '#F59E0B50'}`,
                            boxShadow: isHovered ? '0 2px 10px rgba(245,158,11,0.2)' : 'none',
                          }}
                        >
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#F59E0B' }} />
                          <span className="text-xs font-semibold" style={{ color: '#0A2E2A' }}>
                            Help me lead by example on our company values
                          </span>
                        </button>
                      )
                    })()}
                  </div>

                  {/* Dimension prompts */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-center" style={{ color: '#9CA3AF' }}>
                      Build your MQ
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {DIMENSIONS.map(dim => (
                        <button
                          key={dim.id}
                          onClick={() => {
                            const msg = `Help me build my ${dim.name.toLowerCase()}`
                            setInput(msg)
                            setTimeout(() => {
                              setInput('')
                              setLoading(true)
                              setMessages([
                                { role: 'user', content: msg, pending: false },
                                { role: 'assistant', content: '', pending: true },
                              ])
                              fetch('/api/coaching-room', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                body: JSON.stringify({ message: msg, sessionId: activeSession!.id, focusDimensionId: selectedDimId }),
                              }).then(r => r.json()).then(data => {
                                const reply = data.reply ?? 'Something went wrong. Please try again.'
                                setMessages([
                                  { role: 'user', content: msg },
                                  { role: 'assistant', content: reply },
                                ])
                                setActiveSession(prev => prev ? { ...prev, title: `Build: ${dim.name}` } : prev)
                                setSessions(prev => prev.map(s => s.id === activeSession!.id ? { ...s, title: `Build: ${dim.name}` } : s))
                              }).catch(() => {
                                setMessages([
                                  { role: 'user', content: msg },
                                  { role: 'assistant', content: 'Something went wrong. Please try again.' },
                                ])
                              }).finally(() => {
                                setLoading(false)
                                setTimeout(() => inputRef.current?.focus(), 50)
                              })
                            }, 0)
                          }}
                          onMouseEnter={() => setHoveredDim(dim.id)}
                          onMouseLeave={() => setHoveredDim(null)}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all duration-150"
                          style={{
                            backgroundColor: dim.bg,
                            border: `1px solid ${hoveredDim === dim.id ? dim.color : dim.color + '50'}`,
                            boxShadow: hoveredDim === dim.id ? `0 2px 10px ${dim.color}40` : 'none',
                          }}
                        >
                          <span className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: dim.color }} />
                          <span className="text-xs font-semibold"
                                style={{ color: '#0A2E2A' }}>
                            {dim.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={msg.id ?? i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-sm"
                         style={{ backgroundColor: '#0A2E2A' }}>🧠</div>
                  )}
                  <div className="max-w-sm rounded-2xl px-4 py-3 text-sm leading-relaxed"
                       style={msg.role === 'user'
                         ? { backgroundColor: '#0A2E2A', color: 'white',   borderBottomRightRadius: 4 }
                         : { backgroundColor: 'white',   color: '#0A2E2A', borderBottomLeftRadius: 4, border: '1px solid #B9F8DD' }}>
                    {msg.pending ? (
                      <div className="flex gap-1 items-center py-1">
                        {[0,1,2].map(j => (
                          <div key={j} className="w-2 h-2 rounded-full animate-bounce"
                               style={{ backgroundColor: '#05A88E', animationDelay: `${j*0.15}s` }} />
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
          <div style={{ backgroundColor: 'white', borderTop: '1px solid #B9F8DD' }}>
            <div className="max-w-2xl mx-auto px-4 py-3 flex gap-3 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Talk to your coach…"
                rows={1}
                disabled={loading}
                className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none resize-none disabled:opacity-50"
                style={{ border: '2px solid #B9F8DD', backgroundColor: '#F9FFFE', color: '#0A2E2A', maxHeight: 120 }}
                onInput={e => {
                  const el = e.currentTarget
                  el.style.height = 'auto'
                  el.style.height = `${Math.min(el.scrollHeight, 120)}px`
                }}
              />
              <button onClick={send} disabled={!input.trim() || loading}
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-opacity"
                      style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}>
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
