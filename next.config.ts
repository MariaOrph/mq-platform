import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

// withSentryConfig wraps the build to upload source maps (when
// SENTRY_AUTH_TOKEN is set) and to instrument the bundle. Everything is
// silent and a no-op without the relevant env vars, so leaving it on
// permanently is safe.
export default withSentryConfig(nextConfig, {
  silent: true,
  // Don't ship raw .map files in the public bundle. Sentry uploads them to
  // its own backend when SENTRY_AUTH_TOKEN is present, then deletes them by
  // default (deleteSourcemapFilesAfterUpload defaults to true in v10).
  // Without the token, we skip source-map upload entirely.
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
});
