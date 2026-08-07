-- YourTurn CV builder display/persistence support
alter table public.cvs
  add column if not exists phone text,
  add column if not exists skills_json jsonb not null default '[]'::jsonb;

alter table public.cv_experience
  add column if not exists display_dates text;

alter table public.cv_education
  add column if not exists display_dates text;

create index if not exists cvs_user_status_idx on public.cvs(user_id, status);
