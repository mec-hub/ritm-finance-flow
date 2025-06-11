
-- Drop the existing function first
DROP FUNCTION IF EXISTS public.get_transactions_with_team_data(uuid);

-- Add attachments column to transactions table
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS attachments text[];

-- Enable realtime for team_transaction_assignments table
ALTER TABLE public.team_transaction_assignments REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_transaction_assignments;

-- Create RLS policies for team_transaction_assignments
ALTER TABLE public.team_transaction_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view team assignments for their transactions" 
  ON public.team_transaction_assignments 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions t 
      WHERE t.id = team_transaction_assignments.transaction_id 
      AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create team assignments for their transactions" 
  ON public.team_transaction_assignments 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.transactions t 
      WHERE t.id = team_transaction_assignments.transaction_id 
      AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update team assignments for their transactions" 
  ON public.team_transaction_assignments 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions t 
      WHERE t.id = team_transaction_assignments.transaction_id 
      AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete team assignments for their transactions" 
  ON public.team_transaction_assignments 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions t 
      WHERE t.id = team_transaction_assignments.transaction_id 
      AND t.user_id = auth.uid()
    )
  );

-- Recreate the function with the new return type including attachments
CREATE OR REPLACE FUNCTION public.get_transactions_with_team_data(user_id_param uuid)
RETURNS TABLE(
  id uuid,
  amount numeric,
  description text,
  date date,
  category text,
  subcategory text,
  is_recurring boolean,
  recurrence_interval text,
  recurrence_months integer,
  type text,
  event_id uuid,
  client_id uuid,
  notes text,
  status text,
  attachments text[],
  team_assignments jsonb
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    t.id,
    t.amount,
    t.description,
    t.date,
    t.category,
    t.subcategory,
    t.is_recurring,
    t.recurrence_interval::text,
    t.recurrence_months,
    t.type::text,
    t.event_id,
    t.client_id,
    t.notes,
    t.status::text,
    t.attachments,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'team_member_id', tta.team_member_id,
          'team_member_name', tm.name,
          'percentage_value', tta.percentage_value
        )
      ) FILTER (WHERE tta.id IS NOT NULL),
      '[]'::jsonb
    ) as team_assignments
  FROM public.transactions t
  LEFT JOIN public.team_transaction_assignments tta ON t.id = tta.transaction_id
  LEFT JOIN public.team_members tm ON tta.team_member_id = tm.id
  WHERE t.user_id = user_id_param
  GROUP BY t.id, t.amount, t.description, t.date, t.category, t.subcategory, 
           t.is_recurring, t.recurrence_interval, t.recurrence_months, t.type, 
           t.event_id, t.client_id, t.notes, t.status, t.attachments
  ORDER BY t.date DESC;
$$;
