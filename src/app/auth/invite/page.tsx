'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

// Supabase invite emails redirect here with the session tokens in the URL.
// Two possible formats depending on Supabase version / flow:
//   Hash fragment: /auth/invite#access_token=xxx&refresh_token=yyy
//   PKCE code:     /auth/invite?code=xxx
// We handle both explicitly rather than relying on auto-detection.

export default function InvitePage() {
  useEffect(() => {
    async function handleInvite() {
      const supabase = createClient()

      // ── Case 1: Hash fragment (implicit flow) ───────────────────────────
      // Supabase embeds access_token + refresh_token directly in the URL hash.
      const hash   = window.location.hash.substring(1)
      const hParams = new URLSearchParams(hash)
      const accessToken  = hParams.get('access_token')
      const refreshToken = hParams.get('refresh_token')

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        if (!error) {
          window.location.href = '/auth/setup'
          return
        }
      }

      // ── Case 2: PKCE code flow ──────────────────────────────────────────
      // Newer Supabase sends a short-lived code instead of tokens.
      const qParams = new URLSearchParams(window.location.search)
      const code = qParams.get('code')

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          window.location.href = '/auth/setup'
          return
        }
      }

      // ── Case 3: Session already exists (page refresh / already signed in) ─
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        window.location.href = '/auth/setup'
        return
      }

      // ── Nothing worked ──────────────────────────────────────────────────
      window.location.href = '/login?error=invalid_link'
    }

    handleInvite()
  }, [])

  return (
    <main className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: '#E8FDF7' }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
             style={{ backgroundColor: '#0AF3CD' }}>
          <span className="font-bold text-lg" style={{ color: '#0A2E2A' }}>MQ</span>
        </div>
        <p style={{ color: '#05A88E' }}>Setting up your account…</p>
      </div>
    </main>
  )
}
