'use client'

import { useEffect, useMemo, useState } from 'react'

const BRAND = {
  darkGreen: '#0A2E2A',
  teal:      '#0AF3CD',
  tealSoft:  '#B9F8DD',
  mint:      '#E8FDF7',
  mintPale:  '#F4FDF9',
  ink:       '#0A2E2A',
  inkSoft:   '#05A88E',
  grey:      '#6B7280',
  greyLight: '#9CA3AF',
  border:    '#D1FAE5',
}

const LONDON_TZ = 'Europe/London'

function formatDayHeading(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: LONDON_TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(iso))
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: LONDON_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso))
}

function formatFullDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: LONDON_TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso))
}

interface FormState {
  name:    string
  email:   string
  company: string
  jobRole: string
  phone:   string
  topic:   string
}

export default function BookingForm() {
  const [slots, setSlots]         = useState<string[]>([])
  const [loading, setLoading]     = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [submitting, setSubmitting]     = useState(false)
  const [submitError, setSubmitError]   = useState<string | null>(null)
  const [success, setSuccess] = useState<{ dateLabel: string; timeLabel: string } | null>(null)

  const [form, setForm] = useState<FormState>({
    name: '', email: '', company: '', jobRole: '', phone: '', topic: '',
  })

  // When a slot is picked, scroll back to the top so the booking form is
  // obviously visible (the slot picker is hidden in this state).
  function pickSlot(iso: string) {
    setSelectedSlot(iso)
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  useEffect(() => {
    let cancelled = false
    fetch('/api/bookings/availability')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        if (Array.isArray(data?.slots)) setSlots(data.slots as string[])
        else setLoadError('Could not load available slots.')
      })
      .catch(() => {
        if (!cancelled) setLoadError('Could not load available slots.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  // Group slots by day (London-local).
  const slotsByDay = useMemo(() => {
    const groups = new Map<string, string[]>()
    for (const iso of slots) {
      const dayKey = new Intl.DateTimeFormat('en-GB', {
        timeZone: LONDON_TZ,
        year: 'numeric', month: '2-digit', day: '2-digit',
      }).format(new Date(iso))
      const list = groups.get(dayKey) ?? []
      list.push(iso)
      groups.set(dayKey, list)
    }
    // Preserve insertion order from sorted slots (server returns them sorted).
    return Array.from(groups.entries())
  }, [slots])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedSlot) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot: selectedSlot, ...form }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSubmitError(data?.error ?? 'Something went wrong. Please try again.')
        // If slot is gone, refresh availability.
        if (res.status === 409 || res.status === 400) {
          fetch('/api/bookings/availability')
            .then((r) => r.json())
            .then((d) => Array.isArray(d?.slots) && setSlots(d.slots as string[]))
            .catch(() => null)
          setSelectedSlot(null)
        }
      } else {
        setSuccess({ dateLabel: data.dateLabel, timeLabel: data.timeLabel })
      }
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{ backgroundColor: '#fff', border: `1px solid ${BRAND.border}` }}
      >
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
          style={{ backgroundColor: BRAND.tealSoft }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={BRAND.darkGreen} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-extrabold mb-3" style={{ color: BRAND.darkGreen }}>
          You're in. See you Friday.
        </h2>
        <p className="text-base mb-2" style={{ color: BRAND.grey }}>
          We've booked you in for
        </p>
        <p className="text-lg font-semibold mb-6" style={{ color: BRAND.darkGreen }}>
          {success.dateLabel} at {success.timeLabel} UK time
        </p>
        <p className="text-sm" style={{ color: BRAND.grey, lineHeight: 1.7 }}>
          A confirmation email is on its way with a calendar invite. We'll send the video-call link the day before.
        </p>
      </div>
    )
  }

  // ── Loading / error ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="text-center py-16" style={{ color: BRAND.grey }}>
        Loading available times…
      </div>
    )
  }
  if (loadError) {
    return (
      <div
        className="rounded-2xl p-6 text-center"
        style={{ backgroundColor: '#fff', border: `1px solid ${BRAND.border}`, color: BRAND.grey }}
      >
        {loadError}
      </div>
    )
  }
  if (slots.length === 0) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{ backgroundColor: '#fff', border: `1px solid ${BRAND.border}` }}
      >
        <h2 className="text-xl font-bold mb-3" style={{ color: BRAND.darkGreen }}>
          No slots available right now
        </h2>
        <p style={{ color: BRAND.grey, lineHeight: 1.7 }}>
          We're fully booked for the next 8 weeks. Email us at{' '}
          <a href="mailto:hello@mindsetquo.com" style={{ color: BRAND.inkSoft, fontWeight: 600 }}>
            hello@mindsetquo.com
          </a>{' '}
          and we'll find a time.
        </p>
      </div>
    )
  }

  // ── Picker + form ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Slot picker — hidden once a slot is chosen */}
      {!selectedSlot && (
      <div
        className="rounded-2xl p-6 lg:p-8"
        style={{ backgroundColor: '#fff', border: `1px solid ${BRAND.border}` }}
      >
        <h2 className="text-lg font-bold mb-1" style={{ color: BRAND.darkGreen }}>
          Pick a time
        </h2>
        <p className="text-sm mb-6" style={{ color: BRAND.grey }}>
          All times shown in UK time (Europe/London).
        </p>

        <div className="space-y-5">
          {slotsByDay.map(([dayKey, daySlots]) => (
            <div key={dayKey}>
              <h3 className="text-sm font-semibold mb-2" style={{ color: BRAND.darkGreen }}>
                {formatDayHeading(daySlots[0])}
              </h3>
              <div className="flex flex-wrap gap-2">
                {daySlots.map((iso) => {
                  const isSelected = iso === selectedSlot
                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => pickSlot(iso)}
                      className="px-4 py-2 rounded-full text-sm font-medium transition"
                      style={{
                        backgroundColor: isSelected ? BRAND.darkGreen : BRAND.mint,
                        color:           isSelected ? '#fff' : BRAND.darkGreen,
                        border:          `1px solid ${isSelected ? BRAND.darkGreen : BRAND.tealSoft}`,
                      }}
                    >
                      {formatTime(iso)}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Form (only visible once a slot is picked) */}
      {selectedSlot && (
        <form
          id="booking-form"
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 lg:p-8 space-y-5 scroll-mt-24"
          style={{ backgroundColor: '#fff', border: `1px solid ${BRAND.border}` }}
        >
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: BRAND.inkSoft }}>
              Booking
            </p>
            <h2 className="text-xl font-bold" style={{ color: BRAND.darkGreen }}>
              {formatFullDate(selectedSlot)} at {formatTime(selectedSlot)}
            </h2>
            <button
              type="button"
              onClick={() => setSelectedSlot(null)}
              className="mt-1 text-sm underline"
              style={{ color: BRAND.grey }}
            >
              Change time
            </button>
          </div>

          <Field label="Your name" required>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="w-full px-4 py-3 rounded-lg outline-none"
              style={{ backgroundColor: BRAND.mintPale, border: `1px solid ${BRAND.border}`, color: BRAND.darkGreen }}
            />
          </Field>

          <Field label="Email" required>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="w-full px-4 py-3 rounded-lg outline-none"
              style={{ backgroundColor: BRAND.mintPale, border: `1px solid ${BRAND.border}`, color: BRAND.darkGreen }}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Company">
              <input
                type="text"
                value={form.company}
                onChange={(e) => update('company', e.target.value)}
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{ backgroundColor: BRAND.mintPale, border: `1px solid ${BRAND.border}`, color: BRAND.darkGreen }}
              />
            </Field>
            <Field label="Role">
              <input
                type="text"
                value={form.jobRole}
                onChange={(e) => update('jobRole', e.target.value)}
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{ backgroundColor: BRAND.mintPale, border: `1px solid ${BRAND.border}`, color: BRAND.darkGreen }}
              />
            </Field>
          </div>

          <Field label="Phone (optional)">
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              className="w-full px-4 py-3 rounded-lg outline-none"
              style={{ backgroundColor: BRAND.mintPale, border: `1px solid ${BRAND.border}`, color: BRAND.darkGreen }}
            />
          </Field>

          <Field label="What would you like to discuss?">
            <textarea
              rows={4}
              value={form.topic}
              onChange={(e) => update('topic', e.target.value)}
              className="w-full px-4 py-3 rounded-lg outline-none resize-y"
              style={{ backgroundColor: BRAND.mintPale, border: `1px solid ${BRAND.border}`, color: BRAND.darkGreen }}
              placeholder="A sentence or two helps us prep."
            />
          </Field>

          {submitError && (
            <p className="text-sm" style={{ color: '#B91C1C' }}>
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-3 rounded-full font-semibold text-sm transition disabled:opacity-60"
            style={{ backgroundColor: BRAND.darkGreen, color: '#fff' }}
          >
            {submitting ? 'Booking…' : 'Confirm booking'}
          </button>
        </form>
      )}
    </div>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold mb-2" style={{ color: BRAND.darkGreen }}>
        {label}
        {required && <span style={{ color: '#DC2626' }}> *</span>}
      </span>
      {children}
    </label>
  )
}
