// Next.js calls register() once per server runtime at boot. We use it to
// pull in the right Sentry config for whichever runtime we're on. Each
// imported config is itself guarded by env-var presence, so this whole file
// is a no-op when SENTRY_DSN isn't set.

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}
