-- Phase 1: Complete Database Foundation

-- Insert comprehensive blocks taxonomy (150+ blocks across 9 categories)
INSERT INTO blocks (category, name, description, status, tags) VALUES
-- Business Model & Strategy (25 blocks)
('business_model', 'Revenue Streams', 'Define and optimize multiple revenue channels', 'planned', ARRAY['revenue', 'monetization']),
('business_model', 'Value Proposition Canvas', 'Map customer needs to product benefits', 'planned', ARRAY['strategy', 'customer']),
('business_model', 'Business Model Canvas', 'Complete business model visualization', 'planned', ARRAY['strategy', 'planning']),
('business_model', 'Competitive Analysis', 'Analyze competitors and market positioning', 'planned', ARRAY['market', 'competition']),
('business_model', 'Market Sizing (TAM/SAM/SOM)', 'Calculate total addressable market', 'planned', ARRAY['market', 'sizing']),
('business_model', 'Go-to-Market Strategy', 'Plan market entry and customer acquisition', 'planned', ARRAY['marketing', 'strategy']),
('business_model', 'Partnership Strategy', 'Identify and plan strategic partnerships', 'planned', ARRAY['partnerships', 'strategy']),
('business_model', 'Pricing Strategy', 'Develop optimal pricing models', 'planned', ARRAY['pricing', 'strategy']),
('business_model', 'Customer Segmentation', 'Define target customer segments', 'planned', ARRAY['customer', 'segmentation']),
('business_model', 'Unit Economics', 'Calculate per-unit profitability', 'planned', ARRAY['economics', 'metrics']),
('business_model', 'Scalability Assessment', 'Evaluate business scaling potential', 'planned', ARRAY['scalability', 'growth']),
('business_model', 'Moat Analysis', 'Identify competitive advantages', 'planned', ARRAY['competitive', 'advantage']),
('business_model', 'Platform Strategy', 'Design multi-sided platform business', 'planned', ARRAY['platform', 'network']),
('business_model', 'Subscription Model', 'Design recurring revenue model', 'planned', ARRAY['subscription', 'recurring']),
('business_model', 'Marketplace Design', 'Plan two-sided marketplace', 'planned', ARRAY['marketplace', 'platform']),
('business_model', 'Franchise Model', 'Develop franchising strategy', 'planned', ARRAY['franchise', 'expansion']),
('business_model', 'Licensing Strategy', 'Plan intellectual property licensing', 'planned', ARRAY['licensing', 'ip']),
('business_model', 'Distribution Channels', 'Design product distribution strategy', 'planned', ARRAY['distribution', 'channels']),
('business_model', 'Customer Lifecycle', 'Map customer journey and touchpoints', 'planned', ARRAY['customer', 'lifecycle']),
('business_model', 'Network Effects', 'Design and leverage network effects', 'planned', ARRAY['network', 'viral']),
('business_model', 'Data Monetization', 'Monetize data assets and insights', 'planned', ARRAY['data', 'monetization']),
('business_model', 'API Strategy', 'Design API business model', 'planned', ARRAY['api', 'platform']),
('business_model', 'Vertical Integration', 'Plan supply chain integration', 'planned', ARRAY['integration', 'supply']),
('business_model', 'International Expansion', 'Plan global market entry', 'planned', ARRAY['international', 'expansion']),
('business_model', 'Business Model Innovation', 'Innovate existing business models', 'planned', ARRAY['innovation', 'disruption']),

