-- Backward compatibility: add generated full_name column during transition to split names
alter table public.profiles
  add column if not exists full_name text generated always as (
    trim(first_name || ' ' || coalesce(middle_name || ' ', '') || last_name)
  ) stored;
