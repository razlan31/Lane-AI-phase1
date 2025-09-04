-- Add subscription fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_requests_used INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_requests_reset_date TIMESTAMPTZ DEFAULT now();

-- Create index for subscription queries
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_plan ON public.profiles(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);

-- Create function to reset AI usage monthly
CREATE OR REPLACE FUNCTION public.reset_ai_usage_if_needed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create trigger for automatic AI usage reset
DROP TRIGGER IF EXISTS trigger_reset_ai_usage ON public.profiles;
CREATE TRIGGER trigger_reset_ai_usage
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.reset_ai_usage_if_needed();