-- Financial Planning & Analysis (25 blocks)
('financial', 'Financial Projections', 'Create 3-5 year financial forecasts', 'planned', ARRAY['projections', 'forecasting']),
('financial', 'Cash Flow Management', 'Plan and monitor cash flow', 'planned', ARRAY['cashflow', 'liquidity']),
('financial', 'Budget Planning', 'Create detailed operational budgets', 'planned', ARRAY['budget', 'planning']),
('financial', 'Break-even Analysis', 'Calculate break-even points', 'planned', ARRAY['breakeven', 'analysis']),
('financial', 'ROI Calculations', 'Measure return on investments', 'planned', ARRAY['roi', 'returns']),
('financial', 'Funding Requirements', 'Calculate capital needs and sources', 'planned', ARRAY['funding', 'capital']),
('financial', 'Investor Pitch Deck', 'Create compelling investor presentation', 'planned', ARRAY['pitch', 'investors']),
('financial', 'Valuation Models', 'Calculate company valuation', 'planned', ARRAY['valuation', 'modeling']),
('financial', 'Financial Controls', 'Implement financial monitoring systems', 'planned', ARRAY['controls', 'monitoring']),
('financial', 'Cost Structure Analysis', 'Analyze and optimize cost structure', 'planned', ARRAY['costs', 'optimization']),
('financial', 'Revenue Recognition', 'Plan revenue accounting policies', 'planned', ARRAY['revenue', 'accounting']),
('financial', 'Tax Planning', 'Optimize tax strategy and structure', 'planned', ARRAY['tax', 'optimization']),
('financial', 'Working Capital', 'Manage working capital efficiently', 'planned', ARRAY['working', 'capital']),
('financial', 'Capital Allocation', 'Optimize capital deployment', 'planned', ARRAY['capital', 'allocation']),
('financial', 'Financial Risk Assessment', 'Identify and mitigate financial risks', 'planned', ARRAY['risk', 'financial']),
('financial', 'Scenario Planning', 'Model different business scenarios', 'planned', ARRAY['scenario', 'planning']),
('financial', 'Burn Rate Analysis', 'Monitor and optimize cash burn', 'planned', ARRAY['burn', 'runway']),
('financial', 'Unit Economics Modeling', 'Model customer acquisition costs', 'planned', ARRAY['unit', 'economics']),
('financial', 'Financial Dashboard', 'Create real-time financial monitoring', 'planned', ARRAY['dashboard', 'kpi']),
('financial', 'Debt Management', 'Plan and manage debt structure', 'planned', ARRAY['debt', 'leverage']),
('financial', 'Equity Structure', 'Design equity and ownership structure', 'planned', ARRAY['equity', 'ownership']),
('financial', 'Exit Strategy', 'Plan exit opportunities and timing', 'planned', ARRAY['exit', 'strategy']),
('financial', 'Due Diligence Prep', 'Prepare for investor due diligence', 'planned', ARRAY['due', 'diligence']),
('financial', 'Financial Audit Prep', 'Prepare for financial audits', 'planned', ARRAY['audit', 'compliance']),
('financial', 'International Finance', 'Manage multi-currency operations', 'planned', ARRAY['international', 'currency']),

-- Operations & Processes (20 blocks)
('operations', 'Process Design', 'Design efficient business processes', 'planned', ARRAY['process', 'efficiency']),
('operations', 'Supply Chain Management', 'Optimize supply chain operations', 'planned', ARRAY['supply', 'chain']),
('operations', 'Quality Management', 'Implement quality control systems', 'planned', ARRAY['quality', 'control']),
('operations', 'Inventory Management', 'Optimize inventory levels and turnover', 'planned', ARRAY['inventory', 'optimization']),
('operations', 'Vendor Management', 'Manage supplier relationships', 'planned', ARRAY['vendor', 'supplier']),
('operations', 'Operational Metrics', 'Define and track operational KPIs', 'planned', ARRAY['metrics', 'kpi']),
('operations', 'Automation Strategy', 'Plan process automation initiatives', 'planned', ARRAY['automation', 'efficiency']),
('operations', 'Capacity Planning', 'Plan operational capacity and scaling', 'planned', ARRAY['capacity', 'scaling']),
('operations', 'Risk Management', 'Identify and mitigate operational risks', 'planned', ARRAY['risk', 'mitigation']),
('operations', 'Standard Operating Procedures', 'Document standard processes', 'planned', ARRAY['sop', 'documentation']),
('operations', 'Performance Management', 'Monitor and improve performance', 'planned', ARRAY['performance', 'improvement']),
('operations', 'Cost Optimization', 'Reduce operational costs', 'planned', ARRAY['cost', 'optimization']),
('operations', 'Compliance Management', 'Ensure regulatory compliance', 'planned', ARRAY['compliance', 'regulatory']),
('operations', 'Business Continuity', 'Plan for business continuity', 'planned', ARRAY['continuity', 'disaster']),
('operations', 'Facility Management', 'Manage physical facilities', 'planned', ARRAY['facility', 'space']),
('operations', 'Logistics Optimization', 'Optimize shipping and logistics', 'planned', ARRAY['logistics', 'shipping']),
('operations', 'Customer Service', 'Design customer service operations', 'planned', ARRAY['service', 'support']),
('operations', 'Returns Management', 'Handle product returns efficiently', 'planned', ARRAY['returns', 'reverse']),
('operations', 'International Operations', 'Manage global operations', 'planned', ARRAY['international', 'global']),
('operations', 'Digital Transformation', 'Digitize operational processes', 'planned', ARRAY['digital', 'transformation']),

