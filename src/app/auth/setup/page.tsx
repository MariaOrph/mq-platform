'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// New invited users land here to set their password before
// being redirected to their dashboard for the first time.

export default function SetupPage() {
  const [password, setPassword]       = useState('')
  const [confirm, setConfirm]         = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState('')
  const [checkingSession, setChecking] = useState(true)

  useEffect(() => {
    // Make sure they actually have a session (came via valid invite link)
    async function check() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) window.location.href = '/login'
      else setChecking(false)
    }
    check()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords don\'t match.')
      return
    }

    setSubmitting(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setSubmitting(false)
      return
    }

    // Password set — redirect to role detection which sends them to the right dashboard
    window.location.href = '/auth/me'
  }

  if (checkingSession) return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E8FDF7' }}>
      <p style={{ color: '#05A88E' }}>Loading…</p>
    </main>
  )

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4"
          style={{ backgroundColor: '#E8FDF7' }}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
               style={{ backgroundColor: '#0AF3CD' }}>
            <span className="font-bold text-lg" style={{ color: '#0A2E2A' }}>MQ</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h1 className="text-2xl font-semibold mb-2" style={{ color: '#0A2E2A' }}>
            Welcome to MQ Platform
          </h1>
          <p className="text-sm mb-8" style={{ color: '#05A88E' }}>
            Set a password to complete your account setup.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#0A2E2A' }}>
                New password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                className="w-full px-4 py-3 rounded-xl border bg-white text-sm outline-none"
                style={{ borderColor: '#B9F8DD', color: '#0A2E2A' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#0A2E2A' }}>
                Confirm password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                required
                className="w-full px-4 py-3 rounded-xl border bg-white text-sm outline-none"
                style={{ borderColor: '#B9F8DD', color: '#0A2E2A' }}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting || !password || !confirm}
              className="w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}
            >
              {submitting ? 'Setting password…' : 'Set password & continue →'}
            </button>
          </form>
        </div>

      </div>
    </main>
  )
}
