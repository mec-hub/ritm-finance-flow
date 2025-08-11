
-- Update the content_type enum to include the new content types
ALTER TYPE content_type ADD VALUE IF NOT EXISTS 'davizão_news';
ALTER TYPE content_type ADD VALUE IF NOT EXISTS 'vlog_de_show';
ALTER TYPE content_type ADD VALUE IF NOT EXISTS 'resenha';

-- Note: We cannot remove enum values that are already in use, so we'll keep the existing ones
-- The old values (gameplay, vlog, short) will remain but won't be used in the UI
