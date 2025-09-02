-- Create manual_logs table for AI Copilot audit trail
CREATE TABLE public.manual_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  venture_id uuid,
  context text NOT NULL,
  action text NOT NULL,
  suggestion_text text,
  reasoning text,
  confidence numeric,
  source_ids jsonb,
  accepted boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  type text
);

-- Enable RLS for manual_logs
ALTER TABLE public.manual_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create logs for their ventures"
ON public.manual_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view logs for their ventures"
ON public.manual_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own logs"
ON public.manual_logs
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own logs"
ON public.manual_logs
FOR DELETE
USING (auth.uid() = user_id);

-- Clear existing blocks and seed the correct 150-block taxonomy
DELETE FROM public.blocks;

-- Insert the 150 blocks according to the specified taxonomy
INSERT INTO public.blocks (id, name, description, category, status) VALUES
-- Finance (15 blocks)
('finance_001', 'Runway', 'How long current cash will last', 'Finance', 'planned'),
('finance_002', 'Burn Rate', 'Monthly cash spend rate', 'Finance', 'planned'),
('finance_003', 'Cash Flow', 'Money in vs money out', 'Finance', 'planned'),
('finance_004', 'Revenue', 'Total income streams', 'Finance', 'planned'),
('finance_005', 'Gross Margin', 'Revenue minus direct costs', 'Finance', 'planned'),
('finance_006', 'Break-even Point', 'When revenue equals costs', 'Finance', 'planned'),
('finance_007', 'Unit Economics', 'Profit per customer/unit', 'Finance', 'planned'),
('finance_008', 'Working Capital', 'Short-term liquidity position', 'Finance', 'planned'),
('finance_009', 'Accounts Receivable', 'Money owed to company', 'Finance', 'planned'),
('finance_010', 'Accounts Payable', 'Money company owes', 'Finance', 'planned'),
('finance_011', 'EBITDA', 'Earnings before interest, taxes, depreciation', 'Finance', 'planned'),
('finance_012', 'Funding Raised', 'Total capital raised to date', 'Finance', 'planned'),
('finance_013', 'Valuation', 'Company worth/market value', 'Finance', 'planned'),
('finance_014', 'Cap Table', 'Ownership structure breakdown', 'Finance', 'planned'),
('finance_015', 'Debt Service', 'Loan payments and obligations', 'Finance', 'planned'),

-- Customers (15 blocks)
('customers_016', 'Total Customers', 'Current customer count', 'Customers', 'planned'),
('customers_017', 'Active Users', 'Regularly engaging customers', 'Customers', 'planned'),
('customers_018', 'New Customers', 'Recent customer acquisitions', 'Customers', 'planned'),
('customers_019', 'Customer Growth Rate', 'Rate of customer base expansion', 'Customers', 'planned'),
('customers_020', 'Customer Segments', 'Different customer types/groups', 'Customers', 'planned'),
('customers_021', 'CAC', 'Customer Acquisition Cost', 'Customers', 'planned'),
('customers_022', 'LTV', 'Customer Lifetime Value', 'Customers', 'planned'),
('customers_023', 'Churn Rate', 'Rate customers stop using product', 'Customers', 'planned'),
('customers_024', 'Retention Rate', 'Rate customers continue using', 'Customers', 'planned'),
('customers_025', 'Net Promoter Score', 'Customer satisfaction metric', 'Customers', 'planned'),
('customers_026', 'Customer Support', 'Support volume and quality', 'Customers', 'planned'),
('customers_027', 'Average Order Value', 'Mean transaction size', 'Customers', 'planned'),
('customers_028', 'CLV:CAC Ratio', 'Lifetime value vs acquisition cost', 'Customers', 'planned'),
('customers_029', 'Repeat Purchase Rate', 'Customers who buy again', 'Customers', 'planned'),
('customers_030', 'Customer Feedback', 'Reviews, surveys, complaints', 'Customers', 'planned'),

