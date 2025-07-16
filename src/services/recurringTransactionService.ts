
import { supabase } from '@/integrations/supabase/client';
import { TransactionService } from './transactionService';

interface RecurringTransaction {
  id: string;
  parentTransactionId: string;
  scheduledDate: Date;
  isGenerated: boolean;
  generatedTransactionId?: string;
  userId: string;
  createdAt: Date;
}

export class RecurringTransactionService {
  static async createRecurringSchedule(
    parentTransactionId: string,
    startDate: Date,
    months: number
  ): Promise<void> {
    console.log('RecurringTransactionService.createRecurringSchedule - Starting request:', {
      parentTransactionId,
      startDate,
      months
    });

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error('RecurringTransactionService.createRecurringSchedule - User not authenticated');
      throw new Error('User not authenticated');
    }

    console.log('RecurringTransactionService.createRecurringSchedule - User ID:', userData.user.id);

    const recurringEntries = [];
    
    // Create only months - 1 entries since the original transaction is the first installment
    for (let i = 1; i < months; i++) {
      const scheduledDate = new Date(startDate);
      scheduledDate.setMonth(scheduledDate.getMonth() + i);
      
      recurringEntries.push({
        parent_transaction_id: parentTransactionId,
        scheduled_date: scheduledDate.toISOString().split('T')[0],
        is_generated: false,
        user_id: userData.user.id
      });
    }

    console.log('RecurringTransactionService.createRecurringSchedule - Insert data:', recurringEntries);

