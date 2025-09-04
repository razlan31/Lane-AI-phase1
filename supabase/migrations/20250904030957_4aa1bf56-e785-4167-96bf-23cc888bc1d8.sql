-- Add is_founder column to profiles table
ALTER TABLE public.profiles ADD COLUMN is_founder BOOLEAN DEFAULT false;

-- Seed razlansalim01@gmail.com as founder
UPDATE public.profiles 
SET is_founder = true 
WHERE email = 'razlansalim01@gmail.com';

-- Create index for better performance on founder lookups
CREATE INDEX idx_profiles_is_founder ON public.profiles(is_founder) WHERE is_founder = true;