-- Team & People (15 blocks)
('team_031', 'Team Size', 'Total number of employees', 'Team & People', 'planned'),
('team_032', 'Hiring Plan', 'Future recruitment strategy', 'Team & People', 'planned'),
('team_033', 'Employee Retention', 'Staff turnover rates', 'Team & People', 'planned'),
('team_034', 'Compensation', 'Salary and benefits structure', 'Team & People', 'planned'),
('team_035', 'Performance Reviews', 'Employee evaluation process', 'Team & People', 'planned'),
('team_036', 'Training & Development', 'Skill building programs', 'Team & People', 'planned'),
('team_037', 'Culture & Values', 'Company culture initiatives', 'Team & People', 'planned'),
('team_038', 'Org Chart', 'Company structure and hierarchy', 'Team & People', 'planned'),
('team_039', 'Remote Work', 'Distributed team policies', 'Team & People', 'planned'),
('team_040', 'Employee Satisfaction', 'Team happiness metrics', 'Team & People', 'planned'),
('team_041', 'Recruiting Pipeline', 'Candidate sourcing and hiring', 'Team & People', 'planned'),
('team_042', 'Equity Distribution', 'Employee stock options', 'Team & People', 'planned'),
('team_043', 'Onboarding', 'New employee integration', 'Team & People', 'planned'),
('team_044', 'Leadership Team', 'Key executive roles', 'Team & People', 'planned'),
('team_045', 'Contractor Management', 'External talent coordination', 'Team & People', 'planned'),

-- Operations (15 blocks)
('operations_046', 'Supply Chain', 'Vendor and supplier management', 'Operations', 'planned'),
('operations_047', 'Inventory', 'Stock levels and management', 'Operations', 'planned'),
('operations_048', 'Production', 'Manufacturing or service delivery', 'Operations', 'planned'),
('operations_049', 'Quality Control', 'Product/service quality assurance', 'Operations', 'planned'),
('operations_050', 'Logistics', 'Distribution and fulfillment', 'Operations', 'planned'),
('operations_051', 'Technology Stack', 'Systems and infrastructure', 'Operations', 'planned'),
('operations_052', 'Data Management', 'Information systems and analytics', 'Operations', 'planned'),
('operations_053', 'Security', 'Data and operational security', 'Operations', 'planned'),
('operations_054', 'Automation', 'Process optimization tools', 'Operations', 'planned'),
('operations_055', 'Vendor Management', 'Third-party relationships', 'Operations', 'planned'),
('operations_056', 'Process Documentation', 'Standard operating procedures', 'Operations', 'planned'),
('operations_057', 'Capacity Planning', 'Resource allocation strategy', 'Operations', 'planned'),
('operations_058', 'Cost Optimization', 'Efficiency improvements', 'Operations', 'planned'),
('operations_059', 'Business Continuity', 'Risk mitigation planning', 'Operations', 'planned'),
('operations_060', 'Performance Metrics', 'Operational KPI tracking', 'Operations', 'planned'),

-- Strategy & Market (15 blocks)
('strategy_061', 'TAM', 'Total Addressable Market size', 'Strategy & Market', 'planned'),
('strategy_062', 'SAM', 'Serviceable Addressable Market', 'Strategy & Market', 'planned'),
('strategy_063', 'SOM', 'Serviceable Obtainable Market', 'Strategy & Market', 'planned'),
('strategy_064', 'Pricing Model', 'Revenue and pricing strategy', 'Strategy & Market', 'planned'),
('strategy_065', 'Competitive Analysis', 'Market competition assessment', 'Strategy & Market', 'planned'),
('strategy_066', 'Market Position', 'Competitive positioning', 'Strategy & Market', 'planned'),
('strategy_067', 'Go-to-Market', 'Market entry strategy', 'Strategy & Market', 'planned'),
('strategy_068', 'Business Model', 'Value creation and capture', 'Strategy & Market', 'planned'),
('strategy_069', 'SWOT Analysis', 'Strengths, weaknesses, opportunities, threats', 'Strategy & Market', 'planned'),
('strategy_070', 'Market Research', 'Customer and market insights', 'Strategy & Market', 'planned'),
('strategy_071', 'Strategic Partnerships', 'Key alliance relationships', 'Strategy & Market', 'planned'),
('strategy_072', 'Geographic Expansion', 'Market territory strategy', 'Strategy & Market', 'planned'),
('strategy_073', 'Product Roadmap', 'Future development plans', 'Strategy & Market', 'planned'),
('strategy_074', 'Market Trends', 'Industry direction analysis', 'Strategy & Market', 'planned'),
('strategy_075', 'Competitive Advantage', 'Unique value propositions', 'Strategy & Market', 'planned'),

