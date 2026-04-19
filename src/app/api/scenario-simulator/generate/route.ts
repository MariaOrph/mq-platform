import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic     = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? '' })
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch company values if the user belongs to a cohort
  let companyValues: string | null = null
  try {
    const { data: cr } = await supabaseAdmin
      .from('cohort_participants')
      .select('cohorts(company_values)')
      .eq('participant_id', user.id)
      .maybeSingle()
    if (cr) companyValues = (cr.cohorts as { company_values?: string | null } | null)?.company_values ?? null
  } catch { /* silent */ }

  const valuesBlock = companyValues
    ? `\n\nThe player's organisation has the following stated values or behaviours: "${companyValues}". Weave these naturally into the scenario where relevant — the situation can test whether these values are easy or hard to live in practice.`
    : ''

  const systemPrompt = `You generate scenarios for a leadership development simulator. Each scenario drops a manager into a realistic, pressure-filled leadership moment and asks them to make a series of decisions.

Return ONLY valid JSON — no markdown fences, no explanation, no surrounding text. The JSON must match this exact structure:

{
  "id": "gen-XXXXXXXX",
  "topic": "short topic label (e.g. feedback, conflict, change, trust, performance, communication, wellbeing, decision-making)",
  "title": "Short compelling scenario title (4-8 words)",
  "intro": "2-3 sentences that drop the player into a specific, concrete, pressure-filled moment. Use second person ('you'). Be vivid and specific — name a role, a context, a tension.",
  "rounds": [
    {
      "situation": "The specific decision point in this round. 1-2 sentences, second person.",
      "choices": [
        {
          "label": "A — Brief action label (max 12 words)",
          "points": 2,
          "consequence": "What actually happens as a result. Specific, human, 2 sentences.",
          "coaching": "Why this was the best response — the insight behind it. 2-3 sentences. Should feel like a coach speaking, not a textbook."
        },
        {
          "label": "B — Different action label",
          "points": 1,
          "consequence": "...",
          "coaching": "..."
        },
        {
          "label": "C — Third action label",
          "points": 0,
          "consequence": "...",
          "coaching": "..."
        }
      ]
    },
    { "situation": "...", "choices": [...] },
    { "situation": "...", "choices": [...] }
  ]
}

Rules:
- Replace XXXXXXXX with a random 8-character hex string
- Each round must have exactly 3 choices. Assign points 2, 1, and 0 — but randomise their order (don't always put the best answer first)
- The scenario should escalate across rounds — each round raises the stakes, adds new information, or introduces a complication
- Choices must feel genuinely distinct — not slight variations of the same thing
- The 2-point coaching should feel like a real insight, not an obvious lesson
- The 0-point consequence should be realistic and plausible — not catastrophic, just clearly suboptimal
- Use generic role descriptors (e.g. "a team member", "your manager", "a senior colleague") rather than culturally specific names
- Cover a wide range of real leadership situations — go beyond psych safety and accountability. Good topics: giving difficult feedback, managing underperformance, navigating organisational politics, handling burnout (yours or a team member's), managing up, running a difficult meeting, handling a public mistake, dealing with conflict between team members, onboarding someone who isn't working out, delivering bad news, managing competing priorities under pressure${valuesBlock}`

  try {
    const response = await anthropic.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      // Cache the scenario-generation system prompt (~90% cost cut on repeats within 5 min window)
      system:     [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
      messages:   [{ role: 'user', content: 'Generate a new leadership scenario.' }],
    })

    const raw = (response.content[0] as { type: string; text: string }).text.trim()

    // Strip any accidental markdown fences
    const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

    let scenario
    try {
      scenario = JSON.parse(cleaned)
    } catch {
      console.error('Scenario parse error. Raw output:', raw)
      return NextResponse.json({ error: 'Failed to parse generated scenario' }, { status: 500 })
    }

    // Basic validation
    if (!scenario.id || !scenario.rounds || scenario.rounds.length !== 3) {
      return NextResponse.json({ error: 'Invalid scenario structure' }, { status: 500 })
    }

    return NextResponse.json({ scenario })
  } catch (err) {
    console.error('Scenario generation error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
