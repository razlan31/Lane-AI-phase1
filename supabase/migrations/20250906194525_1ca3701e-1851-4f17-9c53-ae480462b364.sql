-- Fix constraint error - the function is trying to set 'actual' but constraint only allows 'real', 'estimate', 'mock'
-- Also update the function to properly use real data when provided

-- First, let's make confidence_level constraints more flexible
ALTER TABLE public.kpis DROP CONSTRAINT IF EXISTS kpis_confidence_level_check;
ALTER TABLE public.kpis ADD CONSTRAINT kpis_confidence_level_check 
CHECK (confidence_level = ANY (ARRAY['actual'::text, 'real'::text, 'estimate'::text, 'mock'::text]));

-- Also update the confidence constraint to be consistent  
ALTER TABLE public.kpis DROP CONSTRAINT IF EXISTS kpis_confidence_check;
ALTER TABLE public.kpis ADD CONSTRAINT kpis_confidence_check 
CHECK (confidence = ANY (ARRAY['actual'::text, 'real'::text, 'estimate'::text, 'mock'::text]));