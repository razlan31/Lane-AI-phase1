-- Migrate existing tools to new ID convention and add missing tools
-- 1) Update existing tool IDs
UPDATE tools SET id = 'tool_roi_calc' WHERE id = 'roi_calculator';
UPDATE tool_block_links SET tool_id = 'tool_roi_calc' WHERE tool_id = 'roi_calculator';

UPDATE tools SET id = 'tool_runway_calc' WHERE id = 'runway_calculator';
UPDATE tool_block_links SET tool_id = 'tool_runway_calc' WHERE tool_id = 'runway_calculator';

UPDATE tools SET id = 'tool_breakeven_calc' WHERE id = 'breakeven_calculator';
UPDATE tool_block_links SET tool_id = 'tool_breakeven_calc' WHERE tool_id = 'breakeven_calculator';

UPDATE tools SET id = 'tool_cashflow_proj' WHERE id = 'cash_flow_projector';
UPDATE tool_block_links SET tool_id = 'tool_cashflow_proj' WHERE tool_id = 'cash_flow_projector';

UPDATE tools SET id = 'tool_valuation_est' WHERE id = 'valuation_calculator';
UPDATE tool_block_links SET tool_id = 'tool_valuation_est' WHERE tool_id = 'valuation_calculator';

UPDATE tools SET id = 'tool_cac_calc' WHERE id = 'cac_calculator';
UPDATE tool_block_links SET tool_id = 'tool_cac_calc' WHERE tool_id = 'cac_calculator';

UPDATE tools SET id = 'tool_ltv_calc' WHERE id = 'ltv_calculator';
UPDATE tool_block_links SET tool_id = 'tool_ltv_calc' WHERE tool_id = 'ltv_calculator';

-- 2) Insert missing tools (if not exist)
INSERT INTO tools (id, name, description, category, input_schema, output_schema)
VALUES
  ('tool_debt_repay', 'Debt Repayment Planner', 'Compute loan amortization and payments', 'financial',
    '{"type":"object","properties":{"principal":{"type":"number"},"annual_rate":{"type":"number"},"term_months":{"type":"number"}},"required":["principal","annual_rate","term_months"]}',
    '{"type":"object","properties":{"monthly_payment":{"type":"number"},"total_interest":{"type":"number"}}}'),
  ('tool_roas_calc', 'ROAS Calculator', 'Return on Ad Spend', 'marketing',
    '{"type":"object","properties":{"ad_spend":{"type":"number"},"revenue_generated":{"type":"number"}},"required":["ad_spend","revenue_generated"]}',
    '{"type":"object","properties":{"roas":{"type":"number"}}}'),
  ('tool_funnel_dropoff', 'Funnel Drop-off Analyzer', 'Analyze stage-to-stage losses', 'marketing',
    '{"type":"object","properties":{"stages":{"type":"array"}},"required":["stages"]}',
    '{"type":"object","properties":{"dropoff_rates":{"type":"array"},"conversion_rate":{"type":"number"}}}'),
  ('tool_sensitivity', 'Sensitivity Analyzer', 'Compute value range under variation', 'risk',
    '{"type":"object","properties":{"base_value":{"type":"number"},"variation_percent":{"type":"number"}},"required":["base_value","variation_percent"]}',
    '{"type":"object","properties":{"range":{"type":"array"}}}'),
  ('tool_concentration_risk', 'Concentration Risk', 'Herfindahl index of concentration', 'risk',
    '{"type":"object","properties":{"values":{"type":"array"}},"required":["values"]}',
    '{"type":"object","properties":{"concentration_index":{"type":"number"}}}'),
  ('tool_portfolio_diversification', 'Portfolio Diversification', 'Diversity score from variance', 'risk',
    '{"type":"object","properties":{"venture_revenues":{"type":"array"}},"required":["venture_revenues"]}',
    '{"type":"object","properties":{"diversification_score":{"type":"number"}}}'),
  ('tool_personal_runway', 'Personal Runway', 'Months you can sustain', 'personal',
    '{"type":"object","properties":{"savings":{"type":"number"},"monthly_expenses":{"type":"number"}},"required":["savings","monthly_expenses"]}',
    '{"type":"object","properties":{"months_runway":{"type":"number"}}}'),
  ('tool_workload_balance', 'Workload Balance', 'Work vs personal time balance', 'personal',
    '{"type":"object","properties":{"work_hours":{"type":"number"},"personal_hours":{"type":"number"}},"required":["work_hours","personal_hours"]}',
    '{"type":"object","properties":{"balance_score":{"type":"number"}}}'),
  ('tool_burnout_risk', 'Burnout Risk', 'Estimate burnout likelihood', 'personal',
    '{"type":"object","properties":{"work_hours":{"type":"number"},"stress_level":{"type":"number"}},"required":["work_hours","stress_level"]}',
    '{"type":"object","properties":{"burnout_risk_percent":{"type":"number"}}}'),
  ('tool_viral_coeff', 'Viral Coefficient', 'Invites * conversion', 'growth',
    '{"type":"object","properties":{"invitations_sent":{"type":"number"},"conversion_rate":{"type":"number"}},"required":["invitations_sent","conversion_rate"]}',
    '{"type":"object","properties":{"viral_coefficient":{"type":"number"}}}'),
  ('tool_pipeline_velocity', 'Pipeline Velocity', 'Opportunity value flow per day', 'growth',
    '{"type":"object","properties":{"opportunities":{"type":"number"},"deal_size":{"type":"number"},"win_rate":{"type":"number"},"sales_cycle_days":{"type":"number"}},"required":["opportunities","deal_size","win_rate","sales_cycle_days"]}',
    '{"type":"object","properties":{"pipeline_velocity":{"type":"number"}}}')
ON CONFLICT (id) DO NOTHING;

-- 3) Optionally update input_schema for re-IDed tools to keep compatibility
-- (skipped: we keep existing schemas for those tools to avoid breaking forms)
