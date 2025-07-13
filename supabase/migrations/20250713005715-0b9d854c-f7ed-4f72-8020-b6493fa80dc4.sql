
-- Add time fields to the events table
ALTER TABLE public.events 
ADD COLUMN start_time time,
ADD COLUMN end_time time;
