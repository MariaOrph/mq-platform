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
    id: 2, name: 'Ego & identity', color: '#EC4899', bg: '#FCE7F3',
    statements: [
      'Responds to challenge or disagreement without becoming defensive',
      'Gives credit to others readily and openly',
      'Admits uncertainty or mistakes without it threatening their confidence',
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
    id: 4, name: 'Cognitive flexibility', color: '#ff9f43', bg: '#FFF0E0',
    statements: [
      'Genuinely considers different perspectives before reaching a conclusion',
      'Willing to update their view when presented with a compelling argument or new information',
    ],
  },
  {
    id: 5, name: 'Values & purpose', color: '#00c9a7', bg: '#D4F5EF',
    statements: [
      'Acts consistently with their stated values, even when it is difficult',
      'Their decisions reflect a clear sense of what matters, beyond short-term gain',
    ],
  },
  {
    id: 6, name: 'Relational mindset', color: '#2d4a8a', bg: '#E0E6F5',
    statements: [
      'Makes people feel genuinely heard and valued',
      'Creates an environment where people feel safe to be honest',
      'Invests in real relationships, not just transactional ones',
    ],
  },
  {
    id: 7, name: 'Adaptive resilience', color: '#a78bfa', bg: '#EDE9FE',
    statements: [
      'Maintains perspective and energy through setbacks and uncertainty',
      'Brings a constructive, forward-looking attitude to challenges rather than dwelling on problems',
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
