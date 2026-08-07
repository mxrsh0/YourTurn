-- YourTurn auth -> profile bridge
-- Creates a profile automatically when Supabase Auth creates a user.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, target_roles)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    case
      when coalesce(new.raw_user_meta_data ->> 'target_role', '') <> ''
        then array[new.raw_user_meta_data ->> 'target_role']::text[]
      else '{}'::text[]
    end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
