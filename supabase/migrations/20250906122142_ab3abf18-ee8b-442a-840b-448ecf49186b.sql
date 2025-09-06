-- Create calculations_log table for ad-hoc scenario saves
CREATE TABLE IF NOT EXISTS public.calculations_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  scenario_text TEXT NOT NULL,
  assumptions JSONB DEFAULT '{}',
  result JSONB DEFAULT '{}',
  confidence NUMERIC DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  explanation TEXT,
  ai_interaction_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.calculations_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own calculation logs" 
ON public.calculations_log 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own calculation logs" 
ON public.calculations_log 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calculation logs" 
ON public.calculations_log 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calculation logs" 
ON public.calculations_log 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_calculations_log_updated_at
BEFORE UPDATE ON public.calculations_log
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add scenario evaluation to available features
INSERT INTO public.available_features (name, description, category) VALUES
('scenario_eval', 'Evaluate business scenarios with calculations', 'analyst'),
('save_calculation', 'Save scenario calculations to log', 'analyst'),
('convert_to_worksheet', 'Convert scenarios to structured worksheets', 'worksheets')
ON CONFLICT (name) DO NOTHING;