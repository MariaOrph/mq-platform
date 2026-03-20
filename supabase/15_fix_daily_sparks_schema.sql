-- Fix daily_sparks schema to support 7 dimensions, nullable dimension_id (values cards), and up to 34 cards

-- 1. Expand card_number range from 24 → 34
alter table public.daily_sparks
  drop constraint if exists daily_sparks_card_number_check;

alter table public.daily_sparks
  add constraint daily_sparks_card_number_check
  check (card_number between 1 and 34);

-- 2. Allow dimension_id to be NULL (values cards have no MQ dimension)
alter table public.daily_sparks
  alter column dimension_id drop not null;

-- 3. Expand dimension_id range from 6 → 7 (and allow null for values cards)
alter table public.daily_sparks
  drop constraint if exists daily_sparks_dimension_id_check;

alter table public.daily_sparks
  add constraint daily_sparks_dimension_id_check
  check (dimension_id between 1 and 7 or dimension_id is null);
