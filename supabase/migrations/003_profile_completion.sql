-- YourTurn: profile completion support
-- profiles already contains target_roles and career_summary from migration 001.
-- This migration adds only the onboarding completion flag and corrects the RLS
-- policies to use profiles.id, which is the auth.users id.

alter table public.profiles
  add column if not exists onboarding_completed boolean not null default false;

alter table public.profiles enable row level security;

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
using (auth.uid() = id);
