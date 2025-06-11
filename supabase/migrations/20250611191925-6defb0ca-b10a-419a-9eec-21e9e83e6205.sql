
-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can create their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clients;

DROP POLICY IF EXISTS "Users can view their own events" ON public.events;
DROP POLICY IF EXISTS "Users can create their own events" ON public.events;
DROP POLICY IF EXISTS "Users can update their own events" ON public.events;
DROP POLICY IF EXISTS "Users can delete their own events" ON public.events;

DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.transactions;

DROP POLICY IF EXISTS "Users can view their own team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can create their own team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can update their own team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can delete their own team members" ON public.team_members;

DROP POLICY IF EXISTS "Users can view assignments for their transactions" ON public.team_transaction_assignments;
DROP POLICY IF EXISTS "Users can create assignments for their transactions" ON public.team_transaction_assignments;
DROP POLICY IF EXISTS "Users can update assignments for their transactions" ON public.team_transaction_assignments;
DROP POLICY IF EXISTS "Users can delete assignments for their transactions" ON public.team_transaction_assignments;

DROP POLICY IF EXISTS "Users can view their own recurring transactions" ON public.recurring_transactions;
DROP POLICY IF EXISTS "Users can create their own recurring transactions" ON public.recurring_transactions;
DROP POLICY IF EXISTS "Users can update their own recurring transactions" ON public.recurring_transactions;
DROP POLICY IF EXISTS "Users can delete their own recurring transactions" ON public.recurring_transactions;

-- Enable RLS on tables that might not have it
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_transaction_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;

-- Create simplified RLS policies for clients
CREATE POLICY "Users can view their own clients" ON public.clients
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own clients" ON public.clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own clients" ON public.clients
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own clients" ON public.clients
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for events
CREATE POLICY "Users can view their own events" ON public.events
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own events" ON public.events
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own events" ON public.events
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for team members
CREATE POLICY "Users can view their own team members" ON public.team_members
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own team members" ON public.team_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own team members" ON public.team_members
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own team members" ON public.team_members
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for team transaction assignments
CREATE POLICY "Users can view assignments for their transactions" ON public.team_transaction_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.transactions t 
      WHERE t.id = team_transaction_assignments.transaction_id 
      AND t.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can create assignments for their transactions" ON public.team_transaction_assignments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.transactions t 
      WHERE t.id = team_transaction_assignments.transaction_id 
      AND t.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update assignments for their transactions" ON public.team_transaction_assignments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.transactions t 
      WHERE t.id = team_transaction_assignments.transaction_id 
      AND t.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete assignments for their transactions" ON public.team_transaction_assignments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.transactions t 
      WHERE t.id = team_transaction_assignments.transaction_id 
      AND t.user_id = auth.uid()
    )
  );

-- Create RLS policies for recurring transactions
CREATE POLICY "Users can view their own recurring transactions" ON public.recurring_transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own recurring transactions" ON public.recurring_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own recurring transactions" ON public.recurring_transactions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own recurring transactions" ON public.recurring_transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Create database function for calculating team member earnings
CREATE OR REPLACE FUNCTION public.calculate_team_member_earnings(member_id uuid, start_date date DEFAULT NULL, end_date date DEFAULT NULL)
RETURNS TABLE (
  total_earnings numeric,
  total_transactions integer,
  avg_percentage numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    COALESCE(SUM(t.amount * (tta.percentage_value / 100)), 0) as total_earnings,
    COUNT(tta.id)::integer as total_transactions,
    COALESCE(AVG(tta.percentage_value), 0) as avg_percentage
  FROM public.team_transaction_assignments tta
  INNER JOIN public.transactions t ON t.id = tta.transaction_id
  WHERE tta.team_member_id = member_id
    AND t.type = 'income'
    AND t.status = 'paid'
    AND (start_date IS NULL OR t.date >= start_date)
    AND (end_date IS NULL OR t.date <= end_date);
$$;

-- Create database function for getting transaction with team assignments
CREATE OR REPLACE FUNCTION public.get_transactions_with_team_data(user_id_param uuid)
RETURNS TABLE (
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
  team_assignments jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
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
           t.event_id, t.client_id, t.notes, t.status
  ORDER BY t.date DESC;
$$;
