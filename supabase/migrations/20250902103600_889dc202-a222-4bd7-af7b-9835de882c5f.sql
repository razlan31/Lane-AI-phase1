-- Phase 1: Fix Block Categories and Add Dependencies Table

-- Update block categories to match the 9 specified categories
-- Current: business_model, customer, financial, legal, marketing, operations, risk, team, technology  
-- Target: Financial, Marketing, Operations, Risk, Personal, Portfolio, Growth, Team & People, Product & Tech

UPDATE blocks SET category = 'Financial' WHERE category = 'financial';
UPDATE blocks SET category = 'Marketing' WHERE category = 'marketing';
UPDATE blocks SET category = 'Operations' WHERE category = 'operations';
UPDATE blocks SET category = 'Risk & Compliance' WHERE category = 'risk';
UPDATE blocks SET category = 'Team & People' WHERE category = 'team';
UPDATE blocks SET category = 'Product & Tech' WHERE category = 'technology';
UPDATE blocks SET category = 'Portfolio' WHERE category = 'business_model';
UPDATE blocks SET category = 'Growth' WHERE category = 'customer';
UPDATE blocks SET category = 'Personal' WHERE category = 'legal';

-- Create block_dependencies table for relationships
CREATE TABLE IF NOT EXISTS block_dependencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_block_id text NOT NULL,
  dependent_block_id text NOT NULL,
  dependency_type text NOT NULL DEFAULT 'prerequisite', -- prerequisite, enhancement, alternative
  strength integer DEFAULT 1, -- 1-5 strength of relationship
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(parent_block_id, dependent_block_id, dependency_type)
);

-- Enable RLS on block_dependencies
ALTER TABLE block_dependencies ENABLE ROW LEVEL SECURITY;

-- Create policies for block_dependencies (readable by all authenticated users)
CREATE POLICY "Anyone can view block dependencies" 
ON block_dependencies FOR SELECT 
TO authenticated 
USING (true);

-- Add some core block dependencies examples
INSERT INTO block_dependencies (parent_block_id, dependent_block_id, dependency_type, strength) VALUES
-- Financial dependencies
('Revenue Projections', 'Cash Flow Analysis', 'prerequisite', 5),
('Revenue Projections', 'Break-even Analysis', 'prerequisite', 4),
('Budget Planning', 'Cash Flow Analysis', 'prerequisite', 4),
('Financial Risk Assessment', 'Risk Management', 'enhancement', 3),

-- Marketing dependencies  
('Customer Acquisition', 'Customer Retention', 'prerequisite', 4),
('Market Research', 'Go-to-Market Strategy', 'prerequisite', 5),
('Brand Strategy', 'Marketing Analytics', 'enhancement', 3),

-- Operations dependencies
('Process Optimization', 'Performance Management', 'enhancement', 4),
('Quality Control', 'Performance Management', 'enhancement', 3),

-- Growth dependencies
('Product Development', 'Growth Hacking', 'prerequisite', 4),
('Customer Acquisition', 'Growth Hacking', 'prerequisite', 5);

-- Update tools categories to match standard naming
UPDATE tools SET category = 'financial' WHERE category = 'Finance';
UPDATE tools SET category = 'marketing' WHERE category = 'Marketing';
UPDATE tools SET category = 'operations' WHERE category = 'Operations';
UPDATE tools SET category = 'risk' WHERE category = 'Risk';
UPDATE tools SET category = 'personal' WHERE category = 'Personal';
UPDATE tools SET category = 'growth' WHERE category = 'Growth';
UPDATE tools SET category = 'strategy' WHERE category = 'Strategy';