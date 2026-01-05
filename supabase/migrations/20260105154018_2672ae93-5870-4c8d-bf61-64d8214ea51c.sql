-- Add project column to time_entries table
ALTER TABLE public.time_entries
ADD COLUMN project TEXT DEFAULT NULL;

-- Create an index for faster filtering by project
CREATE INDEX idx_time_entries_project ON public.time_entries(project);