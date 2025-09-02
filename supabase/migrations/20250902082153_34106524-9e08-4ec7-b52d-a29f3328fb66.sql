-- Add policy to allow public read of global blocks (templates)
CREATE POLICY IF NOT EXISTS "Anyone can view global blocks"
ON public.blocks
FOR SELECT
USING (venture_id IS NULL);

-- Seed a library of reusable venture-building blocks (global templates)
-- These are accessible to everyone via the policy above and can be copied into ventures in-app
INSERT INTO public.blocks (name, category, description, status, tags)
VALUES
-- Strategy (8)
('Value Proposition', 'Strategy', 'Define the core value you deliver to customers and why it matters.', 'planned', ARRAY['strategy','lean','value']::text[]),
('Business Model', 'Strategy', 'Outline how the company creates, delivers, and captures value.', 'planned', ARRAY['strategy','model']::text[]),
('Competitive Advantage', 'Strategy', 'Identify sustainable advantages that are hard to copy.', 'planned', ARRAY['moat','differentiation']::text[]),
('Vision and Mission', 'Strategy', 'Articulate long-term vision and near-term mission clearly.', 'planned', ARRAY['vision','mission','narrative']::text[]),
('OKRs', 'Strategy', 'Set objectives and key results for alignment and focus.', 'planned', ARRAY['okr','goals','planning']::text[]),
('Pricing Strategy', 'Strategy', 'Choose pricing model, tiers, and discount strategy.', 'planned', ARRAY['pricing','saas']::text[]),
('Positioning Statement', 'Strategy', 'Craft a clear positioning relative to alternatives.', 'planned', ARRAY['positioning','messaging']::text[]),
('Customer Segments', 'Strategy', 'Map the core customer segments to focus on first.', 'planned', ARRAY['segments','focus']::text[]),

-- Market (8)
('TAM SAM SOM', 'Market', 'Size the market: total, addressable, and obtainable.', 'planned', ARRAY['market','sizing']::text[]),
('ICP Definition', 'Market', 'Define your ideal customer profile with firmographic and behavioral traits.', 'planned', ARRAY['icp','b2b']::text[]),
('Market Segmentation', 'Market', 'Break the market into meaningful segments for targeting.', 'planned', ARRAY['segmentation']::text[]),
('Customer Interviews Plan', 'Market', 'Plan and script discovery interviews to validate problems.', 'planned', ARRAY['discovery','research']::text[]),
('Competitor Landscape', 'Market', 'Map direct and indirect competitors, with feature and pricing comparisons.', 'planned', ARRAY['competitors','landscape']::text[]),
('SWOT Analysis', 'Market', 'Analyze strengths, weaknesses, opportunities, threats.', 'planned', ARRAY['swot','strategy']::text[]),
('Problem Statements', 'Market', 'Write concise problem statements backed by user evidence.', 'planned', ARRAY['problem','validation']::text[]),
('Buyer Personas', 'Market', 'Create primary and secondary personas with jobs-to-be-done.', 'planned', ARRAY['persona','jtbd']::text[]),

-- Product (8)
('MVP Scope', 'Product', 'Define smallest valuable product to validate the thesis.', 'planned', ARRAY['mvp','scope']::text[]),
('Feature Roadmap', 'Product', 'Sequence product releases by impact and effort.', 'planned', ARRAY['roadmap','planning']::text[]),
('User Stories', 'Product', 'Write user stories with acceptance criteria.', 'planned', ARRAY['stories','agile']::text[]),
('UX Wireframes', 'Product', 'Sketch key flows and interfaces before high-fidelity design.', 'planned', ARRAY['ux','wireframe']::text[]),
('Technical Architecture', 'Product', 'Define system components, data flow, and integrations.', 'planned', ARRAY['architecture','tech']::text[]),
('QA Test Plan', 'Product', 'Plan test coverage: unit, integration, E2E.', 'planned', ARRAY['qa','testing']::text[]),
('Release Plan', 'Product', 'Define release trains, rollout strategy, and rollback.', 'planned', ARRAY['release','devops']::text[]),
('Analytics Instrumentation', 'Product', 'Identify key events and metrics to implement analytics.', 'planned', ARRAY['analytics','metrics']::text[]),

