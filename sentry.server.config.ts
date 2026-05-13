// Server-side Sentry init. Loaded via instrumentation.ts on the Node runtime.
// Stays a no-op until SENTRY_DSN is set in Vercel.

import * as Sentry from '@sentry/nextjs'

const dsn = process.env.SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    // AbortError fires when a client navigates away mid-request. It is normal
    // behaviour, not a bug, and clutters Sentry if we let it through.
    ignoreErrors: ['AbortError'],
    debug: false,
  })
}
