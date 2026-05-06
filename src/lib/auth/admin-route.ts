// ── Admin route auth helper ────────────────────────────────────────────────────
// Validates that the bearer token on a request belongs to an mq_admin user.
// Returns either the user record + a service-role Supabase client, or a
// NextResponse with the appropriate 401/403 to short-circuit the handler.

import { NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!

export interface AdminAuthOk {
  ok:       true
  userId:   string
  supabase: SupabaseClient
}

export interface AdminAuthFail {
  ok:       false
  response: NextResponse
}

export async function requireMqAdmin(req: NextRequest): Promise<AdminAuthOk | AdminAuthFail> {
  if (!serviceKey) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Server misconfigured' }, { status: 500 }),
    }
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const token = req.headers.get('authorization')?.replace('Bearer ', '').trim()
  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'mq_admin') {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }

  return { ok: true, userId: user.id, supabase }
}
