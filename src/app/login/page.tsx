'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [logoError, setLogoError]       = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !data.user) {
      setError(authError?.message ?? 'Sign in failed. Please try again.')
      setLoading(false)
      return
    }

    window.location.href = '/auth/me'
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel: brand visual ── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center overflow-hidden"
        style={{ backgroundColor: '#0A2E2A' }}
      >
        {/* Background image — add /public/bg.jpg to show it */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/bg.webp')",
            opacity: 0.55,
          }}
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(10,46,42,0.85) 0%, rgba(10,46,42,0.4) 50%, rgba(5,168,142,0.3) 100%)',
          }}
        />

        {/* Decorative glow circles */}
        <div
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: 'rgba(10,243,205,0.08)' }}
        />
        <div
          className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: 'rgba(5,168,142,0.12)' }}
        />

        {/* Content */}
        <div className="relative z-10 px-12 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            {!logoError ? (
              <img
                src="/logo.png"
                alt="MQ"
                className="h-16 w-auto"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="h-16 px-5 rounded-2xl flex items-center justify-center"
                   style={{ backgroundColor: 'rgba(10,243,205,0.15)' }}>
                <span className="text-3xl font-bold tracking-tight" style={{ color: '#0AF3CD' }}>MQ</span>
              </div>
            )}
          </div>

          <h2 className="text-3xl font-semibold mb-4 leading-tight" style={{ color: '#E8FDF7' }}>
            Develop the mindset<br />that leads.
          </h2>
          <p className="text-base leading-relaxed" style={{ color: 'rgba(232,253,247,0.6)' }}>
            Your personal MQ coaching programme,<br />built around how you think.
          </p>
        </div>

        {/* Bottom tagline */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <p className="text-xs tracking-widest uppercase" style={{ color: 'rgba(10,243,205,0.5)' }}>
            Mindset Quotient Platform
          </p>
        </div>
      </div>

      {/* ── Right panel: login form ── */}
      <div
        className="w-full lg:w-1/2 flex flex-col items-center justify-center px-8 py-12"
        style={{ backgroundColor: '#F4FDF9' }}
      >
        <div className="w-full max-w-sm">

          {/* Mobile logo (hidden on desktop) */}
          <div className="flex justify-center mb-8 lg:hidden">
            {!logoError ? (
              <img
                src="/logo.png"
                alt="MQ"
                className="h-12 w-auto"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="h-12 px-4 rounded-xl flex items-center justify-center"
                   style={{ backgroundColor: '#0A2E2A' }}>
                <span className="text-xl font-bold" style={{ color: '#0AF3CD' }}>MQ</span>
              </div>
            )}
          </div>

          <h1 className="text-2xl font-semibold mb-1" style={{ color: '#0A2E2A' }}>
            Welcome back
          </h1>
          <p className="text-sm mb-8" style={{ color: '#05A88E' }}>
            Sign in to your MQ Platform account
          </p>

          <form onSubmit={handleLogin} className="space-y-5">

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1.5"
                style={{ color: '#0A2E2A' }}
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border bg-white text-sm outline-none transition"
                style={{ borderColor: '#B9F8DD', color: '#0A2E2A' }}
                onFocus={e => (e.target.style.borderColor = '#0AF3CD')}
                onBlur={e => (e.target.style.borderColor = '#B9F8DD')}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1.5"
                style={{ color: '#0A2E2A' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border bg-white text-sm outline-none transition pr-12"
                  style={{ borderColor: '#B9F8DD', color: '#0A2E2A' }}
                  onFocus={e => (e.target.style.borderColor = '#0AF3CD')}
                  onBlur={e => (e.target.style.borderColor = '#B9F8DD')}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: '#05A88E' }}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-60 hover:opacity-90"
              style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}
            >
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>

          </form>

          <p className="mt-8 text-center text-xs" style={{ color: '#05A88E' }}>
            No account? You&apos;ll receive an invitation by email.
          </p>

        </div>
      </div>

    </div>
  )
}
