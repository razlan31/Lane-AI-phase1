-- Create available_features table for feature registry
CREATE TABLE IF NOT EXISTS public.available_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ideas table for Strategist role
CREATE TABLE IF NOT EXISTS public.ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  assumptions JSONB DEFAULT '{}',
  risks JSONB DEFAULT '{}',
  suggestions JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  ai_interaction_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create personal_journal table for Journal/Coach role
CREATE TABLE IF NOT EXISTS public.personal_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  entry TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  mood TEXT,
  goals JSONB DEFAULT '{}',
  ai_interaction_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ai_interaction_history table for audit trail
CREATE TABLE IF NOT EXISTS public.ai_interaction_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('explainer', 'strategist', 'analyst', 'guide', 'journal', 'assistant')),
  instruction TEXT NOT NULL,
  ai_response TEXT,
  action_type TEXT,
  action_payload JSONB DEFAULT '{}',
  result_status TEXT DEFAULT 'pending' CHECK (result_status IN ('pending', 'confirmed', 'cancelled', 'error')),
  resource_type TEXT,
  resource_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create feature_requests table
CREATE TABLE IF NOT EXISTS public.feature_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  request_text TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'declined')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create glossary table for Explainer role
CREATE TABLE IF NOT EXISTS public.glossary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT NOT NULL UNIQUE,
  definition TEXT NOT NULL,
  example TEXT,
  category TEXT,
  source TEXT DEFAULT 'system',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.available_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_interaction_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glossary ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for available_features (public read)
CREATE POLICY "Anyone can view available features" 
ON public.available_features 
FOR SELECT 
USING (true);

-- Create RLS policies for ideas
CREATE POLICY "Users can view their own ideas" 
ON public.ideas 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ideas" 
ON public.ideas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ideas" 
ON public.ideas 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ideas" 
ON public.ideas 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for personal_journal
CREATE POLICY "Users can view their own journal entries" 
ON public.personal_journal 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own journal entries" 
ON public.personal_journal 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries" 
ON public.personal_journal 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries" 
ON public.personal_journal 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for ai_interaction_history
CREATE POLICY "Users can view their own AI interactions" 
ON public.ai_interaction_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI interactions" 
ON public.ai_interaction_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI interactions" 
ON public.ai_interaction_history 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for feature_requests
CREATE POLICY "Users can view their own feature requests" 
ON public.feature_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own feature requests" 
ON public.feature_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feature requests" 
ON public.feature_requests 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for glossary (public read, admin write)
CREATE POLICY "Anyone can view glossary entries" 
ON public.glossary 
FOR SELECT 
USING (true);

-- Create triggers for updated_at
CREATE TRIGGER update_available_features_updated_at
BEFORE UPDATE ON public.available_features
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ideas_updated_at
BEFORE UPDATE ON public.ideas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_personal_journal_updated_at
BEFORE UPDATE ON public.personal_journal
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_interaction_history_updated_at
BEFORE UPDATE ON public.ai_interaction_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feature_requests_updated_at
BEFORE UPDATE ON public.feature_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_glossary_updated_at
BEFORE UPDATE ON public.glossary
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial available features
INSERT INTO public.available_features (name, description, category) VALUES
('create_idea', 'Create and manage business ideas', 'strategist'),
('analyze_data', 'Analyze worksheets and KPIs', 'analyst'),
('explain_terms', 'Explain business terms and concepts', 'explainer'),
('journal_entry', 'Create personal journal entries', 'journal'),
('workflow_guide', 'Guide through application workflows', 'guide'),
('create_worksheet', 'Create financial worksheets', 'worksheets'),
('update_venture', 'Update venture information', 'ventures'),
('manage_kpis', 'Manage key performance indicators', 'analytics')
ON CONFLICT (name) DO NOTHING;

-- Insert common business glossary terms
INSERT INTO public.glossary (term, definition, example, category) VALUES
('ROI', 'Return on Investment - a measure of the efficiency of an investment', 'If you invest $1000 and get back $1200, your ROI is 20%', 'finance'),
('Burn Rate', 'The rate at which a company spends money, typically monthly', 'A startup spending $50,000 per month has a burn rate of $50k/month', 'finance'),
('Runway', 'How long a company can operate before running out of money', 'With $500k cash and $50k monthly burn, runway is 10 months', 'finance'),
('CAC', 'Customer Acquisition Cost - the cost to acquire one new customer', 'If you spend $1000 on marketing and get 10 customers, CAC is $100', 'marketing'),
('LTV', 'Lifetime Value - the total revenue expected from a customer', 'A customer paying $50/month for 24 months has an LTV of $1200', 'marketing'),
('Gross Margin', 'Revenue minus cost of goods sold, as a percentage', 'Selling a $100 product that costs $60 to make gives 40% gross margin', 'finance'),
('Break-even', 'The point where total revenue equals total costs', 'When monthly revenue of $10k equals monthly costs of $10k', 'finance'),
('Unit Economics', 'The revenues and costs associated with a single unit', 'Profit per customer, cost per product, revenue per user', 'business'),
('Cashflow', 'The movement of money in and out of a business', 'Monthly income minus monthly expenses', 'finance'),
('KPI', 'Key Performance Indicator - metrics that measure business performance', 'Monthly recurring revenue, customer churn rate, conversion rate', 'business')
ON CONFLICT (term) DO NOTHING;