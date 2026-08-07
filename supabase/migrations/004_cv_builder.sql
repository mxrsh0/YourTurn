-- YourTurn CV builder support
alter table public.cvs
  add column if not exists full_name text,
  add column if not exists professional_title text,
  add column if not exists email text,
  add column if not exists location text,
  add column if not exists summary text;

create index if not exists cv_skills_cv_id_idx on public.cv_skills(cv_id);
