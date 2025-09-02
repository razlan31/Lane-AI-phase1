-- Fix critical security issues: Replace dev policies with proper user-based RLS

-- Drop development policies that allow everything
DROP POLICY IF EXISTS "timeline_dev_policy" ON timeline_events;
DROP POLICY IF EXISTS "worksheets_dev_policy" ON worksheets;

-- Create proper RLS policies for timeline_events
CREATE POLICY "Users can view own timeline events" ON timeline_events
  FOR SELECT 
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create own timeline events" ON timeline_events
  FOR INSERT 
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own timeline events" ON timeline_events
  FOR UPDATE 
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own timeline events" ON timeline_events
  FOR DELETE 
  USING (user_id = auth.uid()::text);

-- Create proper RLS policies for worksheets
CREATE POLICY "Users can view own worksheets" ON worksheets
  FOR SELECT 
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create own worksheets" ON worksheets
  FOR INSERT 
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own worksheets" ON worksheets
  FOR UPDATE 
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own worksheets" ON worksheets
  FOR DELETE 
  USING (user_id = auth.uid()::text);