-- Create tool-block links table to map tools to their related blocks
CREATE TABLE public.tool_block_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_id text NOT NULL,
  block_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for tool_block_links (public read since it's reference data)
ALTER TABLE public.tool_block_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tool block links"
ON public.tool_block_links
FOR SELECT
USING (true);

-- Seed tool-block relationships based on the mapping
INSERT INTO public.tool_block_links (tool_id, block_id)
VALUES
-- ROI Calculator links
('roi_calculator', 'marketing_134'),  -- Campaign ROI when in marketing context

-- Runway Calculator links  
('runway_calculator', 'finance_001'),  -- Runway

-- Break-even Calculator links
('breakeven_calculator', 'finance_006'),  -- Break-even Point

-- CAC Calculator links
('cac_calculator', 'customers_021'),   -- CAC
('cac_calculator', 'customers_028'),   -- CLV:CAC Ratio

-- LTV Calculator links
('ltv_calculator', 'customers_022'),   -- LTV  
('ltv_calculator', 'customers_028'),   -- CLV:CAC Ratio

-- TAM/SAM/SOM Estimator links
('tam_sam_som', 'strategy_061'),       -- TAM
('tam_sam_som', 'strategy_062'),       -- SAM
('tam_sam_som', 'strategy_063'),       -- SOM

-- Churn Simulator links
('churn_simulator', 'customers_023'),  -- Churn Rate
('churn_simulator', 'customers_024'),  -- Retention Rate

-- Pricing Optimizer links  
('pricing_optimizer', 'strategy_064'), -- Pricing Model

-- Funding Calculator links
('funding_calculator', 'finance_001'), -- Runway
('funding_calculator', 'finance_012'), -- Funding Raised

-- Equity Calculator links
('equity_calculator', 'finance_013'),  -- Valuation
('equity_calculator', 'finance_014');  -- Cap Table

-- Add block IDs to the existing blocks based on categories
-- This creates consistent block identifiers for the mappings above
-- Note: These would reference the actual block IDs from the seeded data