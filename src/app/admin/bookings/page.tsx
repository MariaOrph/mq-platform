// ── /admin/bookings ────────────────────────────────────────────────────────────
// Admin page for managing discovery-call bookings: view, cancel, reschedule.
// Server-gated to mq_admin via requireRole; the actual UI lives in the
// client component AdminBookings.

import type { Metadata } from 'next'
import { requireRole } from '@/lib/auth/helpers'
import AdminBookings from './AdminBookings'

export const metadata: Metadata = {
  title: 'Bookings — MQ Admin',
}

export default async function AdminBookingsPage() {
  await requireRole('mq_admin')
  return <AdminBookings />
}
