
-- Add unique constraint on user_id column to fix the upsert operation
ALTER TABLE public.youtube_tokens 
ADD CONSTRAINT youtube_tokens_user_id_unique UNIQUE (user_id);