    if (recurringEntries.length > 0) {
      const { error } = await supabase
        .from('recurring_transactions')
        .insert(recurringEntries);

      console.log('RecurringTransactionService.createRecurringSchedule - Query result:', { error });

      if (error) {
        console.error('RecurringTransactionService.createRecurringSchedule - Error:', error);
        throw error;
      }
    }
  }

  static async getPendingRecurringTransactions(): Promise<RecurringTransaction[]> {
    console.log('RecurringTransactionService.getPendingRecurringTransactions - Starting request');

    const { data, error } = await supabase
      .from('recurring_transactions')
      .select(`
        *,
        transactions!parent_transaction_id (*)
      `)
      .eq('is_generated', false)
      .lte('scheduled_date', new Date().toISOString().split('T')[0]);

    console.log('RecurringTransactionService.getPendingRecurringTransactions - Query result:', { data, error });

    if (error) {
      console.error('RecurringTransactionService.getPendingRecurringTransactions - Error:', error);
      throw error;
    }

    return data.map(item => ({
      id: item.id,
      parentTransactionId: item.parent_transaction_id,
      scheduledDate: new Date(item.scheduled_date),
      isGenerated: item.is_generated,
      generatedTransactionId: item.generated_transaction_id,
      userId: item.user_id,
      createdAt: new Date(item.created_at)
    }));
  }

  static async generateNextInstallment(recurringId: string): Promise<string> {
    console.log('RecurringTransactionService.generateNextInstallment - Starting request:', {
      recurringId
    });

    // Get the recurring transaction and parent transaction details
    const { data: recurringData, error: recurringError } = await supabase
      .from('recurring_transactions')
      .select(`
        *,
        transactions!parent_transaction_id (*)
      `)
      .eq('id', recurringId)
      .eq('is_generated', false)
      .single();

    if (recurringError || !recurringData) {
      console.error('RecurringTransactionService.generateNextInstallment - Error fetching recurring transaction:', recurringError);
      throw new Error('Recurring transaction not found or already generated');
    }

    const parentTransaction = recurringData.transactions;
    
    console.log('RecurringTransactionService.generateNextInstallment - Parent transaction:', parentTransaction);
    console.log('RecurringTransactionService.generateNextInstallment - Scheduled date:', recurringData.scheduled_date);
    
    // Create the new transaction based on the parent
    const newTransaction = {
      amount: parentTransaction.amount,
      description: parentTransaction.description,
      date: new Date(recurringData.scheduled_date),
      category: parentTransaction.category,
      subcategory: parentTransaction.subcategory,
      type: parentTransaction.type as 'income' | 'expense',
      eventId: parentTransaction.event_id,
      clientId: parentTransaction.client_id,
      notes: parentTransaction.notes,
      status: 'not_paid' as const,
      attachments: parentTransaction.attachments || [],
      isRecurring: false, // Generated transactions are not recurring themselves
      teamPercentages: []
    };

    console.log('RecurringTransactionService.generateNextInstallment - Creating new transaction:', newTransaction);

    // Create the new transaction
    const createdTransaction = await TransactionService.create(newTransaction);
    
    console.log('RecurringTransactionService.generateNextInstallment - Created transaction:', createdTransaction.id);
    
    // Mark the recurring transaction as generated
    await this.markAsGenerated(recurringId, createdTransaction.id);

    console.log('RecurringTransactionService.generateNextInstallment - Generated transaction:', createdTransaction.id);
    
    return createdTransaction.id;
  }

  static async markAsGenerated(
    recurringId: string, 
    generatedTransactionId: string
  ): Promise<void> {
    console.log('RecurringTransactionService.markAsGenerated - Starting request:', {
      recurringId,
      generatedTransactionId
    });

    const { error } = await supabase
      .from('recurring_transactions')
      .update({
        is_generated: true,
        generated_transaction_id: generatedTransactionId
      })
      .eq('id', recurringId);

    console.log('RecurringTransactionService.markAsGenerated - Query result:', { error });

    if (error) {
      console.error('RecurringTransactionService.markAsGenerated - Error:', error);
      throw error;
    }
  }

  static async getRecurringTransactionsByParent(
    parentTransactionId: string
  ): Promise<RecurringTransaction[]> {
    console.log('RecurringTransactionService.getRecurringTransactionsByParent - Starting request:', {
      parentTransactionId
    });

    const { data, error } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('parent_transaction_id', parentTransactionId)
      .order('scheduled_date', { ascending: true });

    console.log('RecurringTransactionService.getRecurringTransactionsByParent - Query result:', { data, error });

    if (error) {
      console.error('RecurringTransactionService.getRecurringTransactionsByParent - Error:', error);
      throw error;
    }

    return data.map(item => ({
      id: item.id,
      parentTransactionId: item.parent_transaction_id,
      scheduledDate: new Date(item.scheduled_date),
      isGenerated: item.is_generated,
      generatedTransactionId: item.generated_transaction_id,
      userId: item.user_id,
      createdAt: new Date(item.created_at)
    }));
  }

  static async deleteRecurringTransactions(parentTransactionId: string): Promise<void> {
    console.log('RecurringTransactionService.deleteRecurringTransactions - Starting request:', {
      parentTransactionId
    });

    const { error } = await supabase
      .from('recurring_transactions')
      .delete()
      .eq('parent_transaction_id', parentTransactionId);

    console.log('RecurringTransactionService.deleteRecurringTransactions - Query result:', { error });

    if (error) {
      console.error('RecurringTransactionService.deleteRecurringTransactions - Error:', error);
      throw error;
    }
  }

  static async getUpcomingRecurringTransactions(daysAhead: number = 7): Promise<RecurringTransaction[]> {
    console.log('RecurringTransactionService.getUpcomingRecurringTransactions - Starting request:', {
      daysAhead
    });

    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('recurring_transactions')
      .select(`
        *,
        transactions!parent_transaction_id (*)
      `)
      .eq('is_generated', false)
      .gte('scheduled_date', today)
      .lte('scheduled_date', futureDateStr);

    console.log('RecurringTransactionService.getUpcomingRecurringTransactions - Query result:', { data, error });

    if (error) {
      console.error('RecurringTransactionService.getUpcomingRecurringTransactions - Error:', error);
      throw error;
    }

    return data.map(item => ({
      id: item.id,
      parentTransactionId: item.parent_transaction_id,
      scheduledDate: new Date(item.scheduled_date),
      isGenerated: item.is_generated,
      generatedTransactionId: item.generated_transaction_id,
      userId: item.user_id,
      createdAt: new Date(item.created_at)
    }));
  }

  // New method to automatically generate pending installments (for automatic system)
  static async generatePendingInstallments(): Promise<{ generated: number; errors: string[] }> {
    console.log('RecurringTransactionService.generatePendingInstallments - Starting automatic generation');

    const pendingTransactions = await this.getPendingRecurringTransactions();
    console.log(`Found ${pendingTransactions.length} pending recurring transactions`);

    let generated = 0;
    const errors: string[] = [];

    for (const pending of pendingTransactions) {
      try {
        await this.generateNextInstallment(pending.id);
        generated++;
        console.log(`Generated installment for recurring transaction ${pending.id}`);
      } catch (error) {
        console.error(`Error generating installment for ${pending.id}:`, error);
        errors.push(`Failed to generate installment for ${pending.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log(`Automatic generation completed: ${generated} generated, ${errors.length} errors`);
    
    return { generated, errors };
  }
}
