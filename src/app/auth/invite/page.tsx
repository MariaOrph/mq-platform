'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

// This page handles all invite and magic-link flows.
//
// PRIMARY PATH (new approach):
//   Our invite API extracts the token_hash from Supabase's action_link and
//   builds our own URL: /auth/invite?token_hash=XXX&type=invite (or magiclink)
//   We call verifyOtp directly — no Supabase redirect chain involved at all.
//   This works regardless of the project's PKCE / implicit flow setting.
//
// FALLBACK PATHS (for old links already in the wild):
//   Hash fragment: #access_token=xxx&refresh_token=yyy  (implicit flow)
//   PKCE code:     ?code=xxx

const ROLE_MAP: Record<string, string> = {
  mq_admin:     '/admin',
  client_admin: '/client',
  participant:  '/dashboard',
}

export default function InvitePage() {
  useEffect(() => {
    async function handleInvite() {
      const supabase = createClient()

      // ── Primary: token_hash + type (our custom invite URL) ──────────────────
      const qParams    = new URLSearchParams(window.location.search)
      const tokenHash  = qParams.get('token_hash')
      const otpType    = (qParams.get('type') ?? 'invite') as 'invite' | 'magiclink'

      if (tokenHash) {
        const { error: otpError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type:       otpType,
        })
        if (!otpError) {
          await redirectAfterAuth(supabase)
          return
        }
        window.location.href = '/login?error=link_expired'
        return
      }

      // ── Fallback 1: Hash fragment (implicit flow) ────────────────────────────
      const hash         = window.location.hash.substring(1)
      const hParams      = new URLSearchParams(hash)
      const accessToken  = hParams.get('access_token')
      const refreshToken = hParams.get('refresh_token')

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        if (!error) {
          await redirectAfterAuth(supabase)
          return
        }
      }

      // ── Fallback 2: PKCE code ────────────────────────────────────────────────
      const code = qParams.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          await redirectAfterAuth(supabase)
          return
        }
      }

      // ── Fallback 3: Session already exists ───────────────────────────────────
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await redirectAfterAuth(supabase)
        return
      }

      // ── Nothing worked ───────────────────────────────────────────────────────
      window.location.href = '/login?error=invalid_link'
    }

    async function redirectAfterAuth(supabase: ReturnType<typeof createClient>) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login?error=invalid_link'
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single()

      if (!profile?.full_name) {
        window.location.href = '/auth/setup'
      } else {
        window.location.href = ROLE_MAP[profile.role ?? 'participant'] ?? '/dashboard'
      }
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
