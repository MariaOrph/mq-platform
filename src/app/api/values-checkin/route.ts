import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET — fetch company values + behaviours + participant's existing ratings
export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get participant's company_id
  const { data: profile } = await supabaseAdmin
    .from('profiles').select('company_id').eq('id', user.id).single()

  if (!profile?.company_id) {
    return NextResponse.json({ values: [], ratings: {} })
  }

  // Fetch company values + behaviours
  const { data: values } = await supabaseAdmin
    .from('company_value_behaviours')
    .select('id, value_name, value_order, behaviours')
    .eq('company_id', profile.company_id)
    .order('value_order')

  // Fetch existing ratings for this participant
  const { data: ratings } = await supabaseAdmin
    .from('participant_values_ratings')
    .select('company_value_id, behaviour_index, rating, rated_at')
    .eq('participant_id', user.id)

  // Shape ratings into a lookup: { valueId_behaviourIndex: rating }
  const ratingsMap: Record<string, { rating: number; rated_at: string }> = {}
  for (const r of ratings ?? []) {
    ratingsMap[`${r.company_value_id}_${r.behaviour_index}`] = {
      rating: r.rating,
      rated_at: r.rated_at,
    }
  }

  return NextResponse.json({
    values: (values ?? []).map(v => ({ ...v, behaviours: v.behaviours as string[] })),
    ratings: ratingsMap,
  })
}

// POST — save / update ratings
export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: { ratings: { company_value_id: string; behaviour_index: number; rating: number }[] } = await req.json()

  if (!Array.isArray(body.ratings) || body.ratings.length === 0) {
    return NextResponse.json({ error: 'ratings array required' }, { status: 400 })
  }

  const rows = body.ratings.map(r => ({
    participant_id:   user.id,
    company_value_id: r.company_value_id,
    behaviour_index:  r.behaviour_index,
    rating:           r.rating,
    rated_at:         new Date().toISOString(),
  }))

  const { error } = await supabaseAdmin
    .from('participant_values_ratings')
    .upsert(rows, { onConflict: 'participant_id,company_value_id,behaviour_index' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
