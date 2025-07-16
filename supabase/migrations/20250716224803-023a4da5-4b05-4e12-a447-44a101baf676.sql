
-- First, let's create a function to backfill recurring transactions for existing data
CREATE OR REPLACE FUNCTION backfill_recurring_transactions()
RETURNS void AS $$
DECLARE
    rec RECORD;
    scheduled_date_val DATE;
    i INTEGER;
BEGIN
    -- Loop through all existing recurring transactions that don't have entries in recurring_transactions
    FOR rec IN 
        SELECT t.id, t.date, t.recurrence_months, t.user_id
        FROM transactions t
        WHERE t.is_recurring = true 
        AND t.recurrence_months > 1
        AND NOT EXISTS (
            SELECT 1 FROM recurring_transactions rt 
            WHERE rt.parent_transaction_id = t.id
        )
    LOOP
        -- Create recurring schedule entries (months - 1 since original is first installment)
        FOR i IN 1..(rec.recurrence_months - 1) LOOP
            scheduled_date_val := rec.date + (i || ' months')::INTERVAL;
            
            INSERT INTO recurring_transactions (
                parent_transaction_id,
                scheduled_date,
                is_generated,
                user_id
            ) VALUES (
                rec.id,
                scheduled_date_val::DATE,
                false,
                rec.user_id
            );
        END LOOP;
        
        RAISE NOTICE 'Created % recurring entries for transaction %', rec.recurrence_months - 1, rec.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the backfill function
SELECT backfill_recurring_transactions();

-- Drop the function after use
DROP FUNCTION backfill_recurring_transactions();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_parent_id ON recurring_transactions(parent_transaction_id);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_scheduled_date ON recurring_transactions(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_is_generated ON recurring_transactions(is_generated);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_user_id ON recurring_transactions(user_id);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_user_generated_date 
ON recurring_transactions(user_id, is_generated, scheduled_date);
