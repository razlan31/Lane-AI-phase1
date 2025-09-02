-- Add Marketing and Digital Marketing blocks to complete the 150 block library
INSERT INTO public.blocks (name, category, description, status, tags)
VALUES
-- Marketing (10)
('Brand Awareness', 'Marketing', '% target audience who recognize brand', 'planned', ARRAY['brand','awareness','marketing']::text[]),
('Share of Voice', 'Marketing', 'Visibility vs competitors in media', 'planned', ARRAY['voice','competitors','marketing']::text[]),
('Marketing Spend Efficiency', 'Marketing', 'ROI per $ marketing spend', 'planned', ARRAY['efficiency','spend','marketing']::text[]),
('Campaign ROI', 'Marketing', 'Effectiveness of marketing campaigns', 'planned', ARRAY['campaign','roi','marketing']::text[]),
('Channel Attribution', 'Marketing', 'Contribution of each channel to conversions', 'planned', ARRAY['attribution','channels','marketing']::text[]),
('Event Impact', 'Marketing', 'Leads or revenue from events', 'planned', ARRAY['events','impact','marketing']::text[]),
('PR Coverage', 'Marketing', '# of press mentions / sentiment', 'planned', ARRAY['pr','coverage','marketing']::text[]),
('Community Growth', 'Marketing', 'Expansion of engaged community members', 'planned', ARRAY['community','growth','marketing']::text[]),
('Partnerships ROI', 'Marketing', 'Value from marketing partnerships', 'planned', ARRAY['partnerships','roi','marketing']::text[]),
('Content Volume', 'Marketing', '# blogs, podcasts, videos published', 'planned', ARRAY['content','volume','marketing']::text[]),

-- Digital Marketing (10)
('Website Traffic', 'Digital Marketing', '# sessions / unique visitors', 'planned', ARRAY['traffic','website','digital']::text[]),
('Bounce Rate', 'Digital Marketing', '% visitors leaving without interaction', 'planned', ARRAY['bounce','rate','digital']::text[]),
('Conversion Funnel Drop-off', 'Digital Marketing', '% lost per funnel stage', 'planned', ARRAY['funnel','conversion','digital']::text[]),
('CTR (Click-Through Rate)', 'Digital Marketing', '% clicks from impressions', 'planned', ARRAY['ctr','clicks','digital']::text[]),
('SEO Ranking', 'Digital Marketing', 'Avg. position for key terms', 'planned', ARRAY['seo','ranking','digital']::text[]),
('Domain Authority', 'Digital Marketing', 'SEO trust score', 'planned', ARRAY['domain','authority','digital']::text[]),
('Email Open Rate', 'Digital Marketing', '% of recipients opening emails', 'planned', ARRAY['email','open','digital']::text[]),
('Email CTR', 'Digital Marketing', '% clicking in emails', 'planned', ARRAY['email','ctr','digital']::text[]),
('Paid Ads CPC', 'Digital Marketing', 'Cost per click for paid advertising', 'planned', ARRAY['cpc','ads','digital']::text[]),
('ROAS (Return on Ad Spend)', 'Digital Marketing', 'Revenue return on advertising spend', 'planned', ARRAY['roas','ads','digital']::text[]);

-- Create Playground Sessions table
CREATE TABLE public.playground_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text,
  description text,
  canvas jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for playground_sessions
ALTER TABLE public.playground_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for playground_sessions
CREATE POLICY "Users can create own playground sessions"
ON public.playground_sessions
FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own playground sessions"
ON public.playground_sessions
FOR SELECT
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own playground sessions"
ON public.playground_sessions
FOR UPDATE
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own playground sessions"
ON public.playground_sessions
FOR DELETE
USING (auth.uid()::text = user_id::text);

-- Create trigger for updated_at
CREATE TRIGGER update_playground_sessions_updated_at
BEFORE UPDATE ON public.playground_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create Playground Links table
CREATE TABLE public.playground_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid NOT NULL,
  block_id text,
  kpi_id uuid,
  worksheet_id uuid,
  position jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for playground_links
ALTER TABLE public.playground_links ENABLE ROW LEVEL SECURITY;

-- RLS policies for playground_links (inherit from session ownership)
CREATE POLICY "Users can manage playground links for own sessions"
ON public.playground_links
FOR ALL
USING (auth.uid()::text IN (
  SELECT user_id::text FROM public.playground_sessions WHERE id = playground_links.session_id
));

