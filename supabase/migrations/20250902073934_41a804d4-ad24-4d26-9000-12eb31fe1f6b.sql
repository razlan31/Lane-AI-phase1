-- Create blocks table for the 130 blocks system
CREATE TABLE public.blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venture_id UUID REFERENCES public.ventures(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in-progress', 'complete')),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

-- Create policies for blocks
CREATE POLICY "Users can view blocks for own ventures" 
ON public.blocks 
FOR SELECT 
USING ((auth.uid())::text IN ( 
  SELECT (ventures.user_id)::text AS user_id
  FROM ventures
  WHERE ventures.id = blocks.venture_id
));

CREATE POLICY "Users can create blocks for own ventures" 
ON public.blocks 
FOR INSERT 
WITH CHECK ((auth.uid())::text IN ( 
  SELECT (ventures.user_id)::text AS user_id
  FROM ventures
  WHERE ventures.id = blocks.venture_id
));

CREATE POLICY "Users can update blocks for own ventures" 
ON public.blocks 
FOR UPDATE 
USING ((auth.uid())::text IN ( 
  SELECT (ventures.user_id)::text AS user_id
  FROM ventures
  WHERE ventures.id = blocks.venture_id
));

CREATE POLICY "Users can delete blocks for own ventures" 
ON public.blocks 
FOR DELETE 
USING ((auth.uid())::text IN ( 
  SELECT (ventures.user_id)::text AS user_id
  FROM ventures
  WHERE ventures.id = blocks.venture_id
));

-- Create tags table for better tag management
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for tags (public read, auth write)
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tags" 
ON public.tags 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create tags" 
ON public.tags 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update tags" 
ON public.tags 
FOR UPDATE 
TO authenticated
USING (true);

-- Add confidence_level to KPIs table
ALTER TABLE public.kpis 
ADD COLUMN IF NOT EXISTS confidence_level TEXT DEFAULT 'mock' CHECK (confidence_level IN ('real', 'estimate', 'mock'));

-- Add confidence_level to worksheets table  
ALTER TABLE public.worksheets 
ADD COLUMN IF NOT EXISTS confidence_level TEXT DEFAULT 'mock' CHECK (confidence_level IN ('real', 'estimate', 'mock'));

-- Update notes table to support more context types
ALTER TABLE public.notes 
ADD COLUMN IF NOT EXISTS block_id UUID REFERENCES public.blocks(id) ON DELETE CASCADE;

-- Create trigger for updating timestamps
CREATE TRIGGER update_blocks_updated_at
BEFORE UPDATE ON public.blocks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the 130 default blocks (sample of key blocks across categories)
INSERT INTO public.blocks (venture_id, category, name, description, status) VALUES
-- Market Category (15 blocks)
(null, 'Market', 'Market Size Analysis', 'Analyze total addressable market (TAM), serviceable addressable market (SAM), and serviceable obtainable market (SOM)', 'planned'),
(null, 'Market', 'Competitive Landscape', 'Map direct and indirect competitors, their strengths, weaknesses, and market positioning', 'planned'),
(null, 'Market', 'Customer Personas', 'Define detailed customer personas with demographics, psychographics, and behavioral patterns', 'planned'),
(null, 'Market', 'Market Trends', 'Identify and analyze key market trends affecting your industry', 'planned'),
(null, 'Market', 'Customer Pain Points', 'Document and prioritize customer pain points your venture addresses', 'planned'),
(null, 'Market', 'Market Entry Strategy', 'Define how you will enter and penetrate your target market', 'planned'),
(null, 'Market', 'Geographic Markets', 'Identify and prioritize geographic markets for expansion', 'planned'),
(null, 'Market', 'Market Segmentation', 'Segment your market based on relevant criteria and characteristics', 'planned'),
(null, 'Market', 'Demand Validation', 'Validate market demand through surveys, interviews, and testing', 'planned'),
(null, 'Market', 'Price Sensitivity Analysis', 'Analyze how price changes affect customer demand', 'planned'),
(null, 'Market', 'Market Barriers', 'Identify barriers to market entry and strategies to overcome them', 'planned'),
(null, 'Market', 'Customer Journey Mapping', 'Map the complete customer journey from awareness to advocacy', 'planned'),
(null, 'Market', 'Market Research Plan', 'Create comprehensive plan for ongoing market research', 'planned'),
(null, 'Market', 'Regulatory Environment', 'Understand regulatory requirements and compliance needs', 'planned'),
(null, 'Market', 'Industry Analysis', 'Analyze industry structure, dynamics, and key success factors', 'planned'),

-- Product Category (20 blocks)
(null, 'Product', 'Product Vision', 'Define clear product vision statement and strategic direction', 'planned'),
(null, 'Product', 'Feature Roadmap', 'Plan and prioritize product features over time', 'planned'),
(null, 'Product', 'MVP Definition', 'Define minimum viable product scope and requirements', 'planned'),
(null, 'Product', 'User Experience Design', 'Design intuitive and engaging user experiences', 'planned'),
(null, 'Product', 'Technical Architecture', 'Define technical architecture and technology stack', 'planned'),
(null, 'Product', 'Product Requirements', 'Document detailed functional and non-functional requirements', 'planned'),
(null, 'Product', 'Quality Assurance', 'Establish quality assurance processes and standards', 'planned'),
(null, 'Product', 'User Testing Plan', 'Plan user testing sessions and feedback collection', 'planned'),
(null, 'Product', 'Product Metrics', 'Define key product metrics and success criteria', 'planned'),
(null, 'Product', 'Development Timeline', 'Create realistic development timeline and milestones', 'planned'),
(null, 'Product', 'Technology Risk Assessment', 'Assess technical risks and mitigation strategies', 'planned'),
(null, 'Product', 'Scalability Planning', 'Plan for product scalability and performance requirements', 'planned'),
(null, 'Product', 'Integration Strategy', 'Plan integrations with third-party systems and APIs', 'planned'),
(null, 'Product', 'Security Framework', 'Establish security protocols and data protection measures', 'planned'),
(null, 'Product', 'Product Documentation', 'Create comprehensive product documentation', 'planned'),
(null, 'Product', 'Version Control Strategy', 'Establish version control and release management processes', 'planned'),
(null, 'Product', 'User Onboarding', 'Design effective user onboarding experience', 'planned'),
(null, 'Product', 'Feature Analytics', 'Implement analytics to track feature usage and performance', 'planned'),
(null, 'Product', 'Product Localization', 'Plan product localization for different markets', 'planned'),
(null, 'Product', 'Intellectual Property', 'Identify and protect intellectual property assets', 'planned'),

-- Finance Category (25 blocks)
(null, 'Finance', 'Revenue Model', 'Define how your venture will generate revenue', 'planned'),
(null, 'Finance', 'Pricing Strategy', 'Develop competitive and profitable pricing strategy', 'planned'),
(null, 'Finance', 'Financial Projections', 'Create detailed 3-5 year financial projections', 'planned'),
(null, 'Finance', 'Cash Flow Management', 'Plan and monitor cash flow requirements', 'planned'),
(null, 'Finance', 'Break-even Analysis', 'Calculate break-even point and scenarios', 'planned'),
(null, 'Finance', 'Funding Requirements', 'Determine funding needs and sources', 'planned'),
(null, 'Finance', 'Investment Strategy', 'Develop strategy for seeking and managing investment', 'planned'),
(null, 'Finance', 'Cost Structure', 'Analyze and optimize cost structure', 'planned'),
(null, 'Finance', 'Financial Controls', 'Establish financial controls and reporting systems', 'planned'),
(null, 'Finance', 'Budget Planning', 'Create detailed operational budgets', 'planned'),
(null, 'Finance', 'ROI Analysis', 'Calculate return on investment for key initiatives', 'planned'),
(null, 'Finance', 'Financial Risk Assessment', 'Identify and mitigate financial risks', 'planned'),
(null, 'Finance', 'Tax Strategy', 'Develop tax-efficient structure and strategy', 'planned'),
(null, 'Finance', 'Accounting Systems', 'Establish accounting systems and processes', 'planned'),
(null, 'Finance', 'Financial Reporting', 'Create regular financial reporting framework', 'planned'),
(null, 'Finance', 'Valuation Model', 'Develop venture valuation methodology', 'planned'),
(null, 'Finance', 'Unit Economics', 'Calculate unit economics and contribution margins', 'planned'),
(null, 'Finance', 'Working Capital', 'Manage working capital requirements', 'planned'),
(null, 'Finance', 'Capital Allocation', 'Optimize allocation of financial resources', 'planned'),
(null, 'Finance', 'Financial Scenarios', 'Model various financial scenarios and outcomes', 'planned'),
(null, 'Finance', 'Investor Relations', 'Establish investor communication and reporting', 'planned'),
(null, 'Finance', 'Exit Strategy', 'Plan potential exit strategies and valuations', 'planned'),
(null, 'Finance', 'Grant Opportunities', 'Identify and pursue relevant grant opportunities', 'planned'),
(null, 'Finance', 'Financial Due Diligence', 'Prepare for financial due diligence processes', 'planned'),
(null, 'Finance', 'Currency Risk Management', 'Manage foreign exchange and currency risks', 'planned'),

-- Team Category (15 blocks)
(null, 'Team', 'Organizational Structure', 'Design optimal organizational structure and hierarchy', 'planned'),
(null, 'Team', 'Hiring Plan', 'Create strategic hiring plan and timeline', 'planned'),
(null, 'Team', 'Role Definitions', 'Define clear roles and responsibilities', 'planned'),
(null, 'Team', 'Compensation Strategy', 'Develop competitive compensation and benefits strategy', 'planned'),
(null, 'Team', 'Company Culture', 'Define and cultivate company culture and values', 'planned'),
(null, 'Team', 'Performance Management', 'Establish performance management systems', 'planned'),
(null, 'Team', 'Team Communication', 'Create effective team communication processes', 'planned'),
(null, 'Team', 'Leadership Development', 'Plan leadership development and succession', 'planned'),
(null, 'Team', 'Remote Work Policy', 'Establish remote work policies and tools', 'planned'),
(null, 'Team', 'Training Programs', 'Develop employee training and development programs', 'planned'),
(null, 'Team', 'Equity Distribution', 'Plan equity distribution among team members', 'planned'),
(null, 'Team', 'Advisory Board', 'Recruit and manage advisory board members', 'planned'),
(null, 'Team', 'Employee Handbook', 'Create comprehensive employee handbook', 'planned'),
(null, 'Team', 'Conflict Resolution', 'Establish conflict resolution processes', 'planned'),
(null, 'Team', 'Team Building', 'Plan team building activities and culture initiatives', 'planned'),

-- Operations Category (20 blocks)
(null, 'Operations', 'Business Processes', 'Document and optimize core business processes', 'planned'),
(null, 'Operations', 'Supply Chain', 'Establish reliable supply chain management', 'planned'),
(null, 'Operations', 'Quality Management', 'Implement quality management systems', 'planned'),
(null, 'Operations', 'Vendor Management', 'Manage relationships with key vendors and suppliers', 'planned'),
(null, 'Operations', 'Operational Metrics', 'Define and track key operational metrics', 'planned'),
(null, 'Operations', 'Risk Management', 'Identify and mitigate operational risks', 'planned'),
(null, 'Operations', 'Compliance Framework', 'Ensure compliance with regulations and standards', 'planned'),
(null, 'Operations', 'Customer Support', 'Establish customer support systems and processes', 'planned'),
(null, 'Operations', 'Data Management', 'Implement data collection, storage, and analysis systems', 'planned'),
(null, 'Operations', 'Technology Infrastructure', 'Build scalable technology infrastructure', 'planned'),
(null, 'Operations', 'Security Protocols', 'Implement comprehensive security measures', 'planned'),
(null, 'Operations', 'Disaster Recovery', 'Create disaster recovery and business continuity plans', 'planned'),
(null, 'Operations', 'Inventory Management', 'Optimize inventory levels and management', 'planned'),
(null, 'Operations', 'Facility Management', 'Manage physical facilities and workspace', 'planned'),
(null, 'Operations', 'Environmental Impact', 'Assess and minimize environmental impact', 'planned'),
(null, 'Operations', 'Process Automation', 'Identify opportunities for process automation', 'planned'),
(null, 'Operations', 'Operational Efficiency', 'Continuously improve operational efficiency', 'planned'),
(null, 'Operations', 'Service Level Agreements', 'Define and manage service level agreements', 'planned'),
(null, 'Operations', 'Change Management', 'Establish change management processes', 'planned'),
(null, 'Operations', 'Operational Reporting', 'Create operational reporting and dashboards', 'planned'),

-- Marketing Category (15 blocks)
(null, 'Marketing', 'Brand Strategy', 'Develop comprehensive brand strategy and positioning', 'planned'),
(null, 'Marketing', 'Marketing Mix', 'Define optimal marketing mix (4Ps)', 'planned'),
(null, 'Marketing', 'Digital Marketing', 'Create digital marketing strategy and campaigns', 'planned'),
(null, 'Marketing', 'Content Strategy', 'Develop content marketing strategy and calendar', 'planned'),
(null, 'Marketing', 'Customer Acquisition', 'Plan customer acquisition strategies and channels', 'planned'),
(null, 'Marketing', 'Marketing Analytics', 'Implement marketing analytics and measurement', 'planned'),
(null, 'Marketing', 'Public Relations', 'Develop public relations and media strategy', 'planned'),
(null, 'Marketing', 'Partnership Marketing', 'Establish strategic marketing partnerships', 'planned'),
(null, 'Marketing', 'Event Marketing', 'Plan and execute event marketing initiatives', 'planned'),
(null, 'Marketing', 'Customer Retention', 'Develop customer retention and loyalty programs', 'planned'),
(null, 'Marketing', 'Marketing Budget', 'Allocate and manage marketing budget effectively', 'planned'),
(null, 'Marketing', 'Marketing Technology', 'Implement marketing technology stack', 'planned'),
(null, 'Marketing', 'Influencer Strategy', 'Develop influencer marketing partnerships', 'planned'),
(null, 'Marketing', 'Marketing Automation', 'Implement marketing automation workflows', 'planned'),
(null, 'Marketing', 'Brand Guidelines', 'Create comprehensive brand guidelines', 'planned'),

-- Legal Category (10 blocks)
(null, 'Legal', 'Business Structure', 'Choose and establish optimal business structure', 'planned'),
(null, 'Legal', 'Intellectual Property Protection', 'Protect trademarks, patents, and copyrights', 'planned'),
(null, 'Legal', 'Contracts and Agreements', 'Create standard contracts and legal agreements', 'planned'),
(null, 'Legal', 'Privacy Policy', 'Develop privacy policy and data protection compliance', 'planned'),
(null, 'Legal', 'Terms of Service', 'Create comprehensive terms of service', 'planned'),
(null, 'Legal', 'Employment Law', 'Ensure compliance with employment laws and regulations', 'planned'),
(null, 'Legal', 'Corporate Governance', 'Establish corporate governance framework', 'planned'),
(null, 'Legal', 'Regulatory Compliance', 'Maintain compliance with industry regulations', 'planned'),
(null, 'Legal', 'Legal Risk Management', 'Identify and mitigate legal risks', 'planned'),
(null, 'Legal', 'Legal Documentation', 'Maintain comprehensive legal documentation', 'planned'),

-- Strategy Category (10 blocks)
(null, 'Strategy', 'Strategic Planning', 'Develop comprehensive strategic plan', 'planned'),
(null, 'Strategy', 'Competitive Strategy', 'Define competitive positioning and differentiation', 'planned'),
(null, 'Strategy', 'Growth Strategy', 'Plan sustainable growth strategies', 'planned'),
(null, 'Strategy', 'Innovation Strategy', 'Foster innovation and continuous improvement', 'planned'),
(null, 'Strategy', 'Strategic Partnerships', 'Identify and develop strategic partnerships', 'planned'),
(null, 'Strategy', 'Market Expansion', 'Plan expansion into new markets and segments', 'planned'),
(null, 'Strategy', 'Digital Transformation', 'Lead digital transformation initiatives', 'planned'),
(null, 'Strategy', 'Sustainability Strategy', 'Integrate sustainability into business strategy', 'planned'),
(null, 'Strategy', 'Strategic Metrics', 'Define and track strategic KPIs', 'planned'),
(null, 'Strategy', 'Strategic Review', 'Conduct regular strategic reviews and adjustments', 'planned');