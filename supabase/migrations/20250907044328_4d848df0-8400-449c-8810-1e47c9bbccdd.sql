-- Secure profiles table RLS to prevent email address leakage
-- Enable RLS and enforce it even for table owners
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Lock down access so users can only see/update/insert their own profile
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can view own profile' 
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
    WHERE policyname = 'Users can update own profile' 
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
    WHERE policyname = 'Users can insert own profile' 
      AND schemaname = 'public' AND tablename = 'profiles'
  ) THEN
    CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK ((auth.uid())::text = (id)::text);
  END IF;
END $$;