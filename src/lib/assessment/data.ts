// ============================================================
// MQ ASSESSMENT — QUESTIONS, SCORING & INSIGHTS
// 7 dimensions × 3 questions = 21 questions total
// ============================================================

export const SCALE_OPTIONS = [
  { value: 1, short: 'Rarely',        description: 'this is not like me' },
  { value: 2, short: 'Occasionally',  description: 'sometimes, not reliably' },
  { value: 3, short: 'Sometimes',     description: 'about half the time' },
  { value: 4, short: 'Often',         description: 'this is usually true for me' },
  { value: 5, short: 'Always',        description: 'consistently true for me' },
]

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
  questions:   string[]
  description: string
  insights:    DimensionInsights
}

export const DIMENSIONS: Dimension[] = [
  {
    id: 1,
    name: 'Self-awareness',
    shortName: 'Self-awareness',
    color: '#0AF3CD',
    description: 'The capacity to notice your own thoughts, emotions and patterns in real time — not just in reflection.',
    questions: [
      'I notice when my thoughts or mood are influencing my behaviour in the moment.',
      'I can identify my emotional triggers before they affect how I respond to others.',
      'I am aware of the stories I tell myself about situations, and I question whether they are true.',
    ],
    insights: {
      strong:     'You have a genuine window into your own thinking in real time. This depth of self-awareness is the foundation everything else is built on — and yours is working well.',
      developing: 'You\'re developing real self-awareness. Getting sharper at noticing your patterns as they\'re happening — not just in reflection — will accelerate everything else.',
      growing:    'Self-awareness is the foundation all other MQ dimensions are built on. Starting here is the right place — the growth you make in this area will ripple across your whole profile.',
    },
  },
  {
    id: 2,
    name: 'Ego & identity',
    shortName: 'Ego & identity',
    color: '#EC4899',
    description: 'The capacity to lead from purpose rather than from the need to protect your image, status or sense of being right.',
    questions: [
      'I can acknowledge when I am wrong or don\'t know something, without feeling threatened.',
      'When my ideas or decisions are challenged, I respond with curiosity rather than defensiveness.',
      'I notice when I am acting to protect my image or status rather than to do what is right.',
    ],
    insights: {
      strong:     'You lead with real security — not the kind that comes from always being right, but the kind that comes from knowing who you are. That\'s rare and genuinely powerful.',
      developing: 'You\'re building the capacity to lead from purpose rather than ego protection. Noticing the moments where defensiveness shows up is the first and most important step.',
      growing:    'Ego and identity protection is one of the most common — and least discussed — blockers of great leadership. Naming it here is the beginning of changing it.',
    },
  },
  {
    id: 3,
    name: 'Emotional regulation',
    shortName: 'Emotional regulation',
    color: '#F97316',
    description: 'The capacity to stay resourceful under pressure — noticing and acknowledging emotions without being governed by them.',
    questions: [
      'I can stay present and think clearly in difficult conversations, even when under pressure.',
      'When I notice I\'ve been triggered, I can pause and choose my response rather than react immediately.',
      'I am able to separate how I feel from how I choose to respond in a professional context.',
    ],
    insights: {
      strong:     'Your ability to stay composed under pressure is a genuine asset. The steadiness you bring has a direct calming effect on the people around you.',
      developing: 'You\'re developing solid emotional regulation. The real test is under significant pressure — building your capacity there will pay dividends in your hardest moments.',
      growing:    'Emotional regulation is entirely learnable. The space between being triggered and how you respond can be widened deliberately — and that changes everything.',
    },
  },
  {
    id: 4,
    name: 'Cognitive flexibility',
    shortName: 'Cognitive flexibility',
    color: '#05A88E',
    description: 'The capacity to hold your own thinking lightly — challenging assumptions, reframing setbacks and updating beliefs rather than being trapped by fixed patterns.',
    questions: [
      'When I face a setback, I can genuinely reframe it as information rather than a failure.',
      'I challenge my own assumptions when making decisions, rather than defaulting to my first instinct.',
      'I notice when I am holding a fixed belief and deliberately consider alternative perspectives.',
    ],
    insights: {
      strong:     'You hold your beliefs lightly and think with genuine flexibility. This makes you a more effective decision-maker and a more trustworthy presence for your team.',
      developing: 'You\'re building real cognitive flexibility. The deliberate pause before forming a view — especially under pressure — will take this further.',
      growing:    'Learning to hold your perspectives more lightly is one of the highest-leverage shifts you can make as a leader. Start by noticing where you feel most certain.',
    },
  },
  {
    id: 5,
    name: 'Values & purpose',
    shortName: 'Values & purpose',
    color: '#3B82F6',
    description: 'The capacity to make decisions from a clear sense of what you stand for and why you lead — rather than from fear, habit or external pressure.',
    questions: [
      'When facing difficult choices, I act from my values rather than from fear or external pressure.',
      'My team would describe my behaviour as consistent with what I say matters to me.',
      'I have a clear sense of why I lead — not just what I do, but what I am ultimately in service of.',
    ],
    insights: {
      strong:     'You lead from a clear sense of what matters and why. This consistency is one of the most trust-building things a leader can do — your team knows where you stand.',
      developing: 'Your values and sense of purpose are becoming a clearer anchor. Making them more explicit — and testing them under pressure — will strengthen this foundation.',
      growing:    'Getting clear on your values and your deeper purpose is some of the most grounding work a leader can do. The clearer you are about why you lead, the more consistent and trusted you become.',
    },
  },
  {
    id: 6,
    name: 'Relational mindset',
    shortName: 'Relational mindset',
    color: '#8B5CF6',
    description: 'The internal orientation that makes genuine leadership of people possible — curiosity about what drives others, awareness of your impact on them, and a desire to enable rather than control.',
    questions: [
      'I genuinely seek to understand what motivates and matters to the people I lead.',
      'I notice how my energy and emotional state affect the people around me.',
      'I enable my team to do their best work rather than trying to control how they do things.',
    ],
    insights: {
      strong:     'You bring a genuinely relational quality to your leadership. People feel seen and enabled by how you engage — and that\'s a rare and powerful thing.',
      developing: 'You\'re building a strong relational foundation. Going deeper in understanding what drives each individual, and noticing your own emotional impact, will amplify your effectiveness.',
      growing:    'Developing your relational mindset will transform your effectiveness as a leader. People consistently do their best work when they feel genuinely seen and trusted.',
    },
  },
  {
    id: 7,
    name: 'Adaptive resilience',
    shortName: 'Adaptive resilience',
    color: '#F59E0B',
    description: 'The capacity to maintain your effectiveness, purpose and identity under conditions of pressure, uncertainty and change.',
    questions: [
      'I maintain my effectiveness and sense of purpose during periods of uncertainty or change.',
      'When under significant pressure, I can still access my best thinking rather than going into survival mode.',
      'I can flex my approach when a situation demands it, without losing my core sense of who I am.',
    ],
    insights: {
      strong:     'You navigate uncertainty and pressure with real resilience. Maintaining access to your best thinking when conditions are tough is a high-value leadership capability.',
      developing: 'You\'re building solid adaptive resilience. Strengthening your ability to stay resourceful under significant pressure will make a meaningful difference in your hardest moments.',
      growing:    'Building adaptive resilience is about expanding your range — so you can stay effective and purposeful when it matters most. This is one of the highest-leverage development areas in MQ.',
    },
  },
]