-- Go-To-Market (8)
('Launch Plan', 'Go-To-Market', 'Define pre-launch, launch, and post-launch activities.', 'planned', ARRAY['launch','gtm']::text[]),
('Channel Strategy', 'Go-To-Market', 'Choose primary acquisition channels and supporting ones.', 'planned', ARRAY['channels','acquisition']::text[]),
('Content Calendar', 'Go-To-Market', 'Plan content topics, owners, and publishing cadence.', 'planned', ARRAY['content','seo']::text[]),
('Email Drip Campaign', 'Go-To-Market', 'Design onboarding and lifecycle nurturing sequences.', 'planned', ARRAY['email','lifecycle']::text[]),
('SEO Strategy', 'Go-To-Market', 'Keyword targeting, pillar pages, and technical SEO.', 'planned', ARRAY['seo','organic']::text[]),
('Sales Playbook', 'Go-To-Market', 'Discovery questions, objection handling, and demo flow.', 'planned', ARRAY['sales','playbook']::text[]),
('Partnerships', 'Go-To-Market', 'Identify and prioritize strategic partners and channels.', 'planned', ARRAY['partners','alliances']::text[]),
('Onboarding Funnel', 'Go-To-Market', 'Map and optimize activation funnel and in-product onboarding.', 'planned', ARRAY['onboarding','activation']::text[]),

-- Operations (8)
('Processes Map', 'Operations', 'Document core business processes and owners.', 'planned', ARRAY['process','ops']::text[]),
('Vendor List', 'Operations', 'Track critical vendors, contracts, and renewals.', 'planned', ARRAY['vendor','procurement']::text[]),
('SLAs', 'Operations', 'Define internal and external service level agreements.', 'planned', ARRAY['sla','reliability']::text[]),
('Runbooks', 'Operations', 'Create runbooks for repetitive and incident workflows.', 'planned', ARRAY['runbook','sop']::text[]),
('Incident Response', 'Operations', 'Define severity, escalation, and comms protocols.', 'planned', ARRAY['incident','security']::text[]),
('Data Governance', 'Operations', 'Set data ownership, quality, and lifecycle policies.', 'planned', ARRAY['data','governance']::text[]),
('Security Checklist', 'Operations', 'Baseline security controls and periodic reviews.', 'planned', ARRAY['security','compliance']::text[]),
('KPI Dashboard', 'Operations', 'Define core KPIs and reporting cadence.', 'planned', ARRAY['kpi','reporting']::text[]),

-- Finance (8)
('Budget', 'Finance', 'Create an annual and quarterly operating budget.', 'planned', ARRAY['budget','planning']::text[]),
('Revenue Model', 'Finance', 'Model revenue streams and pricing assumptions.', 'planned', ARRAY['revenue','model']::text[]),
('Unit Economics', 'Finance', 'Calculate per-customer economics including margin.', 'planned', ARRAY['unit','economics']::text[]),
('CAC vs LTV', 'Finance', 'Track acquisition cost versus lifetime value.', 'planned', ARRAY['cac','ltv']::text[]),
('Burn Rate', 'Finance', 'Monitor monthly net burn and drivers.', 'planned', ARRAY['burn','cash']::text[]),
('Runway', 'Finance', 'Project cash runway under scenarios.', 'planned', ARRAY['runway','forecast']::text[]),
('Fundraising Plan', 'Finance', 'Define target round, timeline, and story arcs.', 'planned', ARRAY['fundraising','plan']::text[]),
('Financial Projections', 'Finance', '3-statement model with key drivers and scenarios.', 'planned', ARRAY['fp&a','model']::text[]),

