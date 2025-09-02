-- Fix unique constraint and add tool-block relationships
ALTER TABLE tool_block_links ADD CONSTRAINT unique_tool_block_link UNIQUE (tool_id, block_id);

-- Add tool-block relationships for newly added tools
INSERT INTO tool_block_links (tool_id, block_id) VALUES
-- Financial tools
('tool_debt_repay', 'Debt Management'),
('tool_debt_repay', 'Budget Planning'),

-- Marketing tools  
('tool_roas_calc', 'Digital Marketing'),
('tool_roas_calc', 'Marketing Analytics'),
('tool_funnel_dropoff', 'Conversion Optimization'),
('tool_funnel_dropoff', 'Customer Acquisition'),

-- Risk tools
('tool_sensitivity', 'Financial Risk Assessment'),
('tool_sensitivity', 'Scenario Planning'),
('tool_concentration_risk', 'Risk Management'),
('tool_concentration_risk', 'Enterprise Risk Management'),
('tool_portfolio_diversification', 'Risk Management'),
('tool_portfolio_diversification', 'Financial Risk Management'),

-- Personal tools (assuming these are personal/team categories)
('tool_personal_runway', 'Budget Planning'),
('tool_workload_balance', 'Performance Management'),
('tool_workload_balance', 'Wellness Programs'),
('tool_burnout_risk', 'Employee Engagement'),
('tool_burnout_risk', 'Wellness Programs'),

-- Growth tools
('tool_viral_coeff', 'Growth Hacking'),
('tool_viral_coeff', 'Referral Programs'),
('tool_pipeline_velocity', 'Customer Acquisition'),
('tool_pipeline_velocity', 'Performance Management');