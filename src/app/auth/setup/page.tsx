'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// New invited users land here to set their name + password before
// being redirected to their dashboard for the first time.

const EyeOpen = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const EyeOff = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

export default function SetupPage() {
  const [firstName,     setFirstName]     = useState('')
  const [lastName,      setLastName]      = useState('')
  const [password,      setPassword]      = useState('')
  const [confirm,       setConfirm]       = useState('')
  const [submitting,    setSubmitting]    = useState(false)
  const [error,         setError]         = useState('')
  const [checkingSession, setChecking]    = useState(true)
  const [showPassword,  setShowPassword]  = useState(false)
  const [showConfirm,   setShowConfirm]   = useState(false)
  const [logoError,     setLogoError]     = useState(false)

  useEffect(() => {
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

    if (!firstName.trim()) {
      setError('Please enter your first name.')
      return
    }
    if (!lastName.trim()) {
      setError('Please enter your last name.')
      return
    }
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

    try {
      // Set password
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(updateError.message)
        setSubmitting(false)
        return
      }

      // Save name to profile
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Your session has expired. Please use your invite link again.')
        setSubmitting(false)
        return
      }

      const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ')
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', session.user.id)

      if (profileError) {
        setError('We couldn\'t save your name. Please try again.')
        setSubmitting(false)
        return
      }

      window.location.href = '/auth/me'
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
      console.error('[auth/setup] error:', err)
    }
  }

  if (checkingSession) return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F4FDF9' }}>
      <p style={{ color: '#05A88E' }}>Loading…</p>
    </main>
  )

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4"
          style={{ backgroundColor: '#F4FDF9' }}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          {!logoError ? (
            <img src="/logo.png" alt="MQ" className="h-12 w-auto" onError={() => setLogoError(true)} />
          ) : (
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                 style={{ backgroundColor: '#0AF3CD' }}>
              <span className="font-bold text-lg" style={{ color: '#0A2E2A' }}>MQ</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-8" style={{ boxShadow: '0 4px 20px rgba(10,46,42,0.08)' }}>
          <h1 className="text-2xl font-semibold mb-2" style={{ color: '#0A2E2A' }}>
            Welcome to MQ Platform
          </h1>
          <p className="text-sm mb-8" style={{ color: '#05A88E' }}>
            Just a few details to set up your account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#0A2E2A' }}>
                  First name <span style={{ color: '#0AF3CD' }}>*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Maria"
                  required
                  autoComplete="given-name"
                  className="w-full px-4 py-3 rounded-xl border bg-white text-sm outline-none"
                  style={{ borderColor: '#B9F8DD', color: '#0A2E2A' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#0A2E2A' }}>
                  Last name <span style={{ color: '#0AF3CD' }}>*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Smith"
                  required
                  autoComplete="family-name"
                  className="w-full px-4 py-3 rounded-xl border bg-white text-sm outline-none"
                  style={{ borderColor: '#B9F8DD', color: '#0A2E2A' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#0A2E2A' }}>
                New password <span style={{ color: '#0AF3CD' }}>*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-xl border bg-white text-sm outline-none pr-12"
                  style={{ borderColor: '#B9F8DD', color: '#0A2E2A' }}
                />
                <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                        style={{ color: '#05A88E' }} tabIndex={-1}>
                  {showPassword ? <EyeOff /> : <EyeOpen />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#0A2E2A' }}>
                Confirm password <span style={{ color: '#0AF3CD' }}>*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-xl border bg-white text-sm outline-none pr-12"
                  style={{ borderColor: '#B9F8DD', color: '#0A2E2A' }}
                />
                <button type="button" aria-label={showConfirm ? 'Hide password' : 'Show password'}
                        onClick={() => setShowConfirm(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                        style={{ color: '#05A88E' }} tabIndex={-1}>
                  {showConfirm ? <EyeOff /> : <EyeOpen />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting || !firstName || !lastName || !password || !confirm}
              className="w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}
            >
              {submitting ? 'Setting up your account…' : 'Complete setup →'}
            </button>
          </form>
        </div>

      </div>
    </main>
  )
}
