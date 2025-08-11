
-- Fix database foreign key relationships and RLS policies

-- Add foreign key constraints to enable automatic joins
ALTER TABLE video_workflow_activities 
ADD CONSTRAINT fk_video_workflow_activities_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE video_workflow_comments 
ADD CONSTRAINT fk_video_workflow_comments_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE video_workflow_approvals 
ADD CONSTRAINT fk_video_workflow_approvals_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add foreign key constraints to video_workflow_items
ALTER TABLE video_workflow_activities 
ADD CONSTRAINT fk_video_workflow_activities_video_item_id 
FOREIGN KEY (video_item_id) REFERENCES video_workflow_items(id) ON DELETE CASCADE;

ALTER TABLE video_workflow_comments 
ADD CONSTRAINT fk_video_workflow_comments_video_item_id 
FOREIGN KEY (video_item_id) REFERENCES video_workflow_items(id) ON DELETE CASCADE;

ALTER TABLE video_workflow_approvals 
ADD CONSTRAINT fk_video_workflow_approvals_video_item_id 
FOREIGN KEY (video_item_id) REFERENCES video_workflow_items(id) ON DELETE CASCADE;

-- Drop and recreate RLS policies for video_workflow_approvals to fix the violations
DROP POLICY IF EXISTS "Users can create approvals on their workflow items" ON video_workflow_approvals;
DROP POLICY IF EXISTS "Users can view approvals on their workflow items" ON video_workflow_approvals;

-- Create improved RLS policies for approvals
CREATE POLICY "Users can create approvals on their workflow items" 
  ON video_workflow_approvals 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM video_workflow_items 
      WHERE id = video_workflow_approvals.video_item_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view approvals on their workflow items" 
  ON video_workflow_approvals 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM video_workflow_items 
      WHERE id = video_workflow_approvals.video_item_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update approvals on their workflow items" 
  ON video_workflow_approvals 
  FOR UPDATE 
  USING (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM video_workflow_items 
      WHERE id = video_workflow_approvals.video_item_id 
      AND user_id = auth.uid()
    )
  );

-- Add UPDATE and DELETE policies for comments if needed
CREATE POLICY "Users can update comments on their workflow items" 
  ON video_workflow_comments 
  FOR UPDATE 
  USING (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM video_workflow_items 
      WHERE id = video_workflow_comments.video_item_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete comments on their workflow items" 
  ON video_workflow_comments 
  FOR DELETE 
  USING (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM video_workflow_items 
      WHERE id = video_workflow_comments.video_item_id 
      AND user_id = auth.uid()
    )
  );

-- Add UPDATE and DELETE policies for activities if needed
CREATE POLICY "Users can update activities on their workflow items" 
  ON video_workflow_activities 
  FOR UPDATE 
  USING (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM video_workflow_items 
      WHERE id = video_workflow_activities.video_item_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete activities on their workflow items" 
  ON video_workflow_activities 
  FOR DELETE 
  USING (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM video_workflow_items 
      WHERE id = video_workflow_activities.video_item_id 
      AND user_id = auth.uid()
    )
  );
