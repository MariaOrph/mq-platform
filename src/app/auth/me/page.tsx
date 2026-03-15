'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AuthMe() {
  useEffect(() => {
    async function detect() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        window.location.href = '/login'
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      const roleMap: Record<string, string> = {
        mq_admin:    '/admin',
        client_admin: '/client',
        participant:  '/dashboard',
      }
      window.location.href = roleMap[profile?.role ?? 'participant'] ?? '/dashboard'
    }
    detect()
  }, [])

  return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E8FDF7' }}>
      <p style={{ color: '#05A88E' }}>Loading…</p>
    </main>
  )
}
