-- Insert test ventures for development/testing
INSERT INTO ventures (user_id, name, description, type, stage, created_at) VALUES
-- Food truck business
(auth.uid(), 'Gourmet Street Eats', 'Mobile food truck serving artisanal burgers and craft sodas in downtown area', 'local_business', 'operational', now() - interval '6 months'),

-- Dropshipping business  
(auth.uid(), 'TechGadget Hub', 'Dropshipping business specializing in consumer electronics and smart home devices', 'ecommerce', 'growth', now() - interval '4 months'),

-- Website design freelancing
(auth.uid(), 'Digital Craft Studio', 'Freelance web design and development services for small to medium businesses', 'service_business', 'operational', now() - interval '8 months'),

-- App business
(auth.uid(), 'FitTracker Pro', 'Mobile fitness tracking app with social features and personalized workout plans', 'startup', 'mvp', now() - interval '3 months');

-- Insert realistic KPIs for each venture
INSERT INTO kpis (venture_id, name, value, confidence_level, created_at) VALUES
-- Food truck KPIs
((SELECT id FROM ventures WHERE name = 'Gourmet Street Eats' AND user_id = auth.uid()), 'Monthly Revenue', 12500, 'actual', now() - interval '1 day'),
((SELECT id FROM ventures WHERE name = 'Gourmet Street Eats' AND user_id = auth.uid()), 'Daily Customers', 85, 'actual', now() - interval '1 day'),
((SELECT id FROM ventures WHERE name = 'Gourmet Street Eats' AND user_id = auth.uid()), 'Average Order Value', 14.70, 'actual', now() - interval '1 day'),
((SELECT id FROM ventures WHERE name = 'Gourmet Street Eats' AND user_id = auth.uid()), 'Monthly Burn Rate', 8200, 'estimate', now() - interval '1 day'),

-- Dropshipping KPIs
((SELECT id FROM ventures WHERE name = 'TechGadget Hub' AND user_id = auth.uid()), 'Monthly Revenue', 28900, 'actual', now() - interval '1 day'),
((SELECT id FROM ventures WHERE name = 'TechGadget Hub' AND user_id = auth.uid()), 'Conversion Rate', 3.2, 'actual', now() - interval '1 day'),
((SELECT id FROM ventures WHERE name = 'TechGadget Hub' AND user_id = auth.uid()), 'Customer Acquisition Cost', 45, 'estimate', now() - interval '1 day'),
((SELECT id FROM ventures WHERE name = 'TechGadget Hub' AND user_id = auth.uid()), 'Monthly Orders', 420, 'actual', now() - interval '1 day'),

-- Freelancing KPIs
((SELECT id FROM ventures WHERE name = 'Digital Craft Studio' AND user_id = auth.uid()), 'Monthly Revenue', 8500, 'actual', now() - interval '1 day'),
((SELECT id FROM ventures WHERE name = 'Digital Craft Studio' AND user_id = auth.uid()), 'Active Clients', 6, 'actual', now() - interval '1 day'),
((SELECT id FROM ventures WHERE name = 'Digital Craft Studio' AND user_id = auth.uid()), 'Average Project Value', 2800, 'actual', now() - interval '1 day'),
((SELECT id FROM ventures WHERE name = 'Digital Craft Studio' AND user_id = auth.uid()), 'Monthly Expenses', 1200, 'actual', now() - interval '1 day'),

-- App business KPIs
((SELECT id FROM ventures WHERE name = 'FitTracker Pro' AND user_id = auth.uid()), 'Monthly Active Users', 2400, 'actual', now() - interval '1 day'),
((SELECT id FROM ventures WHERE name = 'FitTracker Pro' AND user_id = auth.uid()), 'Monthly Recurring Revenue', 1850, 'actual', now() - interval '1 day'),
((SELECT id FROM ventures WHERE name = 'FitTracker Pro' AND user_id = auth.uid()), 'User Retention Rate', 68, 'estimate', now() - interval '1 day'),
((SELECT id FROM ventures WHERE name = 'FitTracker Pro' AND user_id = auth.uid()), 'Development Costs', 15000, 'actual', now() - interval '1 day');