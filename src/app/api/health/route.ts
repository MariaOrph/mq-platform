import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Lightweight, unauthenticated health probe for uptime monitors (UptimeRobot,
// Better Uptime, Vercel cron, etc). Returns 200 when all critical dependencies
// are reachable, 503 when degraded. Never call Anthropic from here — we only
// confirm the env var is present, because a real Claude call would cost money
// on every probe and could itself fail when Anthropic is up but throttling us.

export const runtime  = 'nodejs'
export const dynamic  = 'force-dynamic'

const startedAt = Date.now()

export async function GET() {
  let dbOk = false
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (supabaseUrl && serviceKey) {
      const supabase = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
      // head:true returns no rows, just the count metadata — cheapest possible
      // round-trip that proves the DB is reachable AND the service key is valid.
      const { error } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
      dbOk = !error
    }
  } catch {
    dbOk = false
  }

  const aiKeyPresent = !!process.env.ANTHROPIC_API_KEY
  const ok           = dbOk && aiKeyPresent
  const version      = process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'dev'

  return NextResponse.json(
    {
      ok,
      db:               dbOk,
      ai_key_present:   aiKeyPresent,
      version,
      ts:               new Date().toISOString(),
      uptime_seconds:   Math.floor((Date.now() - startedAt) / 1000),
    },
    {
      status: ok ? 200 : 503,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    }
  )
}