-- Growth (15 blocks)
('growth_076', 'Growth Rate', 'Business expansion velocity', 'Growth', 'planned'),
('growth_077', 'Scaling Strategy', 'Growth execution plan', 'Growth', 'planned'),
('growth_078', 'Market Penetration', 'Market share growth', 'Growth', 'planned'),
('growth_079', 'Product Development', 'Innovation and expansion', 'Growth', 'planned'),
('growth_080', 'Channel Strategy', 'Distribution channel growth', 'Growth', 'planned'),
('growth_081', 'International Expansion', 'Global market entry', 'Growth', 'planned'),
('growth_082', 'User Acquisition', 'Customer growth tactics', 'Growth', 'planned'),
('growth_083', 'Viral Coefficient', 'Organic growth multiplier', 'Growth', 'planned'),
('growth_084', 'Referral Program', 'Customer-driven growth', 'Growth', 'planned'),
('growth_085', 'Partnership Growth', 'Strategic alliance expansion', 'Growth', 'planned'),
('growth_086', 'Content Marketing', 'Growth through content', 'Growth', 'planned'),
('growth_087', 'SEO Strategy', 'Organic search growth', 'Growth', 'planned'),
('growth_088', 'Social Media Growth', 'Platform-based expansion', 'Growth', 'planned'),
('growth_089', 'Growth Hacking', 'Experimental growth tactics', 'Growth', 'planned'),
('growth_090', 'Community Building', 'User community development', 'Growth', 'planned'),

-- Risk & Compliance (15 blocks)
('risk_091', 'Financial Risk', 'Money-related risk exposure', 'Risk & Compliance', 'planned'),
('risk_092', 'Market Risk', 'Market volatility impact', 'Risk & Compliance', 'planned'),
('risk_093', 'Operational Risk', 'Process and system failures', 'Risk & Compliance', 'planned'),
('risk_094', 'Regulatory Compliance', 'Legal and regulatory adherence', 'Risk & Compliance', 'planned'),
('risk_095', 'Data Privacy', 'Information protection compliance', 'Risk & Compliance', 'planned'),
('risk_096', 'Cybersecurity', 'Digital security measures', 'Risk & Compliance', 'planned'),
('risk_097', 'Insurance Coverage', 'Risk transfer mechanisms', 'Risk & Compliance', 'planned'),
('risk_098', 'Business Continuity', 'Disruption recovery planning', 'Risk & Compliance', 'planned'),
('risk_099', 'Legal Issues', 'Litigation and legal compliance', 'Risk & Compliance', 'planned'),
('risk_100', 'Reputation Risk', 'Brand and reputation protection', 'Risk & Compliance', 'planned'),
('risk_101', 'Key Person Risk', 'Dependency on individuals', 'Risk & Compliance', 'planned'),
('risk_102', 'Technology Risk', 'Tech failure and obsolescence', 'Risk & Compliance', 'planned'),
('risk_103', 'Fraud Prevention', 'Financial crime protection', 'Risk & Compliance', 'planned'),
('risk_104', 'Crisis Management', 'Emergency response planning', 'Risk & Compliance', 'planned'),
('risk_105', 'Audit Trail', 'Compliance documentation', 'Risk & Compliance', 'planned'),

