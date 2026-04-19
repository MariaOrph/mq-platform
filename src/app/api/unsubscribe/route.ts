import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// UUID v4 regex for basic input validation (prevents malformed queries)
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  // Accept both `token` (new) and `id` (legacy) to support emails already in flight.
  const token = (body.token ?? body.id) as string | undefined

  if (!token || !UUID_RE.test(token)) {
    return NextResponse.json({ error: 'Invalid or missing token' }, { status: 400 })
  }

  // Look up by unsubscribe_token (unguessable). Falls back to id lookup only
  // if no profile found by token, to cover users still on the old email format.
  const { data: byToken } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('unsubscribe_token', token)
    .maybeSingle()

  const profileId = byToken?.id
    ?? (await (async () => {
      // Legacy fallback — remove this block after all old emails have expired (~30 days)
      const { data } = await supabaseAdmin
        .from('profiles').select('id').eq('id', token).maybeSingle()
      return data?.id
    })())

  if (!profileId) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ coaching_reminders_unsubscribed: true })
    .eq('id', profileId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
