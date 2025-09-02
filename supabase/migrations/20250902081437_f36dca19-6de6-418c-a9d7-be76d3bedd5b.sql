-- Day 1: Foundation Schema for LaneAI
-- Complete database structure with RLS policies and relationships

-- 1. Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  onboarded BOOLEAN DEFAULT FALSE,
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Ventures table
CREATE TABLE public.ventures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on ventures
ALTER TABLE public.ventures ENABLE ROW LEVEL SECURITY;

-- Ventures policies
CREATE POLICY "Users can view their own ventures" ON public.ventures
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ventures" ON public.ventures
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ventures" ON public.ventures
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ventures" ON public.ventures
  FOR DELETE USING (auth.uid() = user_id);

-- 3. KPIs table
CREATE TABLE public.kpis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venture_id UUID NOT NULL REFERENCES public.ventures ON DELETE CASCADE,
  name TEXT NOT NULL,
  value NUMERIC,
  unit TEXT,
  confidence_label TEXT CHECK (confidence_label IN ('real', 'estimate', 'mock')),
  trend NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on kpis
ALTER TABLE public.kpis ENABLE ROW LEVEL SECURITY;

-- KPIs policies (through venture ownership)
CREATE POLICY "Users can view KPIs for their ventures" ON public.kpis
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ventures 
      WHERE ventures.id = kpis.venture_id 
      AND ventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create KPIs for their ventures" ON public.kpis
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ventures 
      WHERE ventures.id = kpis.venture_id 
      AND ventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update KPIs for their ventures" ON public.kpis
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.ventures 
      WHERE ventures.id = kpis.venture_id 
      AND ventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete KPIs for their ventures" ON public.kpis
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.ventures 
      WHERE ventures.id = kpis.venture_id 
      AND ventures.user_id = auth.uid()
    )
  );

-- 4. Worksheets table
CREATE TABLE public.worksheets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venture_id UUID NOT NULL REFERENCES public.ventures ON DELETE CASCADE,
  type TEXT NOT NULL,
  inputs JSONB DEFAULT '{}',
  outputs JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'live')),
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on worksheets
ALTER TABLE public.worksheets ENABLE ROW LEVEL SECURITY;

-- Worksheets policies (through venture ownership)
CREATE POLICY "Users can view worksheets for their ventures" ON public.worksheets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ventures 
      WHERE ventures.id = worksheets.venture_id 
      AND ventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create worksheets for their ventures" ON public.worksheets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ventures 
      WHERE ventures.id = worksheets.venture_id 
      AND ventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update worksheets for their ventures" ON public.worksheets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.ventures 
      WHERE ventures.id = worksheets.venture_id 
      AND ventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete worksheets for their ventures" ON public.worksheets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.ventures 
      WHERE ventures.id = worksheets.venture_id 
      AND ventures.user_id = auth.uid()
    )
  );

-- 5. Tags table (global)
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on tags (readable by all authenticated users)
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view tags" ON public.tags
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create tags" ON public.tags
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 6. Notes table
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venture_id UUID REFERENCES public.ventures ON DELETE CASCADE,
  context_type TEXT CHECK (context_type IN ('kpi', 'worksheet', 'block', 'personal', 'global')),
  context_id UUID,
  text TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on notes
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Notes policies
CREATE POLICY "Users can view their own notes" ON public.notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes" ON public.notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON public.notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" ON public.notes
  FOR DELETE USING (auth.uid() = user_id);

-- 7. Chat sessions table
CREATE TABLE public.chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  venture_id UUID REFERENCES public.ventures ON DELETE CASCADE,
  block_id UUID,
  title TEXT DEFAULT 'New Chat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on chat_sessions
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Chat sessions policies
CREATE POLICY "Users can view their own chat sessions" ON public.chat_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat sessions" ON public.chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions" ON public.chat_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions" ON public.chat_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- 8. Chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.chat_sessions ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Chat messages policies (through session ownership)
CREATE POLICY "Users can view messages for their chat sessions" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages for their chat sessions" ON public.chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND chat_sessions.user_id = auth.uid()
    )
  );

-- 9. Blocks table (global template blocks)
CREATE TABLE public.blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  template BOOLEAN DEFAULT TRUE,
  venture_id UUID REFERENCES public.ventures ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on blocks
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

-- Blocks policies
CREATE POLICY "Template blocks are viewable by all authenticated users" ON public.blocks
  FOR SELECT USING (template = TRUE AND auth.role() = 'authenticated');

CREATE POLICY "Users can view their own blocks" ON public.blocks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own blocks" ON public.blocks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own blocks" ON public.blocks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own blocks" ON public.blocks
  FOR DELETE USING (auth.uid() = user_id);

-- 10. Manual logs table
CREATE TABLE public.manual_logs (
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
CREATE POLICY "Users can view logs for their ventures" ON public.manual_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create logs for their ventures" ON public.manual_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own logs" ON public.manual_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own logs" ON public.manual_logs
  FOR DELETE USING (auth.uid() = user_id);

-- 11. Personal table
CREATE TABLE public.personal (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users ON DELETE CASCADE,
  savings NUMERIC DEFAULT 0,
  burn NUMERIC DEFAULT 0,
  hours NUMERIC DEFAULT 40,
  commitments JSONB DEFAULT '[]',
  activities JSONB DEFAULT '[]',
  goals JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on personal
ALTER TABLE public.personal ENABLE ROW LEVEL SECURITY;

-- Personal policies
CREATE POLICY "Users can view their own personal data" ON public.personal
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own personal data" ON public.personal
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personal data" ON public.personal
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own personal data" ON public.personal
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at triggers for tables that need them
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ventures_updated_at
  BEFORE UPDATE ON public.ventures
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kpis_updated_at
  BEFORE UPDATE ON public.kpis
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_worksheets_updated_at
  BEFORE UPDATE ON public.worksheets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_personal_updated_at
  BEFORE UPDATE ON public.personal
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY definer SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();