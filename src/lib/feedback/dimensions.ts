export interface FeedbackDimension {
  id:         number
  name:       string
  color:      string
  bg:         string
  statements: string[]
}

// Observable statements per dimension — rated by peers on a 1–4 scale:
// 1 = Rarely, 2 = Sometimes, 3 = Usually, 4 = Consistently
export const FEEDBACK_DIMENSIONS: FeedbackDimension[] = [
  {
    id: 1, name: 'Self-awareness', color: '#fdcb5e', bg: '#FEF5D9',
    statements: [
      'Seems genuinely aware of how their behaviour and communication land on others',
      'Actively seeks feedback and responds to it openly',
      'Acknowledges when they have got something wrong or could have handled things better',
    ],
  },
  {
    id: 2, name: 'Ego management', color: '#EC4899', bg: '#FCE7F3',
    statements: [
      'Responds to challenge or disagreement without becoming defensive',
      'Gives credit to others readily and openly',
      'Lets go of how things get done and focuses on outcomes rather than controlling the process',
    ],
  },
  {
    id: 3, name: 'Emotional regulation', color: '#ff7b7a', bg: '#FFE8E8',
    statements: [
      'Stays composed and grounded under pressure',
      'Responds to difficult situations without reacting impulsively',
      'Their emotional state has a steady, positive effect on those around them',
    ],
  },
  {
    id: 4, name: 'Clarity & communication', color: '#ff9f43', bg: '#FFF0E0',
    statements: [
      'Communicates expectations, priorities and direction clearly',
      'Gives feedback that is specific, actionable and helpful',
      'Keeps the team informed when plans or priorities change',
    ],
  },
  {
    id: 5, name: 'Trust & development', color: '#00c9a7', bg: '#D4F5EF',
    statements: [
      'Trusts people to do their work without micromanaging',
      'Invests time in developing others through coaching and honest feedback',
      'Creates opportunities for people to stretch and grow',
    ],
  },
  {
    id: 6, name: 'Standards & accountability', color: '#2d4a8a', bg: '#E0E6F5',
    statements: [
      'Sets clear expectations and holds people to them fairly and consistently',
      'Takes ownership when things go wrong rather than looking for someone to blame',
      'Leads by example and holds themselves to the same standards as the team',
    ],
  },
  {
    id: 7, name: 'Relational intelligence', color: '#a78bfa', bg: '#EDE9FE',
    statements: [
      'Makes people feel genuinely heard and valued',
      'Creates an environment where people feel safe to be honest and to disagree',
      'Builds genuine, trust-based relationships, not just transactional ones',
    ],
  },
]

export const RATING_LABELS: Record<number, string> = {
  1: 'Rarely',
  2: 'Sometimes',
  3: 'Usually',
  4: 'Consistently',
}

export const MIN_RESPONSES_TO_SHOW = 3

// Convert average statement rating (1–4) to 0–100 score for comparison with self-assessment
export function ratingToScore(avgRating: number): number {
  return Math.round(((avgRating - 1) / 3) * 100)
}

// Aggregate peer scores from an array of response dimension scores (already 0–100)
export function aggregatePeerScores(scores: number[]): number {
  if (scores.length === 0) return 0
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}