-- Marketing & Growth (20 blocks)
('marketing', 'Customer Acquisition', 'Plan customer acquisition strategy', 'planned', ARRAY['acquisition', 'growth']),
('marketing', 'Digital Marketing', 'Design digital marketing campaigns', 'planned', ARRAY['digital', 'online']),
('marketing', 'Content Marketing', 'Create content marketing strategy', 'planned', ARRAY['content', 'marketing']),
('marketing', 'Social Media Strategy', 'Plan social media presence', 'planned', ARRAY['social', 'media']),
('marketing', 'SEO Strategy', 'Optimize search engine visibility', 'planned', ARRAY['seo', 'search']),
('marketing', 'Brand Development', 'Build strong brand identity', 'planned', ARRAY['brand', 'identity']),
('marketing', 'Customer Retention', 'Improve customer retention rates', 'planned', ARRAY['retention', 'loyalty']),
('marketing', 'Email Marketing', 'Design email marketing campaigns', 'planned', ARRAY['email', 'automation']),
('marketing', 'Influencer Marketing', 'Leverage influencer partnerships', 'planned', ARRAY['influencer', 'partnerships']),
('marketing', 'Conversion Optimization', 'Optimize conversion funnels', 'planned', ARRAY['conversion', 'funnel']),
('marketing', 'Customer Feedback', 'Collect and analyze customer feedback', 'planned', ARRAY['feedback', 'voice']),
('marketing', 'Referral Programs', 'Design customer referral systems', 'planned', ARRAY['referral', 'viral']),
('marketing', 'Public Relations', 'Manage public relations strategy', 'planned', ARRAY['pr', 'media']),
('marketing', 'Event Marketing', 'Plan marketing events and trade shows', 'planned', ARRAY['events', 'tradeshows']),
('marketing', 'Partnership Marketing', 'Leverage marketing partnerships', 'planned', ARRAY['partnerships', 'co-marketing']),
('marketing', 'Marketing Analytics', 'Measure marketing effectiveness', 'planned', ARRAY['analytics', 'measurement']),
('marketing', 'Growth Hacking', 'Implement growth hacking tactics', 'planned', ARRAY['growth', 'hacking']),
('marketing', 'Product Launch', 'Plan product launch strategy', 'planned', ARRAY['launch', 'product']),
('marketing', 'Community Building', 'Build customer communities', 'planned', ARRAY['community', 'engagement']),
('marketing', 'International Marketing', 'Adapt marketing for global markets', 'planned', ARRAY['international', 'localization']),

