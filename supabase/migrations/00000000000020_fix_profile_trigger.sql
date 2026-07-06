-- Fix the auth.users -> profiles trigger after the full_name column was removed.

-- 1. Ensure student_id exists because signup/login reference it.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS student_id TEXT;

-- 2. Recreate the new-user trigger using the actual profiles columns.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    first_name,
    middle_name,
    last_name,
    email,
    student_id
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    NEW.raw_user_meta_data->>'middle_name',
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'student_id'
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    middle_name = EXCLUDED.middle_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    student_id = EXCLUDED.student_id,
    updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 3. Keep profile email in sync when auth email changes.
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.profiles
  SET email = NEW.email,
      updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_update();
