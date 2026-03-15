import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type UserRole = 'mq_admin' | 'client_admin' | 'participant'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  company_id: string | null
}

// ── Get the current logged-in user's full profile ────────────
// Returns null if no one is logged in.
export async function getCurrentProfile(): Promise<UserProfile | null> {
  try {
    const supabase = await createClient()

    // Use getSession() to read the local JWT without a network round-trip
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, company_id')
      .eq('id', session.user.id)
      .single()

    return profile ?? null
  } catch {
    return null
  }
}

// ── Require a logged-in user — redirect to login if not ──────
// Use this at the top of any protected server page.
export async function requireAuth(): Promise<UserProfile> {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')
  return profile
}

// ── Require a specific role — redirect to /unauthorised if wrong ─
// Example: requireRole('mq_admin') on an admin-only page.
export async function requireRole(
  allowedRoles: UserRole | UserRole[]
): Promise<UserProfile> {
  const profile = await requireAuth()
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

  if (!roles.includes(profile.role)) {
    redirect('/unauthorised')
  }

  return profile
}

// ── Get the default dashboard path for a role ────────────────
// After login, users are sent to the right place for their role.
export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'mq_admin':    return '/admin'
    case 'client_admin': return '/client'
    case 'participant':  return '/dashboard'
  }
}