-- Product & Tech (15 blocks)
('product_106', 'Product Features', 'Core functionality development', 'Product & Tech', 'planned'),
('product_107', 'User Experience', 'Product usability and design', 'Product & Tech', 'planned'),
('product_108', 'Technical Architecture', 'System design and structure', 'Product & Tech', 'planned'),
('product_109', 'Development Velocity', 'Speed of product development', 'Product & Tech', 'planned'),
('product_110', 'Bug Tracking', 'Issue identification and resolution', 'Product & Tech', 'planned'),
('product_111', 'Product Analytics', 'Usage data and insights', 'Product & Tech', 'planned'),
('product_112', 'API Strategy', 'Integration and platform approach', 'Product & Tech', 'planned'),
('product_113', 'Testing Strategy', 'Quality assurance processes', 'Product & Tech', 'planned'),
('product_114', 'DevOps', 'Development and operations integration', 'Product & Tech', 'planned'),
('product_115', 'Product Metrics', 'Performance measurement KPIs', 'Product & Tech', 'planned'),
('product_116', 'User Feedback', 'Product improvement insights', 'Product & Tech', 'planned'),
('product_117', 'Technical Debt', 'Code quality and maintenance', 'Product & Tech', 'planned'),
('product_118', 'Platform Strategy', 'Technology foundation planning', 'Product & Tech', 'planned'),
('product_119', 'Mobile Strategy', 'Mobile platform development', 'Product & Tech', 'planned'),
('product_120', 'Innovation Pipeline', 'Future technology exploration', 'Product & Tech', 'planned'),

-- Personal (15 blocks)
('personal_121', 'Personal Runway', 'Individual financial sustainability', 'Personal', 'planned'),
('personal_122', 'Work-Life Balance', 'Personal sustainability metrics', 'Personal', 'planned'),
('personal_123', 'Stress Level', 'Personal well-being indicator', 'Personal', 'planned'),
('personal_124', 'Learning Goals', 'Skill development objectives', 'Personal', 'planned'),
('personal_125', 'Network Building', 'Professional relationship development', 'Personal', 'planned'),
('personal_126', 'Health Metrics', 'Physical and mental health tracking', 'Personal', 'planned'),
('personal_127', 'Personal Goals', 'Individual achievement targets', 'Personal', 'planned'),
('personal_128', 'Time Management', 'Personal productivity optimization', 'Personal', 'planned'),
('personal_129', 'Personal Finances', 'Individual financial management', 'Personal', 'planned'),
('personal_130', 'Mentorship', 'Guidance and advisory relationships', 'Personal', 'planned'),
('personal_131', 'Personal Brand', 'Professional reputation building', 'Personal', 'planned'),
('personal_132', 'Decision Making', 'Personal judgment and choices', 'Personal', 'planned'),
('personal_133', 'Risk Tolerance', 'Personal risk appetite', 'Personal', 'planned'),
('personal_134', 'Energy Management', 'Personal vitality and focus', 'Personal', 'planned'),
('personal_135', 'Reflection & Growth', 'Self-assessment and improvement', 'Personal', 'planned'),

-- Portfolio (15 blocks)
('portfolio_136', 'Portfolio ROI', 'Return across all ventures', 'Portfolio', 'planned'),
('portfolio_137', 'Diversification', 'Risk spread across ventures', 'Portfolio', 'planned'),
('portfolio_138', 'Cross-Venture Synergies', 'Inter-venture value creation', 'Portfolio', 'planned'),
('portfolio_139', 'Resource Allocation', 'Capital and time distribution', 'Portfolio', 'planned'),
('portfolio_140', 'Portfolio Balance', 'Risk and return optimization', 'Portfolio', 'planned'),
('portfolio_141', 'Exit Strategy', 'Portfolio liquidation planning', 'Portfolio', 'planned'),
('portfolio_142', 'Portfolio Performance', 'Aggregate performance tracking', 'Portfolio', 'planned'),
('portfolio_143', 'Investment Thesis', 'Portfolio strategy rationale', 'Portfolio', 'planned'),
('portfolio_144', 'Portfolio Risk', 'Aggregate risk assessment', 'Portfolio', 'planned'),
('portfolio_145', 'Venture Correlation', 'Inter-venture relationship analysis', 'Portfolio', 'planned'),
('portfolio_146', 'Portfolio Runway', 'Combined financial sustainability', 'Portfolio', 'planned'),
('portfolio_147', 'Strategic Themes', 'Common portfolio directions', 'Portfolio', 'planned'),
('portfolio_148', 'Portfolio Governance', 'Management and oversight structure', 'Portfolio', 'planned'),
('portfolio_149', 'Knowledge Transfer', 'Learning across ventures', 'Portfolio', 'planned'),
('portfolio_150', 'Portfolio Optimization', 'Continuous improvement strategies', 'Portfolio', 'planned');

