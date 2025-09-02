-- Add missing tables and policies for Day 1 Foundation

-- Add manual_logs table (missing from existing schema)
CREATE TABLE IF NOT EXISTS public.manual_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venture_id UUID NOT NULL REFERENCES public.ventures ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  type TEXT CHECK (type IN ('manual', 'google')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on manual_logs
ALTER TABLE public.manual_logs ENABLE ROW LEVEL SECURITY;

-- Manual logs policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'manual_logs' AND policyname = 'Users can view logs for their ventures') THEN
    CREATE POLICY "Users can view logs for their ventures" ON public.manual_logs
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'manual_logs' AND policyname = 'Users can create logs for their ventures') THEN
    CREATE POLICY "Users can create logs for their ventures" ON public.manual_logs
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'manual_logs' AND policyname = 'Users can update their own logs') THEN
    CREATE POLICY "Users can update their own logs" ON public.manual_logs
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'manual_logs' AND policyname = 'Users can delete their own logs') THEN
    CREATE POLICY "Users can delete their own logs" ON public.manual_logs
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Ensure updated_at triggers exist for all tables
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers only if they don't exist
DO $$
BEGIN
  -- Profiles trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  -- Ventures trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_ventures_updated_at') THEN
    CREATE TRIGGER update_ventures_updated_at
      BEFORE UPDATE ON public.ventures
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  -- KPIs trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_kpis_updated_at') THEN
    CREATE TRIGGER update_kpis_updated_at
      BEFORE UPDATE ON public.kpis
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  -- Worksheets trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_worksheets_updated_at') THEN
    CREATE TRIGGER update_worksheets_updated_at
      BEFORE UPDATE ON public.worksheets
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  -- Notes trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_notes_updated_at') THEN
    CREATE TRIGGER update_notes_updated_at
      BEFORE UPDATE ON public.notes
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  -- Chat sessions trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_chat_sessions_updated_at') THEN
    CREATE TRIGGER update_chat_sessions_updated_at
      BEFORE UPDATE ON public.chat_sessions
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  -- Personal trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_personal_updated_at') THEN
    CREATE TRIGGER update_personal_updated_at
      BEFORE UPDATE ON public.personal
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;