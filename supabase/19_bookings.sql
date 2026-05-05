-- ── 19_bookings.sql ────────────────────────────────────────────────────────────
-- Discovery-call bookings for the Manager Mindset Accelerator landing page.
-- Slots are Friday mornings 9:00–12:00 UK time, in 30-minute increments.
-- Server-side only: anonymous users book via API routes that use the service
-- role key. RLS therefore denies all direct access from the client.

create table if not exists bookings (
  id            uuid primary key default gen_random_uuid(),
  slot_at       timestamptz not null,
  name          text not null,
  email         text not null,
  company       text,
  job_role      text,
  phone         text,
  topic         text,
  cancel_token  uuid not null default gen_random_uuid(),
  status        text not null default 'confirmed' check (status in ('confirmed','cancelled')),
  created_at    timestamptz not null default now(),
  cancelled_at  timestamptz
);

-- One confirmed booking per slot. Cancelled bookings free the slot back up.
create unique index if not exists bookings_slot_confirmed_unique
  on bookings (slot_at)
  where status = 'confirmed';

create index if not exists bookings_slot_at_idx        on bookings (slot_at);
create index if not exists bookings_cancel_token_idx   on bookings (cancel_token);
create index if not exists bookings_email_idx          on bookings (email);

alter table bookings enable row level security;

-- Deny everything to anon + authenticated. All access goes through API routes
-- that use the service role key (which bypasses RLS).
revoke all on bookings from anon, authenticated;
