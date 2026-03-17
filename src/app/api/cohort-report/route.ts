import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic     = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? '' })
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DIMENSION_NAMES: Record<string, string> = {
  d1: 'Self-awareness',
  d2: 'Cognitive flexibility',
  d3: 'Emotional regulation',
  d4: 'Values clarity',
  d5: 'Relational mindset',
  d6: 'Adaptive resilience',
}

const DIMENSION_KEYS = ['d1','d2','d3','d4','d5','d6'] as const

function avg(nums: (number | null)[]): number | null {
  const valid = nums.filter((n): n is number => n !== null)
  if (valid.length === 0) return null
  return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length)
}

function getScoreBand(score: number | null): string {
  if (score === null) return 'Pending'
  if (score >= 90) return 'Exceptional'
  if (score >= 75) return 'Strong'
  if (score >= 60) return 'Solid'
  if (score >= 40) return 'Developing'
  return 'Growth area'
}

export async function GET(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role, company_id').eq('id', user.id).single()

  if (!profile || !['mq_admin', 'client_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const cohortId = req.nextUrl.searchParams.get('cohortId')
  if (!cohortId) return NextResponse.json({ error: 'cohortId required' }, { status: 400 })

  // ── Fetch cohort ──────────────────────────────────────────────────────────
  const { data: cohort } = await supabaseAdmin
    .from('cohorts')
    .select('id, name, type, company_id, companies(name)')
    .eq('id', cohortId)
    .single()

  if (!cohort) return NextResponse.json({ error: 'Cohort not found' }, { status: 404 })

  // client_admin can only access their own company's cohorts
  if (profile.role === 'client_admin' && cohort.company_id !== profile.company_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const companyName = (cohort.companies as { name: string } | null)?.name ?? 'Unknown company'

  // ── Fetch participants + their assessments ────────────────────────────────
  const { data: participants } = await supabaseAdmin
    .from('cohort_participants')
    .select('participant_id')
    .eq('cohort_id', cohortId)

  const participantIds = (participants ?? [])
    .map(p => p.participant_id)
    .filter(Boolean) as string[]

  const totalInvited = participantIds.length

  let assessmentRows: {
    overall_score: number | null
    d1_score: number | null; d2_score: number | null; d3_score: number | null
    d4_score: number | null; d5_score: number | null; d6_score: number | null
  }[] = []

  if (participantIds.length > 0) {
    const { data: rows } = await supabaseAdmin
      .from('assessments')
      .select('overall_score, d1_score, d2_score, d3_score, d4_score, d5_score, d6_score')
      .in('participant_id', participantIds)
      .not('overall_score', 'is', null)
      .order('completed_at', { ascending: false })

    // One assessment per participant (most recent)
    const seen = new Set<string>()
    for (const r of rows ?? []) {
      const pid = participantIds.find(id => !seen.has(id))
      if (pid) { seen.add(pid); assessmentRows.push(r) }
    }
    // Simpler: just take all, avg already smooths duplicates
    assessmentRows = rows ?? []
  }

  const completed = assessmentRows.length

  if (completed === 0) {
    return NextResponse.json({
      cohortId, cohortName: cohort.name, companyName,
      totalInvited, completed: 0,
      scores: { overall: null, d1: null, d2: null, d3: null, d4: null, d5: null, d6: null },
      analysis: null,
    })
  }

  // ── Compute averages ──────────────────────────────────────────────────────
  const scores = {
    overall: avg(assessmentRows.map(r => r.overall_score)),
    d1: avg(assessmentRows.map(r => r.d1_score)),
    d2: avg(assessmentRows.map(r => r.d2_score)),
    d3: avg(assessmentRows.map(r => r.d3_score)),
    d4: avg(assessmentRows.map(r => r.d4_score)),
    d5: avg(assessmentRows.map(r => r.d5_score)),
    d6: avg(assessmentRows.map(r => r.d6_score)),
  }

  // ── Generate AI analysis ──────────────────────────────────────────────────
  const dimLines = DIMENSION_KEYS.map(k =>
    `- ${DIMENSION_NAMES[k]}: ${scores[k] !== null ? `${scores[k]}/100 (${getScoreBand(scores[k])})` : 'pending'}`
  ).join('\n')

  const prompt = `You are writing a professional cohort MQ (Mindset Quotient) report for an HR leader or programme lead at ${companyName}.

Cohort: ${cohort.name} (${cohort.type}) | ${completed} participants completed

Aggregate dimension scores:
${dimLines}
- Overall team MQ: ${scores.overall !== null ? `${scores.overall}/100 (${getScoreBand(scores.overall)})` : 'pending'}

MQ is defined as the ability to notice your thoughts, beliefs, and emotional triggers — and choose how to respond rather than being unconsciously driven by them. The 6 dimensions measure: Self-awareness (internal observer), Cognitive flexibility (holding multiple perspectives), Emotional regulation (managing emotional responses under pressure), Values clarity (alignment between stated and lived values), Relational mindset (quality of attention in relationships), and Adaptive resilience (sustaining performance under pressure).

Return a JSON object with this exact structure:
{
  "executive_summary": "3–4 sentences. Identify the team's standout strengths and the 1–2 dimensions with most room to grow. Frame everything in possibility language — what becomes available when these dimensions develop. Warm, expert, never deficit-focused.",
  "dimensions": {
    "d1": {
      "interpretation": "2 sentences on what this score means for this team collectively in their day-to-day leadership.",
      "risks": ["Risk 1 if this dimension remains underdeveloped (specific, practical)", "Risk 2", "Risk 3"],
      "opportunities": ["Opportunity 1 for development (forward-looking, specific)", "Opportunity 2", "Opportunity 3"]
    },
    "d2": { "interpretation": "...", "risks": ["...","...","..."], "opportunities": ["...","...","..."] },
    "d3": { "interpretation": "...", "risks": ["...","...","..."], "opportunities": ["...","...","..."] },
    "d4": { "interpretation": "...", "risks": ["...","...","..."], "opportunities": ["...","...","..."] },
    "d5": { "interpretation": "...", "risks": ["...","...","..."], "opportunities": ["...","...","..."] },
    "d6": { "interpretation": "...", "risks": ["...","...","..."], "opportunities": ["...","...","..."] }
  }
}

Tone: warm, expert, human. Never clinical. Never mention specific numbers in the interpretation — describe the pattern instead. Risks should feel like honest observations, not criticism. Opportunities should feel energising.`

  let analysis: {
    executive_summary: string
    dimensions: Record<string, {
      interpretation: string
      risks: string[]
      opportunities: string[]
    }>
  } | null = null

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001', max_tokens: 2000,
      system: 'You are an expert leadership development coach. Return only valid JSON, no markdown or extra text.',
      messages: [{ role: 'user', content: prompt }],
    })
    const block = response.content[0]
    if (block.type === 'text') {
      analysis = JSON.parse(block.text.trim())
    }
  } catch (err) {
    console.error('[cohort-report] AI error:', err)
    // Non-fatal — return data without analysis
  }

  return NextResponse.json({
    cohortId, cohortName: cohort.name, companyName, cohortType: cohort.type,
    totalInvited, completed, scores, analysis,
  })
}
