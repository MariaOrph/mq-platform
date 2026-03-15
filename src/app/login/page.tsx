'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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

    // Navigate to role-detection page which figures out where to send the user
    window.location.href = '/auth/me'
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
         style={{ backgroundColor: '#E8FDF7' }}>

      {/* Logo / Brand mark */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
             style={{ backgroundColor: '#0AF3CD' }}>
          <span className="text-2xl font-bold" style={{ color: '#0A2E2A' }}>MQ</span>
        </div>
        <h1 className="text-2xl font-semibold" style={{ color: '#0A2E2A' }}>
          Welcome back
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#05A88E' }}>
          Sign in to your MQ Platform account
        </p>
      </div>

      {/* Login card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-8">
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
              className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition"
              style={{
                borderColor: '#B9F8DD',
                color: '#0A2E2A',
              }}
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
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition"
              style={{
                borderColor: '#B9F8DD',
                color: '#0A2E2A',
              }}
              onFocus={e => (e.target.style.borderColor = '#0AF3CD')}
              onBlur={e => (e.target.style.borderColor = '#B9F8DD')}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-60"
            style={{
              backgroundColor: '#0AF3CD',
              color: '#0A2E2A',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

        </form>

        <p className="mt-6 text-center text-xs" style={{ color: '#05A88E' }}>
          No account? You&apos;ll receive an invitation by email.
        </p>
      </div>

    </div>
  )
}
