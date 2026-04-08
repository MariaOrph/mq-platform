'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import MicButton from '@/components/MicButton'
import ScenarioSimulator from '@/components/ScenarioSimulator'

// ── Types ─────────────────────────────────────────────────────────────────────

type Topic = 'values' | 'psych-safety' | 'accountability' | 'inclusion'

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


interface DeepDiveCard {
  researcher: string
  work:       string
  tagline:    string
  points:     string[]
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
    name:    'Psychological Safety',
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
    name:    'Accountability',
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
  inclusion: {
    id:      'inclusion',
    name:    'Inclusion',
    tagline: 'Make sure every voice is heard, valued, and given a genuine chance to contribute',
    emoji:   '🤝',
    color:   '#F59E0B',
    bg:      '#FFFBEB',
    intro:   "Inclusion is about whether everyone on your team genuinely belongs, gets heard, and has an equal chance to contribute. I help you see the patterns in how voices, credit, and opportunities are distributed on your team — and what you can do differently as a leader.",
    prompts: [
      "Some voices dominate every meeting — how do I change that?",
      "I want to make sure everyone on my team truly feels they belong",
      "How do I make sure I'm seeking out different perspectives before I decide?",
      "I think someone on my team feels like an outsider — what do I do?",
    ],
  },
}

// ── Dig Deeper data ─────────────────────────────────────────────────────────

