
-- Add foreign key constraint between video_workflow_comment_acknowledgments and profiles
ALTER TABLE public.video_workflow_comment_acknowledgments 
ADD CONSTRAINT fk_video_workflow_comment_acknowledgments_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
