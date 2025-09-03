-- Check if columns already exist first, then add missing ones
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarded BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS role TEXT,
ADD COLUMN IF NOT EXISTS venture_type TEXT,
ADD COLUMN IF NOT EXISTS experience_level TEXT;