-- Technology & Product (20 blocks)
('technology', 'Product Roadmap', 'Plan product development roadmap', 'planned', ARRAY['roadmap', 'planning']),
('technology', 'Technical Architecture', 'Design system architecture', 'planned', ARRAY['architecture', 'systems']),
('technology', 'Development Process', 'Optimize software development process', 'planned', ARRAY['development', 'agile']),
('technology', 'Quality Assurance', 'Implement testing and QA processes', 'planned', ARRAY['qa', 'testing']),
('technology', 'DevOps Strategy', 'Plan development operations', 'planned', ARRAY['devops', 'deployment']),
('technology', 'Security Framework', 'Implement cybersecurity measures', 'planned', ARRAY['security', 'cyber']),
('technology', 'Data Strategy', 'Plan data collection and usage', 'planned', ARRAY['data', 'analytics']),
('technology', 'API Design', 'Design application programming interfaces', 'planned', ARRAY['api', 'integration']),
('technology', 'Cloud Strategy', 'Plan cloud infrastructure', 'planned', ARRAY['cloud', 'infrastructure']),
('technology', 'Mobile Strategy', 'Plan mobile application strategy', 'planned', ARRAY['mobile', 'apps']),
('technology', 'AI/ML Integration', 'Integrate artificial intelligence', 'planned', ARRAY['ai', 'machine-learning']),
('technology', 'Technology Stack', 'Select optimal technology stack', 'planned', ARRAY['stack', 'technology']),
('technology', 'Scalability Planning', 'Plan for technical scalability', 'planned', ARRAY['scalability', 'performance']),
('technology', 'Technical Debt', 'Manage and reduce technical debt', 'planned', ARRAY['debt', 'refactoring']),
('technology', 'Innovation Lab', 'Plan technology innovation initiatives', 'planned', ARRAY['innovation', 'r&d']),
('technology', 'Integration Strategy', 'Plan system integrations', 'planned', ARRAY['integration', 'systems']),
('technology', 'Technical Documentation', 'Document technical systems', 'planned', ARRAY['documentation', 'technical']),
('technology', 'Performance Optimization', 'Optimize system performance', 'planned', ARRAY['performance', 'optimization']),
('technology', 'Disaster Recovery', 'Plan technical disaster recovery', 'planned', ARRAY['disaster', 'backup']),
('technology', 'Compliance Technology', 'Implement compliance technology', 'planned', ARRAY['compliance', 'regulatory']),

-- Human Resources & Team (15 blocks)
('team', 'Organizational Design', 'Design organizational structure', 'planned', ARRAY['organization', 'structure']),
('team', 'Hiring Strategy', 'Plan talent acquisition strategy', 'planned', ARRAY['hiring', 'recruitment']),
('team', 'Team Development', 'Develop team capabilities', 'planned', ARRAY['development', 'training']),
('team', 'Performance Management', 'Manage employee performance', 'planned', ARRAY['performance', 'evaluation']),
('team', 'Compensation Strategy', 'Design compensation and benefits', 'planned', ARRAY['compensation', 'benefits']),
('team', 'Company Culture', 'Build strong company culture', 'planned', ARRAY['culture', 'values']),
('team', 'Employee Engagement', 'Improve employee engagement', 'planned', ARRAY['engagement', 'satisfaction']),
('team', 'Leadership Development', 'Develop leadership capabilities', 'planned', ARRAY['leadership', 'management']),
('team', 'Remote Work Strategy', 'Plan remote work policies', 'planned', ARRAY['remote', 'distributed']),
('team', 'Succession Planning', 'Plan leadership succession', 'planned', ARRAY['succession', 'continuity']),
('team', 'Diversity & Inclusion', 'Promote diversity and inclusion', 'planned', ARRAY['diversity', 'inclusion']),
('team', 'Employee Onboarding', 'Design new hire onboarding', 'planned', ARRAY['onboarding', 'integration']),
('team', 'Communication Strategy', 'Improve internal communication', 'planned', ARRAY['communication', 'transparency']),
('team', 'Conflict Resolution', 'Manage workplace conflicts', 'planned', ARRAY['conflict', 'resolution']),
('team', 'Wellness Programs', 'Implement employee wellness programs', 'planned', ARRAY['wellness', 'health']),

-- Legal & Compliance (15 blocks)
('legal', 'Legal Structure', 'Choose optimal legal entity structure', 'planned', ARRAY['structure', 'entity']),
('legal', 'Intellectual Property', 'Protect intellectual property assets', 'planned', ARRAY['ip', 'patents']),
('legal', 'Contract Management', 'Manage contracts and agreements', 'planned', ARRAY['contracts', 'agreements']),
('legal', 'Regulatory Compliance', 'Ensure regulatory compliance', 'planned', ARRAY['compliance', 'regulations']),
('legal', 'Data Privacy', 'Implement data privacy policies', 'planned', ARRAY['privacy', 'gdpr']),
('legal', 'Employment Law', 'Comply with employment regulations', 'planned', ARRAY['employment', 'labor']),
('legal', 'Terms of Service', 'Create terms of service agreements', 'planned', ARRAY['terms', 'legal']),
('legal', 'Privacy Policy', 'Develop privacy policy documents', 'planned', ARRAY['privacy', 'policy']),
('legal', 'Risk Assessment', 'Assess legal and compliance risks', 'planned', ARRAY['risk', 'legal']),
('legal', 'Insurance Strategy', 'Plan business insurance coverage', 'planned', ARRAY['insurance', 'coverage']),
('legal', 'International Law', 'Navigate international legal requirements', 'planned', ARRAY['international', 'law']),
('legal', 'Dispute Resolution', 'Plan dispute resolution procedures', 'planned', ARRAY['dispute', 'arbitration']),
('legal', 'Corporate Governance', 'Implement governance structures', 'planned', ARRAY['governance', 'board']),
('legal', 'Securities Compliance', 'Comply with securities regulations', 'planned', ARRAY['securities', 'compliance']),
('legal', 'Environmental Law', 'Comply with environmental regulations', 'planned', ARRAY['environmental', 'sustainability']),

