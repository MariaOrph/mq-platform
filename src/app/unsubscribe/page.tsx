'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function UnsubscribeContent() {
  const params    = useSearchParams()
  // Support both new `token` param and legacy `id` param during transition
  const token     = params.get('token') ?? params.get('id')
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading')

  useEffect(() => {
    if (!token) { setStatus('invalid'); return }

    fetch('/api/unsubscribe', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ token }),
    })
      .then(r => r.ok ? setStatus('success') : setStatus('error'))
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <main className="min-h-screen flex items-center justify-center px-6"
          style={{ backgroundColor: '#E8FDF7' }}>
      <div className="max-w-sm w-full text-center">

        {/* Logo */}
        <div className="mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
               style={{ backgroundColor: '#0A2E2A' }}>
            <span className="font-black text-lg" style={{ color: '#0AF3CD' }}>MQ</span>
          </div>
          <p className="text-xs uppercase tracking-widest" style={{ color: '#05A88E' }}>Mindset Quotient®</p>
        </div>

        {status === 'loading' && (
          <p className="text-sm" style={{ color: '#05A88E' }}>Processing…</p>
        )}

        {status === 'success' && (
          <>
            <h1 className="text-xl font-bold mb-3" style={{ color: '#0A2E2A' }}>
              You've been unsubscribed
            </h1>
            <p className="text-sm mb-6" style={{ color: '#05A88E', lineHeight: 1.7 }}>
              You won't receive daily coaching reminder emails anymore. Your account and coaching progress are still active; you can always log in directly.
            </p>
            <a
              href="/dashboard"
              className="inline-block px-6 py-2.5 rounded-xl text-sm font-bold"
              style={{ backgroundColor: '#0AF3CD', color: '#0A2E2A' }}
            >
              Go to my dashboard
            </a>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-xl font-bold mb-3" style={{ color: '#0A2E2A' }}>
              Something went wrong
            </h1>
            <p className="text-sm" style={{ color: '#05A88E' }}>
              We couldn't process your unsubscribe request. Please try again or contact us at hello@mindsetquo.com.
            </p>
          </>
        )}

        {status === 'invalid' && (
          <>
            <h1 className="text-xl font-bold mb-3" style={{ color: '#0A2E2A' }}>
              Invalid link
            </h1>
            <p className="text-sm" style={{ color: '#05A88E' }}>
              This unsubscribe link is not valid. Please use the link from your email.
            </p>
          </>
        )}

      </div>
    </main>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E8FDF7' }}>
        <p className="text-sm" style={{ color: '#05A88E' }}>Loading…</p>
      </main>
    }>
      <UnsubscribeContent />
    </Suspense>
  )
}
