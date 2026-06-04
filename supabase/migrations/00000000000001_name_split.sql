-- BU Alumni v3 — Split full_name into first_name, middle_name, last_name

-- 1. Add new name columns
alter table public.profiles
  add column if not exists first_name  text not null default '',
  add column if not exists middle_name text,              -- nullable
  add column if not exists last_name   text not null default '';

-- 2. Migrate existing data: copy full_name into first_name (safe fallback)
update public.profiles
  set first_name = coalesce(full_name, '')
  where full_name is not null and full_name <> '';

-- 3. Add generated display_name column
alter table public.profiles
  add column if not exists display_name text generated always as (
    trim(first_name || ' ' || coalesce(middle_name || ' ', '') || last_name)
  ) stored;

-- 4. Create full-text search index on names
create index if not exists profiles_name_search_idx on public.profiles
  using gin(to_tsvector('simple', display_name));

-- 5. Drop old full_name column
alter table public.profiles
  drop column if exists full_name;

-- 6. Update trigger to use split names
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, first_name, middle_name, last_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    new.raw_user_meta_data->>'middle_name',
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    'alumni'
  );
  return new;
end;
$$;
