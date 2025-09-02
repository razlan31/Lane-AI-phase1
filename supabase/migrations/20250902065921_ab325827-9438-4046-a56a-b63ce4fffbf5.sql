-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ventures table
CREATE TABLE public.ventures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT,
  stage TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create kpis table
CREATE TABLE public.kpis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venture_id UUID NOT NULL REFERENCES public.ventures(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value NUMERIC,
  confidence TEXT CHECK (confidence IN ('real','estimate','mock')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notes table
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  venture_id UUID NULL REFERENCES public.ventures(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  tags TEXT[],
  context_type TEXT CHECK (context_type IN ('global','kpi','worksheet','decision','personal')),
  context_id UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_sessions table
CREATE TABLE public.chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  venture_id UUID NULL REFERENCES public.ventures(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('system','user','assistant')) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ventures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid()::text = id::text);

-- Create RLS policies for ventures
CREATE POLICY "Users can view own ventures" 
ON public.ventures 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own ventures" 
ON public.ventures 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own ventures" 
ON public.ventures 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own ventures" 
ON public.ventures 
FOR DELETE 
USING (auth.uid()::text = user_id::text);

-- Create RLS policies for kpis
CREATE POLICY "Users can view own venture kpis" 
ON public.kpis 
FOR SELECT 
USING (auth.uid()::text IN (
  SELECT user_id::text FROM public.ventures WHERE id = venture_id
));

CREATE POLICY "Users can create kpis for own ventures" 
ON public.kpis 
FOR INSERT 
WITH CHECK (auth.uid()::text IN (
  SELECT user_id::text FROM public.ventures WHERE id = venture_id
));

CREATE POLICY "Users can update kpis for own ventures" 
ON public.kpis 
FOR UPDATE 
USING (auth.uid()::text IN (
  SELECT user_id::text FROM public.ventures WHERE id = venture_id
));

CREATE POLICY "Users can delete kpis for own ventures" 
ON public.kpis 
FOR DELETE 
USING (auth.uid()::text IN (
  SELECT user_id::text FROM public.ventures WHERE id = venture_id
));

-- Create RLS policies for notes
CREATE POLICY "Users can view own notes" 
ON public.notes 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own notes" 
ON public.notes 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own notes" 
ON public.notes 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own notes" 
ON public.notes 
FOR DELETE 
USING (auth.uid()::text = user_id::text);

-- Create RLS policies for chat_sessions
CREATE POLICY "Users can view own chat sessions" 
ON public.chat_sessions 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own chat sessions" 
ON public.chat_sessions 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own chat sessions" 
ON public.chat_sessions 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own chat sessions" 
ON public.chat_sessions 
FOR DELETE 
USING (auth.uid()::text = user_id::text);

-- Create RLS policies for chat_messages
CREATE POLICY "Users can view messages from own sessions" 
ON public.chat_messages 
FOR SELECT 
USING (auth.uid()::text IN (
  SELECT user_id::text FROM public.chat_sessions WHERE id = session_id
));

CREATE POLICY "Users can create messages in own sessions" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (auth.uid()::text IN (
  SELECT user_id::text FROM public.chat_sessions WHERE id = session_id
));

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ventures_updated_at
    BEFORE UPDATE ON public.ventures
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kpis_updated_at
    BEFORE UPDATE ON public.kpis
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON public.notes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at
    BEFORE UPDATE ON public.chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create profile trigger for new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();