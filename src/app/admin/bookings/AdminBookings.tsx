'use client'

// ── Admin bookings client UI ───────────────────────────────────────────────────
// Shows upcoming bookings (and a toggle to include past + cancelled).
// Each row has Cancel + Reschedule actions. Reschedule pulls available slots
// from /api/bookings/availability and lets the admin pick a new one.

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { formatSlotDate, formatSlotTime } from '@/lib/bookings/slots'

interface Booking {
  id:            string
  slot_at:       string
  name:          string
  email:         string
  company:       string | null
  job_role:      string | null
  phone:         string | null
  topic:         string | null
  status:        'confirmed' | 'cancelled'
  cancel_token:  string
  created_at:    string
  cancelled_at:  string | null
}

interface AvailableSlot {
  iso:   string
  taken: boolean
}

const COLORS = {
  ink:       '#0A2E2A',
  inkSoft:   '#3F4F4D',
  teal:      '#05A88E',
  tealLight: '#CFFAF1',
  cream:     '#F4FDF9',
  border:    '#E5E7EB',
  red:       '#B91C1C',
  redBg:     '#FEE2E2',
  amber:     '#92400E',
  amberBg:   '#FEF3C7',
  grey:      '#6B7280',
  greyBg:    '#F3F4F6',
}

/* ── Component ─────────────────────────────────────────────────────────────── */

