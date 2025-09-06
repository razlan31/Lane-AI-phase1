-- Fix linter warning: set search_path on function without it
CREATE OR REPLACE FUNCTION public.reset_ai_usage_if_needed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Reset AI usage if it's been more than 30 days
  IF OLD.ai_requests_reset_date < (now() - interval '30 days') THEN
    NEW.ai_requests_used = 0;
    NEW.ai_requests_reset_date = now();
  END IF;
  RETURN NEW;
END;
$$;