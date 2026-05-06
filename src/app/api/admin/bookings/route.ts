// ── GET /api/admin/bookings ────────────────────────────────────────────────────
// Returns bookings for the admin tool. By default returns confirmed bookings
// from now onwards; pass ?include=all to also include past + cancelled.

import { NextRequest, NextResponse } from 'next/server'
import { requireMqAdmin } from '@/lib/auth/admin-route'

export async function GET(req: NextRequest) {
  const auth = await requireMqAdmin(req)
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(req.url)
  const include = searchParams.get('include')  // 'all' | undefined

  let query = auth.supabase
    .from('bookings')
    .select('id, slot_at, name, email, company, job_role, phone, topic, status, cancel_token, created_at, cancelled_at')
    .order('slot_at', { ascending: true })

  if (include !== 'all') {
    query = query
      .eq('status', 'confirmed')
      .gte('slot_at', new Date().toISOString())
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ bookings: data ?? [] })
}
