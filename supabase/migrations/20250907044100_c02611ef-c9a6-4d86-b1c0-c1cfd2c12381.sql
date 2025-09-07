-- Harden profiles table RLS (id contains user UUID and emails)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Create policies only if missing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE polname = 'Users can view own profile' 
      AND schemaname = 'public' AND tablename = 'profiles'
  ) THEN
    CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING ((auth.uid())::text = (id)::text);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE polname = 'Users can update own profile' 
      AND schemaname = 'public' AND tablename = 'profiles'
  ) THEN
    CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING ((auth.uid())::text = (id)::text);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE polname = 'Users can insert own profile' 
      AND schemaname = 'public' AND tablename = 'profiles'
  ) THEN
    CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK ((auth.uid())::text = (id)::text);
  END IF;
END $$;