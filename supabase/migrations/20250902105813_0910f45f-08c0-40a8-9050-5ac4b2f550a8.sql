-- Add sample data for authenticated users
INSERT INTO ventures (user_id, name, description, type, stage, created_at) 
VALUES 
  (auth.uid(), 'My First Venture', 'A sample venture to get you started with Lane AI', 'startup', 'concept', now()),
  (auth.uid(), 'Coffee Shop Demo', 'Local coffee business for testing features', 'local_business', 'planning', now())
ON CONFLICT DO NOTHING;

-- Add sample KPIs for new ventures
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
WHERE v.user_id = auth.uid() 
AND NOT EXISTS (SELECT 1 FROM kpis k WHERE k.venture_id = v.id)
LIMIT 2;

-- Add sample blocks for global use
INSERT INTO blocks (venture_id, name, category, description, status, tags, created_at)
VALUES 
  (NULL, 'Revenue Model Canvas', 'Finance', 'Framework for mapping revenue streams and pricing models', 'published', ARRAY['revenue', 'pricing', 'framework'], now()),
  (NULL, 'Customer Acquisition Funnel', 'Marketing', 'Multi-stage customer acquisition and conversion process', 'published', ARRAY['marketing', 'funnel', 'conversion'], now()),
  (NULL, 'Financial Dashboard', 'Finance', 'Real-time financial metrics and KPI tracking', 'published', ARRAY['finance', 'dashboard', 'kpis'], now()),
  (NULL, 'Risk Assessment Matrix', 'Risk', 'Systematic risk identification and mitigation planning', 'published', ARRAY['risk', 'assessment', 'planning'], now()),
  (NULL, 'Team Structure Plan', 'Team', 'Organizational design and role definition framework', 'published', ARRAY['team', 'organization', 'roles'], now())
ON CONFLICT DO NOTHING;