-- Customer Success & Support (10 blocks)
('customer', 'Customer Success Strategy', 'Design customer success programs', 'planned', ARRAY['success', 'retention']),
('customer', 'Support Operations', 'Design customer support operations', 'planned', ARRAY['support', 'helpdesk']),
('customer', 'Customer Onboarding', 'Design customer onboarding process', 'planned', ARRAY['onboarding', 'activation']),
('customer', 'Customer Health Scoring', 'Monitor customer health metrics', 'planned', ARRAY['health', 'metrics']),
('customer', 'Churn Prevention', 'Prevent customer churn', 'planned', ARRAY['churn', 'retention']),
('customer', 'Customer Education', 'Educate customers on product usage', 'planned', ARRAY['education', 'training']),
('customer', 'Feedback Management', 'Collect and act on customer feedback', 'planned', ARRAY['feedback', 'voice']),
('customer', 'Escalation Management', 'Handle customer escalations', 'planned', ARRAY['escalation', 'resolution']),
('customer', 'Customer Community', 'Build customer communities', 'planned', ARRAY['community', 'engagement']),
('customer', 'Account Management', 'Manage key customer accounts', 'planned', ARRAY['accounts', 'management']),

-- Risk Management & Governance (10 blocks)
('risk', 'Enterprise Risk Management', 'Implement comprehensive risk management', 'planned', ARRAY['risk', 'enterprise']),
('risk', 'Business Continuity Planning', 'Plan for business continuity', 'planned', ARRAY['continuity', 'disaster']),
('risk', 'Crisis Management', 'Prepare for crisis situations', 'planned', ARRAY['crisis', 'response']),
('risk', 'Cybersecurity Risk', 'Manage cybersecurity risks', 'planned', ARRAY['cyber', 'security']),
('risk', 'Financial Risk Management', 'Manage financial risks', 'planned', ARRAY['financial', 'risk']),
('risk', 'Operational Risk', 'Identify operational risks', 'planned', ARRAY['operational', 'risk']),
('risk', 'Strategic Risk', 'Assess strategic risks', 'planned', ARRAY['strategic', 'risk']),
('risk', 'Reputational Risk', 'Manage reputation risks', 'planned', ARRAY['reputation', 'brand']),
('risk', 'Regulatory Risk', 'Manage regulatory compliance risks', 'planned', ARRAY['regulatory', 'compliance']),
('risk', 'Environmental Risk', 'Assess environmental risks', 'planned', ARRAY['environmental', 'sustainability'])

ON CONFLICT (category, name) DO NOTHING;

-- Insert comprehensive tools catalog (18 tools across categories)
INSERT INTO tools (id, name, description, category, input_schema, output_schema) VALUES
-- Financial Tools (6 tools)
('roi_calculator', 'ROI Calculator', 'Calculate return on investment for projects and initiatives', 'financial', 
  '{"type": "object", "properties": {"investment": {"type": "number", "description": "Initial investment amount"}, "revenue": {"type": "number", "description": "Expected revenue"}, "timeframe": {"type": "number", "description": "Time period in months"}}, "required": ["investment", "revenue", "timeframe"]}',
  '{"type": "object", "properties": {"roi_percentage": {"type": "number"}, "payback_period": {"type": "number"}, "net_profit": {"type": "number"}}}'),