-- Team (8)
('Org Chart', 'Team', 'Define current and target organizational structure.', 'planned', ARRAY['org','structure']::text[]),
('Hiring Plan', 'Team', 'Prioritize roles, timelines, and budget for hiring.', 'planned', ARRAY['hiring','recruiting']::text[]),
('Role Definitions', 'Team', 'Write clear role scopes and competencies.', 'planned', ARRAY['roles','hr']::text[]),
('Culture Principles', 'Team', 'Document values and operating principles.', 'planned', ARRAY['culture','values']::text[]),
('Performance Reviews', 'Team', 'Define cadence and rubric for reviews.', 'planned', ARRAY['performance','reviews']::text[]),
('Compensation Bands', 'Team', 'Create salary and equity bands by level.', 'planned', ARRAY['comp','equity']::text[]),
('Onboarding Checklist', 'Team', 'Standardize new hire onboarding steps.', 'planned', ARRAY['onboarding','hr']::text[]),
('Advisory Board', 'Team', 'Identify advisors, roles, and engagement model.', 'planned', ARRAY['advisors','governance']::text[]),

-- Legal (8)
('Incorporation', 'Legal', 'Select entity, jurisdiction, and run incorporation steps.', 'planned', ARRAY['legal','incorporation']::text[]),
('IP Strategy', 'Legal', 'Protect IP: copyrights, trademarks, patents.', 'planned', ARRAY['ip','patent']::text[]),
('Privacy Policy', 'Legal', 'Draft and publish a compliant privacy policy.', 'planned', ARRAY['privacy','policy']::text[]),
('Terms of Service', 'Legal', 'Draft standard terms and acceptable use.', 'planned', ARRAY['tos','legal']::text[]),
('Data Processing Agreement', 'Legal', 'Create DPA templates for processors.', 'planned', ARRAY['dpa','gdpr']::text[]),
('Contracts Templates', 'Legal', 'Standardize MSAs, SOWs, NDAs, and order forms.', 'planned', ARRAY['contracts','templates']::text[]),
('Compliance Checklist', 'Legal', 'Track applicable frameworks and obligations.', 'planned', ARRAY['compliance','audit']::text[]),
('Risk Register', 'Legal', 'Centralize and track legal and regulatory risks.', 'planned', ARRAY['risk','legal']::text[]),

-- Fundraising (8)
('Pitch Deck', 'Fundraising', 'Create a compelling narrative and deck structure.', 'planned', ARRAY['deck','story']::text[]),
('Investor CRM', 'Fundraising', 'Track investors, stages, and follow-ups.', 'planned', ARRAY['crm','investors']::text[]),
('Target List', 'Fundraising', 'Build a list of aligned firms and angels.', 'planned', ARRAY['targets','outreach']::text[]),
('Narrative', 'Fundraising', 'Craft the investment thesis and why now.', 'planned', ARRAY['narrative','why-now']::text[]),
('Data Room', 'Fundraising', 'Assemble materials for diligence and sharing.', 'planned', ARRAY['data-room','diligence']::text[]),
('KPI Snapshot', 'Fundraising', 'Summarize key traction metrics for updates.', 'planned', ARRAY['kpi','updates']::text[]),
('Milestones', 'Fundraising', 'Define milestones to raise at better terms.', 'planned', ARRAY['milestones','roadmap']::text[]),
('Use of Funds', 'Fundraising', 'Allocate funds across priorities and timelines.', 'planned', ARRAY['use-of-funds','budget']::text[]),

-- Risk (8)
('Risk Matrix', 'Risk', 'Assess likelihood and impact across categories.', 'planned', ARRAY['risk','matrix']::text[]),
('Assumptions Log', 'Risk', 'Track critical assumptions and validation plan.', 'planned', ARRAY['assumptions','validation']::text[]),
('Contingency Plan', 'Risk', 'Define mitigations and triggers for key risks.', 'planned', ARRAY['contingency','plan']::text[]),
('Dependency Map', 'Risk', 'Visualize dependencies and single points of failure.', 'planned', ARRAY['dependency','map']::text[]),
('Security Risks', 'Risk', 'Catalog security threats and mitigations.', 'planned', ARRAY['security','risks']::text[]),
('Market Risks', 'Risk', 'Identify market-related threats and trends.', 'planned', ARRAY['market','risks']::text[]),
('Operational Risks', 'Risk', 'List operational risks and owners.', 'planned', ARRAY['ops','risks']::text[]),
('Technical Risks', 'Risk', 'Document technical risks and experiments.', 'planned', ARRAY['tech','risks']::text[]);
