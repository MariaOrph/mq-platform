import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateUpcomingSlots } from '@/lib/bookings/slots'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!serviceKey) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const slots = generateUpcomingSlots()
  if (slots.length === 0) {
    return NextResponse.json({ slots: [] })
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Pull every confirmed booking inside our window in one query.
  const earliest = slots[0].toISOString()
  const latest   = slots[slots.length - 1].toISOString()

  const { data, error } = await supabase
    .from('bookings')
    .select('slot_at')
    .eq('status', 'confirmed')
    .gte('slot_at', earliest)
    .lte('slot_at', latest)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const taken = new Set((data ?? []).map((r) => new Date(r.slot_at as string).toISOString()))
  const available = slots
    .map((s) => s.toISOString())
    .filter((iso) => !taken.has(iso))

  return NextResponse.json({ slots: available })
}
