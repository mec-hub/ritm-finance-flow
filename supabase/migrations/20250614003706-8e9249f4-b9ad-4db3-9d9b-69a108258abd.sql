
-- Add columns to team_members table to store calculated earnings
ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS calculated_income NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS calculated_expenses NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_calculation_date TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create a function to calculate and update team member earnings
CREATE OR REPLACE FUNCTION public.update_team_member_earnings(member_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_income NUMERIC := 0;
    total_expenses NUMERIC := 0;
BEGIN
    -- Calculate income from percentage assignments
    SELECT COALESCE(SUM(t.amount * (tta.percentage_value / 100)), 0)
    INTO total_income
    FROM public.team_transaction_assignments tta
    INNER JOIN public.transactions t ON t.id = tta.transaction_id
    WHERE tta.team_member_id = member_id_param
    AND t.type = 'income'
    AND t.status = 'paid';
    
    -- Calculate expenses from percentage assignments
    SELECT COALESCE(SUM(t.amount * (tta.percentage_value / 100)), 0)
    INTO total_expenses
    FROM public.team_transaction_assignments tta
    INNER JOIN public.transactions t ON t.id = tta.transaction_id
    WHERE tta.team_member_id = member_id_param
    AND t.type = 'expense'
    AND t.status = 'paid';
    
    -- Update the team member's calculated earnings
    UPDATE public.team_members
    SET 
        calculated_income = total_income,
        calculated_expenses = total_expenses,
        last_calculation_date = now()
    WHERE id = member_id_param;
END;
$$;

-- Create a function to update all team members' earnings
CREATE OR REPLACE FUNCTION public.update_all_team_member_earnings(user_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    member_record RECORD;
BEGIN
    -- Loop through all team members for the user
    FOR member_record IN 
        SELECT id FROM public.team_members WHERE user_id = user_id_param
    LOOP
        PERFORM public.update_team_member_earnings(member_record.id);
    END LOOP;
END;
$$;
