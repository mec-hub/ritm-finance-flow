
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Auto-generate recurring transactions job started');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get today's date and 7 days from now
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 7);

    const todayStr = today.toISOString().split('T')[0];
    const futureDateStr = futureDate.toISOString().split('T')[0];

    console.log(`Checking for recurring transactions between ${todayStr} and ${futureDateStr}`);

    // Get recurring transactions that should be generated (scheduled within next 7 days)
    const { data: recurringTransactions, error: fetchError } = await supabase
      .from('recurring_transactions')
      .select(`
        *,
        transactions!parent_transaction_id (*)
      `)
      .eq('is_generated', false)
      .gte('scheduled_date', todayStr)
      .lte('scheduled_date', futureDateStr);

    if (fetchError) {
      console.error('Error fetching recurring transactions:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${recurringTransactions?.length || 0} recurring transactions to process`);

    let generatedCount = 0;
    const notifications = [];

    for (const recurringTransaction of recurringTransactions || []) {
      try {
        const parentTransaction = recurringTransaction.transactions;
        
        console.log(`Processing recurring transaction ${recurringTransaction.id} for parent ${parentTransaction.id}`);

        // Create the new transaction
        const { data: newTransaction, error: insertError } = await supabase
          .from('transactions')
          .insert({
            amount: parentTransaction.amount,
            description: parentTransaction.description,
            date: recurringTransaction.scheduled_date,
            category: parentTransaction.category,
            subcategory: parentTransaction.subcategory,
            type: parentTransaction.type,
            event_id: parentTransaction.event_id,
            client_id: parentTransaction.client_id,
            notes: parentTransaction.notes,
            status: 'not_paid',
            attachments: parentTransaction.attachments || [],
            is_recurring: false,
            user_id: recurringTransaction.user_id
          })
          .select()
          .single();

        if (insertError) {
          console.error(`Error creating transaction for recurring ${recurringTransaction.id}:`, insertError);
          continue;
        }

        // Mark recurring transaction as generated
        const { error: updateError } = await supabase
          .from('recurring_transactions')
          .update({
            is_generated: true,
            generated_transaction_id: newTransaction.id
          })
          .eq('id', recurringTransaction.id);

        if (updateError) {
          console.error(`Error updating recurring transaction ${recurringTransaction.id}:`, updateError);
          continue;
        }

        generatedCount++;
        console.log(`Successfully generated transaction ${newTransaction.id} from recurring ${recurringTransaction.id}`);

        // Prepare notification
        notifications.push({
          user_id: recurringTransaction.user_id,
          type: 'recurring_transaction_generated',
          title: 'Parcela Recorrente Gerada',
          message: `A parcela "${parentTransaction.description}" foi gerada automaticamente para ${recurringTransaction.scheduled_date}`,
          data: {
            transaction_id: newTransaction.id,
            recurring_id: recurringTransaction.id,
            amount: parentTransaction.amount,
            type: parentTransaction.type
          }
        });

      } catch (error) {
        console.error(`Error processing recurring transaction ${recurringTransaction.id}:`, error);
      }
    }

    // Create notifications for generated transactions
    if (notifications.length > 0) {
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notificationError) {
        console.error('Error creating notifications:', notificationError);
      } else {
        console.log(`Created ${notifications.length} notifications`);
      }
    }

    console.log(`Auto-generate job completed. Generated ${generatedCount} transactions`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Generated ${generatedCount} recurring transactions`,
        processed: recurringTransactions?.length || 0,
        generated: generatedCount
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in auto-generate-recurring function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