-- Clear existing tools and seed the complete 18-tool catalog
DELETE FROM public.tools;

-- Insert the complete 18 tools with proper input/output schemas
INSERT INTO public.tools (id, name, description, category, input_schema, output_schema) VALUES
-- Finance Tools (4)
('roi_calculator', 'ROI Calculator', 'Calculate return on investment for campaigns or projects', 'Finance', 
'{"properties": {"investment": {"type": "number", "title": "Investment Amount", "description": "Total amount invested"}, "return": {"type": "number", "title": "Return Amount", "description": "Total return received"}}, "required": ["investment", "return"]}',
'{"properties": {"roi_percentage": {"type": "number", "title": "ROI %"}, "profit": {"type": "number", "title": "Profit"}, "interpretation": {"type": "string", "title": "Result Interpretation"}}}'),

('runway_calculator', 'Runway Calculator', 'Calculate how long current cash will last', 'Finance',
'{"properties": {"current_cash": {"type": "number", "title": "Current Cash", "description": "Available cash balance"}, "monthly_burn": {"type": "number", "title": "Monthly Burn Rate", "description": "Monthly cash expenditure"}}, "required": ["current_cash", "monthly_burn"]}',
'{"properties": {"runway_months": {"type": "number", "title": "Runway (Months)"}, "runway_date": {"type": "string", "title": "Cash Depletion Date"}, "risk_level": {"type": "string", "title": "Risk Assessment"}}}'),

('breakeven_calculator', 'Break-even Calculator', 'Find the point where revenue equals costs', 'Finance',
'{"properties": {"fixed_costs": {"type": "number", "title": "Fixed Costs", "description": "Monthly fixed expenses"}, "variable_cost_per_unit": {"type": "number", "title": "Variable Cost per Unit"}, "price_per_unit": {"type": "number", "title": "Price per Unit"}}, "required": ["fixed_costs", "variable_cost_per_unit", "price_per_unit"]}',
'{"properties": {"breakeven_units": {"type": "number", "title": "Break-even Units"}, "breakeven_revenue": {"type": "number", "title": "Break-even Revenue"}, "contribution_margin": {"type": "number", "title": "Contribution Margin"}}}'),

('funding_calculator', 'Funding Calculator', 'Determine funding needs and runway extension', 'Finance',
'{"properties": {"current_runway": {"type": "number", "title": "Current Runway (Months)"}, "target_runway": {"type": "number", "title": "Target Runway (Months)"}, "monthly_burn": {"type": "number", "title": "Monthly Burn Rate"}}, "required": ["current_runway", "target_runway", "monthly_burn"]}',
'{"properties": {"funding_needed": {"type": "number", "title": "Funding Needed"}, "months_to_raise": {"type": "number", "title": "Months to Raise"}, "urgency_level": {"type": "string", "title": "Urgency Level"}}}'),

-- Marketing Tools (4)
('cac_calculator', 'CAC Calculator', 'Calculate customer acquisition cost', 'Marketing',
'{"properties": {"marketing_spend": {"type": "number", "title": "Marketing Spend", "description": "Total marketing investment"}, "customers_acquired": {"type": "number", "title": "Customers Acquired", "description": "Number of new customers"}}, "required": ["marketing_spend", "customers_acquired"]}',
'{"properties": {"cac": {"type": "number", "title": "Customer Acquisition Cost"}, "efficiency_rating": {"type": "string", "title": "Efficiency Rating"}, "benchmark_comparison": {"type": "string", "title": "Industry Benchmark"}}}'),