// Flat list of all 21 questions for easy indexing
export const ALL_QUESTIONS = DIMENSIONS.flatMap((dim, dIdx) =>
  dim.questions.map((text, qIdx) => ({
    text,
    dimension: dim,
    dimensionIndex: dIdx,
    questionIndexInDimension: qIdx,
    globalIndex: dIdx * 3 + qIdx,
  }))
)

export const TOTAL_QUESTIONS = ALL_QUESTIONS.length // 21

// ── Scoring ─────────────────────────────────────────────────────

export function calculateDimensionScore(responses: number[], dimensionIndex: number): number {
  const scores = responses.slice(dimensionIndex * 3, dimensionIndex * 3 + 3)
  const sum = scores.reduce((a, b) => a + b, 0)
  return Math.round((sum / 15) * 100)
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
  if (score >= 80) return `${firstName}, you're showing strong mindset leadership. Your profile reveals a leader who is self-aware, purposeful and able to stay resourceful under pressure.`
  if (score >= 60) return `${firstName}, your MQ profile shows a leader who is actively developing their mindset. There's real strength here — and clear areas to build on.`
  if (score >= 40) return `${firstName}, your MQ profile highlights real opportunities for growth. The dimensions below show where your development will have the most impact.`
  return `${firstName}, this is an honest starting point — and the most valuable kind. The awareness you're building now is the foundation for everything that follows.`
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
