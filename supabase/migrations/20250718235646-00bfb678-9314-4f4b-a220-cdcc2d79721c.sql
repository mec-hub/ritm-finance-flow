
-- Create budgets table
CREATE TABLE public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  budget_type TEXT DEFAULT 'general',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived', 'completed')),
  amount NUMERIC,
  period_start DATE,
  period_end DATE,
  external_url TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create budget_attachments table
CREATE TABLE public.budget_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for budget attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('budget-attachments', 'budget-attachments', true);

-- Enable RLS on budgets table
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for budgets
CREATE POLICY "Users can view their own budgets" 
  ON public.budgets 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budgets" 
  ON public.budgets 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets" 
  ON public.budgets 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets" 
  ON public.budgets 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable RLS on budget_attachments table
ALTER TABLE public.budget_attachments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for budget_attachments
CREATE POLICY "Users can view attachments for their budgets" 
  ON public.budget_attachments 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.budgets 
    WHERE budgets.id = budget_attachments.budget_id 
    AND budgets.user_id = auth.uid()
  ));

CREATE POLICY "Users can create attachments for their budgets" 
  ON public.budget_attachments 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.budgets 
    WHERE budgets.id = budget_attachments.budget_id 
    AND budgets.user_id = auth.uid()
  ));

CREATE POLICY "Users can update attachments for their budgets" 
  ON public.budget_attachments 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.budgets 
    WHERE budgets.id = budget_attachments.budget_id 
    AND budgets.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete attachments for their budgets" 
  ON public.budget_attachments 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.budgets 
    WHERE budgets.id = budget_attachments.budget_id 
    AND budgets.user_id = auth.uid()
  ));

-- Create storage policies for budget-attachments bucket
CREATE POLICY "Users can view budget attachments" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'budget-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload budget attachments" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'budget-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update budget attachments" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'budget-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete budget attachments" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'budget-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add trigger for updated_at on budgets table
CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
