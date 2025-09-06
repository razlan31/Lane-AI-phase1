-- Create billing_subscriptions table to track subscription details
CREATE TABLE public.billing_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive',
  price_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.billing_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for users to view their own subscription
CREATE POLICY "Users can view own billing subscriptions" 
ON public.billing_subscriptions 
FOR SELECT 
USING (user_id = auth.uid());

-- Create policies for edge functions to manage subscriptions
CREATE POLICY "Edge functions can insert billing subscriptions" 
ON public.billing_subscriptions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Edge functions can update billing subscriptions" 
ON public.billing_subscriptions 
FOR UPDATE 
USING (true);

-- Update profiles table with additional fields needed
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS ai_quota_remaining INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS ai_quota_reset_date TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';

-- Create trigger for updated_at on billing_subscriptions
CREATE TRIGGER update_billing_subscriptions_updated_at
BEFORE UPDATE ON public.billing_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();