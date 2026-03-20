import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── XP / Level system ─────────────────────────────────────────────────────────

export const LEVELS = [
  { label: 'Rookie',              minXp: 0    },
  { label: 'Developing Manager',  minXp: 100  },
  { label: 'Capable Manager',     minXp: 300  },
  { label: 'Strong Manager',      minXp: 600  },
  { label: 'Exceptional Manager', minXp: 1000 },
]

function getLevelFromXp(xp: number) {
  let level = LEVELS[0]
  for (const l of LEVELS) {
    if (xp >= l.minXp) level = l
  }
  return level
}

function starsFromScore(score: number): number {
  if (score >= 5) return 3
  if (score >= 3) return 2
  return 1
}

function xpFromStars(stars: number): number {
  return stars * 50
}

// ── GET — player stats ────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get all scores for this participant
  const { data: scores } = await supabaseAdmin
    .from('simulator_scores')
    .select('scenario_id, score, stars, xp_earned, completed_at')
    .eq('participant_id', user.id)
    .order('completed_at', { ascending: false })

  const allScores = scores ?? []

  // Total XP
  const totalXp = allScores.reduce((sum, s) => sum + s.xp_earned, 0)
  const currentLevel = getLevelFromXp(totalXp)

  // Best score per scenario
  const bestByScenario: Record<string, { score: number; stars: number; xp_earned: number; completed_at: string }> = {}
  for (const s of allScores) {
    const existing = bestByScenario[s.scenario_id]
    if (!existing || s.score > existing.score) {
      bestByScenario[s.scenario_id] = s
    }
  }

  // Next level progress
  const levelIndex = LEVELS.findIndex(l => l.label === currentLevel.label)
  const nextLevel   = LEVELS[levelIndex + 1] ?? null
  const xpForNext   = nextLevel ? nextLevel.minXp - currentLevel.minXp : null
  const xpProgress  = nextLevel ? totalXp - currentLevel.minXp : null

  return NextResponse.json({
    totalXp,
    currentLevel: currentLevel.label,
    levelIndex,
    nextLevel: nextLevel?.label ?? null,
    xpForNext,
    xpProgress,
    bestByScenario,
    runCount: allScores.length,
  })
}

// ── POST — save a completed scenario ─────────────────────────────────────────

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { scenarioId?: string; score?: number }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { scenarioId, score } = body
  if (!scenarioId || score === undefined || score === null) {
    return NextResponse.json({ error: 'scenarioId and score required' }, { status: 400 })
  }
  if (score < 0 || score > 6) {
    return NextResponse.json({ error: 'score must be 0–6' }, { status: 400 })
  }

  const stars    = starsFromScore(score)
  const xpEarned = xpFromStars(stars)

  await supabaseAdmin.from('simulator_scores').insert({
    participant_id: user.id,
    scenario_id:    scenarioId,
    score,
    stars,
    xp_earned: xpEarned,
  })

  // Return new totals
  const { data: allScores } = await supabaseAdmin
    .from('simulator_scores')
    .select('xp_earned')
    .eq('participant_id', user.id)

  const totalXp    = (allScores ?? []).reduce((sum, s) => sum + s.xp_earned, 0)
  const level      = getLevelFromXp(totalXp)
  const levelIndex = LEVELS.findIndex(l => l.label === level.label)
  const nextLevel  = LEVELS[levelIndex + 1] ?? null

  return NextResponse.json({
    stars,
    xpEarned,
    totalXp,
    currentLevel: level.label,
    levelIndex,
    nextLevel: nextLevel?.label ?? null,
  })
}
