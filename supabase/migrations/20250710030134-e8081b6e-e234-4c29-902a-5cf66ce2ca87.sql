
-- Add new location-related columns to the events table
ALTER TABLE public.events 
ADD COLUMN place_name TEXT,
ADD COLUMN formatted_address TEXT,
ADD COLUMN latitude NUMERIC,
ADD COLUMN longitude NUMERIC,
ADD COLUMN place_id TEXT;

-- Create an index on place_id for efficient lookups
CREATE INDEX IF NOT EXISTS idx_events_place_id ON public.events(place_id);

-- Create indexes on latitude and longitude for geospatial queries
CREATE INDEX IF NOT EXISTS idx_events_coordinates ON public.events(latitude, longitude);
