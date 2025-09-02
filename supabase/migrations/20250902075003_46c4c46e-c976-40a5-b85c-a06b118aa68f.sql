-- Create personal table for Personal Page
CREATE TABLE public.personal (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  savings NUMERIC DEFAULT 0,
  monthly_burn NUMERIC DEFAULT 0,
  work_hours NUMERIC DEFAULT 40,
  commitments TEXT[],
  activities TEXT[],
  goals TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.personal ENABLE ROW LEVEL SECURITY;

-- Create policies for personal data
CREATE POLICY "Users can view own personal data" 
ON public.personal 
FOR SELECT 
USING ((auth.uid())::text = (user_id)::text);

CREATE POLICY "Users can insert own personal data" 
ON public.personal 
FOR INSERT 
WITH CHECK ((auth.uid())::text = (user_id)::text);

CREATE POLICY "Users can update own personal data" 
ON public.personal 
FOR UPDATE 
USING ((auth.uid())::text = (user_id)::text);

CREATE POLICY "Users can delete own personal data" 
ON public.personal 
FOR DELETE 
USING ((auth.uid())::text = (user_id)::text);

-- Add version tracking to worksheets for advanced features
ALTER TABLE public.worksheets 
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.worksheets(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS template_category TEXT;

-- Create alerts table for wellbeing alerts
CREATE TABLE public.alerts (
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
CREATE TABLE public.portfolio_metrics (
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
CREATE TRIGGER update_personal_updated_at
BEFORE UPDATE ON public.personal
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at
BEFORE UPDATE ON public.alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default worksheet templates
INSERT INTO public.worksheets (user_id, venture_id, type, inputs, is_template, template_category, confidence_level) VALUES
(null, null, 'cashflow_projection', '{"periods": 24, "starting_cash": 100000, "revenue_growth": 0.1, "fixed_costs": 10000, "variable_cost_ratio": 0.3}', true, 'Finance', 'estimate'),
(null, null, 'breakeven_analysis', '{"fixed_costs": 10000, "variable_cost_per_unit": 15, "price_per_unit": 50, "units_to_breakeven": 0}', true, 'Finance', 'estimate'),
(null, null, 'roi_calculator', '{"initial_investment": 100000, "annual_return": 25000, "years": 5, "discount_rate": 0.1}', true, 'Finance', 'estimate'),
(null, null, 'sensitivity_analysis', '{"base_case": {"revenue": 100000, "costs": 80000}, "variables": ["revenue", "costs"], "ranges": [0.2, 0.2]}', true, 'Science', 'estimate'),
(null, null, 'portfolio_risk_model', '{"ventures": [], "correlation_matrix": [], "risk_weights": []}', true, 'Science', 'estimate'),
(null, null, 'market_tam_sam_som', '{"tam": 1000000000, "sam": 100000000, "som": 10000000, "market_penetration": 0.01}', true, 'Science', 'estimate'),
(null, null, 'budget_planner', '{"monthly_income": 5000, "fixed_expenses": 3000, "variable_expenses": 1000, "savings_target": 1000}', true, 'Personal', 'estimate'),
(null, null, 'savings_runway', '{"current_savings": 50000, "monthly_expenses": 4000, "emergency_fund_months": 6}', true, 'Personal', 'estimate'),
(null, null, 'time_allocation', '{"work_hours": 40, "personal_hours": 20, "family_hours": 30, "venture_hours": 15}', true, 'Personal', 'estimate'),
(null, null, 'work_life_balance', '{"stress_level": 5, "satisfaction_level": 7, "energy_level": 6, "goal_alignment": 8}', true, 'Personal', 'estimate'),
(null, null, 'personal_venture_bridge', '{"personal_capacity": 100, "venture_demands": [], "synergy_score": 0}', true, 'Personal', 'estimate');