('ltv_calculator', 'LTV Calculator', 'Calculate customer lifetime value', 'Marketing',
'{"properties": {"average_order_value": {"type": "number", "title": "Average Order Value"}, "purchase_frequency": {"type": "number", "title": "Purchase Frequency (per year)"}, "customer_lifespan": {"type": "number", "title": "Customer Lifespan (years)"}}, "required": ["average_order_value", "purchase_frequency", "customer_lifespan"]}',
'{"properties": {"ltv": {"type": "number", "title": "Customer Lifetime Value"}, "ltv_cac_ratio": {"type": "number", "title": "LTV:CAC Ratio"}, "value_assessment": {"type": "string", "title": "Value Assessment"}}}'),

('tam_sam_som', 'TAM/SAM/SOM Estimator', 'Estimate total addressable, serviceable, and obtainable markets', 'Marketing',
'{"properties": {"total_market_size": {"type": "number", "title": "Total Market Size"}, "serviceable_percentage": {"type": "number", "title": "Serviceable % of TAM"}, "obtainable_percentage": {"type": "number", "title": "Obtainable % of SAM"}}, "required": ["total_market_size", "serviceable_percentage", "obtainable_percentage"]}',
'{"properties": {"tam": {"type": "number", "title": "Total Addressable Market"}, "sam": {"type": "number", "title": "Serviceable Addressable Market"}, "som": {"type": "number", "title": "Serviceable Obtainable Market"}, "market_potential": {"type": "string", "title": "Market Potential Assessment"}}}'),

('churn_simulator', 'Churn Simulator', 'Model customer churn and retention scenarios', 'Marketing',
'{"properties": {"current_customers": {"type": "number", "title": "Current Customers"}, "monthly_churn_rate": {"type": "number", "title": "Monthly Churn Rate (%)"}, "months_to_project": {"type": "number", "title": "Months to Project"}}, "required": ["current_customers", "monthly_churn_rate", "months_to_project"]}',
'{"properties": {"projected_customers": {"type": "number", "title": "Projected Customers"}, "total_churn": {"type": "number", "title": "Total Customer Loss"}, "retention_rate": {"type": "number", "title": "Retention Rate"}, "churn_impact": {"type": "string", "title": "Churn Impact Assessment"}}}'),

-- Strategy Tools (4)
('pricing_optimizer', 'Pricing Optimizer', 'Optimize pricing strategy for maximum revenue', 'Strategy',
'{"properties": {"current_price": {"type": "number", "title": "Current Price"}, "demand_at_current": {"type": "number", "title": "Current Demand"}, "price_elasticity": {"type": "number", "title": "Price Elasticity"}, "cost_per_unit": {"type": "number", "title": "Cost per Unit"}}, "required": ["current_price", "demand_at_current", "price_elasticity", "cost_per_unit"]}',
'{"properties": {"optimal_price": {"type": "number", "title": "Optimal Price"}, "revenue_increase": {"type": "number", "title": "Revenue Increase %"}, "profit_margin": {"type": "number", "title": "Profit Margin"}, "pricing_strategy": {"type": "string", "title": "Recommended Strategy"}}}'),

('competitive_analyzer', 'Competitive Analyzer', 'Analyze competitive positioning and opportunities', 'Strategy',
'{"properties": {"competitor_count": {"type": "number", "title": "Number of Competitors"}, "market_share": {"type": "number", "title": "Current Market Share %"}, "competitive_advantage": {"type": "string", "title": "Main Competitive Advantage"}, "threat_level": {"type": "string", "title": "Competitive Threat Level", "enum": ["Low", "Medium", "High"]}}, "required": ["competitor_count", "market_share", "competitive_advantage", "threat_level"]}',
'{"properties": {"competitive_position": {"type": "string", "title": "Competitive Position"}, "market_opportunity": {"type": "number", "title": "Market Opportunity Score"}, "strategic_recommendations": {"type": "array", "title": "Strategic Recommendations"}, "differentiation_score": {"type": "number", "title": "Differentiation Score"}}}'),