('runway_calculator', 'Runway Calculator', 'Calculate how long current cash will last', 'financial',
  '{"type": "object", "properties": {"current_cash": {"type": "number", "description": "Current cash balance"}, "monthly_burn": {"type": "number", "description": "Monthly burn rate"}, "revenue_growth": {"type": "number", "description": "Monthly revenue growth rate"}}, "required": ["current_cash", "monthly_burn"]}',
  '{"type": "object", "properties": {"runway_months": {"type": "number"}, "runway_date": {"type": "string"}, "recommendations": {"type": "array"}}}'),

('breakeven_calculator', 'Break-even Calculator', 'Calculate break-even point for products or services', 'financial',
  '{"type": "object", "properties": {"fixed_costs": {"type": "number", "description": "Monthly fixed costs"}, "variable_cost_per_unit": {"type": "number", "description": "Variable cost per unit"}, "price_per_unit": {"type": "number", "description": "Selling price per unit"}}, "required": ["fixed_costs", "variable_cost_per_unit", "price_per_unit"]}',
  '{"type": "object", "properties": {"breakeven_units": {"type": "number"}, "breakeven_revenue": {"type": "number"}, "contribution_margin": {"type": "number"}}}'),

('cash_flow_projector', 'Cash Flow Projector', 'Project future cash flow based on current trends', 'financial',
  '{"type": "object", "properties": {"starting_cash": {"type": "number"}, "monthly_revenue": {"type": "number"}, "monthly_expenses": {"type": "number"}, "growth_rate": {"type": "number"}, "projection_months": {"type": "number"}}, "required": ["starting_cash", "monthly_revenue", "monthly_expenses", "projection_months"]}',
  '{"type": "object", "properties": {"projections": {"type": "array"}, "ending_cash": {"type": "number"}, "cash_flow_trend": {"type": "string"}}}'),

('valuation_calculator', 'Valuation Calculator', 'Calculate company valuation using multiple methods', 'financial',
  '{"type": "object", "properties": {"annual_revenue": {"type": "number"}, "annual_profit": {"type": "number"}, "industry": {"type": "string"}, "growth_rate": {"type": "number"}}, "required": ["annual_revenue", "annual_profit", "industry"]}',
  '{"type": "object", "properties": {"revenue_multiple_valuation": {"type": "number"}, "profit_multiple_valuation": {"type": "number"}, "dcf_valuation": {"type": "number"}, "recommended_valuation": {"type": "number"}}}'),

('unit_economics', 'Unit Economics Calculator', 'Calculate customer acquisition and lifetime value metrics', 'financial',
  '{"type": "object", "properties": {"cac": {"type": "number", "description": "Customer acquisition cost"}, "ltv": {"type": "number", "description": "Customer lifetime value"}, "monthly_revenue_per_customer": {"type": "number"}, "gross_margin": {"type": "number"}}, "required": ["cac", "ltv", "monthly_revenue_per_customer"]}',
  '{"type": "object", "properties": {"ltv_cac_ratio": {"type": "number"}, "payback_period": {"type": "number"}, "customer_profitability": {"type": "number"}, "recommendations": {"type": "array"}}}'),

-- Marketing Tools (4 tools)
('cac_calculator', 'CAC Calculator', 'Calculate customer acquisition cost across channels', 'marketing',
  '{"type": "object", "properties": {"marketing_spend": {"type": "number", "description": "Total marketing spend"}, "customers_acquired": {"type": "number", "description": "Number of customers acquired"}, "time_period": {"type": "number", "description": "Time period in months"}}, "required": ["marketing_spend", "customers_acquired"]}',
  '{"type": "object", "properties": {"cac": {"type": "number"}, "cac_by_channel": {"type": "object"}, "efficiency_score": {"type": "number"}}}'),

('ltv_calculator', 'LTV Calculator', 'Calculate customer lifetime value', 'marketing',
  '{"type": "object", "properties": {"avg_order_value": {"type": "number"}, "purchase_frequency": {"type": "number"}, "customer_lifespan": {"type": "number"}, "gross_margin": {"type": "number"}}, "required": ["avg_order_value", "purchase_frequency", "customer_lifespan"]}',
  '{"type": "object", "properties": {"ltv": {"type": "number"}, "annual_value": {"type": "number"}, "lifetime_profit": {"type": "number"}}}'),

