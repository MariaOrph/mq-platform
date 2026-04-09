'use client'

import { useState } from 'react'

// ── Types ───────────────────────────────────────────────────────────────────────

type Category =
  | 'Developing Talent'
  | 'Driving Performance'
  | 'Shaping Culture'
  | 'Creating Clarity'
  | 'Leadership'

type Resource = {
  title: string
  description: string
  category: Category
  filename: string
}

// ── Resource catalogue ──────────────────────────────────────────────────────────

const RESOURCES: Resource[] = [

  // ── Developing Talent ──────────────────────────────────────────────────
  {
    title: 'Coaching Your Team',
    description: 'The GROW model and the shift from directing to developing.',
    category: 'Developing Talent',
    filename: 'Coaching Your Team.pdf',
  },
  {
    title: 'Giving Effective Feedback',
    description: 'The AID framework for feedback that is clear, forward-looking, and actually lands.',
    category: 'Developing Talent',
    filename: 'Giving Effective Feedback.pdf',
  },
  {
    title: 'Mentoring',
    description: 'How to be a mentor who opens doors, shares experience, and accelerates someone else\'s growth.',
    category: 'Developing Talent',
    filename: 'Mentoring.pdf',
  },
  {
    title: 'Career and Development Conversations',
    description: 'The four-layer framework for conversations that change the trajectory of someone\'s career.',
    category: 'Developing Talent',
    filename: 'Career and Development Conversations.pdf',
  },

  // ── Driving Performance ────────────────────────────────────────────────
  {
    title: 'Running Effective 1:1s',
    description: 'A simple structure for the most important recurring meeting you have.',
    category: 'Driving Performance',
    filename: 'Running Effective 1-1s.pdf',
  },
  {
    title: 'Setting Clear Goals',
    description: 'How to write goals that drive real performance, using the SMART framework.',
    category: 'Driving Performance',
    filename: 'Setting Clear Goals.pdf',
  },
  {
    title: 'Managing Underperformance',
    description: 'How to address poor performance early, fairly, and with clarity on both sides.',
    category: 'Driving Performance',
    filename: 'Managing Underperformance.pdf',
  },
  {
    title: 'Having Difficult Conversations',
    description: 'How to approach high-stakes conversations with clarity, composure, and care.',
    category: 'Driving Performance',
    filename: 'Having Difficult Conversations.pdf',
  },
  {
    title: 'Prioritisation',
    description: 'How to focus on what matters when everything feels urgent.',
    category: 'Driving Performance',
    filename: 'Prioritisation.pdf',
  },

  // ── Shaping Culture ────────────────────────────────────────────────────
  {
    title: 'Building Trust',
    description: 'The four pillars of a trustworthy leadership presence.',
    category: 'Shaping Culture',
    filename: 'Building Trust.pdf',
  },
  {
    title: 'Psychological Safety',
    description: 'The four stages of safety that unlock honest, high-performing teams.',
    category: 'Shaping Culture',
    filename: 'Psychological Safety.pdf',
  },
  {
    title: 'Culture of Accountability',
    description: 'How clarity, ownership, and follow-through create cultures where people deliver.',
    category: 'Shaping Culture',
    filename: 'Culture of Accountability.pdf',
  },
  {
    title: 'Active Listening',
    description: 'Four levels of listening that build trust and surface what people really need.',
    category: 'Shaping Culture',
    filename: 'Active Listening.pdf',
  },
  {
    title: 'Conflict Resolution',
    description: 'How to surface, navigate, and resolve conflict without taking sides.',
    category: 'Shaping Culture',
    filename: 'Conflict Resolution.pdf',
  },
  {
    title: 'Influencing Without Authority',
    description: 'Four levers for moving people who don\'t report to you.',
    category: 'Shaping Culture',
    filename: 'Influencing Without Authority.pdf',
  },
  {
    title: 'Managing Up',
    description: 'How to build a productive relationship with your manager and make your work visible.',
    category: 'Shaping Culture',
    filename: 'Managing Up.pdf',
  },

  // ── Creating Clarity ───────────────────────────────────────────────────
  {
    title: 'Delegating Effectively',
    description: 'How to transfer ownership — not just tasks — in a way that develops your team.',
    category: 'Creating Clarity',
    filename: 'Delegating Effectively.pdf',
  },
  {
    title: 'Running Effective Meetings',
    description: 'What to do before, during, and after a meeting so it is actually worth the time.',
    category: 'Creating Clarity',
    filename: 'Running Effective Meetings.pdf',
  },
  {
    title: 'Decision Making',
    description: 'The WRAP framework for decisions that are well-made, not just well-intentioned.',
    category: 'Creating Clarity',
    filename: 'Decision Making.pdf',
  },
  {
    title: 'Onboarding New Team Members',
    description: 'A 30/60/90 day framework for setting up new hires — and yourself — for success.',
    category: 'Creating Clarity',
    filename: 'Onboarding New Team Members.pdf',
  },

  // ── Leadership ─────────────────────────────────────────────────────────
  {
    title: 'Leading Through Change',
    description: 'How to guide your team from awareness through to committed action.',
    category: 'Leadership',
    filename: 'Leading Through Change.pdf',
  },
  {
    title: 'Developing Future Leaders',
    description: 'Four levers that turn your 1:1s and day-to-day interactions into a development engine.',
    category: 'Leadership',
    filename: 'Developing Future Leaders.pdf',
  },
  {
    title: 'Strategic Communication',
    description: 'Purpose, audience, message, channel — the four questions to answer before you communicate anything important.',
    category: 'Leadership',
    filename: 'Strategic Communication.pdf',
  },
  {
    title: 'Stakeholder Management',
    description: 'How to map, engage, and influence the people who shape your success.',
    category: 'Leadership',
    filename: 'Stakeholder Management.pdf',
  },
  {
    title: 'Executive Presence',
    description: 'The signals — verbal and non-verbal — that build credibility and command a room.',
    category: 'Leadership',
    filename: 'Executive Presence.pdf',
  },
]

