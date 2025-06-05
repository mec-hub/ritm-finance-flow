
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types';
import { RecurringTransactionService } from './recurringTransactionService';

export class TransactionService {
  static async getAll(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        clients (name),
        events (title)
      `)
      .order('date', { ascending: false });

    if (error) throw error;

    return data.map(transaction => ({
      id: transaction.id,
      amount: transaction.amount,
      description: transaction.description,
      date: new Date(transaction.date),
      category: transaction.category,
      subcategory: transaction.subcategory || '',
      isRecurring: transaction.is_recurring || false,
      recurrenceInterval: transaction.recurrence_interval as 'weekly' | 'monthly' | 'quarterly' | 'yearly' | undefined,
      recurrenceMonths: transaction.recurrence_months || undefined,
      type: transaction.type as 'income' | 'expense',
      eventId: transaction.event_id || undefined,
      clientId: transaction.client_id || undefined,
      attachments: transaction.attachments || [],
      notes: transaction.notes || '',
      status: transaction.status as 'paid' | 'not_paid' | 'canceled' || 'not_paid'
    }));
  }

  static async create(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date.toISOString().split('T')[0],
        category: transaction.category,
        subcategory: transaction.subcategory,
        type: transaction.type,
        status: transaction.status || 'not_paid',
        is_recurring: transaction.isRecurring,
        recurrence_interval: transaction.recurrenceInterval,
        recurrence_months: transaction.recurrenceMonths,
        event_id: transaction.eventId,
        client_id: transaction.clientId,
        attachments: transaction.attachments,
        notes: transaction.notes,
        user_id: userData.user.id
      })
      .select()
      .single();

    if (error) throw error;

    // If this is a recurring transaction, create the recurring schedule
    if (transaction.isRecurring && transaction.recurrenceMonths) {
      await RecurringTransactionService.createRecurringSchedule(
        data.id,
        transaction.date,
        transaction.recurrenceMonths
      );
    }

    return { ...transaction, id: data.id };
  }

  static async update(id: string, updates: Partial<Transaction>): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .update({
        amount: updates.amount,
        description: updates.description,
        date: updates.date?.toISOString().split('T')[0],
        category: updates.category,
        subcategory: updates.subcategory,
        type: updates.type,
        status: updates.status,
        is_recurring: updates.isRecurring,
        recurrence_interval: updates.recurrenceInterval,
        recurrence_months: updates.recurrenceMonths,
        event_id: updates.eventId,
        client_id: updates.clientId,
        attachments: updates.attachments,
        notes: updates.notes
      })
      .eq('id', id);

    if (error) throw error;

    // Handle recurring transaction updates
    if (updates.isRecurring !== undefined) {
      if (updates.isRecurring && updates.recurrenceMonths && updates.date) {
        // Delete existing recurring transactions and create new ones
        await RecurringTransactionService.deleteRecurringTransactions(id);
        await RecurringTransactionService.createRecurringSchedule(
          id,
          updates.date,
          updates.recurrenceMonths
        );
      } else if (!updates.isRecurring) {
        // Remove all recurring transactions if no longer recurring
        await RecurringTransactionService.deleteRecurringTransactions(id);
      }
    }
  }

  static async delete(id: string): Promise<void> {
    // First delete any recurring transactions
    await RecurringTransactionService.deleteRecurringTransactions(id);
    
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getById(id: string): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        clients (name),
        events (title)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      amount: data.amount,
      description: data.description,
      date: new Date(data.date),
      category: data.category,
      subcategory: data.subcategory || '',
      isRecurring: data.is_recurring || false,
      recurrenceInterval: data.recurrence_interval as 'weekly' | 'monthly' | 'quarterly' | 'yearly' | undefined,
      recurrenceMonths: data.recurrence_months || undefined,
      type: data.type as 'income' | 'expense',
      eventId: data.event_id || undefined,
      clientId: data.client_id || undefined,
      attachments: data.attachments || [],
      notes: data.notes || '',
      status: data.status as 'paid' | 'not_paid' | 'canceled' || 'not_paid'
    };
  }
}
