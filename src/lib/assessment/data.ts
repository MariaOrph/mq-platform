// ============================================================
// MQ ASSESSMENT — QUESTIONS, SCORING & INSIGHTS
// 7 dimensions × 4 questions = 28 questions total
// 4-point scale (no neutral middle)
// ============================================================

export interface QuestionOption {
  value: number
  text:  string
}

export interface Question {
  text:    string
  options: QuestionOption[]
}

export interface DimensionInsights {
  strong:     string  // score 70+
  developing: string  // score 45–69
  growing:    string  // score below 45
}

export interface Dimension {
  id:          number
  name:        string
  shortName:   string
  color:       string
  questions:   Question[]
  description: string
  insights:    DimensionInsights
}

export const DIMENSIONS: Dimension[] = [
  {
    id: 1,
    name: 'Self-awareness',
    shortName: 'Self-awareness',
    color: '#fdcb5e',
    description: 'How clearly you see your own strengths, blind spots, patterns and impact on others.',
    questions: [
      {
        text: 'I notice when my thoughts or mood are influencing how I behave in the moment.',
        options: [
          { value: 1, text: 'I rarely notice this, and usually only realise afterwards' },
          { value: 2, text: 'I sometimes notice, but often too late to change anything' },
          { value: 3, text: 'I usually notice while it\u2019s happening' },
          { value: 4, text: 'I consistently notice in real time and adjust accordingly' },
        ],
      },
      {
        text: 'I can accurately describe the impact I have on the people around me.',
        options: [
          { value: 1, text: 'I don\u2019t really think about the impact I have on others' },
          { value: 2, text: 'I have a vague sense, but I\u2019d struggle to be specific' },
          { value: 3, text: 'I have a reasonable understanding of how I come across' },
          { value: 4, text: 'I have a clear and honest picture, including my blind spots' },
        ],
      },
      {
        text: 'When I receive critical feedback, I can separate what\u2019s useful from my emotional reaction to it.',
        options: [
          { value: 1, text: 'I tend to get defensive or dismiss it' },
          { value: 2, text: 'I hear it, but my emotional reaction usually wins' },
          { value: 3, text: 'I can usually take it on board, even if it stings' },
          { value: 4, text: 'I actively welcome it and look for what I can learn' },
        ],
      },
      {
        text: 'I am honest with myself about the gap between how I think I lead and how others experience me.',
        options: [
          { value: 1, text: 'I tend to assume my intentions match my impact' },
          { value: 2, text: 'I occasionally consider the gap but don\u2019t explore it' },
          { value: 3, text: 'I actively reflect on this and seek input from others' },
          { value: 4, text: 'I regularly check this gap and adjust my behaviour based on what I learn' },
        ],
      },
    ],
    insights: {
      strong:     'You have a genuine window into your own thinking in real time. This depth of self-awareness is the foundation everything else is built on, and yours is working well.',
      developing: 'You\u2019re developing real self-awareness. Getting sharper at noticing your patterns as they\u2019re happening, not just in reflection, will accelerate everything else.',
      growing:    'Self-awareness is the foundation all other MQ dimensions are built on. Starting here is the right place. The growth you make in this area will ripple across your whole profile.',
    },
  },
  {
    id: 2,
    name: 'Ego management',
    shortName: 'Ego management',
    color: '#EC4899',
    description: 'How easily you let go of being the expert, accept challenge, and shift your identity from personal performer to enabler of others.',
    questions: [
      {
        text: 'When someone challenges my idea in a meeting, my instinct is to:',
        options: [
          { value: 1, text: 'Defend my position and explain why I\u2019m right' },
          { value: 2, text: 'Feel irritated but try to hear them out' },
          { value: 3, text: 'Genuinely consider their point, even if I initially disagree' },
          { value: 4, text: 'Welcome it as a chance to improve the thinking' },
        ],
      },
      {
        text: 'I find it easy to say "I don\u2019t know" or "I was wrong" in front of my team.',
        options: [
          { value: 1, text: 'I avoid this. It feels like it undermines my authority' },
          { value: 2, text: 'I can do it occasionally, but it doesn\u2019t come naturally' },
          { value: 3, text: 'I\u2019m fairly comfortable with it in most situations' },
          { value: 4, text: 'I do this regularly and see it as a strength' },
        ],
      },
      {
        text: 'I can let go of how something gets done, as long as the outcome is right.',
        options: [
          { value: 1, text: 'I struggle with this. I usually need it done my way' },
          { value: 2, text: 'I try, but I often step in and course-correct' },
          { value: 3, text: 'I can usually let go, unless the stakes are very high' },
          { value: 4, text: 'I genuinely focus on outcomes and give people freedom in how they get there' },
        ],
      },
      {
        text: 'My identity as a leader is based on:',
        options: [
          { value: 1, text: 'Being the most knowledgeable or capable person in the room' },
          { value: 2, text: 'Being respected for my expertise and judgment' },
          { value: 3, text: 'Being someone who makes others better at what they do' },
          { value: 4, text: 'Enabling others to succeed, even when I don\u2019t get the credit' },
        ],
      },
    ],
    insights: {
      strong:     'You lead with real security, not the kind that comes from always being right, but the kind that comes from knowing who you are. That\u2019s rare and genuinely powerful.',
      developing: 'You\u2019re building the capacity to lead from purpose rather than ego protection. Noticing the moments where defensiveness shows up is the first and most important step.',
      growing:    'Ego and identity protection is one of the most common, and least discussed, blockers of great leadership. Naming it here is the beginning of changing it.',
    },
  },
  {
    id: 3,
    name: 'Emotional regulation',
    shortName: 'Emotional regulation',
    color: '#ff7b7a',
    description: 'How well you notice and interrupt your reactive patterns before they drive your behaviour.',
    questions: [
      {
        text: 'When I feel frustrated or stressed at work, I tend to:',
        options: [
          { value: 1, text: 'React immediately. People usually know when I\u2019m annoyed' },
          { value: 2, text: 'Try to contain it, but it often leaks into my tone or body language' },
          { value: 3, text: 'Notice the feeling and usually manage to pause before reacting' },
          { value: 4, text: 'Recognise the emotion, choose how to respond, and stay composed' },
        ],
      },
      {
        text: 'After a difficult or heated conversation, I can move on without it affecting my next interaction.',
        options: [
          { value: 1, text: 'I carry it with me and it colours the rest of my day' },
          { value: 2, text: 'It takes me a while to reset, and the next few interactions can suffer' },
          { value: 3, text: 'I can usually reset fairly quickly' },
          { value: 4, text: 'I consciously reset and approach the next interaction fresh' },
        ],
      },
      {
        text: 'When someone on my team makes a significant mistake, my first response is:',
        options: [
          { value: 1, text: 'Frustration or anger, and they usually see it' },
          { value: 2, text: 'Internal frustration, though I try to stay calm on the surface' },
          { value: 3, text: 'Curiosity about what happened before jumping to judgment' },
          { value: 4, text: 'A calm, genuine focus on understanding and helping them learn from it' },
        ],
      },
      {
        text: 'I notice when my emotional state is about to affect a decision I\u2019m making.',
        options: [
          { value: 1, text: 'Rarely. I tend to realise after the fact' },
          { value: 2, text: 'Sometimes, but usually not quickly enough to change course' },
          { value: 3, text: 'Usually. I can pause and check myself before deciding' },
          { value: 4, text: 'Consistently. I treat my emotional state as data that informs but doesn\u2019t drive my decisions' },
        ],
      },
    ],
    insights: {
      strong:     'Your ability to stay composed under pressure is a genuine asset. The steadiness you bring has a direct calming effect on the people around you.',
      developing: 'You\u2019re developing solid emotional regulation. The real test is under significant pressure. Building your capacity there will pay dividends in your hardest moments.',
      growing:    'Emotional regulation is entirely learnable. The space between being triggered and how you respond can be widened deliberately, and that changes everything.',
    },
  },
  {
    id: 4,
    name: 'Clarity & communication',
    shortName: 'Clarity & comms',
    color: '#ff9f43',
    description: 'How effectively you think through complexity and translate it into clear direction, expectations and decisions for others.',
    questions: [
      {
        text: 'When I give direction or delegate work, the people I\u2019m speaking to walk away clear on what matters most and what success looks like.',
        options: [
          { value: 1, text: 'They often come back with questions or get the priorities wrong' },
          { value: 2, text: 'They usually get the gist, but details or priorities get lost' },
          { value: 3, text: 'They generally understand what\u2019s needed, why it matters, and what to focus on' },
          { value: 4, text: 'They consistently walk away knowing exactly what\u2019s expected, what good looks like, and what takes priority' },
        ],
      },
      {
        text: 'When I give feedback, the person receiving it understands specifically what to do differently.',
        options: [
          { value: 1, text: 'I tend to be vague or avoid specifics' },
          { value: 2, text: 'I give a general sense but don\u2019t always land on concrete actions' },
          { value: 3, text: 'I\u2019m usually clear and specific about what needs to change' },
          { value: 4, text: 'I consistently give feedback that is specific, actionable and tied to impact' },
        ],
      },
      {
        text: 'When facing a complex problem with no obvious answer, I tend to:',
        options: [
          { value: 1, text: 'Feel overwhelmed and delay making a decision' },
          { value: 2, text: 'Simplify it quickly, but sometimes miss important nuance' },
          { value: 3, text: 'Work through the complexity and reach a clear position' },
          { value: 4, text: 'Break it down methodically and communicate my thinking so others can follow and contribute' },
        ],
      },
      {
        text: 'When plans change or new information arrives, I communicate the shift to my team:',
        options: [
          { value: 1, text: 'Inconsistently. People sometimes find out late or not at all' },
          { value: 2, text: 'When I remember, but not always with the context they need' },
          { value: 3, text: 'Promptly, with enough context for them to understand why' },
          { value: 4, text: 'Quickly and clearly, explaining what changed, why, and what it means for them' },
        ],
      },
    ],
    insights: {
      strong:     'You bring real clarity to your communication. Your team knows where they stand, what\u2019s expected, and why. That directness builds trust and momentum.',
      developing: 'You\u2019re building solid communication skills. Getting sharper at translating complex thinking into simple, clear direction will amplify your impact significantly.',
      growing:    'Clarity of communication is one of the highest-leverage skills for any manager. The ability to make expectations, feedback and priorities unmistakably clear changes everything for the people around you.',
    },
  },
  {
    id: 5,
    name: 'Trust & development',
    shortName: 'Trust & development',
    color: '#00c9a7',
    description: 'How deeply you believe in others\u2019 ability to grow, how willingly you give autonomy, and how actively you invest in developing people through coaching and honest feedback.',
    questions: [
      {
        text: 'My default assumption about the people I manage is:',
        options: [
          { value: 1, text: 'They need close oversight to deliver good work' },
          { value: 2, text: 'They\u2019re capable but need regular check-ins to stay on track' },
          { value: 3, text: 'They can be trusted with most things if given clear direction' },
          { value: 4, text: 'They are capable of growth, good judgment and ownership when given the space' },
        ],
      },
      {
        text: 'When someone on my team is struggling, my instinct is to:',
        options: [
          { value: 1, text: 'Step in and take over to make sure it gets done right' },
          { value: 2, text: 'Give them the answer so they can move forward quickly' },
          { value: 3, text: 'Ask questions to help them think it through' },
          { value: 4, text: 'Coach them through it, even if it takes longer, because that\u2019s how they grow' },
        ],
      },
      {
        text: 'I make time for genuine development conversations (not just performance reviews) with my team.',
        options: [
          { value: 1, text: 'Rarely. There\u2019s always something more urgent' },
          { value: 2, text: 'Occasionally, but it\u2019s not consistent' },
          { value: 3, text: 'Regularly, though I could do more' },
          { value: 4, text: 'It\u2019s a deliberate priority. I see growing people as a core part of my role' },
        ],
      },
      {
        text: 'When it comes to giving honest, difficult feedback, I:',
        options: [
          { value: 1, text: 'Avoid it or delay it until it becomes unavoidable' },
          { value: 2, text: 'Give it, but I soften it so much the message gets lost' },
          { value: 3, text: 'Deliver it clearly and directly, even when it\u2019s uncomfortable' },
          { value: 4, text: 'Lean into it. I see honest feedback as one of the most valuable things I can give someone' },
        ],
      },
    ],
    insights: {
      strong:     'You genuinely invest in growing the people around you. This is the hallmark of a leader who has made the shift from personal performance to enabling the performance of others.',
      developing: 'You\u2019re building the trust and coaching habits that define great managers. Leaning further into honest feedback and deliberate development will accelerate the people around you.',
      growing:    'The shift from doing the work yourself to growing others to do it is the most important transition any manager makes. Building trust and investing in development is where that shift begins.',
    },
  },
  {
    id: 6,
    name: 'Standards & accountability',
    shortName: 'Standards',
    color: '#2d4a8a',
    description: 'How consistently you set clear expectations, take ownership of outcomes and hold yourself and others to high standards without micromanaging.',
    questions: [
      {
        text: 'When I set expectations for my team, those expectations are:',
        options: [
          { value: 1, text: 'Often unclear. People aren\u2019t always sure what \u201cgood\u201d looks like' },
          { value: 2, text: 'Mostly understood, though sometimes misinterpreted' },
          { value: 3, text: 'Generally clear and well-communicated' },
          { value: 4, text: 'Explicitly defined, consistently reinforced and tied to outcomes' },
        ],
      },
      {
        text: 'When someone consistently underperforms, I:',
        options: [
          { value: 1, text: 'Avoid addressing it directly and hope it improves' },
          { value: 2, text: 'Mention it eventually, but often too late or too gently' },
          { value: 3, text: 'Address it clearly within a reasonable timeframe' },
          { value: 4, text: 'Have the conversation early, directly and supportively, with a clear plan for improvement' },
        ],
      },
      {
        text: 'When something goes wrong on a project I\u2019m responsible for, my default response is:',
        options: [
          { value: 1, text: 'Look for who or what caused the problem' },
          { value: 2, text: 'Acknowledge the issue but focus on external factors' },
          { value: 3, text: 'Take ownership of my part and focus on the fix' },
          { value: 4, text: 'Take full ownership publicly, then work with the team to understand what happened and prevent it happening again' },
        ],
      },
      {
        text: 'My team would say I hold people accountable in a way that is:',
        options: [
          { value: 1, text: 'Absent. I let things slide more than I should' },
          { value: 2, text: 'Inconsistent. It depends on my mood or the situation' },
          { value: 3, text: 'Fair and clear. People know where they stand' },
          { value: 4, text: 'Firm, consistent and respectful. High standards with high support' },
        ],
      },
    ],
    insights: {
      strong:     'You set a high bar and hold it consistently, with fairness and support. Your team knows what\u2019s expected and trusts that you\u2019ll hold everyone, including yourself, to the same standard.',
      developing: 'You\u2019re building strong accountability habits. Getting more consistent at addressing underperformance early and modelling the standard will strengthen your authority and your team\u2019s trust.',
      growing:    'Clear standards and consistent accountability are the backbone of any high-performing team. Starting to set explicit expectations and own outcomes publicly will transform how your team operates.',
    },
  },
  {
    id: 7,
    name: 'Relational intelligence',
    shortName: 'Relational intelligence',
    color: '#a78bfa',
    description: 'How naturally you build trust, collaborate across difference, and create the conditions for others to contribute fully.',
    questions: [
      {
        text: 'When working with someone whose style or perspective is very different from mine, I:',
        options: [
          { value: 1, text: 'Find it frustrating and tend to avoid collaborating closely' },
          { value: 2, text: 'Tolerate it but default to my own way of doing things' },
          { value: 3, text: 'Make an effort to understand their approach and find common ground' },
          { value: 4, text: 'Actively value the difference and adjust how I work to get the best from both of us' },
        ],
      },
      {
        text: 'When there\u2019s tension or conflict within my team, I:',
        options: [
          { value: 1, text: 'Avoid it and hope it resolves itself' },
          { value: 2, text: 'Acknowledge it but don\u2019t always address the root cause' },
          { value: 3, text: 'Step in to facilitate a conversation and help people work through it' },
          { value: 4, text: 'Address it early and directly, creating a safe space for honest dialogue' },
        ],
      },
      {
        text: 'I invest time in building genuine relationships with the people I work with, not just transactional ones.',
        options: [
          { value: 1, text: 'Not really. I keep things professional and task-focused' },
          { value: 2, text: 'I\u2019m friendly, but I don\u2019t go much deeper than surface level' },
          { value: 3, text: 'I make a genuine effort with most people I work with' },
          { value: 4, text: 'I deliberately build trust-based relationships and see them as foundational to how I lead' },
        ],
      },
      {
        text: 'People outside my immediate team would describe me as someone who collaborates well across boundaries.',
        options: [
          { value: 1, text: 'Probably not. I tend to focus on my own team\u2019s priorities' },
          { value: 2, text: 'Sometimes, but I could be better at thinking beyond my team' },
          { value: 3, text: 'Generally yes. I make an effort to connect and collaborate' },
          { value: 4, text: 'Definitely. I actively build bridges and think about collective success, not just my team\u2019s' },
        ],
      },
    ],
    insights: {
      strong:     'You bring a genuinely relational quality to your leadership. People feel seen, heard and enabled by how you engage, and that\u2019s a rare and powerful thing.',
      developing: 'You\u2019re building strong relational skills. Going deeper in understanding what drives each individual, and investing in trust-based relationships, will amplify your effectiveness.',
      growing:    'Developing your relational intelligence will transform your effectiveness as a leader. People consistently do their best work when they feel genuinely valued and connected.',
    },
  },
]

