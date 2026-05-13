// Edge-runtime Sentry init (middleware, edge route handlers). Loaded via
// instrumentation.ts when NEXT_RUNTIME === 'edge'. Stays a no-op until
// SENTRY_DSN is set in Vercel.

import * as Sentry from '@sentry/nextjs'

const dsn = process.env.SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    debug: false,
  })
}
