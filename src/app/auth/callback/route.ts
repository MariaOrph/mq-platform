import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

// This route handles the magic link that Supabase sends in invitation emails.
// When a newly-invited user clicks their link, they land here first.
// We exchange the one-time token for a real session, then send them to
// set their password (if new) or straight to their dashboard (if returning).

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type') // 'invite' when coming from an invitation email

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data?.user) {
      // Brand-new invited user — send them to set a password before continuing
      if (type === 'invite') {
        return NextResponse.redirect(new URL('/auth/setup', origin))
      }

      // Returning user — send them to the right dashboard based on their role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      const roleMap: Record<string, string> = {
        mq_admin:     '/admin',
        client_admin: '/client',
        participant:  '/dashboard',
      }
      const destination = roleMap[profile?.role ?? 'participant'] ?? '/dashboard'

      return NextResponse.redirect(new URL(destination, origin))
    }
  }

  // Something went wrong — send them back to login with an error message
  return NextResponse.redirect(
    new URL('/login?error=invalid_link', origin)
  )
}
