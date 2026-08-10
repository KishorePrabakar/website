/*
# Add spaced repetition columns to neo_tasks

1. Modified Tables
- `neo_tasks`
  - `tier` (integer, default 1) — 1=Essential, 2=Important, 3=Bonus
  - `category` (text) — e.g. "Arrays & Hashing", "Sliding Window"
  - `sr_stage` (integer, default 0) — 0=not started, 1=done once, 2=1-day rev done, 3=3-day rev done, 4=7-day rev done (complete)
  - `sr_next_date` (date, nullable) — when the next revision is due
  - `sr_first_done` (date, nullable) — date the problem was first completed

2. Notes
- SR intervals: Stage 1→2 = 1 day, 2→3 = 3 days, 3→4 = 7 days (from the date of the previous stage completion).
- When sr_next_date <= today and the stage is not yet complete (stage < 4), the revision is "overdue" and locks new practice.
- No RLS policy changes needed — existing owner-scoped policies cover the new columns.
*/

ALTER TABLE public.neo_tasks
  ADD COLUMN IF NOT EXISTS tier integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS sr_stage integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sr_next_date date,
  ADD COLUMN IF NOT EXISTS sr_first_done date;
