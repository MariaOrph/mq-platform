// Browser-side Sentry init. Loaded automatically by @sentry/nextjs in the
// client bundle. Stays a no-op until NEXT_PUBLIC_SENTRY_DSN is set in Vercel,
// which lets us ship the wiring without paying Sentry's "any error gets sent"
// cost or leaking events from local dev.

import * as Sentry from '@sentry/nextjs'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    // Performance: sample 10% of transactions. Free Sentry tier allows 10k
    // events/month, so 100% would burn through it fast on any real traffic.
    tracesSampleRate: 0.1,
    // Session replay: record full replay for any session that hits an error,
    // none otherwise. This is the cheap-and-useful default.
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0,
    // Don't spam the console in dev when DSN is set locally.
    debug: false,
  })
}
