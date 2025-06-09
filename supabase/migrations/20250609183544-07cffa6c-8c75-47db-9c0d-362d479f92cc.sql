
-- Drop all existing policies on all tables to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Also drop any other existing policies that might exist
DROP POLICY IF EXISTS "Users can view their own clients or admins can view all" ON public.clients;
DROP POLICY IF EXISTS "Users can create their own clients or admins can create any" ON public.clients;
DROP POLICY IF EXISTS "Users can update their own clients or admins can update any" ON public.clients;
DROP POLICY IF EXISTS "Users can delete their own clients or admins can delete any" ON public.clients;

DROP POLICY IF EXISTS "Users can view their own events or admins can view all" ON public.events;
DROP POLICY IF EXISTS "Users can create their own events or admins can create any" ON public.events;
DROP POLICY IF EXISTS "Users can update their own events or admins can update any" ON public.events;
DROP POLICY IF EXISTS "Users can delete their own events or admins can delete any" ON public.events;

DROP POLICY IF EXISTS "Users can view their own transactions or admins can view all" ON public.transactions;
DROP POLICY IF EXISTS "Users can create their own transactions or admins can create any" ON public.transactions;
DROP POLICY IF EXISTS "Users can update their own transactions or admins can update any" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions or admins can delete any" ON public.transactions;

DROP POLICY IF EXISTS "Users can view their own team members or admins can view all" ON public.team_members;
DROP POLICY IF EXISTS "Users can create their own team members or admins can create any" ON public.team_members;
DROP POLICY IF EXISTS "Users can update their own team members or admins can update any" ON public.team_members;
DROP POLICY IF EXISTS "Users can delete their own team members or admins can delete any" ON public.team_members;

DROP POLICY IF EXISTS "Users can view their own recurring transactions or admins can view all" ON public.recurring_transactions;
DROP POLICY IF EXISTS "Users can create their own recurring transactions or admins can create any" ON public.recurring_transactions;
DROP POLICY IF EXISTS "Users can update their own recurring transactions or admins can update any" ON public.recurring_transactions;
DROP POLICY IF EXISTS "Users can delete their own recurring transactions or admins can delete any" ON public.recurring_transactions;

-- Create the security definer function (this might already exist, but it's safe to recreate)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(role, 'user'::app_role) FROM public.profiles WHERE id = auth.uid();
$$;

-- Now create all the policies fresh
-- Clients policies
CREATE POLICY "Users can view their own clients or admins can view all" 
  ON public.clients 
  FOR SELECT 
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    public.get_current_user_role() = 'admin'::app_role
  );

CREATE POLICY "Users can create their own clients or admins can create any" 
  ON public.clients 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR 
    public.get_current_user_role() = 'admin'::app_role
  );

CREATE POLICY "Users can update their own clients or admins can update any" 
  ON public.clients 
  FOR UPDATE 
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    public.get_current_user_role() = 'admin'::app_role
  );

CREATE POLICY "Users can delete their own clients or admins can delete any" 
  ON public.clients 
  FOR DELETE 
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    public.get_current_user_role() = 'admin'::app_role
  );

-- Events policies
CREATE POLICY "Users can view their own events or admins can view all" 
  ON public.events 
  FOR SELECT 
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    public.get_current_user_role() = 'admin'::app_role
  );

CREATE POLICY "Users can create their own events or admins can create any" 
  ON public.events 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR 
    public.get_current_user_role() = 'admin'::app_role
  );

CREATE POLICY "Users can update their own events or admins can update any" 
  ON public.events 
  FOR UPDATE 
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    public.get_current_user_role() = 'admin'::app_role
  );

CREATE POLICY "Users can delete their own events or admins can delete any" 
  ON public.events 
  FOR DELETE 
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    public.get_current_user_role() = 'admin'::app_role
  );

-- Transactions policies
CREATE POLICY "Users can view their own transactions or admins can view all" 
  ON public.transactions 
  FOR SELECT 
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    public.get_current_user_role() = 'admin'::app_role
  );

CREATE POLICY "Users can create their own transactions or admins can create any" 
  ON public.transactions 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR 
    public.get_current_user_role() = 'admin'::app_role
  );

CREATE POLICY "Users can update their own transactions or admins can update any" 
  ON public.transactions 
  FOR UPDATE 
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    public.get_current_user_role() = 'admin'::app_role
  );

CREATE POLICY "Users can delete their own transactions or admins can delete any" 
  ON public.transactions 
  FOR DELETE 
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    public.get_current_user_role() = 'admin'::app_role
  );

-- Team members policies
CREATE POLICY "Users can view their own team members or admins can view all" 
  ON public.team_members 
  FOR SELECT 
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    public.get_current_user_role() = 'admin'::app_role
  );

CREATE POLICY "Users can create their own team members or admins can create any" 
  ON public.team_members 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR 
    public.get_current_user_role() = 'admin'::app_role
  );

CREATE POLICY "Users can update their own team members or admins can update any" 
  ON public.team_members 
  FOR UPDATE 
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    public.get_current_user_role() = 'admin'::app_role
  );

CREATE POLICY "Users can delete their own team members or admins can delete any" 
  ON public.team_members 
  FOR DELETE 
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    public.get_current_user_role() = 'admin'::app_role
  );

-- Recurring transactions policies
CREATE POLICY "Users can view their own recurring transactions or admins can view all" 
  ON public.recurring_transactions 
  FOR SELECT 
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    public.get_current_user_role() = 'admin'::app_role
  );

CREATE POLICY "Users can create their own recurring transactions or admins can create any" 
  ON public.recurring_transactions 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR 
    public.get_current_user_role() = 'admin'::app_role
  );

CREATE POLICY "Users can update their own recurring transactions or admins can update any" 
  ON public.recurring_transactions 
  FOR UPDATE 
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    public.get_current_user_role() = 'admin'::app_role
  );

CREATE POLICY "Users can delete their own recurring transactions or admins can delete any" 
  ON public.recurring_transactions 
  FOR DELETE 
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    public.get_current_user_role() = 'admin'::app_role
  );

-- Profiles policies (users can only view/update their own profile)
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id);

-- Verify your admin role is set correctly
UPDATE public.profiles 
SET role = 'admin'::app_role 
WHERE email = 'riandultrabird@gmail.com';
