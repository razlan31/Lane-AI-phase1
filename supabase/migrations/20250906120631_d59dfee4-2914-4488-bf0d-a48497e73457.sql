-- Create versions table for unified versioning system
CREATE TABLE public.versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL,
  parent_type TEXT NOT NULL, -- 'scratchpad', 'worksheet', 'venture', 'personal', 'founder_mode'
  user_id UUID NOT NULL,
  content JSONB NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'committed', 'deleted')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.versions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own versions" 
ON public.versions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own versions" 
ON public.versions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own versions" 
ON public.versions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own versions" 
ON public.versions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to auto-increment version numbers
CREATE OR REPLACE FUNCTION public.increment_version_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the highest version number for this parent_id and increment by 1
  SELECT COALESCE(MAX(version_number), 0) + 1 
  INTO NEW.version_number
  FROM public.versions 
  WHERE parent_id = NEW.parent_id AND parent_type = NEW.parent_type;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-incrementing version numbers
CREATE TRIGGER trigger_increment_version_number
BEFORE INSERT ON public.versions
FOR EACH ROW
EXECUTE FUNCTION public.increment_version_number();

-- Create trigger for updating timestamps
CREATE TRIGGER update_versions_updated_at
BEFORE UPDATE ON public.versions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_versions_parent ON public.versions(parent_id, parent_type);
CREATE INDEX idx_versions_user ON public.versions(user_id);
CREATE INDEX idx_versions_status ON public.versions(status);