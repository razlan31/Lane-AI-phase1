-- Create sample ventures for demonstration
INSERT INTO ventures (id, user_id, name, description, type, stage, created_at, updated_at) VALUES
(gen_random_uuid(), 'demo-user', 'Coffee Shop Pro', 'Premium coffee shop with artisanal focus', 'local_business', 'launch', now(), now()),
(gen_random_uuid(), 'demo-user', 'SaaS Analytics Platform', 'B2B analytics platform for small businesses', 'tech_startup', 'growth', now(), now()),
(gen_random_uuid(), 'demo-user', 'E-commerce Fashion', 'Online fashion retailer targeting millennials', 'ecommerce', 'validation', now(), now());

-- Create sample KPIs for the demo ventures
WITH venture_data AS (
  SELECT id, name FROM ventures WHERE user_id = 'demo-user'
)
INSERT INTO kpis (venture_id, name, value, confidence_level, confidence, created_at, updated_at)
SELECT 
  id,
  CASE 
    WHEN name = 'Coffee Shop Pro' THEN 'Monthly Revenue'
    WHEN name = 'SaaS Analytics Platform' THEN 'MRR'
    WHEN name = 'E-commerce Fashion' THEN 'Conversion Rate'
  END,
  CASE 
    WHEN name = 'Coffee Shop Pro' THEN 12500
    WHEN name = 'SaaS Analytics Platform' THEN 8900
    WHEN name = 'E-commerce Fashion' THEN 2.4
  END,
  'estimated',
  CASE 
    WHEN name = 'Coffee Shop Pro' THEN 'Based on local market research'
    WHEN name = 'SaaS Analytics Platform' THEN 'Beta customer feedback'
    WHEN name = 'E-commerce Fashion' THEN 'Industry benchmark'
  END,
  now(),
  now()
FROM venture_data;

-- Add more KPIs for each venture
WITH venture_data AS (
  SELECT id, name FROM ventures WHERE user_id = 'demo-user'
)
INSERT INTO kpis (venture_id, name, value, confidence_level, confidence, created_at, updated_at)
SELECT 
  id,
  CASE 
    WHEN name = 'Coffee Shop Pro' THEN 'Customer Acquisition Cost'
    WHEN name = 'SaaS Analytics Platform' THEN 'Churn Rate'
    WHEN name = 'E-commerce Fashion' THEN 'Average Order Value'
  END,
  CASE 
    WHEN name = 'Coffee Shop Pro' THEN 15
    WHEN name = 'SaaS Analytics Platform' THEN 5.2
    WHEN name = 'E-commerce Fashion' THEN 85
  END,
  'mock',
  CASE 
    WHEN name = 'Coffee Shop Pro' THEN 'Marketing campaign analysis'
    WHEN name = 'SaaS Analytics Platform' THEN 'Beta period tracking'
    WHEN name = 'E-commerce Fashion' THEN 'Website analytics'
  END,
  now(),
  now()
FROM venture_data;

-- Create sample worksheets for demonstration
WITH venture_data AS (
  SELECT id, name FROM ventures WHERE user_id = 'demo-user'
)
INSERT INTO worksheets (venture_id, user_id, type, inputs, outputs, confidence_level, is_template, created_at)
SELECT 
  id,
  'demo-user',
  CASE 
    WHEN name = 'Coffee Shop Pro' THEN 'financial_model'
    WHEN name = 'SaaS Analytics Platform' THEN 'revenue_projection'
    WHEN name = 'E-commerce Fashion' THEN 'unit_economics'
  END,
  CASE 
    WHEN name = 'Coffee Shop Pro' THEN '{"initial_investment": 50000, "monthly_rent": 3500, "staff_cost": 8000}'::jsonb
    WHEN name = 'SaaS Analytics Platform' THEN '{"pricing_tier": 99, "target_customers": 500, "churn_rate": 5}'::jsonb
    WHEN name = 'E-commerce Fashion' THEN '{"product_cost": 25, "shipping_cost": 8, "marketing_cost": 15}'::jsonb
  END,
  CASE 
    WHEN name = 'Coffee Shop Pro' THEN '{"breakeven_months": 18, "monthly_profit": 4200, "roi": 0.168}'::jsonb
    WHEN name = 'SaaS Analytics Platform' THEN '{"arr": 594000, "monthly_growth": 15, "ltv": 1890}'::jsonb
    WHEN name = 'E-commerce Fashion' THEN '{"gross_margin": 0.62, "contribution_margin": 0.47, "payback_period": 3.2}'::jsonb
  END,
  'estimated',
  false,
  now()
FROM venture_data;

