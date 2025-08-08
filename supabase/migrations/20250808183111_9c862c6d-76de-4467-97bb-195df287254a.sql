
-- Create YouTube tokens table for OAuth authentication
CREATE TABLE public.youtube_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  channel_id TEXT NOT NULL,
  channel_title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create YouTube cache table for API response caching
CREATE TABLE public.youtube_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  cache_key TEXT NOT NULL,
  cache_data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, cache_key)
);

-- Enable RLS for youtube_tokens table
ALTER TABLE public.youtube_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own YouTube tokens" 
  ON public.youtube_tokens 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own YouTube tokens" 
  ON public.youtube_tokens 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own YouTube tokens" 
  ON public.youtube_tokens 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own YouTube tokens" 
  ON public.youtube_tokens 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable RLS for youtube_cache table
ALTER TABLE public.youtube_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own YouTube cache" 
  ON public.youtube_cache 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own YouTube cache" 
  ON public.youtube_cache 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own YouTube cache" 
  ON public.youtube_cache 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own YouTube cache" 
  ON public.youtube_cache 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_youtube_tokens_updated_at
  BEFORE UPDATE ON public.youtube_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