const CULTURE_LAB_DEEP_DIVE: Record<Topic, DeepDiveCard[]> = {
  values: [
    {
      researcher: 'Edgar Schein',
      work: 'Organizational Culture and Leadership (1985, updated 2017)',
      tagline: 'Culture lives at the level of assumptions — not values on walls',
      points: [
        'Culture operates at three levels: visible artifacts (behaviours, rituals, symbols), espoused values (what the organisation says it stands for), and underlying assumptions (the unconscious beliefs that actually drive behaviour).',
        'Leaders shape underlying assumptions through what they pay attention to, what they reward, and what they tolerate under pressure — not through what they say.',
        'The gap between stated and lived values almost always reflects a mismatch between espoused values and underlying assumptions.',
        'Real culture change requires surfacing and examining those assumptions — not rewriting the values statement.',
      ],
    },
    {
      researcher: 'Brené Brown',
      work: 'Dare to Lead (2018)',
      tagline: 'Values only become real when you use them to say no',
      points: [
        'Research finding: most people cannot name their top two values without prompting — and fewer still can articulate what those values look like as specific behaviours.',
        'Her method: identify two core values, translate each into three specific, observable behaviours, and use them as explicit decision-making criteria when things are hard.',
        'Values are most tested under pressure — the moment when living them costs you something.',
        'Leaders who cannot tolerate being wrong consistently build cultures of self-protection around them.',
      ],
    },
    {
      researcher: 'Daniel Coyle',
      work: 'The Culture Code (2018)',
      tagline: 'Culture travels through belonging cues, not mission statements',
      points: [
        'High-performing cultures are built through belonging cues — small, repeated signals that communicate safety, membership, and shared purpose.',
        'The most powerful belonging cues communicate: I see you. I know you matter. We are doing something important together.',
        'Leaders transmit culture in micro-moments: how they start a meeting, respond to a mistake, give credit, or handle a crisis.',
        'Culture is not what leaders say — it is the pattern of behaviour their teams observe and replicate.',
      ],
    },
    {
      researcher: 'Simon Sinek',
      work: 'Start With Why (2009)',
      tagline: 'Leaders who know their Why inspire; those who only know their What manage',
      points: [
        'The Golden Circle: most leaders communicate from the outside in — What they do, How they do it, Why they do it. The most inspiring leaders do the opposite.',
        'Sinek\'s central insight: people don\'t buy what you do, they buy why you do it. Inside organisations, people follow leaders they believe in — not just leaders with good plans.',
        'In a values coaching context, the key question is: can the leader articulate their personal Why as clearly as they can recite the company values? If not, the values stay abstract and borrowed rather than lived and owned.',
        'Sinek is a practitioner and communicator rather than an academic researcher — his framework is the most accessible bridge between values clarity and the practice of inspiring others with it.',
      ],
    },
  ],
  'psych-safety': [
    {
      researcher: 'Amy Edmondson',
      work: 'The Fearless Organization (Harvard, 1999 — updated 2018)',
      tagline: 'Psychological safety is the single strongest predictor of team learning and performance',
      points: [
        'Psychological safety is the shared belief that the team is safe for interpersonal risk-taking — speaking up, asking questions, admitting mistakes, and challenging ideas.',
        'Her original research in hospital teams found that higher-performing teams appeared to make more errors — because they felt safe enough to report them.',
        'Safety is created or destroyed by leader behaviour, particularly the response in the moment when someone speaks up with bad news, a mistake, or an unpopular view.',
        'The most powerful building behaviours: explicitly inviting challenge, modelling fallibility, and following through when someone raises a concern.',
      ],
    },
    {
      researcher: 'Timothy Clark',
      work: '4 Stages of Psychological Safety (2020)',
      tagline: 'Teams move through four stages — and leaders often skip the early ones',
      points: [
        'Stage 1 — Inclusion safety: I feel safe being myself and belonging to the team.',
        'Stage 2 — Learner safety: I feel safe asking questions, making mistakes, and experimenting.',
        'Stage 3 — Contributor safety: I feel safe applying my skills and contributing meaningfully.',
        'Stage 4 — Challenger safety: I feel safe challenging the status quo and questioning decisions.',
        'Leaders who push for challenger safety without having built inclusion and learner safety first will find their efforts backfire.',
      ],
    },
    {
      researcher: 'Anita Woolley',
      work: 'Collective Intelligence (Science, 2010)',
      tagline: 'Team intelligence is predicted by social sensitivity — not individual IQ',
      points: [
        'A landmark study of 699 people working in groups found that what predicts team performance is not average or maximum individual IQ.',
        'The strongest predictor is collective intelligence: social sensitivity — reading others\' emotional states — and equality of conversational turn-taking.',
        'Teams where one or two people dominate the conversation consistently underperform their collective potential.',
        'This is hard scientific evidence that psychological safety is not a soft concern: it directly determines whether a team uses its full intelligence.',
      ],
    },
    {
      researcher: 'Edgar Schein',
      work: 'Humble Inquiry (2013)',
      tagline: 'Asking with genuine curiosity builds more safety than any process',
      points: [
        'Humble inquiry is the art of drawing someone out by asking questions to which you do not already know the answer.',
        'Most leaders are trained to tell, diagnose, and direct — switching to genuine inquiry is counter-cultural and requires deliberate practice.',
        'When leaders ask questions they already know the answer to, people learn quickly that it is not safe to diverge from the expected response.',
        'The discipline is to stay in genuine curiosity — especially when under time pressure or when the answer matters.',
      ],
    },
    {
      researcher: 'Google Project Aristotle',
      work: 'Team Effectiveness Research (2012–2016)',
      tagline: 'Psychological safety beat every other factor in predicting team success at Google',
      points: [
        'A two-year study of 180 Google teams tested dozens of factors: team composition, individual skills, seniority, structure, and more.',
        'The single most important factor was psychological safety — teams where people felt safe to take interpersonal risks significantly outperformed those where they did not.',
        'The finding held across team types, functions, and seniority levels — making it one of the most robust real-world findings on team performance.',
        'Critically: it was not who was on the team that mattered most — it was how they interacted.',
      ],
    },
  ],
  accountability: [
    {
      researcher: 'Kim Scott',
      work: 'Radical Candor (2017)',
      tagline: 'Ruinous Empathy is the most common leadership failure mode',
      points: [
        'Radical Candor sits at the intersection of caring personally and challenging directly — both are required simultaneously.',
        'Ruinous Empathy (high care, low challenge) is the most common failure mode: leaders who are kind to people but not honest with them.',
        'The result: poor performance persists, the person never gets to improve, and the team sees that standards are not enforced.',
        'The reframe: real accountability is an act of respect. Withholding honest feedback is not kindness — it is abdication.',
      ],
    },
    {
      researcher: 'Kerry Patterson & Joseph Grenny',
      work: 'Crucial Accountability (2013)',
      tagline: 'The gap between promising and performing is the central accountability challenge',
      points: [
        'When someone fails to meet a commitment, the first question is not why they didn\'t do it, but whether the expectation was truly clear and agreed.',
        'Effective accountability conversations: name the specific commitment missed (not character), invite their perspective, agree on what changes, and establish a clear check-in.',
        'Delay is the most corrosive response: every day a missed commitment goes unaddressed, the team recalibrates what the real standard is.',
        'The goal is not punishment or compliance — it is restoring the agreement and rebuilding confidence that commitments will be kept.',
      ],
    },
    {
      researcher: 'Chris Argyris',
      work: 'Defensive Routines and the Ladder of Inference',
      tagline: 'Leaders avoid accountability conversations because of stories they never test',
      points: [
        'The ladder of inference: we select data from what we observe, add meaning, draw conclusions, and adopt beliefs — all rapidly and invisibly, without testing any of it.',
        'By the time a leader decides to avoid a conversation, they have typically climbed the entire ladder based on unexamined assumptions.',
        'Defensive routines are organisational patterns that protect everyone from embarrassment by making real performance issues undiscussable.',
        'The discipline before any accountability conversation: notice your own ladder. What are you assuming? What have you not actually checked?',
      ],
    },
  ],
  inclusion: [
    {
      researcher: 'Iris Bohnet',
      work: 'What Works: Gender Equality by Design (Harvard Kennedy School, 2016)',
      tagline: 'Structural changes outperform good intentions — every time',
      points: [
        'The most rigorous research on what actually reduces bias: awareness training rarely changes behaviour in the moment of decision.',
        'Structural solutions have measurable effects: blinded CV reviews, structured interviews with consistent criteria, evaluation rubrics defined before assessment begins.',
        'The most powerful question a leader can ask: what in our current process makes biased outcomes more likely — and what can I change?',
        'De-biasing the process is more reliable than de-biasing the person.',
      ],
    },
    {
      researcher: 'Juliet Bourke',
      work: 'Which Two Heads Are Better Than One (Deloitte research, 2016)',
      tagline: 'Six traits distinguish genuinely inclusive leaders from those who mean well',
      points: [
        'Commitment: inclusion is visible, personal, and deliberate — not delegated to HR.',
        'Courage: calling out exclusion when it happens, even when uncomfortable.',
        'Cognizance of bias: actively acknowledging personal blind spots and systemic patterns.',
        'Curiosity: genuine interest in others\' perspectives with judgment suspended.',
        'Cultural intelligence: attentiveness to how context shapes experience and contribution.',
        'Collaboration: actively seeking diverse input before making decisions — not after.',
      ],
    },
    {
      researcher: 'Claude Steele',
      work: 'Whistling Vivaldi: How Stereotypes Affect Us (2010)',
      tagline: 'Stereotype threat is a performance issue, not just a fairness issue',
      points: [
        'Stereotype threat: when people are aware of a negative stereotype about a group they belong to, the fear of confirming it consumes cognitive resources and impairs performance.',
        'The effect is powerful enough to measurably reduce performance in interviews, tests, and high-stakes moments — even among highly capable people.',
        'Leaders reduce stereotype threat by: affirming belonging explicitly, giving high-standard feedback paired with expressed confidence, and avoiding identity salience in evaluation moments.',
        'Inclusion is not a fairness agenda in isolation — it is about creating conditions where everyone can actually perform at their level.',
      ],
    },
    {
      researcher: 'David Rock / NeuroLeadership Institute',
      work: 'SCARF Model (2008)',
      tagline: 'Exclusion triggers the same threat response as physical danger',
      points: [
        'The brain monitors five social domains for threat: Status, Certainty, Autonomy, Relatedness, and Fairness.',
        'Exclusion dynamics almost always activate multiple SCARF threats simultaneously — Status (being overlooked), Relatedness (not feeling in-group), and Fairness (unequal standards).',
        'When these threats fire, the threat response reduces cognitive capacity — the same prefrontal shutdown that happens under physical stress.',
        'A leader who repeatedly triggers SCARF threats — even unintentionally — is directly impairing the capability and engagement of those affected.',
      ],
    },
  ],
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

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <p className="font-bold text-sm" style={{ color: '#0A2E2A' }}>{title}</p>
      {subtitle && <p className="text-xs" style={{ color: '#9CA3AF' }}>{subtitle}</p>}
    </div>
  )
}

