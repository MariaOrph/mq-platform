// ============================================================
// MQ ASSESSMENT — QUESTIONS, SCORING & INSIGHTS
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
  id:        number
  name:      string
  color:     string
  questions: string[]
  insights:  DimensionInsights
}

export const DIMENSIONS: Dimension[] = [
  {
    id: 1,
    name: 'Self-awareness',
    color: '#0AF3CD',
    questions: [
      'I notice when my thoughts or mood are influencing my behaviour in the moment.',
      'I can identify my emotional triggers before they affect how I respond to others.',
      'I regularly reflect on how my mindset might be limiting or enabling my performance.',
      'I am aware of the stories I tell myself about situations, and I question whether they are true.',
    ],
    insights: {
      strong:     'You have a genuine window into your own thinking. This depth of self-awareness is the foundation of everything — and yours is working well.',
      developing: 'You\'re developing real self-awareness. Getting sharper at noticing your patterns in the moment — not just in reflection — will accelerate everything else.',
      growing:    'Self-awareness is the foundation all other dimensions are built on. Starting here is exciting — the growth you make in this area will ripple across your whole MQ profile.',
    },
  },
  {
    id: 2,
    name: 'Cognitive flexibility',
    color: '#05A88E',
    questions: [
      'When I face a setback, I can reframe it as an opportunity to learn rather than a failure.',
      'I challenge my own assumptions when making decisions, rather than defaulting to my first instinct.',
      'I am open to feedback, even when it challenges my self-perception.',
      'I notice when I am holding a fixed belief and deliberately consider alternative perspectives.',
    ],
    insights: {
      strong:     'You hold your beliefs lightly and think with genuine flexibility. This makes you a more effective decision-maker and a more trustworthy presence for your team.',
      developing: 'You\'re building good cognitive flexibility. The deliberate pause before forming a view — especially under pressure — will take this further.',
      growing:    'Learning to hold your perspectives more lightly is one of the highest-leverage shifts you can make as a leader. Start by noticing where you feel most certain.',
    },
  },
  {
    id: 3,
    name: 'Emotional regulation',
    color: '#F97316',
    questions: [
      'I can stay calm and composed in difficult conversations, even when under pressure.',
      'When I feel a strong emotion — or notice I have been triggered — I can acknowledge it without immediately acting on it.',
      'I recover from stressful or triggering situations relatively quickly and without significant impact on my performance.',
      'I am able to separate how I feel from how I choose to respond in a professional context.',
    ],
    insights: {
      strong:     'Your ability to stay composed under pressure is a genuine asset. The steadiness you bring has a direct calming effect on the people around you.',
      developing: 'You\'re developing solid emotional regulation. The real test is under pressure — and building your capacity there will pay dividends in your hardest moments.',
      growing:    'Emotional regulation is entirely learnable. Building this capacity will transform how you show up in your most challenging moments — for yourself and your team.',
    },
  },
  {
    id: 4,
    name: 'Values clarity',
    color: '#3B82F6',
    questions: [
      'I have a clear sense of what I value most as a leader, and I use this to guide my decisions.',
      'When facing difficult choices, I act from my values rather than from fear or external pressure.',
      'My team would describe my behaviour as consistent with what I say matters to me.',
      'I can articulate why I lead the way I do, not just what I do.',
    ],
    insights: {
      strong:     'You lead from a clear sense of what matters. This consistency is one of the most trust-building things a leader can do — your team knows where you stand.',
      developing: 'Your values are becoming a clearer leadership anchor. Making them more explicit and testing them under pressure will strengthen this foundation further.',
      growing:    'Getting clear on your values is some of the most grounding work a leader can do. The clearer you are about why you lead, the more consistent and trusted you become.',
    },
  },
  {
    id: 5,
    name: 'Relational mindset',
    color: '#8B5CF6',
    questions: [
      'I genuinely seek to understand what motivates and matters to the people I lead.',
      'I enable my team to do their best work rather than trying to control how they do things.',
      'I am able to have honest, direct conversations with people even when they are uncomfortable.',
      'I notice how my energy and mindset affect the people around me.',
    ],
    insights: {
      strong:     'You bring a genuinely relational quality to your leadership. People feel seen and enabled by how you engage — and that\'s a rare and powerful thing.',
      developing: 'You\'re building a strong relational foundation. Going deeper in understanding what drives each individual will amplify your impact significantly.',
      growing:    'Developing your relational mindset will transform your effectiveness as a leader. People consistently do their best work when they feel truly understood.',
    },
  },
  {
    id: 6,
    name: 'Adaptive resilience',
    color: '#F59E0B',
    questions: [
      'I maintain my effectiveness and sense of purpose during periods of uncertainty or change.',
      'When under significant pressure, I can still access my best thinking rather than going into survival mode.',
      'I see challenges and disruption as something to move through and learn from, not just endure.',
      'I can flex my approach when a situation demands it, without losing my core sense of who I am.',
    ],
    insights: {
      strong:     'You navigate uncertainty and disruption with real resilience. Maintaining your effectiveness when conditions are tough is a high-value capability.',
      developing: 'You\'re building solid adaptive resilience. Strengthening your ability to access your best thinking under significant pressure will make a meaningful difference.',
      growing:    'Building adaptive resilience is about expanding your range — so you can stay resourceful when it matters most. This is one of the highest-leverage development areas in MQ.',
    },
  },
]

// Flat list of all 24 questions for easy indexing
export const ALL_QUESTIONS = DIMENSIONS.flatMap((dim, dIdx) =>
  dim.questions.map((text, qIdx) => ({
    text,
    dimension: dim,
    dimensionIndex: dIdx,
    questionIndexInDimension: qIdx,
    globalIndex: dIdx * 4 + qIdx,
  }))
)

// ── Scoring ────────────────────────────────────────────────────

export function calculateDimensionScore(responses: number[], dimensionIndex: number): number {
  const scores = responses.slice(dimensionIndex * 4, dimensionIndex * 4 + 4)
  const sum = scores.reduce((a, b) => a + b, 0)
  return Math.round((sum / 20) * 100)
}

export function calculateAllScores(responses: number[]) {
  const dimensionScores = DIMENSIONS.map((_, i) => calculateDimensionScore(responses, i))
  const overall = Math.round(dimensionScores.reduce((a, b) => a + b, 0) / 6)
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
  if (score >= 80) return `${firstName}, you're showing strong mindset leadership. Your profile reveals a leader who is self-aware, flexible in their thinking, and grounded in their values.`
  if (score >= 60) return `${firstName}, your MQ profile shows a leader who is actively developing their mindset. There's real strength here — and clear areas to build on.`
  if (score >= 40) return `${firstName}, your MQ profile highlights real opportunities for growth. The dimensions below show where your development will have the most impact.`
  return `${firstName}, this is an honest starting point — and the most valuable kind. The awareness you're building now is the foundation for everything that follows.`
}
