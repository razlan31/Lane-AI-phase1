-- Add onboarded column to profiles table for tracking completion status
ALTER TABLE public.profiles 
ADD COLUMN onboarded BOOLEAN DEFAULT false;

-- Add role and other onboarding-related fields that may be referenced
ALTER TABLE public.profiles 
ADD COLUMN role TEXT,
ADD COLUMN venture_type TEXT,
ADD COLUMN experience_level TEXT;