('swot_analyzer', 'SWOT Analyzer', 'Systematic strengths, weaknesses, opportunities, threats analysis', 'Strategy',
'{"properties": {"strengths": {"type": "array", "title": "Strengths", "items": {"type": "string"}}, "weaknesses": {"type": "array", "title": "Weaknesses", "items": {"type": "string"}}, "opportunities": {"type": "array", "title": "Opportunities", "items": {"type": "string"}}, "threats": {"type": "array", "title": "Threats", "items": {"type": "string"}}}, "required": ["strengths", "weaknesses", "opportunities", "threats"]}',
'{"properties": {"strategic_priorities": {"type": "array", "title": "Strategic Priorities"}, "risk_score": {"type": "number", "title": "Overall Risk Score"}, "opportunity_score": {"type": "number", "title": "Opportunity Score"}, "action_items": {"type": "array", "title": "Recommended Actions"}}}'),

('equity_calculator', 'Equity Calculator', 'Calculate equity distribution and valuation impact', 'Strategy',
'{"properties": {"company_valuation": {"type": "number", "title": "Company Valuation"}, "shares_outstanding": {"type": "number", "title": "Shares Outstanding"}, "new_investment": {"type": "number", "title": "New Investment Amount"}, "investor_ownership": {"type": "number", "title": "Investor Ownership %"}}, "required": ["company_valuation", "shares_outstanding", "new_investment", "investor_ownership"]}',
'{"properties": {"pre_money_valuation": {"type": "number", "title": "Pre-Money Valuation"}, "post_money_valuation": {"type": "number", "title": "Post-Money Valuation"}, "founder_dilution": {"type": "number", "title": "Founder Dilution %"}, "new_shares_issued": {"type": "number", "title": "New Shares Issued"}}}'),

-- Risk Tools (3)
('risk_assessor', 'Risk Assessor', 'Comprehensive business risk evaluation', 'Risk',
'{"properties": {"financial_risk": {"type": "number", "title": "Financial Risk (1-10)"}, "market_risk": {"type": "number", "title": "Market Risk (1-10)"}, "operational_risk": {"type": "number", "title": "Operational Risk (1-10)"}, "regulatory_risk": {"type": "number", "title": "Regulatory Risk (1-10)"}}, "required": ["financial_risk", "market_risk", "operational_risk", "regulatory_risk"]}',
'{"properties": {"overall_risk_score": {"type": "number", "title": "Overall Risk Score"}, "risk_level": {"type": "string", "title": "Risk Level"}, "priority_risks": {"type": "array", "title": "Priority Risk Areas"}, "mitigation_strategies": {"type": "array", "title": "Risk Mitigation Strategies"}}}'),

('scenario_planner', 'Scenario Planner', 'Model best case, worst case, and realistic scenarios', 'Risk',
'{"properties": {"base_revenue": {"type": "number", "title": "Base Case Revenue"}, "optimistic_growth": {"type": "number", "title": "Optimistic Growth %"}, "pessimistic_decline": {"type": "number", "title": "Pessimistic Decline %"}, "probability_weights": {"type": "object", "title": "Scenario Probabilities"}}, "required": ["base_revenue", "optimistic_growth", "pessimistic_decline"]}',
'{"properties": {"best_case_outcome": {"type": "number", "title": "Best Case Revenue"}, "worst_case_outcome": {"type": "number", "title": "Worst Case Revenue"}, "expected_value": {"type": "number", "title": "Expected Value"}, "risk_adjusted_return": {"type": "number", "title": "Risk-Adjusted Return"}}}'),

('burn_rate_optimizer', 'Burn Rate Optimizer', 'Optimize cash burn and extend runway', 'Risk',
'{"properties": {"current_burn": {"type": "number", "title": "Current Monthly Burn"}, "fixed_costs": {"type": "number", "title": "Fixed Costs"}, "variable_costs": {"type": "number", "title": "Variable Costs"}, "target_runway": {"type": "number", "title": "Target Runway (Months)"}}, "required": ["current_burn", "fixed_costs", "variable_costs", "target_runway"]}',
'{"properties": {"optimized_burn": {"type": "number", "title": "Optimized Burn Rate"}, "cost_reduction_needed": {"type": "number", "title": "Cost Reduction Needed"}, "runway_extension": {"type": "number", "title": "Runway Extension (Months)"}, "optimization_recommendations": {"type": "array", "title": "Cost Optimization Recommendations"}}}'),

