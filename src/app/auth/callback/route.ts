import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type') // 'invite', 'recovery', etc.

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
      // Password recovery — send straight to the reset password page
      if (type === 'recovery') {
        return NextResponse.redirect(new URL('/auth/reset-password', origin))
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', data.user.id)
        .single()

      if (!profile?.full_name) {
        return NextResponse.redirect(new URL('/auth/setup', origin))
      }

      const roleMap: Record<string, string> = {
        mq_admin:     '/admin',
        client_admin: '/client',
        participant:  '/dashboard',
      }
      const destination = roleMap[profile?.role ?? 'participant'] ?? '/dashboard'
      return NextResponse.redirect(new URL(destination, origin))
    }

    // PKCE exchange failed (common for invite flows where the code verifier
    // was not stored by our app). Pass the code to the client-side invite page
    // which tries multiple auth methods including direct OTP verification.
    if (type !== 'recovery') {
      return NextResponse.redirect(
        new URL(`/auth/invite?code=${encodeURIComponent(code)}`, origin)
      )
    }
  }

  // No code in the URL — this happens with implicit flow where Supabase puts
  // access_token + refresh_token in the hash fragment. The server cannot read
  // hash fragments, so we return an HTML page that reads them client-side and
  // forwards to the invite page which handles setSession.
  const qs = searchParams.toString()
  const queryStr = qs ? `?${qs}` : ''

  return new Response(
    `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Setting up your account…</title>
  <style>
    body { margin: 0; background: #E8FDF7; display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: -apple-system, sans-serif; }
    .box { text-align: center; }
    .logo { width: 48px; height: 48px; background: #0AF3CD; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="box">
    <div class="logo"><span style="font-weight:900;color:#0A2E2A;">MQ</span></div>
    <p style="color:#05A88E;margin:0;">Setting up your account…</p>
  </div>
  <script>
    // Hash fragments (implicit flow) are only readable client-side.
    // Forward them to the invite page which calls setSession().
    var hash = window.location.hash || '';
    window.location.replace('/auth/invite${queryStr}' + hash);
  </script>
</body>
</html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}
