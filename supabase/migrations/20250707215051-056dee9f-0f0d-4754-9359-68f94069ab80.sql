
-- Create a dedicated categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  user_id UUID NOT NULL,
  display_order INTEGER DEFAULT 0,
  color TEXT DEFAULT '#6B7280',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT categories_name_user_unique UNIQUE(name, user_id)
);

-- Add Row Level Security (RLS) for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
CREATE POLICY "Users can view their own categories" 
  ON public.categories 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own categories" 
  ON public.categories 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" 
  ON public.categories 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" 
  ON public.categories 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add foreign key constraint to transactions table to reference categories by name
-- This maintains compatibility with existing transaction data
ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_category_name_check 
CHECK (category IS NOT NULL);

-- Insert default categories for existing users who have transactions
INSERT INTO public.categories (name, user_id, display_order)
SELECT DISTINCT 
  category, 
  user_id,
  ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY category) as display_order
FROM public.transactions 
WHERE category IS NOT NULL
ON CONFLICT (name, user_id) DO NOTHING;

-- Insert common default categories for users who don't have any categories yet
INSERT INTO public.categories (name, user_id, display_order)
SELECT 
  unnest(ARRAY['Shows', 'Eventos', 'Publicidade', 'Equipamento', 'Transporte', 'Alimentação', 'Hospedagem', 'Pessoal', 'Marketing', 'Outros']) as category_name,
  u.id as user_id,
  generate_series(1, 10) as display_order
FROM (SELECT DISTINCT user_id as id FROM public.transactions) u
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories c WHERE c.user_id = u.id
)
ON CONFLICT (name, user_id) DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER categories_updated_at_trigger
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_updated_at();