export const QUESTIONS_PER_DIMENSION = 4

// Flat list of all 28 questions for easy indexing
export const ALL_QUESTIONS = DIMENSIONS.flatMap((dim, dIdx) =>
  dim.questions.map((q, qIdx) => ({
    text: q.text,
    options: q.options,
    dimension: dim,
    dimensionIndex: dIdx,
    questionIndexInDimension: qIdx,
    globalIndex: dIdx * QUESTIONS_PER_DIMENSION + qIdx,
  }))
)

export const TOTAL_QUESTIONS = ALL_QUESTIONS.length // 28

// ── Scoring ─────────────────────────────────────────────────────
// 4-point scale: each question scores 1–4
// Per dimension: 4 questions, max raw = 16, min raw = 4
// Normalised to 0–100

export function calculateDimensionScore(responses: number[], dimensionIndex: number): number {
  const start = dimensionIndex * QUESTIONS_PER_DIMENSION
  const scores = responses.slice(start, start + QUESTIONS_PER_DIMENSION)
  const sum = scores.reduce((a, b) => a + b, 0)
  const maxRaw = QUESTIONS_PER_DIMENSION * 4
  const minRaw = QUESTIONS_PER_DIMENSION * 1
  return Math.round(((sum - minRaw) / (maxRaw - minRaw)) * 100)
}

