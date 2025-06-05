
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
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');

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

    const { error } = await supabase
      .from('recurring_transactions')
      .insert(recurringEntries);

    if (error) throw error;
  }

  static async getPendingRecurringTransactions(): Promise<RecurringTransaction[]> {
    const { data, error } = await supabase
      .from('recurring_transactions')
      .select(`
        *,
        transactions!parent_transaction_id (*)
      `)
      .eq('is_generated', false)
      .lte('scheduled_date', new Date().toISOString().split('T')[0]);

    if (error) throw error;

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
    const { error } = await supabase
      .from('recurring_transactions')
      .update({
        is_generated: true,
        generated_transaction_id: generatedTransactionId
      })
      .eq('id', recurringId);

    if (error) throw error;
  }

  static async getRecurringTransactionsByParent(
    parentTransactionId: string
  ): Promise<RecurringTransaction[]> {
    const { data, error } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('parent_transaction_id', parentTransactionId)
      .order('scheduled_date', { ascending: true });

    if (error) throw error;

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
    const { error } = await supabase
      .from('recurring_transactions')
      .delete()
      .eq('parent_transaction_id', parentTransactionId);

    if (error) throw error;
  }
}
