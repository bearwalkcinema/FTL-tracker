-- Run this once in Supabase → SQL Editor → New Query → Run.

create table if not exists tracker_data (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- Allow the app's public (anon) key to read and write this table.
-- This mirrors how the tracker worked before: anyone with the link can view
-- and, if given producer access in-app, edit. There is no per-user login yet.
alter table tracker_data enable row level security;

create policy "public read" on tracker_data
  for select using (true);

create policy "public write" on tracker_data
  for insert with check (true);

create policy "public update" on tracker_data
  for update using (true);

-- Enables live sync: when one person edits, everyone else viewing sees it
-- update automatically without refreshing.
alter publication supabase_realtime add table tracker_data;

-- Seed the single row the app reads/writes. The app will also create this
-- automatically on first load if it's missing, so this is just a safety net.
insert into tracker_data (id, data)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;