export default function AdminBookings() {
  const supabase = useMemo(() => createBrowserClient(), [])

  const [bookings,    setBookings]    = useState<Booking[]>([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)
  const [includeAll,  setIncludeAll]  = useState(false)
  const [actionId,    setActionId]    = useState<string | null>(null)
  // Captured "now" — refreshed each time we reload the list. Used for visual
  // past/upcoming distinction. Kept in state to satisfy React's render-purity
  // rules (Date.now() must not be called directly during render).
  const [now, setNow] = useState<number>(() => Date.now())
  const [confirmCancel,    setConfirmCancel]    = useState<Booking | null>(null)
  const [reschedTarget,    setReschedTarget]    = useState<Booking | null>(null)
  const [availSlots,       setAvailSlots]       = useState<AvailableSlot[]>([])
  const [availLoading,     setAvailLoading]     = useState(false)
  const [chosenSlot,       setChosenSlot]       = useState<string | null>(null)
  const [actionNote,       setActionNote]       = useState('')

  const getToken = useCallback(async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ?? null
  }, [supabase])

  const loadBookings = useCallback(async () => {
    setLoading(true)
    setError(null)
    const token = await getToken()
    if (!token) {
      setError('Not signed in.')
      setLoading(false)
      return
    }
    const url = includeAll ? '/api/admin/bookings?include=all' : '/api/admin/bookings'
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    const json = await res.json()
    if (!res.ok) {
      setError(json.error ?? 'Failed to load bookings')
      setLoading(false)
      return
    }
    setBookings(json.bookings ?? [])
    setNow(Date.now())
    setLoading(false)
  }, [getToken, includeAll])

  // Fetch on mount + whenever the filter toggle changes. The setState calls
  // inside loadBookings are intentional ("loading…" state during fetch) — this
  // is the canonical client-side data-fetching pattern.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void loadBookings() }, [loadBookings])

  /* ── Cancel ─────────────────────────────────────────────────────────────── */

  async function doCancel(booking: Booking, note: string) {
    setActionId(booking.id)
    const token = await getToken()
    if (!token) { setError('Not signed in.'); setActionId(null); return }

    const res = await fetch('/api/admin/bookings/cancel', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body:    JSON.stringify({ bookingId: booking.id, note: note.trim() || undefined }),
    })
    const json = await res.json()
    setActionId(null)
    if (!res.ok) { setError(json.error ?? 'Cancel failed'); return }
    setConfirmCancel(null)
    setActionNote('')
    await loadBookings()
  }

  /* ── Reschedule ─────────────────────────────────────────────────────────── */

  async function openReschedule(booking: Booking) {
    setReschedTarget(booking)
    setChosenSlot(null)
    setActionNote('')
    setAvailLoading(true)
    const res = await fetch('/api/bookings/availability')
    const json = await res.json()
    setAvailLoading(false)
    if (!res.ok) { setError(json.error ?? 'Failed to load slots'); return }
    setAvailSlots(json.slots ?? [])
  }

  async function doReschedule() {
    if (!reschedTarget || !chosenSlot) return
    setActionId(reschedTarget.id)
    const token = await getToken()
    if (!token) { setError('Not signed in.'); setActionId(null); return }

    const res = await fetch('/api/admin/bookings/reschedule', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body:    JSON.stringify({
        bookingId: reschedTarget.id,
        newSlot:   chosenSlot,
        note:      actionNote.trim() || undefined,
      }),
    })
    const json = await res.json()
    setActionId(null)
    if (!res.ok) { setError(json.error ?? 'Reschedule failed'); return }
    setReschedTarget(null)
    setChosenSlot(null)
    setActionNote('')
    await loadBookings()
  }

  /* ── Render ─────────────────────────────────────────────────────────────── */

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.cream, padding: '32px 16px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <Link href="/admin" style={{ fontSize: 13, color: COLORS.grey, textDecoration: 'none' }}>← Admin home</Link>
          <Link href="/book-a-call" target="_blank" style={{ fontSize: 13, color: COLORS.teal, textDecoration: 'none' }}>
            View public booking page ↗
          </Link>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.ink, margin: '8px 0 4px' }}>Discovery call bookings</h1>
        <p style={{ fontSize: 14, color: COLORS.inkSoft, margin: '0 0 24px' }}>
          Manage upcoming calls. Cancelling frees the slot and emails the booker an apology with a rebook link. Rescheduling sends a fresh calendar invite.
        </p>

        {/* Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => setIncludeAll(false)}
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              border:        `1px solid ${!includeAll ? COLORS.teal : COLORS.border}`,
              backgroundColor: !includeAll ? COLORS.tealLight : '#fff',
              color:           !includeAll ? COLORS.ink : COLORS.inkSoft,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >Upcoming only</button>
          <button
            type="button"
            onClick={() => setIncludeAll(true)}
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              border:        `1px solid ${includeAll ? COLORS.teal : COLORS.border}`,
              backgroundColor: includeAll ? COLORS.tealLight : '#fff',
              color:           includeAll ? COLORS.ink : COLORS.inkSoft,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >Include past + cancelled</button>
          <button
            type="button"
            onClick={loadBookings}
            disabled={loading}
            style={{
              marginLeft: 'auto',
              padding: '6px 14px',
              borderRadius: 999,
              border: `1px solid ${COLORS.border}`,
              backgroundColor: '#fff',
              color: COLORS.inkSoft,
              fontWeight: 600,
              fontSize: 13,
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >{loading ? 'Loading…' : 'Refresh'}</button>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{ background: COLORS.redBg, color: COLORS.red, padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
            {error}
          </div>
        )}

        {/* Bookings list */}
        <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${COLORS.border}`, overflow: 'hidden' }}>
          {loading && bookings.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: COLORS.grey, fontSize: 14 }}>Loading bookings…</div>
          ) : bookings.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: COLORS.grey, fontSize: 14 }}>
              {includeAll ? 'No bookings on record.' : 'No upcoming bookings.'}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: COLORS.cream }}>
                  <th style={th()}>When</th>
                  <th style={th()}>Booker</th>
                  <th style={th()}>Company / role</th>
                  <th style={th()}>Topic</th>
                  <th style={th()}>Status</th>
                  <th style={{ ...th(), textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => {
                  const slot = new Date(b.slot_at)
                  const isPast = slot.getTime() < now
                  const isCancelled = b.status === 'cancelled'
                  const dimmed = isPast || isCancelled
                  return (
                    <tr key={b.id} style={{ borderTop: `1px solid ${COLORS.border}`, opacity: dimmed ? 0.6 : 1 }}>
                      <td style={td()}>
                        <div style={{ fontWeight: 600, color: COLORS.ink }}>{formatSlotDate(slot)}</div>
                        <div style={{ color: COLORS.inkSoft, fontSize: 13 }}>{formatSlotTime(slot)} UK</div>
                      </td>
                      <td style={td()}>
                        <div style={{ fontWeight: 600, color: COLORS.ink }}>{b.name}</div>
                        <a href={`mailto:${b.email}`} style={{ color: COLORS.teal, fontSize: 13, textDecoration: 'none' }}>{b.email}</a>
                        {b.phone && <div style={{ fontSize: 12, color: COLORS.grey }}>{b.phone}</div>}
                      </td>
                      <td style={td()}>
                        {b.company && <div style={{ color: COLORS.ink }}>{b.company}</div>}
                        {b.job_role && <div style={{ color: COLORS.grey, fontSize: 13 }}>{b.job_role}</div>}
                        {!b.company && !b.job_role && <span style={{ color: COLORS.grey }}>—</span>}
                      </td>
                      <td style={{ ...td(), maxWidth: 280 }}>
                        {b.topic ? (
                          <div style={{ color: COLORS.inkSoft, fontSize: 13, lineHeight: 1.5 }}>
                            {b.topic.length > 140 ? `${b.topic.slice(0, 140)}…` : b.topic}
                          </div>
                        ) : <span style={{ color: COLORS.grey }}>—</span>}
                      </td>
                      <td style={td()}>
                        {isCancelled ? (
                          <span style={badge(COLORS.redBg, COLORS.red)}>Cancelled</span>
                        ) : isPast ? (
                          <span style={badge(COLORS.greyBg, COLORS.grey)}>Past</span>
                        ) : (
                          <span style={badge(COLORS.tealLight, COLORS.ink)}>Confirmed</span>
                        )}
                      </td>
                      <td style={{ ...td(), textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {!isCancelled && !isPast && (
                          <>
                            <button
                              type="button"
                              onClick={() => openReschedule(b)}
                              disabled={actionId === b.id}
                              style={btn(COLORS.ink, '#fff', COLORS.border)}
                            >Reschedule</button>
                            <button
                              type="button"
                              onClick={() => { setConfirmCancel(b); setActionNote('') }}
                              disabled={actionId === b.id}
                              style={{ ...btn(COLORS.red, '#fff', COLORS.border), marginLeft: 6 }}
                            >Cancel</button>
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Cancel modal ────────────────────────────────────────────────── */}
      {confirmCancel && (
        <Modal onClose={() => { setConfirmCancel(null); setActionNote('') }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: COLORS.ink }}>Cancel this booking?</h2>
          <p style={{ margin: '0 0 16px', fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.6 }}>
            <strong>{confirmCancel.name}</strong> — {formatSlotDate(new Date(confirmCancel.slot_at))} at {formatSlotTime(new Date(confirmCancel.slot_at))}.
            We&apos;ll email them an apology with a link to rebook, plus a calendar cancellation.
          </p>
          <label style={{ display: 'block', fontSize: 12, color: COLORS.grey, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
            Optional personal note (added to email)
          </label>
          <textarea
            value={actionNote}
            onChange={e => setActionNote(e.target.value)}
            rows={3}
            placeholder="e.g. Sorry — clashing engagement on our side. Happy to find a new time."
            style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <button
              type="button"
              onClick={() => { setConfirmCancel(null); setActionNote('') }}
              style={btn(COLORS.inkSoft, '#fff', COLORS.border)}
            >Keep booking</button>
            <button
              type="button"
              onClick={() => doCancel(confirmCancel, actionNote)}
              disabled={actionId === confirmCancel.id}
              style={{ ...btn('#fff', COLORS.red, COLORS.red), opacity: actionId === confirmCancel.id ? 0.6 : 1 }}
            >{actionId === confirmCancel.id ? 'Cancelling…' : 'Cancel booking'}</button>
          </div>
        </Modal>
      )}

      {/* ── Reschedule modal ────────────────────────────────────────────── */}
      {reschedTarget && (
        <Modal onClose={() => { setReschedTarget(null); setChosenSlot(null); setActionNote('') }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: COLORS.ink }}>Reschedule</h2>
          <p style={{ margin: '0 0 16px', fontSize: 14, color: COLORS.inkSoft }}>
            <strong>{reschedTarget.name}</strong> — currently {formatSlotDate(new Date(reschedTarget.slot_at))} at {formatSlotTime(new Date(reschedTarget.slot_at))}
          </p>

          {availLoading ? (
            <div style={{ padding: 24, textAlign: 'center', color: COLORS.grey }}>Loading slots…</div>
          ) : availSlots.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: COLORS.grey }}>No slots available in the upcoming window.</div>
          ) : (
            <div style={{ maxHeight: 280, overflowY: 'auto', border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 8 }}>
              <SlotPicker
                slots={availSlots}
                currentSlot={reschedTarget.slot_at}
                chosen={chosenSlot}
                onPick={setChosenSlot}
              />
            </div>
          )}

          <label style={{ display: 'block', fontSize: 12, color: COLORS.grey, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, margin: '16px 0 6px' }}>
            Optional note (added to email)
          </label>
          <textarea
            value={actionNote}
            onChange={e => setActionNote(e.target.value)}
            rows={2}
            placeholder="e.g. Apologies — had to move things around. Hope this works."
            style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <button
              type="button"
              onClick={() => { setReschedTarget(null); setChosenSlot(null); setActionNote('') }}
              style={btn(COLORS.inkSoft, '#fff', COLORS.border)}
            >Cancel</button>
            <button
              type="button"
              onClick={doReschedule}
              disabled={!chosenSlot || actionId === reschedTarget.id}
              style={{
                ...btn('#fff', COLORS.teal, COLORS.teal),
                opacity: (!chosenSlot || actionId === reschedTarget.id) ? 0.5 : 1,
                cursor: (!chosenSlot || actionId === reschedTarget.id) ? 'not-allowed' : 'pointer',
              }}
            >{actionId === reschedTarget.id ? 'Moving…' : 'Move booking'}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ── Slot picker ────────────────────────────────────────────────────────────── */

function SlotPicker({
  slots, currentSlot, chosen, onPick,
}: {
  slots:       AvailableSlot[]
  currentSlot: string
  chosen:      string | null
  onPick:      (iso: string) => void
}) {
  // Group by date
  const groups = useMemo(() => {
    const map = new Map<string, AvailableSlot[]>()
    for (const s of slots) {
      const date = formatSlotDate(new Date(s.iso))
      if (!map.has(date)) map.set(date, [])
      map.get(date)!.push(s)
    }
    return Array.from(map.entries())
  }, [slots])

  const currentIso = new Date(currentSlot).toISOString()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {groups.map(([date, daySlots]) => (
        <div key={date}>
          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.grey, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
            {date}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {daySlots.map(s => {
              const isCurrent  = s.iso === currentIso
              const isChosen   = s.iso === chosen
              const isDisabled = s.taken && !isCurrent
              return (
                <button
                  key={s.iso}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => onPick(s.iso)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    border: `1px solid ${isChosen ? COLORS.teal : isCurrent ? COLORS.amber : COLORS.border}`,
                    backgroundColor: isChosen ? COLORS.tealLight : isCurrent ? COLORS.amberBg : isDisabled ? COLORS.greyBg : '#fff',
                    color: isDisabled ? COLORS.grey : isCurrent ? COLORS.amber : COLORS.ink,
                    textDecoration: isDisabled ? 'line-through' : 'none',
                  }}
                  title={isCurrent ? 'Currently booked into this slot' : isDisabled ? 'Already booked' : ''}
                >
                  {formatSlotTime(new Date(s.iso))}
                  {isCurrent && ' (current)'}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Modal shell ────────────────────────────────────────────────────────────── */

function Modal({ children, onClose }: { children: React.ReactNode, onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(10,46,42,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, zIndex: 50,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 14, padding: 24,
          width: '100%', maxWidth: 520, boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
        }}
      >
        {children}
      </div>
    </div>
  )
}

/* ── Style helpers ──────────────────────────────────────────────────────────── */

function th(): React.CSSProperties {
  return { textAlign: 'left', padding: '10px 14px', fontSize: 12, color: COLORS.grey, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }
}
function td(): React.CSSProperties {
  return { padding: '12px 14px', verticalAlign: 'top' }
}
function badge(bg: string, color: string): React.CSSProperties {
  return { display: 'inline-block', padding: '3px 10px', borderRadius: 999, background: bg, color, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }
}
function btn(color: string, bg: string, border: string): React.CSSProperties {
  return {
    display: 'inline-block', padding: '6px 12px', borderRadius: 8,
    fontSize: 13, fontWeight: 600,
    color, background: bg, border: `1px solid ${border}`,
    cursor: 'pointer',
  }
}
