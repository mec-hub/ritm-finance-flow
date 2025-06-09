
import { supabase } from '@/integrations/supabase/client';

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
    
    for (let i = 1; i <= months; i++) {
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

    const { error } = await supabase
      .from('recurring_transactions')
      .insert(recurringEntries);

    console.log('RecurringTransactionService.createRecurringSchedule - Query result:', { error });

    if (error) {
      console.error('RecurringTransactionService.createRecurringSchedule - Error:', error);
      throw error;
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
}
