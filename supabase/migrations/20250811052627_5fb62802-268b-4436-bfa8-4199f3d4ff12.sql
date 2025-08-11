
-- Create a table for comment acknowledgments
CREATE TABLE public.video_workflow_comment_acknowledgments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.video_workflow_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  acknowledged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Add Row Level Security (RLS)
ALTER TABLE public.video_workflow_comment_acknowledgments ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view acknowledgments on their workflow items
CREATE POLICY "Users can view acknowledgments on their workflow items" 
  ON public.video_workflow_comment_acknowledgments 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM video_workflow_comments c
    JOIN video_workflow_items i ON c.video_item_id = i.id
    WHERE c.id = video_workflow_comment_acknowledgments.comment_id 
    AND i.user_id = auth.uid()
  ));

-- Create policy that allows users to create acknowledgments on their workflow items
CREATE POLICY "Users can create acknowledgments on their workflow items" 
  ON public.video_workflow_comment_acknowledgments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM video_workflow_comments c
    JOIN video_workflow_items i ON c.video_item_id = i.id
    WHERE c.id = video_workflow_comment_acknowledgments.comment_id 
    AND i.user_id = auth.uid()
  ));

-- Create policy that allows users to delete their own acknowledgments
CREATE POLICY "Users can delete their own acknowledgments" 
  ON public.video_workflow_comment_acknowledgments 
  FOR DELETE 
  USING (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM video_workflow_comments c
    JOIN video_workflow_items i ON c.video_item_id = i.id
    WHERE c.id = video_workflow_comment_acknowledgments.comment_id 
    AND i.user_id = auth.uid()
  ));

-- Create foreign key constraint to profiles table for user name retrieval
CREATE INDEX idx_comment_acknowledgments_user_id ON public.video_workflow_comment_acknowledgments(user_id);
CREATE INDEX idx_comment_acknowledgments_comment_id ON public.video_workflow_comment_acknowledgments(comment_id);
