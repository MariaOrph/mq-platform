# MQ Platform — Operations Runbook

This is the playbook for when something goes wrong with the MQ Platform in
production. Each section follows the same shape: **Symptom → Investigate → Fix**.
Read top to bottom in an incident; skim by section heading day-to-day.

If you are panicking: take a breath, then start at **§1 Prod is down**.

---

## Quick links

| What | Where |
|---|---|
| Live app | https://app.mindsetquo.com (or current Vercel domain) |
| Vercel project | https://vercel.com/dashboard → mq-platform |
| Supabase project | https://supabase.com/dashboard → MQ project |
| Anthropic console | https://console.anthropic.com (usage, billing, rate limits) |
| Resend dashboard | https://resend.com/emails (delivery logs) |
| Sentry | https://sentry.io → mq-platform project (once activated, see §B) |
| UptimeRobot | https://uptimerobot.com (set up to ping /api/health) |
| Health endpoint | https://app.mindsetquo.com/api/health |
| GitHub repo | (Maria's GitHub → mq-platform) |

The health endpoint returns JSON like:
```json
{ "ok": true, "db": true, "ai_key_present": true, "version": "a1b2c3d", "ts": "...", "uptime_seconds": 42 }
```
Status 200 = healthy. Status 503 = at least one critical dependency is down.

---

## 1. Prod is down

**Symptom.** Users can't reach app.mindsetquo.com, or it loads but nothing works.

**Investigate.**
1. Hit `https://app.mindsetquo.com/api/health` in a browser. What's the JSON say?
   - All `true`, 200 → app is fine, the user's issue is local.
   - `db: false` → jump to §2.
   - `ai_key_present: false` → env var got dropped on Vercel. Re-add it in Vercel → Settings → Environment Variables and redeploy.
   - 502 / 504 / no response at all → Vercel itself is having a problem.
2. Check https://www.vercel-status.com.
3. Check Vercel dashboard → Deployments. Has there been a recent deploy? If so, did it succeed?

**Fix.**
- If a recent deploy looks suspicious, see §11 (rollback).
- If Vercel platform is down, there is nothing to do but wait. Post a status note to users if downtime exceeds 15 minutes.
- If env vars were lost, re-add and trigger a redeploy (Vercel → Deployments → ⋯ → Redeploy).

---

## 2. Database unreachable

**Symptom.** Health endpoint reports `db: false`, or all pages show "Failed to fetch profile" / loading spinners that never resolve.

**Investigate.**
1. https://status.supabase.com — is Supabase having an outage?
2. Supabase dashboard → Project → Database → has it been paused (free tier auto-pauses after 7 days of inactivity)?
3. Supabase dashboard → Project Settings → API. Are `URL` and `service_role` key still the values Vercel has?
4. Supabase dashboard → Reports → Database load. Is connection pool saturated?

**Fix.**
- Paused project → click "Restore". Takes ~1 minute.
- Rotated keys → copy from Supabase, update Vercel env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`), redeploy.
- Connection pool exhausted → check for runaway queries in Supabase → Database → Query Performance. Kill any long-running ones.
- Supabase platform outage → wait it out. Communicate.

---

## 3. Anthropic API outage / errors

**Symptom.** Users report the coaching room, MQ Builder, daily spark, or scenario simulator returning errors. App itself works, just the AI calls fail.

**Investigate.**
1. https://status.anthropic.com — is Anthropic itself down?
2. Vercel → Logs → filter for `anthropic` or `messages.create`. What's the error?
   - `401 invalid x-api-key` → key was rotated or deleted.
   - `429 rate_limit_error` → we are hitting Anthropic's account-level rate limit.
   - `529 overloaded_error` → Anthropic is overloaded (transient).
   - `500` from Anthropic → upstream issue.
3. Anthropic console → Usage. Has spend hit the cap (see §5)?

**Fix.**
- 401 → regenerate key in Anthropic console, paste new value into Vercel env var `ANTHROPIC_API_KEY`, redeploy.
- 429 account-level → request a higher tier in the Anthropic console, or wait (the per-user limits we ship in §C are designed to keep us below this).
- 529 / 500 → not actionable on our side. Our endpoints already surface a polite error. Wait for Anthropic recovery.
- Hit spend cap → see §5.

---

## 4. Stripe webhook failures

**N/A for MQ.** MQ does not use Stripe. This section is reserved so the runbook
structure matches our other apps; if billing is ever added, document it here.

---

## 5. Cost spike (Anthropic bill suddenly large)

**Symptom.** Anthropic spend in the console is rising much faster than usual, or you got a billing alert.

**Investigate.**
1. Anthropic console → Usage → group by date. When did it start climbing?
2. Supabase → SQL editor — find the top burners over the last 7 days (this query depends on the `ai_usage` table from migration 21):
   ```sql
   select user_id, day, endpoint, count
   from ai_usage
   where day >= current_date - 7
   order by count desc
   limit 20;
   ```
3. Cross-reference user_ids with `profiles` to see who they are:
   ```sql
   select p.email, p.role, u.day, u.endpoint, u.count
   from ai_usage u
   join profiles p on p.id = u.user_id
   where u.day >= current_date - 7
   order by u.count desc
   limit 20;
   ```
4. Look for: a single user with 10× normal volume (compromised account or scripted abuse), or a bug that retry-loops Anthropic calls.

**Fix.**
- Single abusive user → lower their AI tier (see `src/lib/ai-rate-limit.ts`) or temporarily mark their profile inactive.
- Bug in retry logic → patch and deploy (see §10).
- Long-term: tighten the per-endpoint daily caps in `src/lib/ai-rate-limit.ts`.
- Set an account-level spend cap in Anthropic console → Billing → Spend limits. Recommended: 2× your expected monthly spend as a hard ceiling.

---

## 6. Email deliverability problems

**Symptom.** Users report not receiving invites, password resets, or reminder emails.

**Investigate.**
1. Resend dashboard → Emails. Search by recipient address. Is the email there?
   - Delivered → it's in their spam folder.
   - Bounced → bad address, or recipient's domain blocked us.
   - Not present at all → our app didn't send it.
2. If our app didn't send: Vercel logs → filter for the relevant route (e.g. `/api/invite`, `/api/send-reminders`). Look for `resend.emails.send` errors.
3. Check `RESEND_API_KEY` env var is still set in Vercel.
4. Domain verification: Resend → Domains → mindsetquo.com (or whatever sender domain). All DNS records should be Verified.

**Fix.**
- Spam folder → ask user to mark as Not Spam; long-term verify domain + warm up sending reputation.
- Bounce → confirm address typo with sender, retry.
- Resend API key rotated → re-paste into Vercel, redeploy.
- DNS records unverified → re-add SPF/DKIM/DMARC records in domain registrar.

---

## 7. User says they lost data / "everything reset"

**Symptom.** "I filled out the whole assessment and it disappeared", "my notes are gone", "my coaching session reset".

**Investigate.**
1. Confirm the user is logged into the same account they used originally (not a different email).
2. Supabase → Table Editor → find their row by email in `profiles`. Note their `id`.
3. Check the relevant table:
   - Assessment: `assessments` filtered by `participant_id = <id>`.
   - Coaching: `coaching_chats` and `coaching_room_messages` filtered by `participant_id`.
   - Notes: `notes` filtered by `user_id`.
   - 360 feedback: `feedback_responses` filtered by relevant participant.
4. If the row is missing entirely → it never saved. Check Vercel logs around their reported time for errors on the relevant insert.
5. If the row exists but is empty / partial → it saved but the user is looking in the wrong place (different account, different cohort).

**Fix.**
- Drafted-but-never-saved long-form work: Phase D persistence (see `src/lib/use-persisted-state.ts`) buffers assessment and 360 feedback form answers in localStorage so a crash mid-flow doesn't lose them. If the user still has the same browser tab open, their draft should auto-restore on reload. Walk them through it.
- Genuinely deleted from DB: see §8.

---

## 8. Restoring data from backup

**Symptom.** Confirmed data loss (deletion bug, dropped table, malicious delete).

**Investigate.**
1. Supabase → Project Settings → Database → Backups. What's the most recent point-in-time?
2. Free tier: daily backups, 7 days retention. Paid tier: hourly + PITR.

**Fix.**
- **Do not** restore the whole project unless absolutely necessary — it overwrites everything since the backup.
- Preferred: restore the backup into a *separate* project, then `pg_dump` the specific table/rows you need and `psql` them into production.
- If you must restore in place: take a fresh snapshot first, then click Restore. Notify users that anything done in the gap is lost.
- After any restore, run the latest migration files manually if their snapshot predates them.

---

## 9. Sentry alert fired

**Symptom.** You got an email or Slack ping from Sentry about a new issue or a regression.

**Investigate.**
1. Open the issue in Sentry. Read the stack trace and the breadcrumbs.
2. How many users? How frequent? Is it a one-off or trending up?
3. Check the release tag → does it correlate with a recent deploy?

**Fix.**
- High-frequency new issue right after a deploy → rollback (§11) first, then fix at leisure.
- Long-standing low-frequency issue → triage normally, fix in next deploy.
- Known non-issue (e.g. expected `AbortError` from a cancelled fetch) → add to `ignoreErrors` in `sentry.server.config.ts` / `sentry.client.config.ts`.

---

## 10. Need to deploy a fix urgently

**Investigate.** Reproduce the bug locally if at all possible. A 5-minute repro saves a 2-hour rollback.

**Fix.**
1. Branch off main: `git checkout -b hotfix/<short-name>`.
2. Make the smallest change that fixes it.
3. `npx tsc --noEmit` and `npm run build` locally. Don't push a deploy that fails to build.
4. Commit using the right identity:
   ```bash
   git -c user.email=MariaOrph@users.noreply.github.com -c user.name=MariaOrph \
     commit -m "fix: <one-line summary>

   <why this matters, what we changed, what we verified>"
   ```
5. Push to main (or open a PR if you want a second pair of eyes — for a true hotfix, push direct).
6. Watch the Vercel deployment go green.
7. Hit `/api/health` to confirm.

---

## 11. Rolling back a bad deploy

**Symptom.** A recent deploy broke prod. You need to revert NOW.

**Fix.**
1. Vercel dashboard → Deployments.
2. Find the last known-good deployment (look for the one before the bad one — green checkmark, and you remember it working).
3. Click ⋯ → **Promote to Production**.
4. Confirm.
5. Vercel will route traffic to that build within ~10 seconds. No git revert needed.
6. Hit `/api/health` to confirm.
7. **Then** go fix the underlying bug in git (don't leave main pointing at the broken commit).

---

## 12. Common gotchas

These trip us up repeatedly. Save yourself by reading them before you start a session.

- **Never use `Co-Authored-By` in git commits.** Vercel's Hobby plan blocks unrecognised committers and the deploy fails silently.
- **Always commit as `MariaOrph@users.noreply.github.com`.** Vercel matches this against the GitHub account. Use:
  ```
  git -c user.email=MariaOrph@users.noreply.github.com -c user.name=MariaOrph commit ...
  ```
- **No em dashes in user-facing copy.** Emails, UI text, AI prompts — use full stops or commas instead. Em dashes have become a tell for AI-generated text and our brand voice avoids them.
- **RLS on every user-data table.** New tables that hold per-user data must have `enable row level security` plus explicit `select_own` / `insert_own` / `update_own` policies. Service-role-only tables (like `auth_rate_limit`) have RLS *off* with grants revoked from `anon` and `authenticated`.
- **Service-role key never reaches the browser.** Only used inside route handlers and server components. Anything client-side uses the anon key.
- **Migrations are append-only.** Don't edit an existing `NN_*.sql` file — write a new one with the next number. The current latest is `20_coaching_history_summary.sql`, so the next is `21_*.sql`.

---

## A. Activating Sentry (one-time setup, ~10 minutes)

Sentry SDK is installed and wired but starts as a no-op until a DSN is set. To turn it on:

1. Sign up at https://sentry.io. Create a new project, platform = **Next.js**, name = **mq-platform**.
2. Sentry will show you a DSN that looks like `https://xxxxx@oyyy.ingest.sentry.io/zzzz`.
3. In Vercel → mq-platform → Settings → Environment Variables, add for **Production**:
   - `NEXT_PUBLIC_SENTRY_DSN` = the DSN from step 2
   - `SENTRY_DSN` = same DSN
4. (Optional but recommended) Create a Sentry auth token under Sentry → Settings → Account → Auth Tokens with scope `project:releases`. Add it to Vercel as `SENTRY_AUTH_TOKEN`. This uploads source maps on each deploy so stack traces are readable.
5. Trigger a redeploy in Vercel.
6. Test: temporarily add `throw new Error('Sentry test')` to a route, deploy, hit the route, confirm it appears in Sentry. Then revert.

---

## B. Activating Bot/Abuse Hardening (one-time setup, ~5 minutes)

The booking form (`/book-a-call`) is the only public lead-capture surface on
MQ. To protect it from spam bookings:

1. Sign in at https://www.cloudflare.com → Turnstile → Add Site. Domain = your production domain. Widget mode = **Managed**.
2. Cloudflare gives you a **Site Key** and a **Secret Key**.
3. In Vercel → Settings → Environment Variables, add for **Production**:
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` = the site key
   - `TURNSTILE_SECRET_KEY` = the secret key
4. Trigger a redeploy.
5. Test: open `/book-a-call` in an incognito window. The Turnstile widget should render below the form fields. Submit a booking — if the widget is in place, you'll get a token and the booking will go through. Without a valid token, the precheck endpoint returns 4xx.

Without these env vars set, the system gracefully no-ops: the widget renders nothing, the verifier returns `ok: true`, and the rate limit + disposable-email filter still run.
