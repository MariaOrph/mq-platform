'use client'

import { useState } from 'react'
import Link from 'next/link'

const BRAND = {
  darkGreen: '#0A2E2A',
  inkSoft:   '#05A88E',
  grey:      '#6B7280',
}

export default function CancelButton({ token }: { token: string }) {
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone]             = useState(false)
  const [error, setError]           = useState<string | null>(null)

  async function handleCancel() {
    setSubmitting(true)
    setError(null)
    try {
      const res  = await fetch('/api/bookings/cancel', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error ?? 'Could not cancel. Please email hello@mindsetquo.com.')
      } else {
        setDone(true)
      }
    } catch {
      setError('Could not cancel. Please email hello@mindsetquo.com.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div>
        <p className="mb-5 font-semibold" style={{ color: BRAND.darkGreen }}>
          Cancelled. The slot is free again.
        </p>
        <Link
          href="/book-a-call"
          className="inline-block px-6 py-3 rounded-full font-semibold text-sm"
          style={{ backgroundColor: BRAND.darkGreen, color: '#fff' }}
        >
          Book another time
        </Link>
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleCancel}
        disabled={submitting}
        className="px-6 py-3 rounded-full font-semibold text-sm disabled:opacity-60"
        style={{ backgroundColor: BRAND.darkGreen, color: '#fff' }}
      >
        {submitting ? 'Cancelling…' : 'Yes, cancel my call'}
      </button>
      {error && <p className="mt-3 text-sm" style={{ color: '#B91C1C' }}>{error}</p>}
    </div>
  )
}