-- Create sample blocks for specific ventures
WITH venture_data AS (
  SELECT id, name FROM ventures WHERE user_id = 'demo-user'
)
INSERT INTO blocks (venture_id, name, description, category, status, tags, created_at, updated_at)
SELECT 
  id,
  CASE 
    WHEN name = 'Coffee Shop Pro' THEN 'Location Strategy'
    WHEN name = 'SaaS Analytics Platform' THEN 'Product Roadmap'
    WHEN name = 'E-commerce Fashion' THEN 'Supply Chain'
  END,
  CASE 
    WHEN name = 'Coffee Shop Pro' THEN 'High-traffic location analysis and lease negotiation'
    WHEN name = 'SaaS Analytics Platform' THEN 'Feature prioritization and development timeline'
    WHEN name = 'E-commerce Fashion' THEN 'Supplier relationships and inventory management'
  END,
  CASE 
    WHEN name = 'Coffee Shop Pro' THEN 'Market'
    WHEN name = 'SaaS Analytics Platform' THEN 'Product'
    WHEN name = 'E-commerce Fashion' THEN 'Operations'
  END,
  'in-progress',
  CASE 
    WHEN name = 'Coffee Shop Pro' THEN ARRAY['location', 'real-estate', 'market-research']
    WHEN name = 'SaaS Analytics Platform' THEN ARRAY['development', 'features', 'roadmap']
    WHEN name = 'E-commerce Fashion' THEN ARRAY['suppliers', 'inventory', 'logistics']
  END,
  now(),
  now()
FROM venture_data;

-- Create sample scratchpad notes
INSERT INTO scratchpad_notes (user_id, text, tags, linked_context, created_at) VALUES
('demo-user', 'Need to calculate CAC for the coffee shop - thinking about loyalty program impact on customer retention. Should run ROI analysis on different marketing channels.', ARRAY['cac', 'roi', 'marketing'], '{"type": "venture", "id": "coffee-shop"}'::jsonb, now()),
('demo-user', 'SaaS pricing model needs work. Considering freemium vs tiered pricing. Need to model different scenarios and their impact on revenue projections.', ARRAY['pricing', 'revenue', 'saas'], '{"type": "venture", "id": "saas-platform"}'::jsonb, now()),
('demo-user', 'E-commerce unit economics looking tight. Shipping costs are higher than expected. Need to explore partnerships or volume discounts.', ARRAY['unit-economics', 'shipping', 'costs'], '{"type": "venture", "id": "ecommerce"}'::jsonb, now());

-- Create sample tool runs to demonstrate flow
INSERT INTO tool_runs (user_id, tool_id, inputs, outputs, linked_context, created_at) VALUES
('demo-user', 'roi_calculator', '{"investment": 5000, "revenue": 1200, "period": 12}'::jsonb, '{"roi": 1.88, "payback_period": 4.2, "net_profit": 9400}'::jsonb, '{"type": "venture", "venture_id": "coffee-shop"}'::jsonb, now()),
('demo-user', 'market_sizer', '{"market_type": "local", "population": 50000, "penetration": 0.03}'::jsonb, '{"tam": 1500, "sam": 450, "som": 135}'::jsonb, '{"type": "venture", "venture_id": "coffee-shop"}'::jsonb, now()),
('demo-user', 'pricing_optimizer', '{"cost_per_unit": 25, "target_margin": 0.6, "market_price": 85}'::jsonb, '{"optimal_price": 62.5, "margin": 0.6, "competitive_position": "below"}'::jsonb, '{"type": "venture", "venture_id": "ecommerce"}'::jsonb, now());

-- Create sample manual logs for AI audit trail
INSERT INTO manual_logs (user_id, venture_id, type, content, created_at) VALUES
('demo-user', (SELECT id FROM ventures WHERE name = 'Coffee Shop Pro' LIMIT 1), 'ai_suggestion', 'Suggested ROI Calculator tool based on scratchpad mention of "CAC calculation"', now()),
('demo-user', (SELECT id FROM ventures WHERE name = 'SaaS Analytics Platform' LIMIT 1), 'ai_suggestion', 'Recommended Revenue Projection block after pricing tool usage', now()),
('demo-user', (SELECT id FROM ventures WHERE name = 'E-commerce Fashion' LIMIT 1), 'ai_suggestion', 'Suggested Unit Economics worksheet generation from shipping cost analysis', now()),
('demo-user', (SELECT id FROM ventures WHERE name = 'Coffee Shop Pro' LIMIT 1), 'tool_suggestion_accepted', 'User accepted ROI Calculator suggestion, opened tool', now()),
('demo-user', (SELECT id FROM ventures WHERE name = 'SaaS Analytics Platform' LIMIT 1), 'block_suggestion_dismissed', 'User dismissed Revenue Projection block suggestion', now());