'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// ── Types ─────────────────────────────────────────────────────────────────────

type Topic = 'values' | 'psych-safety' | 'accountability'

interface TopicConfig {
  id:       Topic
  name:     string
  tagline:  string
  emoji:    string
  color:    string
  bg:       string
  prompts:  string[]
  intro:    string
}

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

// ── Topic config ──────────────────────────────────────────────────────────────

const TOPICS: Record<Topic, TopicConfig> = {
  values: {
    id:      'values',
    name:    'Living Your Company Values',
    tagline: 'Make your company values visible in how you actually lead',
    emoji:   '⭐',
    color:   '#F97316',
    bg:      '#FFF3E8',
    intro:   "I help you explore where you're genuinely living your company's values — and where the gap is. Bring a specific situation, a value you find hard to embody, or a team member you're not sure is living the values.",
    prompts: [
      "Where am I falling short on one of our values?",
      "How do I role-model our values under pressure?",
      "My team doesn't seem to live our values — what do I do?",
      "How do I hold someone accountable to our values?",
    ],
  },
  'psych-safety': {
    id:      'psych-safety',
    name:    'Creating Psychological Safety',
    tagline: 'Create the conditions for your team to speak up, take risks, and learn',
    emoji:   '🛡️',
    color:   '#6366F1',
    bg:      '#EEF2FF',
    intro:   "Psychological safety determines whether people on your team feel safe enough to speak up, admit mistakes, and challenge ideas. My role is to help you see how your behaviour shapes that environment — and what to change.",
    prompts: [
      "How do I know if my team feels psychologically safe?",
      "Someone on my team is afraid to share bad news with me",
      "I want people to challenge my ideas more — how?",
      "How do I respond better when someone raises a problem?",
    ],
  },
  accountability: {
    id:      'accountability',
    name:    'Building a Culture of Accountability',
    tagline: 'Hold people to high standards without creating fear or blame',
    emoji:   '🎯',
    color:   '#06D6A0',
    bg:      '#E0FBF5',
    intro:   "Accountability is about clear expectations, honest conversations, and consistent follow-through — not blame or micromanagement. Bring me a situation where accountability is breaking down and I'll help you work out exactly what to do.",
    prompts: [
      "Someone keeps missing deadlines — how do I handle it?",
      "My team doesn't take ownership of their work",
      "How do I follow through without coming across as a micromanager?",
      "I need to have a difficult performance conversation",
    ],
  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d    = new Date(iso)
  const now  = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7)  return d.toLocaleDateString('en-GB', { weekday: 'long' })
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CultureLabPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [token,       setToken]       = useState<string | null>(null)
  const [firstName,   setFirstName]   = useState('there')
  const [view,        setView]        = useState<'landing' | 'chat'>('landing')
  const [activeTopic, setActiveTopic] = useState<TopicConfig | null>(null)

  // Chat state
  const [sessions,       setSessions]       = useState<Session[]>([])
  const [activeSession,  setActiveSession]  = useState<Session | null>(null)
  const [messages,       setMessages]       = useState<Message[]>([])
  const [input,          setInput]          = useState('')
  const [loading,        setLoading]        = useState(false)
  const [sessionsLoaded, setSessionsLoaded] = useState(false)
  const [msgLoaded,      setMsgLoaded]      = useState(false)
  const [showHistory,    setShowHistory]    = useState(false)
  const [deletingId,     setDeletingId]     = useState<string | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  // Auth + name
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setToken(session.access_token)
      supabase.from('profiles').select('full_name').eq('id', session.user.id).single()
        .then(({ data }) => { if (data?.full_name) setFirstName(data.full_name.split(' ')[0]) })
    })
  }, [supabase, router])

  // Scroll to bottom
  useEffect(() => {
    if (view === 'chat') bottomRef.current?.scrollIntoView({ behavior: msgLoaded ? 'smooth' : 'instant' })
  }, [messages, msgLoaded, view])

  // Focus input when entering chat
  useEffect(() => {
    if (view === 'chat') setTimeout(() => inputRef.current?.focus(), 150)
  }, [view])

  // Load sessions for a topic
  const loadSessions = useCallback(async (topic: Topic) => {
    if (!token) return
    setSessionsLoaded(false)
    try {
      const res = await fetch(`/api/culture-lab?topic=${topic}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) { const d = await res.json(); setSessions(d.sessions ?? []) }
    } finally { setSessionsLoaded(true) }
  }, [token])

  // Load messages for a session
  const loadMessages = useCallback(async (sessionId: string) => {
    if (!token) return
    setMsgLoaded(false)
    try {
      const res = await fetch(`/api/culture-lab?sessionId=${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) { const d = await res.json(); setMessages(d.messages ?? []) }
    } finally { setMsgLoaded(true) }
  }, [token])

  // Open topic — starts a new conversation immediately
  async function openTopic(topic: TopicConfig) {
    if (!token) return
    setActiveTopic(topic)
    setMessages([])
    setShowHistory(false)

    // Create a new session for this topic
    const res = await fetch('/api/culture-lab', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body:    JSON.stringify({ action: 'new_session', topic: topic.id }),
    })
    if (res.ok) {
      const { session } = await res.json()
      setActiveSession(session)
      setMsgLoaded(true)
    }

    await loadSessions(topic.id)
    setView('chat')
  }

  // Resume a past session
  async function resumeSession(session: Session) {
    setActiveSession(session)
    setMessages([])
    setView('chat')
    await loadMessages(session.id)
  }

  // Send message
  async function send(overrideText?: string) {
    const text = (overrideText ?? input).trim()
    if (!text || loading || !activeSession || !activeTopic || !token) return
    setInput('')
    setLoading(true)

    setMessages(prev => [
      ...prev,
      { role: 'user',      content: text, pending: false },
      { role: 'assistant', content: '',   pending: true  },
    ])

    try {
      const res = await fetch('/api/culture-lab', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ message: text, sessionId: activeSession.id, topic: activeTopic.id }),
      })
      const data = await res.json()
      const reply = res.ok && data.reply ? data.reply : 'Something went wrong. Please try again.'
      setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: reply }])

      // Update session title if first message
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

  // Delete session
  async function deleteSession(sessionId: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!token) return
    setDeletingId(sessionId)
    try {
      await fetch(`/api/culture-lab?sessionId=${sessionId}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      })
      setSessions(prev => prev.filter(s => s.id !== sessionId))
    } finally { setDeletingId(null) }
  }

  // ── LANDING VIEW ────────────────────────────────────────────────────────────

  if (view === 'landing') {
    return (
      <main className="min-h-screen" style={{ backgroundColor: '#F4FDF9' }}>

        {/* Header */}
        <div style={{ backgroundColor: '#0A2E2A' }}>
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')}
                    className="text-sm hover:opacity-80" style={{ color: '#B9F8DD' }}>
              ← Back
            </button>
            <div className="flex items-center gap-3 flex-1">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                   style={{ backgroundColor: '#0AF3CD' }}>🧪</div>
              <div>
                <p className="text-sm font-bold" style={{ color: 'white' }}>Culture Lab</p>
                <p className="text-xs" style={{ color: '#B9F8DD' }}>Culture and values coaching</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

          {/* Hero */}
          <div>
            <h1 className="text-2xl font-black mb-2" style={{ color: '#0A2E2A' }}>
              Culture Lab
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
              Your coaching space for the cultural dimensions of leadership. Each conversation is focused, practical, and grounded in your specific context.
            </p>
          </div>

          {/* Topic cards */}
          <div className="space-y-3">
            {Object.values(TOPICS).map(topic => (
              <div key={topic.id}
                   className="rounded-2xl overflow-hidden"
                   style={{ backgroundColor: 'white', border: '1px solid #E8FDF7', boxShadow: '0 2px 12px rgba(10,46,42,0.07)' }}>

                {/* Colour top strip */}
                <div style={{ height: 4, background: `linear-gradient(90deg, ${topic.color}88, ${topic.color})` }} />

                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Emoji badge */}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
                         style={{ backgroundColor: topic.bg }}>
                      {topic.emoji}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base mb-1" style={{ color: '#0A2E2A' }}>{topic.name}</p>
                      <p className="text-sm leading-relaxed mb-4" style={{ color: '#6B7280' }}>{topic.tagline}</p>

                      <button onClick={() => openTopic(topic)}
                              className="w-full py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
                              style={{ backgroundColor: topic.color, color: topic.id === 'psych-safety' ? 'white' : '#0A2E2A' }}>
                        Start conversation →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-center pb-4" style={{ color: '#9CA3AF' }}>
            Culture Lab is separate from the MQ Coaching Room, which focuses on your individual mindset development.
          </p>
        </div>
      </main>
    )
  }

  // ── CHAT VIEW ───────────────────────────────────────────────────────────────

  const topic = activeTopic!

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: '#F4FDF9' }}>

      {/* Header */}
      <div style={{ backgroundColor: '#0A2E2A' }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => setView('landing')}
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 hover:opacity-80"
                  style={{ color: '#B9F8DD', border: '1px solid rgba(185,248,221,0.3)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                 style={{ backgroundColor: topic.bg }}>
              {topic.emoji}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold" style={{ color: 'white' }}>{topic.name}</p>
              <p className="text-xs" style={{ color: '#B9F8DD' }}>Culture Lab · always focused on your context</p>
            </div>
          </div>

          {/* History toggle */}
          {sessions.length > 0 && (
            <button
              onClick={() => setShowHistory(v => !v)}
              className="text-xs px-2.5 py-1 rounded-full flex-shrink-0"
              style={{ color: '#B9F8DD', border: '1px solid rgba(185,248,221,0.3)' }}>
              History
            </button>
          )}
        </div>

        {/* History drawer */}
        {showHistory && (
          <div className="max-w-2xl mx-auto px-6 pb-4 space-y-2 border-t"
               style={{ borderColor: 'rgba(185,248,221,0.2)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider pt-3" style={{ color: '#B9F8DD' }}>
              Past conversations on this topic
            </p>
            {sessions.map(s => (
              <div key={s.id}
                   className="flex items-center gap-2 rounded-xl px-3 py-2 cursor-pointer hover:opacity-80"
                   style={{ backgroundColor: 'rgba(10,243,205,0.08)' }}
                   onClick={() => { setShowHistory(false); resumeSession(s) }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'white' }}>{s.title}</p>
                  <p className="text-xs" style={{ color: '#B9F8DD' }}>{formatDate(s.updated_at)}</p>
                </div>
                <button
                  onClick={e => deleteSession(s.id, e)}
                  disabled={deletingId === s.id}
                  className="w-6 h-6 rounded-lg flex items-center justify-center opacity-50 hover:opacity-100"
                  style={{ backgroundColor: '#FEE2E2' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>
            ))}
            <button
              onClick={async () => {
                setShowHistory(false)
                if (!token) return
                const res = await fetch('/api/culture-lab', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ action: 'new_session', topic: topic.id }),
                })
                if (res.ok) {
                  const { session } = await res.json()
                  setActiveSession(session)
                  setMessages([])
                  setMsgLoaded(true)
                  setSessions(prev => [session, ...prev])
                }
              }}
              className="w-full py-2 rounded-xl text-xs font-bold mt-1"
              style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}>
              + New conversation
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-6 space-y-4">

          {!msgLoaded && (
            <div className="flex justify-center py-8">
              <div className="flex gap-1.5">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                       style={{ backgroundColor: topic.color, animationDelay: `${i*0.15}s` }} />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {msgLoaded && messages.length === 0 && (
            <div className="py-6">
              {/* Intro card */}
              <div className="rounded-2xl p-5 mb-6"
                   style={{ backgroundColor: topic.bg, border: `1px solid ${topic.color}40` }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{topic.emoji}</span>
                  <span className="text-sm font-bold" style={{ color: topic.color }}>{topic.name}</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                  {topic.intro}
                </p>
              </div>

              {/* Starter prompts */}
              <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-center"
                 style={{ color: '#9CA3AF' }}>
                Start with a question
              </p>
              <div className="space-y-2">
                {topic.prompts.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => send(prompt)}
                    disabled={loading}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                    style={{
                      backgroundColor: 'white',
                      color: '#0A2E2A',
                      border: `1px solid ${topic.color}50`,
                      boxShadow: '0 1px 4px rgba(10,46,42,0.06)',
                    }}>
                    <span className="mr-2" style={{ color: topic.color }}>→</span>
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <div key={msg.id ?? i}
                 className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-sm"
                     style={{ backgroundColor: topic.bg }}>
                  {topic.emoji}
                </div>
              )}
              <div className="max-w-sm rounded-2xl px-4 py-3 text-sm leading-relaxed"
                   style={msg.role === 'user'
                     ? { backgroundColor: '#0A2E2A', color: 'white', borderBottomRightRadius: 4 }
                     : { backgroundColor: 'white', color: '#0A2E2A', borderBottomLeftRadius: 4, border: `1px solid ${topic.color}33` }}>
                {msg.pending ? (
                  <div className="flex gap-1 items-center py-1">
                    {[0,1,2].map(j => (
                      <div key={j} className="w-2 h-2 rounded-full animate-bounce"
                           style={{ backgroundColor: topic.color, animationDelay: `${j*0.15}s` }} />
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
            placeholder={`Talk to your ${topic.name.toLowerCase()} coach…`}
            rows={1}
            disabled={loading}
            className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none resize-none disabled:opacity-50"
            style={{ border: `2px solid ${topic.color}60`, backgroundColor: '#FFFFF8', color: '#0A2E2A', maxHeight: 120 }}
            onInput={e => {
              const el = e.currentTarget
              el.style.height = 'auto'
              el.style.height = `${Math.min(el.scrollHeight, 120)}px`
            }}
          />
          <button onClick={() => send()} disabled={!input.trim() || loading}
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-opacity"
                  style={{ backgroundColor: topic.color, color: topic.id === 'psych-safety' ? 'white' : '#0A2E2A' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <p className="text-center text-xs pb-3" style={{ color: '#9CA3AF' }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
