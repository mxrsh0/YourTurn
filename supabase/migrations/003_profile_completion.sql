-- YourTurn: profile completion support
-- Adds the fields needed by the onboarding/profile step.

alter table public.profiles
  add column if not exists target_roles text[] not null default '{}',
  add column if not exists career_summary text,
  add column if not exists onboarding_completed boolean not null default false;

alter table public.profiles enable row level security;

-- Users may update only their own profile.
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Users may read only their own profile.
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
using (auth.uid() = user_id);
