-- Create sample ventures for demonstration
WITH demo_user AS (
  SELECT auth.uid() as user_id
)
INSERT INTO ventures (id, user_id, name, description, type, stage, created_at, updated_at) 
SELECT 
  gen_random_uuid(), 
  demo_user.user_id,
  venture_name,
  venture_desc,
  venture_type,
  venture_stage,
  now(), 
  now()
FROM demo_user,
VALUES 
  ('Coffee Shop Pro', 'Premium coffee shop with artisanal focus', 'local_business', 'launch'),
  ('SaaS Analytics Platform', 'B2B analytics platform for small businesses', 'tech_startup', 'growth'),
  ('E-commerce Fashion', 'Online fashion retailer targeting millennials', 'ecommerce', 'validation')
AS v(venture_name, venture_desc, venture_type, venture_stage);

-- Create sample KPIs for the demo ventures
WITH user_ventures AS (
  SELECT id, name, auth.uid() as user_id FROM ventures WHERE user_id = auth.uid()
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
FROM user_ventures;

-- Create sample scratchpad notes
INSERT INTO scratchpad_notes (user_id, text, tags, linked_context, created_at) 
SELECT 
  auth.uid(),
  note_text,
  note_tags,
  note_context::jsonb,
  now()
FROM VALUES 
  ('Need to calculate CAC for the coffee shop - thinking about loyalty program impact on customer retention. Should run ROI analysis on different marketing channels.', 
   ARRAY['cac', 'roi', 'marketing'], 
   '{"type": "venture", "id": "coffee-shop"}'),
  ('SaaS pricing model needs work. Considering freemium vs tiered pricing. Need to model different scenarios and their impact on revenue projections.', 
   ARRAY['pricing', 'revenue', 'saas'], 
   '{"type": "venture", "id": "saas-platform"}'),
  ('E-commerce unit economics looking tight. Shipping costs are higher than expected. Need to explore partnerships or volume discounts.', 
   ARRAY['unit-economics', 'shipping', 'costs'], 
   '{"type": "venture", "id": "ecommerce"}')
AS notes(note_text, note_tags, note_context);