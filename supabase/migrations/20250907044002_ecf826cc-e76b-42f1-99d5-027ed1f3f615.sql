-- Secure profiles table RLS to prevent email leakage
-- 1) Ensure RLS is enabled and enforced
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- 2) Lock down access so users can only see/update/insert their own row
CREATE POLICY IF NOT EXISTS "Users can view own profile"
ON public.profiles
FOR SELECT
USING ((auth.uid())::text = (id)::text);

CREATE POLICY IF NOT EXISTS "Users can update own profile"
ON public.profiles
FOR UPDATE
USING ((auth.uid())::text = (id)::text);

CREATE POLICY IF NOT EXISTS "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK ((auth.uid())::text = (id)::text);

-- Optional hardening: explicitly disallow DELETE unless needed
-- (No DELETE policy is created, so deletes are denied by default under RLS)

-- Note: Service role bypasses RLS (intended for server-side admin ops).