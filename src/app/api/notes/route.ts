import { NextRequest, NextResponse } from 'next/server'
import { createClient }              from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// ── Auth helper ─────────────────────────────────────────────────────────────

async function getParticipantId(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get('authorization') ?? ''
  const token = auth.replace('Bearer ', '').trim()
  if (!token) return null
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return null
  // Confirm they are a participant
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single()
  if (!profile || profile.role !== 'participant') return null
  return profile.id
}

// ── GET — list notes ─────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const participantId = await getParticipantId(req)
  if (!participantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('notes')
    .select('id, title, content, created_at, updated_at')
    .eq('participant_id', participantId)
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ notes: data ?? [] })
}

// ── POST — create note ───────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const participantId = await getParticipantId(req)
  if (!participantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, content } = await req.json()

  const { data, error } = await supabaseAdmin
    .from('notes')
    .insert({ participant_id: participantId, title: title ?? null, content: content ?? '' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ note: data })
}

// ── PATCH — update note ──────────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  const participantId = await getParticipantId(req)
  if (!participantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, title, content } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('notes')
    .update({ title: title ?? null, content: content ?? '' })
    .eq('id', id)
    .eq('participant_id', participantId)   // belt-and-braces: users can only update their own
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ note: data })
}

// ── DELETE — delete note ─────────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const participantId = await getParticipantId(req)
  if (!participantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('notes')
    .delete()
    .eq('id', id)
    .eq('participant_id', participantId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
