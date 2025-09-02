-- Create sample ventures for demonstration (simplified approach)
-- Note: These will only be visible to the user who creates them due to RLS policies

-- Insert sample ventures
INSERT INTO ventures (user_id, name, description, type, stage) VALUES
(auth.uid(), 'Coffee Shop Pro', 'Premium coffee shop with artisanal focus', 'local_business', 'launch'),
(auth.uid(), 'SaaS Analytics Platform', 'B2B analytics platform for small businesses', 'tech_startup', 'growth'),
(auth.uid(), 'E-commerce Fashion', 'Online fashion retailer targeting millennials', 'ecommerce', 'validation');

-- Insert sample scratchpad notes
INSERT INTO scratchpad_notes (user_id, text, tags, linked_context) VALUES
(auth.uid(), 'Need to calculate CAC for the coffee shop - thinking about loyalty program impact on customer retention. Should run ROI analysis on different marketing channels.', ARRAY['cac', 'roi', 'marketing'], '{"type": "venture", "name": "coffee-shop"}'),
(auth.uid(), 'SaaS pricing model needs work. Considering freemium vs tiered pricing. Need to model different scenarios and their impact on revenue projections.', ARRAY['pricing', 'revenue', 'saas'], '{"type": "venture", "name": "saas-platform"}'),
(auth.uid(), 'E-commerce unit economics looking tight. Shipping costs are higher than expected. Need to explore partnerships or volume discounts.', ARRAY['unit-economics', 'shipping', 'costs'], '{"type": "venture", "name": "ecommerce"}');