
-- Create enum for video workflow stages
CREATE TYPE video_stage AS ENUM (
  'scripted',
  'recorded', 
  'editing',
  'awaiting_review',
  'approved'
);

-- Create enum for content types
CREATE TYPE content_type AS ENUM (
  'tutorial',
  'review',
  'gameplay',
  'vlog',
  'short',
  'livestream',
  'other'
);

-- Create enum for activity types
CREATE TYPE activity_type AS ENUM (
  'created',
  'moved',
  'commented',
  'approved',
  'rejected'
);

-- Create video workflow items table
CREATE TABLE video_workflow_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content_type content_type NOT NULL DEFAULT 'other',
  script_link TEXT,
  drive_link TEXT,
  estimated_publication_date DATE,
  current_stage video_stage NOT NULL DEFAULT 'scripted',
  description TEXT,
  thumbnail_url TEXT,
  priority INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create comments table for video items
CREATE TABLE video_workflow_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_item_id UUID NOT NULL REFERENCES video_workflow_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create approvals table
CREATE TABLE video_workflow_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_item_id UUID NOT NULL REFERENCES video_workflow_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  approved BOOLEAN NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(video_item_id, user_id)
);

-- Create activity log table
CREATE TABLE video_workflow_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_item_id UUID NOT NULL REFERENCES video_workflow_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  activity_type activity_type NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create archived items table for completed workflows
CREATE TABLE video_workflow_archived (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_item_id UUID NOT NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content_type content_type NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  final_publication_date DATE,
  approval_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'
);

-- Enable Row Level Security
ALTER TABLE video_workflow_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_workflow_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_workflow_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_workflow_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_workflow_archived ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for video_workflow_items
CREATE POLICY "Users can view their own workflow items" 
  ON video_workflow_items FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workflow items" 
  ON video_workflow_items FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflow items" 
  ON video_workflow_items FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflow items" 
  ON video_workflow_items FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for video_workflow_comments
CREATE POLICY "Users can view comments on their workflow items" 
  ON video_workflow_comments FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM video_workflow_items 
    WHERE id = video_workflow_comments.video_item_id 
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create comments on their workflow items" 
  ON video_workflow_comments FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM video_workflow_items 
      WHERE id = video_workflow_comments.video_item_id 
      AND user_id = auth.uid()
    )
  );

-- Create RLS policies for video_workflow_approvals
CREATE POLICY "Users can view approvals on their workflow items" 
  ON video_workflow_approvals FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM video_workflow_items 
    WHERE id = video_workflow_approvals.video_item_id 
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create approvals on their workflow items" 
  ON video_workflow_approvals FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM video_workflow_items 
      WHERE id = video_workflow_approvals.video_item_id 
      AND user_id = auth.uid()
    )
  );

-- Create RLS policies for video_workflow_activities
CREATE POLICY "Users can view activities on their workflow items" 
  ON video_workflow_activities FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM video_workflow_items 
    WHERE id = video_workflow_activities.video_item_id 
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create activities on their workflow items" 
  ON video_workflow_activities FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM video_workflow_items 
      WHERE id = video_workflow_activities.video_item_id 
      AND user_id = auth.uid()
    )
  );

-- Create RLS policies for video_workflow_archived
CREATE POLICY "Users can view their own archived items" 
  ON video_workflow_archived FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own archived items" 
  ON video_workflow_archived FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_video_workflow_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_video_workflow_items_updated_at
  BEFORE UPDATE ON video_workflow_items
  FOR EACH ROW
  EXECUTE FUNCTION update_video_workflow_updated_at();

-- Create function to automatically log stage changes
CREATE OR REPLACE FUNCTION log_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.current_stage IS DISTINCT FROM NEW.current_stage THEN
    INSERT INTO video_workflow_activities (
      video_item_id,
      user_id,
      activity_type,
      description,
      metadata
    ) VALUES (
      NEW.id,
      auth.uid(),
      'moved',
      'Moved from ' || OLD.current_stage || ' to ' || NEW.current_stage,
      jsonb_build_object(
        'from_stage', OLD.current_stage,
        'to_stage', NEW.current_stage
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_video_stage_changes
  AFTER UPDATE ON video_workflow_items
  FOR EACH ROW
  EXECUTE FUNCTION log_stage_change();