// ── Expandable researcher card ───────────────────────────────────────────────

function ExpandableCard({ card, color, bg }: { card: DeepDiveCard; color: string; bg: string }) {
  const [open, setOpen] = useState(false)
  const initial = card.researcher.split(' ').filter(w => w.length > 1).pop()?.charAt(0) ?? '?'
  return (
    <div className="rounded-2xl overflow-hidden cursor-pointer select-none"
         style={{ backgroundColor: 'white', border: `1px solid ${color}30`, boxShadow: '0 2px 8px rgba(10,46,42,0.06)' }}
         onClick={() => setOpen(v => !v)}>
      <div style={{ height: 3, background: `linear-gradient(90deg, ${color}60, ${color})` }} />
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
               style={{ backgroundColor: bg, color }}>
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm leading-tight" style={{ color: '#0A2E2A' }}>{card.researcher}</p>
            <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{card.work}</p>
            <p className="text-xs font-semibold mt-1.5" style={{ color }}>{card.tagline}</p>
          </div>
          <div className="flex-shrink-0 mt-0.5" style={{ color: '#9CA3AF' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                 style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>
        {open && (
          <div className="mt-3 space-y-2 pl-12">
            {card.points.map((point, j) => (
              <div key={j} className="flex gap-2 items-start">
                <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                <p className="text-xs leading-relaxed" style={{ color: '#374151' }}>{point}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CultureLabPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [token,       setToken]       = useState<string | null>(null)
  const [view,        setView]        = useState<'landing' | 'chat' | 'deep-dive'>('landing')
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
  const [deepDiveTopic,  setDeepDiveTopic]  = useState<Topic | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setToken(session.access_token)
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

  // Open topic
  async function openTopic(topic: TopicConfig) {
    if (!token) return
    setActiveTopic(topic)
    setMessages([])
    setShowHistory(false)

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
      <main className="min-h-screen animate-fadeIn" style={{ backgroundColor: '#F4FDF9' }}>

        {/* Header */}
        <div className="sticky top-0 z-30" style={{ backgroundColor: '#0A2E2A' }}>
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                   style={{ backgroundColor: '#0AF3CD' }}>🤝</div>
              <div>
                <p className="text-sm font-bold" style={{ color: 'white' }}>Culture Lab</p>
                <p className="text-xs" style={{ color: '#B9F8DD' }}>Culture and values coaching</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 20, lineHeight: 1 }}
            >×</button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">

          {/* ── Section 1: Values in Action ─────────────────────────────────── */}
          <div>
            <SectionHeader
              title="Values in Action"
              subtitle="How you live your company values"
            />
            {(() => {
              const topic = TOPICS['values']
              return (
                <div className="rounded-2xl overflow-hidden"
                     style={{ backgroundColor: 'white', border: '1px solid #E8FDF7', boxShadow: '0 2px 12px rgba(10,46,42,0.07)' }}>
                  <div style={{ height: 4, background: `linear-gradient(90deg, ${topic.color}88, ${topic.color})` }} />
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
                           style={{ backgroundColor: topic.bg }}>
                        {topic.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-base mb-1" style={{ color: '#0A2E2A' }}>{topic.name}</p>
                        <p className="text-sm leading-relaxed mb-4" style={{ color: '#6B7280' }}>{topic.tagline}</p>
                        <button onClick={() => openTopic(topic)}
                                className="w-full py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
                                style={{ backgroundColor: topic.color, color: '#0A2E2A' }}>
                          Coach me →
                        </button>
                        <button onClick={() => { setDeepDiveTopic(topic.id); setView('deep-dive') }}
                                className="w-full mt-2 py-2 rounded-xl text-xs font-semibold hover:opacity-80 transition-opacity"
                                style={{ backgroundColor: 'transparent', color: topic.color, border: `1px solid ${topic.color}40` }}>
                          Dive deeper →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* ── Section 2: Building a happy high performing team ────────────── */}
          <div>
            <SectionHeader
              title="Building a happy, high performing team"
            />
            <div className="space-y-3">
              {(['psych-safety', 'accountability', 'inclusion'] as Topic[]).map(id => {
                const topic = TOPICS[id]
                return (
                  <div key={id}
                       className="rounded-2xl overflow-hidden"
                       style={{ backgroundColor: 'white', border: '1px solid #E8FDF7', boxShadow: '0 2px 8px rgba(10,46,42,0.06)' }}>
                    <div style={{ height: 3, background: `linear-gradient(90deg, ${topic.color}88, ${topic.color})` }} />
                    <div className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                             style={{ backgroundColor: topic.bg }}>
                          {topic.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm" style={{ color: '#0A2E2A' }}>{topic.name}</p>
                          <p className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>{topic.tagline}</p>
                        </div>
                        <div className="flex flex-col gap-1.5 flex-shrink-0 items-stretch">
                          <button onClick={() => openTopic(topic)}
                                  className="px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
                                  style={{ backgroundColor: topic.color, color: topic.id === 'psych-safety' ? 'white' : '#0A2E2A' }}>
                            Coach me →
                          </button>
                          <button onClick={() => { setDeepDiveTopic(topic.id); setView('deep-dive') }}
                                  className="px-3 py-1.5 rounded-xl text-xs font-semibold hover:opacity-80 transition-opacity text-center"
                                  style={{ backgroundColor: 'transparent', color: topic.color, border: `1px solid ${topic.color}40` }}>
                            Dive deeper
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Section 3: Scenario Simulator ───────────────────────────────── */}
          <div>
            <SectionHeader
              title="Test Your Instincts"
              subtitle="Real leadership situations. How would you handle it?"
            />
            <div className="rounded-2xl overflow-hidden"
                 style={{ backgroundColor: 'white', border: '1px solid #E8FDF7', boxShadow: '0 2px 12px rgba(10,46,42,0.07)' }}>
              <div style={{ height: 4, background: 'linear-gradient(90deg, #0AF3CD88, #0AF3CD)' }} />
              <div className="p-5">
                {token ? (
                  <ScenarioSimulator token={token} />
                ) : (
                  <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #E5E7EB', borderTopColor: '#0A2E2A', animation: 'spin 0.8s linear infinite' }} />
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    )
  }


  // ── DEEP DIVE VIEW ──────────────────────────────────────────────────────────

  if (view === 'deep-dive' && deepDiveTopic) {
    const ddTopic = TOPICS[deepDiveTopic]
    const ddCards = CULTURE_LAB_DEEP_DIVE[deepDiveTopic]
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
                   style={{ backgroundColor: ddTopic.bg }}>
                {ddTopic.emoji}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold" style={{ color: 'white' }}>{ddTopic.name}</p>
                <p className="text-xs" style={{ color: '#B9F8DD' }}>Research &amp; insights</p>
              </div>
            </div>
            <button onClick={() => openTopic(ddTopic)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: ddTopic.color, color: ddTopic.id === 'psych-safety' ? 'white' : '#0A2E2A' }}>
              Coach me →
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-6 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#9CA3AF' }}>
              {ddCards.length} researcher{ddCards.length !== 1 ? 's' : ''} · tap any card to expand
            </p>
            {ddCards.map((c, i) => (
              <ExpandableCard key={i} card={c} color={ddTopic.color} bg={ddTopic.bg} />
            ))}
          </div>
        </div>

      </div>
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
          <MicButton
            onTranscript={t => setInput(prev => prev ? prev + ' ' + t : t)}
            activeColor={topic.color}
            activeBg="#FFFFF8"
          />
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
