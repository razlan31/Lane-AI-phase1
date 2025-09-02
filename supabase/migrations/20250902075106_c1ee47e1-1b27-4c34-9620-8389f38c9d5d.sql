-- Add version tracking to worksheets for advanced features
ALTER TABLE public.worksheets 
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.worksheets(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS template_category TEXT;

-- Create alerts table for wellbeing alerts
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  venture_id UUID REFERENCES public.ventures(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for alerts
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for alerts
CREATE POLICY "Users can view own alerts" 
ON public.alerts 
FOR SELECT 
USING ((auth.uid())::text = (user_id)::text);

CREATE POLICY "Users can update own alerts" 
ON public.alerts 
FOR UPDATE 
USING ((auth.uid())::text = (user_id)::text);

-- Create portfolio_metrics table for multi-venture analysis
CREATE TABLE IF NOT EXISTS public.portfolio_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_revenue NUMERIC DEFAULT 0,
  total_runway NUMERIC DEFAULT 0,
  total_burn_rate NUMERIC DEFAULT 0,
  portfolio_roi NUMERIC DEFAULT 0,
  risk_score NUMERIC DEFAULT 0,
  diversification_score NUMERIC DEFAULT 0,
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB
);

-- Enable RLS for portfolio metrics
ALTER TABLE public.portfolio_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own portfolio metrics" 
ON public.portfolio_metrics 
FOR SELECT 
USING ((auth.uid())::text = (user_id)::text);

-- Add triggers for updating timestamps
CREATE TRIGGER update_alerts_updated_at
BEFORE UPDATE ON public.alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();