// ── Category config ─────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  'Developing Talent',
  'Driving Performance',
  'Shaping Culture',
  'Creating Clarity',
  'Leadership',
]

const CATEGORY_CONFIG: Record<Category, {
  colour: string; bg: string; border: string; text: string; emoji: string; tagline: string
}> = {
  'Developing Talent':   { colour: '#0AF3CD', bg: '#E8FDF7', border: '#B9F8DD', text: '#065f46', emoji: '🌱', tagline: 'Coaching, feedback, and growing the people around you' },
  'Driving Performance': { colour: '#f59e0b', bg: '#FEF3C7', border: '#FDE68A', text: '#92400e', emoji: '🎯', tagline: 'Goals, accountability, and getting results through others' },
  'Shaping Culture':     { colour: '#a78bfa', bg: '#EDE9FE', border: '#DDD6FE', text: '#4c1d95', emoji: '🤝', tagline: 'Trust, safety, and the environment your team works in' },
  'Creating Clarity':    { colour: '#3b82f6', bg: '#EFF6FF', border: '#BFDBFE', text: '#1e40af', emoji: '🧭', tagline: 'Structure, decisions, and making expectations unmistakable' },
  'Leadership':          { colour: '#f43f5e', bg: '#FFF1F2', border: '#FECDD3', text: '#881337', emoji: '⭐', tagline: 'Bigger-picture skills for those shaping direction and culture at scale' },
}

// ── Page ────────────────────────────────────────────────────────────────────────

