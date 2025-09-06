-- Create 4 complete test ventures with realistic KPIs
-- Food truck business
WITH food_truck AS (
  INSERT INTO ventures (user_id, name, description, type, stage, created_at) 
  VALUES (auth.uid(), 'Gourmet Street Eats', 'Mobile food truck serving artisanal burgers and craft sodas in downtown area', 'local_business', 'operational', now() - interval '6 months')
  RETURNING id, name
),
-- Dropshipping business  
dropship AS (
  INSERT INTO ventures (user_id, name, description, type, stage, created_at) 
  VALUES (auth.uid(), 'TechGadget Hub', 'Dropshipping business specializing in consumer electronics and smart home devices', 'ecommerce', 'growth', now() - interval '4 months')
  RETURNING id, name
),
-- Website design freelancing
freelance AS (
  INSERT INTO ventures (user_id, name, description, type, stage, created_at) 
  VALUES (auth.uid(), 'Digital Craft Studio', 'Freelance web design and development services for small to medium businesses', 'service_business', 'operational', now() - interval '8 months')
  RETURNING id, name
),
-- App business
app_biz AS (
  INSERT INTO ventures (user_id, name, description, type, stage, created_at) 
  VALUES (auth.uid(), 'FitTracker Pro', 'Mobile fitness tracking app with social features and personalized workout plans', 'startup', 'mvp', now() - interval '3 months')
  RETURNING id, name
)
-- Insert KPIs for all ventures
INSERT INTO kpis (venture_id, name, value, confidence_level, created_at) 
SELECT id, kpi_name, kpi_value, 'actual', now() - interval '1 day'
FROM (
  -- Food truck KPIs
  SELECT id, 'Monthly Revenue' as kpi_name, 12500 as kpi_value FROM food_truck
  UNION ALL SELECT id, 'Daily Customers', 85 FROM food_truck
  UNION ALL SELECT id, 'Average Order Value', 14.7 FROM food_truck
  UNION ALL SELECT id, 'Monthly Burn Rate', 8200 FROM food_truck
  
  UNION ALL
  
  -- Dropshipping KPIs
  SELECT id, 'Monthly Revenue', 28900 FROM dropship
  UNION ALL SELECT id, 'Conversion Rate', 3.2 FROM dropship
  UNION ALL SELECT id, 'Customer Acquisition Cost', 45 FROM dropship
  UNION ALL SELECT id, 'Monthly Orders', 420 FROM dropship
  
  UNION ALL
  
  -- Freelancing KPIs
  SELECT id, 'Monthly Revenue', 8500 FROM freelance
  UNION ALL SELECT id, 'Active Clients', 6 FROM freelance
  UNION ALL SELECT id, 'Average Project Value', 2800 FROM freelance
  UNION ALL SELECT id, 'Monthly Expenses', 1200 FROM freelance
  
  UNION ALL
  
  -- App business KPIs
  SELECT id, 'Monthly Active Users', 2400 FROM app_biz
  UNION ALL SELECT id, 'Monthly Recurring Revenue', 1850 FROM app_biz
  UNION ALL SELECT id, 'User Retention Rate', 68 FROM app_biz
  UNION ALL SELECT id, 'Development Costs', 15000 FROM app_biz
) kpi_data;