('conversion_optimizer', 'Conversion Rate Optimizer', 'Analyze and optimize conversion funnels', 'marketing',
  '{"type": "object", "properties": {"funnel_stages": {"type": "array", "description": "Array of funnel stages with conversion rates"}, "traffic": {"type": "number"}, "current_conversion": {"type": "number"}}, "required": ["funnel_stages", "traffic", "current_conversion"]}',
  '{"type": "object", "properties": {"conversion_analysis": {"type": "object"}, "optimization_opportunities": {"type": "array"}, "potential_uplift": {"type": "number"}}}'),

('market_sizer', 'Market Size Calculator', 'Calculate TAM, SAM, and SOM for market opportunities', 'marketing',
  '{"type": "object", "properties": {"total_population": {"type": "number"}, "target_demographic_percent": {"type": "number"}, "avg_spending": {"type": "number"}, "market_penetration": {"type": "number"}}, "required": ["total_population", "target_demographic_percent", "avg_spending"]}',
  '{"type": "object", "properties": {"tam": {"type": "number"}, "sam": {"type": "number"}, "som": {"type": "number"}, "market_analysis": {"type": "object"}}}'),

-- Operations Tools (4 tools)
('capacity_planner', 'Capacity Planner', 'Plan operational capacity and resource requirements', 'operations',
  '{"type": "object", "properties": {"current_capacity": {"type": "number"}, "utilization_rate": {"type": "number"}, "growth_projection": {"type": "number"}, "lead_time": {"type": "number"}}, "required": ["current_capacity", "utilization_rate", "growth_projection"]}',
  '{"type": "object", "properties": {"required_capacity": {"type": "number"}, "capacity_gap": {"type": "number"}, "expansion_timeline": {"type": "object"}, "resource_requirements": {"type": "array"}}}'),

('inventory_optimizer', 'Inventory Optimizer', 'Optimize inventory levels and reduce carrying costs', 'operations',
  '{"type": "object", "properties": {"demand_rate": {"type": "number"}, "lead_time": {"type": "number"}, "carrying_cost": {"type": "number"}, "ordering_cost": {"type": "number"}}, "required": ["demand_rate", "lead_time", "carrying_cost"]}',
  '{"type": "object", "properties": {"optimal_order_quantity": {"type": "number"}, "reorder_point": {"type": "number"}, "total_cost": {"type": "number"}, "cost_savings": {"type": "number"}}}'),

('process_optimizer', 'Process Efficiency Analyzer', 'Analyze and optimize business processes', 'operations',
  '{"type": "object", "properties": {"process_steps": {"type": "array", "description": "Array of process steps with time and cost"}, "current_efficiency": {"type": "number"}, "target_efficiency": {"type": "number"}}, "required": ["process_steps", "current_efficiency"]}',
  '{"type": "object", "properties": {"efficiency_analysis": {"type": "object"}, "bottlenecks": {"type": "array"}, "optimization_suggestions": {"type": "array"}, "potential_savings": {"type": "number"}}}'),

('risk_assessor', 'Risk Assessment Tool', 'Assess and quantify business risks', 'operations',
  '{"type": "object", "properties": {"risk_categories": {"type": "array"}, "impact_scale": {"type": "number"}, "probability_estimates": {"type": "object"}}, "required": ["risk_categories", "impact_scale"]}',
  '{"type": "object", "properties": {"risk_matrix": {"type": "object"}, "priority_risks": {"type": "array"}, "mitigation_strategies": {"type": "array"}, "overall_risk_score": {"type": "number"}}}'),

-- Strategy Tools (4 tools)
('scenario_planner', 'Scenario Planner', 'Model different business scenarios and outcomes', 'strategy',
  '{"type": "object", "properties": {"base_case": {"type": "object"}, "optimistic_case": {"type": "object"}, "pessimistic_case": {"type": "object"}, "key_variables": {"type": "array"}}, "required": ["base_case", "optimistic_case", "pessimistic_case"]}',
  '{"type": "object", "properties": {"scenario_outcomes": {"type": "object"}, "sensitivity_analysis": {"type": "object"}, "recommended_strategy": {"type": "string"}, "contingency_plans": {"type": "array"}}}'),

