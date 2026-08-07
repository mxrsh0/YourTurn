-- YourTurn initial schema
-- Run this migration once in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  location text,
  phone text,
  preferred_contact_method text,
  target_roles text[] not null default '{}',
  career_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cvs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'My CV',
  source text not null default 'built' check (source in ('uploaded','built')),
  template text not null default 'clean',
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cv_experience (
  id uuid primary key default gen_random_uuid(),
  cv_id uuid not null references public.cvs(id) on delete cascade,
  job_title text,
  employer text,
  location text,
  start_date date,
  end_date date,
  current_role boolean not null default false,
  description text,
  sort_order integer not null default 0
);

create table public.cv_education (
  id uuid primary key default gen_random_uuid(),
  cv_id uuid not null references public.cvs(id) on delete cascade,
  institution text,
  qualification text,
  field text,
  start_date date,
  end_date date,
  description text,
  sort_order integer not null default 0
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table public.cv_skills (
  cv_id uuid not null references public.cvs(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  proficiency text,
  sort_order integer not null default 0,
  primary key (cv_id, skill_id)
);

create table public.job_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  desired_roles text[] not null default '{}',
  experience_level text,
  minimum_salary integer,
  maximum_salary integer,
  locations text[] not null default '{}',
  remote_preference text,
  employment_types text[] not null default '{}',
  willing_to_relocate boolean not null default false,
  notification_preferences jsonb not null default '{}'::jsonb
);

create table public.job_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source_type text not null check (source_type in ('aggregator','agency','company','other')),
  base_url text,
  active boolean not null default true,
  last_successful_sync timestamptz
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.job_sources(id) on delete set null,
  external_id text,
  canonical_url text not null,
  title text not null,
  company_name text,
  location text,
  description text,
  salary_min integer,
  salary_max integer,
  salary_currency text default 'GBP',
  experience_level text,
  employment_type text,
  remote_type text,
  posted_at timestamptz,
  discovered_at timestamptz not null default now(),
  expires_at timestamptz,
  content_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_id, external_id)
);

create table public.saved_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  status text not null default 'saved',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, job_id)
);

create table public.search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  query text,
  filters_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Indexes for common access patterns.
create index cvs_user_id_idx on public.cvs(user_id);
create index cv_experience_cv_id_idx on public.cv_experience(cv_id);
create index cv_education_cv_id_idx on public.cv_education(cv_id);
create index cv_skills_skill_id_idx on public.cv_skills(skill_id);
create index jobs_source_id_idx on public.jobs(source_id);
create index jobs_posted_at_idx on public.jobs(posted_at desc);
create index jobs_location_idx on public.jobs(location);
create index saved_jobs_user_id_idx on public.saved_jobs(user_id);
create index search_history_user_id_idx on public.search_history(user_id, created_at desc);

-- Row Level Security: user-owned data is private to its owner.
alter table public.profiles enable row level security;
alter table public.cvs enable row level security;
alter table public.cv_experience enable row level security;
alter table public.cv_education enable row level security;
alter table public.cv_skills enable row level security;
alter table public.job_preferences enable row level security;
alter table public.saved_jobs enable row level security;
alter table public.search_history enable row level security;

create policy "Users can view their profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can create their profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users can manage their CVs" on public.cvs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage CV experience" on public.cv_experience for all using (
  exists (select 1 from public.cvs c where c.id = cv_id and c.user_id = auth.uid())
) with check (
  exists (select 1 from public.cvs c where c.id = cv_id and c.user_id = auth.uid())
);

create policy "Users can manage CV education" on public.cv_education for all using (
  exists (select 1 from public.cvs c where c.id = cv_id and c.user_id = auth.uid())
) with check (
  exists (select 1 from public.cvs c where c.id = cv_id and c.user_id = auth.uid())
);

create policy "Users can manage CV skills" on public.cv_skills for all using (
  exists (select 1 from public.cvs c where c.id = cv_id and c.user_id = auth.uid())
) with check (
  exists (select 1 from public.cvs c where c.id = cv_id and c.user_id = auth.uid())
);

create policy "Users can manage job preferences" on public.job_preferences for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage saved jobs" on public.saved_jobs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage search history" on public.search_history for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Public/read-only job catalogue tables. Writes will later be restricted to a server-side ingestion service.
alter table public.jobs enable row level security;
alter table public.job_sources enable row level security;
create policy "Anyone can read active job sources" on public.job_sources for select using (active = true);
create policy "Anyone can read jobs" on public.jobs for select using (true);

-- Keep updated_at current for rows changed through the API.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger cvs_updated_at before update on public.cvs for each row execute function public.set_updated_at();
create trigger job_preferences_updated_at before update on public.job_preferences for each row execute function public.set_updated_at();
create trigger saved_jobs_updated_at before update on public.saved_jobs for each row execute function public.set_updated_at();
create trigger jobs_updated_at before update on public.jobs for each row execute function public.set_updated_at();