export function calculateAllScores(responses: number[]) {
  const dimensionScores = DIMENSIONS.map((_, i) => calculateDimensionScore(responses, i))
  const overall = Math.round(dimensionScores.reduce((a, b) => a + b, 0) / DIMENSIONS.length)
  return { dimensionScores, overall }
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'High MQ'
  if (score >= 60) return 'Developing MQ'
  if (score >= 40) return 'Emerging MQ'
  return 'Early MQ'
}

export function getDimensionInsight(dimension: Dimension, score: number): string {
  if (score >= 70) return dimension.insights.strong
  if (score >= 45) return dimension.insights.developing
  return dimension.insights.growing
}

export function getPersonalisedMessage(score: number, firstName: string): string {
  if (score >= 80) return `${firstName}, you\u2019re showing strong leadership maturity. Your profile reveals a leader who is self-aware, purposeful and able to enable the performance of others.`
  if (score >= 60) return `${firstName}, your MQ profile shows a leader who is actively developing. There\u2019s real strength here, and clear areas to build on.`
  if (score >= 40) return `${firstName}, your MQ profile highlights real opportunities for growth. The dimensions below show where your development will have the most impact.`
  return `${firstName}, this is an honest starting point, and the most valuable kind. The awareness you\u2019re building now is the foundation for everything that follows.`
}

// ── Helpers used across the app ──────────────────────────────────
export const DIMENSION_NAMES = DIMENSIONS.map(d => d.name)

export function getDimensionByIndex(index: number): Dimension | undefined {
  return DIMENSIONS[index]
}

// Map DB score columns to dimension indices (d1_score = index 0, etc.)
export const DB_SCORE_COLS = [
  'd1_score', 'd2_score', 'd3_score', 'd4_score',
  'd5_score', 'd6_score', 'd7_score',
] as const
