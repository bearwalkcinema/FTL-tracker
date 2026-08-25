-- Run this once in Supabase → SQL Editor → New Query → Run.

create table if not exists tracker_data (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- Allow anyone to VIEW the data (this is what makes Client View work without
-- a login), but only people who are signed in (producers/editors you've
-- added as users) can write to it.
alter table tracker_data enable row level security;

create policy "public read" on tracker_data
  for select using (true);

create policy "authenticated write" on tracker_data
  for insert with check (auth.role() = 'authenticated');

create policy "authenticated update" on tracker_data
  for update using (auth.role() = 'authenticated');

-- Enables live sync: when one person edits, everyone else viewing sees it
-- update automatically without refreshing.
alter publication supabase_realtime add table tracker_data;

-- Seed the single row the app reads/writes. The app will also create this
-- automatically on first load if it's missing, so this is just a safety net.
insert into tracker_data (id, data)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;
