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

  static async updateRecurringSchedule(
    parentTransactionId: string,
    startDate: Date,
    newMonths: number
  ): Promise<{ success: boolean; message: string; deletedCount?: number; addedCount?: number }> {
    console.log('RecurringTransactionService.updateRecurringSchedule - Starting request:', {
      parentTransactionId,
      startDate,
      newMonths
    });

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    // Get current recurring transactions for this parent
    const currentRecurring = await this.getRecurringTransactionsByParent(parentTransactionId);
    const currentTotalInstallments = currentRecurring.length + 1; // +1 for the original transaction
    
    console.log('RecurringTransactionService.updateRecurringSchedule - Current installments:', currentTotalInstallments, 'New installments:', newMonths);

    if (newMonths === currentTotalInstallments) {
      return { success: true, message: 'No changes needed - installment count is already correct' };
    }

    let deletedCount = 0;
    let addedCount = 0;

    // Case 1: Reducing installments (delete excess)
    if (newMonths < currentTotalInstallments) {
      console.log('RecurringTransactionService.updateRecurringSchedule - Reducing installments');
      
      // Calculate how many to keep (newMonths - 1, since original is installment 1)
      const toKeep = newMonths - 1;
      
      // Sort by scheduled date to keep the earliest ones
      const sortedRecurring = [...currentRecurring].sort((a, b) => 
        new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
      );
      
      // Identify which ones to delete (the ones beyond the new limit)
      const toDelete = sortedRecurring.slice(toKeep);
      
      // Check if any of the transactions to delete have been generated
      const generatedToDelete = toDelete.filter(r => r.isGenerated);
      
      if (generatedToDelete.length > 0) {
        return {
          success: false,
          message: `Cannot reduce installments because ${generatedToDelete.length} installment(s) have already been generated. Please manage generated transactions separately.`
        };
      }
      
      // Delete the excess ungenerated recurring transactions
      if (toDelete.length > 0) {
        const idsToDelete = toDelete.map(r => r.id);
        
        const { error } = await supabase
          .from('recurring_transactions')
          .delete()
          .in('id', idsToDelete);
          
        if (error) {
          console.error('RecurringTransactionService.updateRecurringSchedule - Error deleting:', error);
          throw error;
        }
        
        deletedCount = toDelete.length;
        console.log('RecurringTransactionService.updateRecurringSchedule - Deleted excess installments:', deletedCount);
      }
    }
    
    // Case 2: Increasing installments (add missing)
    else if (newMonths > currentTotalInstallments) {
      console.log('RecurringTransactionService.updateRecurringSchedule - Increasing installments');
      
      // Calculate how many to add
      const toAdd = newMonths - currentTotalInstallments;
      const newEntries = [];
      
      // Start from the current total installments
      for (let i = currentTotalInstallments; i < newMonths; i++) {
        const scheduledDate = new Date(startDate);
        scheduledDate.setMonth(scheduledDate.getMonth() + i);
        
        newEntries.push({
          parent_transaction_id: parentTransactionId,
          scheduled_date: scheduledDate.toISOString().split('T')[0],
          is_generated: false,
          user_id: userData.user.id
        });
      }
      
      if (newEntries.length > 0) {
        const { error } = await supabase
          .from('recurring_transactions')
          .insert(newEntries);
          
        if (error) {
          console.error('RecurringTransactionService.updateRecurringSchedule - Error inserting:', error);
          throw error;
        }
        
        addedCount = newEntries.length;
        console.log('RecurringTransactionService.updateRecurringSchedule - Added new installments:', addedCount);
      }
    }

    let message = 'Recurring schedule updated successfully';
    if (deletedCount > 0) {
      message += ` - removed ${deletedCount} future installment(s)`;
    }
    if (addedCount > 0) {
      message += ` - added ${addedCount} new installment(s)`;
    }

    return { success: true, message, deletedCount, addedCount };
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
