-- Fix sample data insertion with proper user context
-- This will work when a user is authenticated and inserting their own data

-- Create a function to generate sample data for new users
CREATE OR REPLACE FUNCTION public.create_sample_data_for_user(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert sample ventures for this user
  INSERT INTO ventures (user_id, name, description, type, stage, created_at) 
  VALUES 
    (user_id, 'My First Venture', 'A sample venture to get you started with Lane AI', 'startup', 'concept', now()),
    (user_id, 'Coffee Shop Demo', 'Local coffee business for testing features', 'local_business', 'planning', now())
  ON CONFLICT DO NOTHING;

  -- Insert sample KPIs for the new ventures
  INSERT INTO kpis (venture_id, name, value, confidence_level, created_at)
  SELECT 
    v.id,
    CASE 
      WHEN v.name LIKE '%Coffee%' THEN 'Monthly Revenue'
      ELSE 'User Acquisition Rate'
    END,
    CASE 
      WHEN v.name LIKE '%Coffee%' THEN 8500
      ELSE 150
    END,
    'estimate',
    now()
  FROM ventures v 
  WHERE v.user_id = user_id 
  AND NOT EXISTS (SELECT 1 FROM kpis k WHERE k.venture_id = v.id)
  LIMIT 2;

  -- Insert sample scratchpad notes
  INSERT INTO scratchpad_notes (user_id, text, tags, created_at) 
  VALUES 
    (user_id, 'Need to calculate CAC for the coffee shop - thinking about loyalty program impact on customer retention. Should run ROI analysis on different marketing channels.', ARRAY['cac', 'roi', 'marketing'], now()),
    (user_id, 'SaaS pricing model needs work. Considering freemium vs tiered pricing. Need to model different scenarios and their impact on revenue projections.', ARRAY['pricing', 'revenue', 'saas'], now()),
    (user_id, 'E-commerce unit economics looking tight. Shipping costs are higher than expected. Need to explore partnerships or volume discounts.', ARRAY['unit-economics', 'shipping', 'costs'], now())
  ON CONFLICT DO NOTHING;
END;
$$;