export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState<Category | null>(null)

  const visibleCategories = activeCategory ? [activeCategory] : CATEGORIES

  return (
    <div className="min-h-screen animate-fadeIn" style={{ backgroundColor: '#f0faf6' }}>

      {/* Header */}
      <div className="sticky top-0 z-30" style={{ backgroundColor: '#0A2E2A' }}>
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="/dashboard"
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(10,243,205,0.12)', color: '#0AF3CD' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </a>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#0AF3CD' }}>Resource Centre</p>
              <p className="text-sm font-bold" style={{ color: 'white' }}>Management &amp; Leadership Skills</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                 style={{ backgroundColor: 'rgba(10,243,205,0.12)', color: '#0AF3CD' }}>
              {RESOURCES.length} guides
            </div>
            <a
              href="/dashboard"
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 20, lineHeight: 1 }}
            >{'×'}</a>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-5 space-y-6">

        {/* Intro */}
        <p className="text-sm leading-relaxed" style={{ color: '#4B5563' }}>
          Practical one-pagers on the skills that make the biggest difference. Each includes a framework, what good looks like, and one thing to try this week.
        </p>

        {/* Category filter chips */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={
              activeCategory === null
                ? { backgroundColor: '#0A2E2A', color: '#0AF3CD' }
                : { backgroundColor: 'white', color: '#6B7280', border: '1px solid #E5E7EB' }
            }
          >
            All ({RESOURCES.length})
          </button>
          {CATEGORIES.map(cat => {
            const cfg = CATEGORY_CONFIG[cat]
            const count = RESOURCES.filter(r => r.category === cat).length
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={
                  activeCategory === cat
                    ? { backgroundColor: cfg.colour, color: cfg.text, border: `1px solid ${cfg.colour}` }
                    : { backgroundColor: 'white', color: '#6B7280', border: '1px solid #E5E7EB' }
                }
              >
                {cfg.emoji} {cat} ({count})
              </button>
            )
          })}
        </div>

        {/* Grouped sections */}
        {visibleCategories.map(cat => {
          const cfg = CATEGORY_CONFIG[cat]
          const resources = RESOURCES.filter(r => r.category === cat)
          return (
            <div key={cat}>

              {/* Section header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                     style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}>
                  {cfg.emoji}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#0A2E2A' }}>{cat}</p>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>{cfg.tagline}</p>
                </div>
                <div className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                     style={{ backgroundColor: cfg.bg, color: cfg.text }}>
                  {resources.length}
                </div>
              </div>

              {/* Resource cards */}
              <div className="space-y-2 pl-0">
                {resources.map(resource => (
                  <a
                    key={resource.filename}
                    href={`/resources/${resource.filename.replace(/ /g, '%20')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-2xl p-4 transition-all hover:shadow-md group"
                    style={{ backgroundColor: 'white', border: `1px solid #F3F4F6`, boxShadow: '0 1px 4px rgba(10,46,42,0.04)' }}
                  >
                    {/* Left accent */}
                    <div className="w-1 self-stretch rounded-full flex-shrink-0"
                         style={{ backgroundColor: cfg.colour + '66' }} />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold leading-snug" style={{ color: '#0A2E2A' }}>{resource.title}</p>
                      <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#6B7280' }}>{resource.description}</p>
                    </div>

                    {/* Download icon */}
                    <svg className="flex-shrink-0 opacity-40 group-hover:opacity-70 transition-opacity" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0A2E2A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )
        })}

        {/* ── Research & Attribution ─────────────────────────────────────── */}
        <div className="pt-2">
          <a
            href="/dashboard/methodology"
            className="flex items-center gap-4 rounded-2xl p-5 transition-all hover:shadow-md group"
            style={{ backgroundColor: '#0A2E2A', boxShadow: '0 2px 12px rgba(10,46,42,0.15)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                 style={{ backgroundColor: 'rgba(10,243,205,0.15)' }}>
              🔬
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold" style={{ color: 'white' }}>Research &amp; Attribution</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(185,248,221,0.6)' }}>
                The psychology and leadership research behind the MQ
              </p>
            </div>
            <svg className="flex-shrink-0 opacity-50 group-hover:opacity-80 transition-opacity" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0AF3CD" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </a>
        </div>

      </div>
    </div>
  )
}