-- Personal Tools (3)
('personal_runway', 'Personal Runway Calculator', 'Calculate personal financial runway', 'Personal',
'{"properties": {"personal_savings": {"type": "number", "title": "Personal Savings"}, "monthly_expenses": {"type": "number", "title": "Monthly Personal Expenses"}, "founder_salary": {"type": "number", "title": "Founder Salary"}}, "required": ["personal_savings", "monthly_expenses"]}',
'{"properties": {"personal_runway_months": {"type": "number", "title": "Personal Runway (Months)"}, "financial_stress_level": {"type": "string", "title": "Financial Stress Level"}, "recommended_actions": {"type": "array", "title": "Financial Recommendations"}}}'),

('wellness_tracker', 'Founder Wellness Tracker', 'Track founder health and stress levels', 'Personal',
'{"properties": {"stress_level": {"type": "number", "title": "Stress Level (1-10)"}, "work_hours_per_week": {"type": "number", "title": "Work Hours per Week"}, "sleep_hours": {"type": "number", "title": "Average Sleep Hours"}, "exercise_frequency": {"type": "number", "title": "Exercise Sessions per Week"}}, "required": ["stress_level", "work_hours_per_week", "sleep_hours"]}',
'{"properties": {"wellness_score": {"type": "number", "title": "Overall Wellness Score"}, "burnout_risk": {"type": "string", "title": "Burnout Risk Level"}, "health_recommendations": {"type": "array", "title": "Health & Wellness Recommendations"}}}'),

('goal_tracker', 'Personal Goal Tracker', 'Track personal and professional goals', 'Personal',
'{"properties": {"goals": {"type": "array", "title": "Current Goals", "items": {"type": "object", "properties": {"goal": {"type": "string"}, "progress": {"type": "number"}, "deadline": {"type": "string"}}}}, "time_allocation": {"type": "object", "title": "Time Allocation %"}}, "required": ["goals"]}',
'{"properties": {"goal_completion_rate": {"type": "number", "title": "Goal Completion Rate %"}, "productivity_score": {"type": "number", "title": "Productivity Score"}, "focus_areas": {"type": "array", "title": "Recommended Focus Areas"}, "time_optimization": {"type": "array", "title": "Time Management Recommendations"}}}');

-- Update tool_block_links with correct mappings
DELETE FROM public.tool_block_links;

INSERT INTO public.tool_block_links (tool_id, block_id) VALUES
-- Finance Tools
('roi_calculator', 'finance_005'),      -- Gross Margin
('runway_calculator', 'finance_001'),   -- Runway  
('breakeven_calculator', 'finance_006'), -- Break-even Point
('funding_calculator', 'finance_012'),  -- Funding Raised

-- Marketing Tools
('cac_calculator', 'customers_021'),    -- CAC
('ltv_calculator', 'customers_022'),    -- LTV
('tam_sam_som', 'strategy_061'),        -- TAM
('tam_sam_som', 'strategy_062'),        -- SAM
('tam_sam_som', 'strategy_063'),        -- SOM
('churn_simulator', 'customers_023'),   -- Churn Rate

-- Strategy Tools  
('pricing_optimizer', 'strategy_064'),  -- Pricing Model
('competitive_analyzer', 'strategy_065'), -- Competitive Analysis
('swot_analyzer', 'strategy_069'),      -- SWOT Analysis
('equity_calculator', 'finance_013'),   -- Valuation

-- Risk Tools
('risk_assessor', 'risk_091'),          -- Financial Risk
('scenario_planner', 'risk_092'),       -- Market Risk  
('burn_rate_optimizer', 'finance_002'), -- Burn Rate

-- Personal Tools
('personal_runway', 'personal_121'),    -- Personal Runway
('wellness_tracker', 'personal_126'),   -- Health Metrics
('goal_tracker', 'personal_127');       -- Personal Goals