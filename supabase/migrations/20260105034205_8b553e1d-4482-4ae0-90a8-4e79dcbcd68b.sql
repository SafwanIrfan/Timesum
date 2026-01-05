-- Create monthly_periods table to track closed months
CREATE TABLE public.monthly_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2000 AND year <= 2100),
  is_closed BOOLEAN NOT NULL DEFAULT false,
  closed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, month, year)
);

-- Add period_id to time_entries to link entries to a specific month
ALTER TABLE public.time_entries 
ADD COLUMN period_id UUID REFERENCES public.monthly_periods(id) ON DELETE CASCADE;

-- Enable RLS on monthly_periods
ALTER TABLE public.monthly_periods ENABLE ROW LEVEL SECURITY;

-- RLS policies for monthly_periods
CREATE POLICY "Users can view their own periods" 
ON public.monthly_periods 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own periods" 
ON public.monthly_periods 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own periods" 
ON public.monthly_periods 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own periods" 
ON public.monthly_periods 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_monthly_periods_updated_at
BEFORE UPDATE ON public.monthly_periods
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();