('competitive_analyzer', 'Competitive Analysis Tool', 'Analyze competitive landscape and positioning', 'strategy',
  '{"type": "object", "properties": {"competitors": {"type": "array"}, "competitive_factors": {"type": "array"}, "market_position": {"type": "string"}}, "required": ["competitors", "competitive_factors"]}',
  '{"type": "object", "properties": {"competitive_matrix": {"type": "object"}, "market_gaps": {"type": "array"}, "differentiation_opportunities": {"type": "array"}, "competitive_advantage": {"type": "string"}}}'),

('swot_analyzer', 'SWOT Analysis Tool', 'Conduct comprehensive SWOT analysis', 'strategy',
  '{"type": "object", "properties": {"strengths": {"type": "array"}, "weaknesses": {"type": "array"}, "opportunities": {"type": "array"}, "threats": {"type": "array"}}, "required": ["strengths", "weaknesses", "opportunities", "threats"]}',
  '{"type": "object", "properties": {"swot_matrix": {"type": "object"}, "strategic_initiatives": {"type": "array"}, "priority_actions": {"type": "array"}, "risk_mitigation": {"type": "array"}}}'),

('goal_tracker', 'Strategic Goal Tracker', 'Track progress toward strategic objectives', 'strategy',
  '{"type": "object", "properties": {"goals": {"type": "array"}, "kpis": {"type": "array"}, "timeframe": {"type": "number"}, "current_progress": {"type": "object"}}, "required": ["goals", "kpis", "timeframe"]}',
  '{"type": "object", "properties": {"progress_analysis": {"type": "object"}, "goal_achievement_probability": {"type": "number"}, "recommended_adjustments": {"type": "array"}, "milestone_tracking": {"type": "object"}}}')

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  input_schema = EXCLUDED.input_schema,
  output_schema = EXCLUDED.output_schema;

-- Create tool-block relationships
INSERT INTO tool_block_links (tool_id, block_id) VALUES
-- Financial tools relationships
('roi_calculator', 'ROI Calculations'),
('roi_calculator', 'Investment Analysis'),
('runway_calculator', 'Cash Flow Management'),
('runway_calculator', 'Funding Requirements'),
('breakeven_calculator', 'Break-even Analysis'),
('breakeven_calculator', 'Financial Projections'),
('cash_flow_projector', 'Cash Flow Management'),
('cash_flow_projector', 'Financial Projections'),
('valuation_calculator', 'Valuation Models'),
('valuation_calculator', 'Investor Pitch Deck'),
('unit_economics', 'Unit Economics'),
('unit_economics', 'Customer Acquisition'),

-- Marketing tools relationships
('cac_calculator', 'Customer Acquisition'),
('cac_calculator', 'Digital Marketing'),
('ltv_calculator', 'Customer Retention'),
('ltv_calculator', 'Unit Economics'),
('conversion_optimizer', 'Conversion Optimization'),
('conversion_optimizer', 'Digital Marketing'),
('market_sizer', 'Market Sizing (TAM/SAM/SOM)'),
('market_sizer', 'Go-to-Market Strategy'),

-- Operations tools relationships
('capacity_planner', 'Capacity Planning'),
('capacity_planner', 'Scalability Planning'),
('inventory_optimizer', 'Inventory Management'),
('inventory_optimizer', 'Supply Chain Management'),
('process_optimizer', 'Process Design'),
('process_optimizer', 'Operational Metrics'),
('risk_assessor', 'Risk Management'),
('risk_assessor', 'Enterprise Risk Management'),

-- Strategy tools relationships
('scenario_planner', 'Scenario Planning'),
('scenario_planner', 'Strategic Planning'),
('competitive_analyzer', 'Competitive Analysis'),
('competitive_analyzer', 'Market Analysis'),
('swot_analyzer', 'Strategic Planning'),
('swot_analyzer', 'Business Strategy'),
('goal_tracker', 'Performance Management'),
('goal_tracker', 'Strategic Objectives')

ON CONFLICT (tool_id, block_id) DO NOTHING;