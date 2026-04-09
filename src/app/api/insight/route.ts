import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? '',
})

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── Types ──────────────────────────────────────────────────────────────────────

interface InsightRequest {
  cohortId:    string
  cohortName:  string
  companyName: string
  scores: {
    d1: number | null   // Self-awareness
    d2: number | null   // Ego management
    d3: number | null   // Emotional regulation
    d4: number | null   // Clarity & communication
    d5: number | null   // Trust & development
    d6: number | null   // Standards & accountability
    d7: number | null   // Relational intelligence
    overall: number | null
  }
}

// ── Hash ──────────────────────────────────────────────────────────────────────
// Simple deterministic hash — changes whenever scores change,
// which triggers a fresh generation.

function buildDataHash(req: InsightRequest): string {
  const { d1, d2, d3, d4, d5, d6, d7, overall } = req.scores
  return `${d1}|${d2}|${d3}|${d4}|${d5}|${d6}|${d7}|${overall}`
}

// ── Prompt builder ─────────────────────────────────────────────────────────────

const DIMENSION_NAMES: Record<string, string> = {
  d1: 'Self-awareness',
  d2: 'Ego management',
  d3: 'Emotional regulation',
  d4: 'Clarity & communication',
  d5: 'Trust & development',
  d6: 'Standards & accountability',
  d7: 'Relational intelligence',
}

function buildUserPrompt(req: InsightRequest): string {
  const { cohortName, companyName, scores } = req
  const lines = Object.entries(DIMENSION_NAMES).map(([key, name]) => {
    const val = scores[key as keyof typeof scores]
    return `- ${name}: ${val !== null ? `${val}/100` : 'pending'}`
  })
  lines.push(`- Overall team MQ: ${scores.overall !== null ? `${scores.overall}/100` : 'pending'}`)

  return `Here are the MQ dimension scores for ${cohortName} (${companyName}):

${lines.join('\n')}

Write 3–4 sentences for the HR leader or founder viewing this. Identify the 1–2 dimensions with most room to grow and frame them as the biggest opportunities for this team. Then end with one sentence about what becomes possible for this team and their people when those dimensions develop. Always use possibility language — what opens up, what grows, what becomes available — never deficit language.`
}

const SYSTEM_PROMPT = `You are an expert leadership development coach working for MQ (Mindset Quotient). MQ measures how fully a leader has made the shift from individual performer to effective leader of others, across seven dimensions of mindset and management skill. Your role is to generate warm, specific, forward-looking insights for HR leaders and founders about their management team's MQ results. Your tone is expert but human — never clinical, never negative. Always frame insights as opportunities and possibilities, never as deficits or criticisms.`

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: InsightRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { cohortId, scores } = body

  // Must have at least some completed scores to generate
  if (scores.overall === null) {
    return NextResponse.json({ error: 'No completed assessments yet' }, { status: 400 })
  }

  const dataHash = buildDataHash(body)

  // ── Check cache ──────────────────────────────────────────────────────────
  const { data: cached } = await supabaseAdmin
    .from('cohort_insights')
    .select('insight_text, data_hash')
    .eq('cohort_id', cohortId)
    .single()

  if (cached && cached.data_hash === dataHash) {
    return NextResponse.json({ insight: cached.insight_text, cached: true })
  }

  // ── Generate fresh insight ───────────────────────────────────────────────
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY not configured' },
      { status: 500 }
    )
  }

  let insightText: string
  try {
    const message = await anthropic.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system:     SYSTEM_PROMPT,
      messages:   [{ role: 'user', content: buildUserPrompt(body) }],
    })

    const block = message.content[0]
    if (block.type !== 'text') {
      throw new Error('Unexpected response type from Anthropic')
    }
    insightText = block.text.trim()
  } catch (err) {
    console.error('[/api/insight] Anthropic API error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 502 })
  }

  // ── Upsert into cache ────────────────────────────────────────────────────
  await supabaseAdmin
    .from('cohort_insights')
    .upsert({
      cohort_id:    cohortId,
      insight_text: insightText,
      data_hash:    dataHash,
      generated_at: new Date().toISOString(),
    }, { onConflict: 'cohort_id' })

  return NextResponse.json({ insight: insightText, cached: false })
}
