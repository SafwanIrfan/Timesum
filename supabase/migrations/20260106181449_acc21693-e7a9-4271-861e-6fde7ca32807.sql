-- Rename project column to tag for time entries
ALTER TABLE public.time_entries RENAME COLUMN project TO tag;

-- Add a comment to clarify the column purpose
COMMENT ON COLUMN public.time_entries.tag IS 'Optional label/tag to describe what was done during this time entry';