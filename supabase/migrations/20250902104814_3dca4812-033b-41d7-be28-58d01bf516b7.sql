-- Add sample scratchpad notes for authenticated users
INSERT INTO scratchpad_notes (user_id, text, tags, created_at) 
VALUES 
  (auth.uid(), 'Need to calculate CAC for the coffee shop - thinking about loyalty program impact on customer retention. Should run ROI analysis on different marketing channels.', ARRAY['cac', 'roi', 'marketing'], now()),
  (auth.uid(), 'SaaS pricing model needs work. Considering freemium vs tiered pricing. Need to model different scenarios and their impact on revenue projections.', ARRAY['pricing', 'revenue', 'saas'], now()),
  (auth.uid(), 'E-commerce unit economics looking tight. Shipping costs are higher than expected. Need to explore partnerships or volume discounts.', ARRAY['unit-economics', 'shipping', 'costs'], now())
ON CONFLICT DO NOTHING;