-- Create Scratchpad Notes table
CREATE TABLE public.scratchpad_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  text text NOT NULL,
  tags text[],
  linked_context jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for scratchpad_notes
ALTER TABLE public.scratchpad_notes ENABLE ROW LEVEL SECURITY;

-- RLS policies for scratchpad_notes
CREATE POLICY "Users can create own scratchpad notes"
ON public.scratchpad_notes
FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own scratchpad notes"
ON public.scratchpad_notes
FOR SELECT
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own scratchpad notes"
ON public.scratchpad_notes
FOR UPDATE
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own scratchpad notes"
ON public.scratchpad_notes
FOR DELETE
USING (auth.uid()::text = user_id::text);

-- Create Tools catalog table (seeded once, readable by all)
CREATE TABLE public.tools (
  id text NOT NULL PRIMARY KEY,
  category text NOT NULL,
  name text NOT NULL,
  description text,
  input_schema jsonb,
  output_schema jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for tools (public read access)
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tools"
ON public.tools
FOR SELECT
USING (true);

-- Create Tool Runs table
CREATE TABLE public.tool_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  tool_id text NOT NULL,
  inputs jsonb,
  outputs jsonb,
  linked_context jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for tool_runs
ALTER TABLE public.tool_runs ENABLE ROW LEVEL SECURITY;

-- RLS policies for tool_runs
CREATE POLICY "Users can create own tool runs"
ON public.tool_runs
FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own tool runs"
ON public.tool_runs
FOR SELECT
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own tool runs"
ON public.tool_runs
FOR UPDATE
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own tool runs"
ON public.tool_runs
FOR DELETE
USING (auth.uid()::text = user_id::text);

-- Seed initial tools catalog
INSERT INTO public.tools (id, category, name, description, input_schema, output_schema)
VALUES
('roi_calculator', 'Finance', 'ROI Calculator', 'Calculate return on investment', 
 '{"initial_investment": "number", "returns": "number"}',
 '{"roi_percent": "number", "profit": "number"}'),
('runway_calculator', 'Finance', 'Runway Calculator', 'Calculate cash runway',
 '{"cash_balance": "number", "monthly_burn": "number"}',
 '{"runway_months": "number", "runway_date": "date"}'),
('breakeven_calculator', 'Finance', 'Break-even Calculator', 'Find break-even point',
 '{"fixed_costs": "number", "variable_cost_per_unit": "number", "price_per_unit": "number"}',
 '{"breakeven_units": "number", "breakeven_revenue": "number"}'),
('cac_calculator', 'Marketing', 'CAC Calculator', 'Customer acquisition cost calculator',
 '{"marketing_spend": "number", "customers_acquired": "number"}',
 '{"cac": "number"}'),
('ltv_calculator', 'Marketing', 'LTV Calculator', 'Lifetime value calculator',
 '{"monthly_revenue": "number", "gross_margin": "number", "churn_rate": "number"}',
 '{"ltv": "number"}'),
('tam_sam_som', 'Strategy', 'TAM/SAM/SOM Estimator', 'Market size estimation',
 '{"total_market": "number", "addressable_percent": "number", "obtainable_percent": "number"}',
 '{"tam": "number", "sam": "number", "som": "number"}'),
('churn_simulator', 'Customers', 'Churn Simulator', 'Model customer churn scenarios',
 '{"customers": "number", "monthly_churn_rate": "number", "months": "number"}',
 '{"remaining_customers": "number", "customers_lost": "number"}'),
('pricing_optimizer', 'Strategy', 'Pricing Optimizer', 'Test different pricing scenarios',
 '{"current_price": "number", "demand_elasticity": "number", "price_change": "number"}',
 '{"new_demand": "number", "revenue_impact": "number"}'),
('funding_calculator', 'Finance', 'Funding Calculator', 'Calculate funding needs',
 '{"monthly_burn": "number", "revenue_growth": "number", "target_runway": "number"}',
 '{"funding_needed": "number", "target_revenue": "number"}'),
('equity_calculator', 'Finance', 'Equity Calculator', 'Calculate equity dilution',
 '{"pre_money_valuation": "number", "investment_amount": "number"}',
 '{"post_money_valuation": "number", "dilution_percent": "number", "investor_ownership": "number"}')