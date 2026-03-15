'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface Message {
  id?:        string
  role:       'user' | 'assistant'
  content:    string
  created_at?: string
  pending?:   boolean
}

interface CoachingRoomProps {
  token:     string
  firstName: string
  onClose:   () => void
}

export default function CoachingRoom({ token, firstName, onClose }: CoachingRoomProps) {
  const [messages,  setMessages]  = useState<Message[]>([])
  const [input,     setInput]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const bottomRef  = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLTextAreaElement>(null)

  // ── Load history ───────────────────────────────────────────────────────────
  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/coaching-room', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages ?? [])
      }
    } finally {
      setHistoryLoaded(true)
    }
  }, [token])

  useEffect(() => { loadHistory() }, [loadHistory])

  // ── Scroll to bottom on new messages ──────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: historyLoaded ? 'smooth' : 'instant' })
  }, [messages, historyLoaded])

  // ── Focus input on open ────────────────────────────────────────────────────
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  // ── Send message ───────────────────────────────────────────────────────────
  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setLoading(true)

    // Optimistically add user message + typing indicator
    setMessages(prev => [
      ...prev,
      { role: 'user',      content: text,    pending: false },
      { role: 'assistant', content: '',       pending: true  },
    ])

    try {
      const res  = await fetch('/api/coaching-room', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          Authorization:   `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json()
      if (res.ok && data.reply) {
        setMessages(prev => [
          ...prev.slice(0, -1), // remove typing indicator
          { role: 'assistant', content: data.reply },
        ])
      } else {
        setMessages(prev => [
          ...prev.slice(0, -1),
          { role: 'assistant', content: 'Something went wrong. Please try again.' },
        ])
      }
    } catch {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: 'Something went wrong. Please try again.' },
      ])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  const isEmpty = historyLoaded && messages.length === 0

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: '#E8FDF7' }}
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: '#0A2E2A' }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-base"
              style={{ backgroundColor: '#0AF3CD' }}
            >
              🧠
            </div>
            <div>
              <p className="text-sm font-bold leading-tight" style={{ color: 'white' }}>
                The Coaching Room
              </p>
              <p className="text-xs" style={{ color: '#B9F8DD' }}>
                Your MQ Coach · always here
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg leading-none"
            style={{ color: '#B9F8DD', border: '1px solid rgba(185,248,221,0.3)' }}
            aria-label="Close coaching room"
          >
            ×
          </button>
        </div>
      </div>

      {/* ── Messages area ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-6 space-y-4">

          {/* Loading history */}
          {!historyLoaded && (
            <div className="flex justify-center py-8">
              <div className="flex gap-1.5 items-center">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ backgroundColor: '#0AF3CD', animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {isEmpty && (
            <div className="text-center py-12">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl"
                style={{ backgroundColor: '#0A2E2A' }}
              >
                🧠
              </div>
              <p className="text-base font-semibold mb-2" style={{ color: '#0A2E2A' }}>
                Hey {firstName}, I'm your MQ Coach.
              </p>
              <p className="text-sm max-w-xs mx-auto" style={{ color: '#05A88E' }}>
                Bring me anything — a tricky conversation, a leadership challenge, something you're working through. I'm here.
              </p>
              {/* Starter prompts */}
              <div className="flex flex-wrap gap-2 justify-center mt-6">
                {[
                  'I have a difficult conversation coming up',
                  'I\'m struggling to motivate my team',
                  'I feel like I\'m losing confidence',
                  'I need help with a decision',
                ].map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="text-xs px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: 'white', color: '#05A88E', border: '1px solid #B9F8DD' }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <div
              key={msg.id ?? i}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Coach avatar */}
              {msg.role === 'assistant' && (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-sm"
                  style={{ backgroundColor: '#0A2E2A' }}
                >
                  🧠
                </div>
              )}

              {/* Bubble */}
              <div
                className="max-w-sm rounded-2xl px-4 py-3 text-sm leading-relaxed"
                style={
                  msg.role === 'user'
                    ? { backgroundColor: '#0A2E2A', color: 'white',    borderBottomRightRadius: 4 }
                    : { backgroundColor: 'white',   color: '#0A2E2A',  borderBottomLeftRadius: 4, border: '1px solid #B9F8DD' }
                }
              >
                {msg.pending ? (
                  /* Typing indicator */
                  <div className="flex gap-1 items-center py-1">
                    {[0, 1, 2].map(j => (
                      <div
                        key={j}
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ backgroundColor: '#05A88E', animationDelay: `${j * 0.15}s` }}
                      />
                    ))}
                  </div>
                ) : (
                  /* Render content with paragraph breaks */
                  msg.content.split('\n\n').map((para, p) => (
                    <p key={p} className={p > 0 ? 'mt-3' : ''}>
                      {para}
                    </p>
                  ))
                )}
              </div>
            </div>
          ))}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input bar ───────────────────────────────────────────────────────── */}
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
            style={{
              border:          '2px solid #B9F8DD',
              backgroundColor: '#F9FFFE',
              color:           '#0A2E2A',
              maxHeight:       120,
            }}
            onInput={e => {
              const el = e.currentTarget
              el.style.height = 'auto'
              el.style.height = `${Math.min(el.scrollHeight, 120)}px`
            }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-opacity"
            style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}
            aria-label="Send message"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="text-center text-xs pb-3" style={{ color: '#B9F8DD' }}>
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
