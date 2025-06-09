
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types';
import { RecurringTransactionService } from './recurringTransactionService';

export class TransactionService {
  static async getAll(): Promise<Transaction[]> {
    console.log('TransactionService.getAll - Starting request');
    
    const { data: userData } = await supabase.auth.getUser();
    console.log('TransactionService.getAll - Current user:', userData.user?.id);

    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        clients (name),
        events (title)
      `)
      .order('date', { ascending: false });

    console.log('TransactionService.getAll - Query result:', { data, error });

    if (error) {
      console.error('TransactionService.getAll - Error:', error);
      throw error;
    }

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
    console.log('TransactionService.create - Starting request with data:', transaction);
    
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error('TransactionService.create - User not authenticated');
      throw new Error('User not authenticated');
    }

    console.log('TransactionService.create - User ID:', userData.user.id);

    const insertData = {
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
    };

    console.log('TransactionService.create - Insert data:', insertData);

    const { data, error } = await supabase
      .from('transactions')
      .insert(insertData)
      .select()
      .single();

    console.log('TransactionService.create - Query result:', { data, error });

    if (error) {
      console.error('TransactionService.create - Error:', error);
      throw error;
    }

    // If this is a recurring transaction, create the recurring schedule
    if (transaction.isRecurring && transaction.recurrenceMonths) {
      try {
        await RecurringTransactionService.createRecurringSchedule(
          data.id,
          transaction.date,
          transaction.recurrenceMonths
        );
        console.log('TransactionService.create - Recurring schedule created');
      } catch (recurringError) {
        console.error('TransactionService.create - Error creating recurring schedule:', recurringError);
        // Don't throw here as the main transaction was created successfully
      }
    }

    return { ...transaction, id: data.id };
  }

  static async update(id: string, updates: Partial<Transaction>): Promise<void> {
    console.log('TransactionService.update - Starting request:', { id, updates });

    const updateData: any = {};
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.date !== undefined) updateData.date = updates.date?.toISOString().split('T')[0];
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.subcategory !== undefined) updateData.subcategory = updates.subcategory;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.isRecurring !== undefined) updateData.is_recurring = updates.isRecurring;
    if (updates.recurrenceInterval !== undefined) updateData.recurrence_interval = updates.recurrenceInterval;
    if (updates.recurrenceMonths !== undefined) updateData.recurrence_months = updates.recurrenceMonths;
    if (updates.eventId !== undefined) updateData.event_id = updates.eventId;
    if (updates.clientId !== undefined) updateData.client_id = updates.clientId;
    if (updates.attachments !== undefined) updateData.attachments = updates.attachments;
    if (updates.notes !== undefined) updateData.notes = updates.notes;

    console.log('TransactionService.update - Update data:', updateData);

    const { error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id);

    console.log('TransactionService.update - Query result:', { error });

    if (error) {
      console.error('TransactionService.update - Error:', error);
      throw error;
    }

    // Handle recurring transaction updates
    if (updates.isRecurring !== undefined) {
      try {
        if (updates.isRecurring && updates.recurrenceMonths && updates.date) {
          // Delete existing recurring transactions and create new ones
          await RecurringTransactionService.deleteRecurringTransactions(id);
          await RecurringTransactionService.createRecurringSchedule(
            id,
            updates.date,
            updates.recurrenceMonths
          );
          console.log('TransactionService.update - Recurring schedule updated');
        } else if (!updates.isRecurring) {
          // Remove all recurring transactions if no longer recurring
          await RecurringTransactionService.deleteRecurringTransactions(id);
          console.log('TransactionService.update - Recurring schedule removed');
        }
      } catch (recurringError) {
        console.error('TransactionService.update - Error updating recurring schedule:', recurringError);
        // Don't throw here as the main transaction update was successful
      }
    }
  }

  static async delete(id: string): Promise<void> {
    console.log('TransactionService.delete - Starting request:', { id });

    // First delete any recurring transactions
    try {
      await RecurringTransactionService.deleteRecurringTransactions(id);
      console.log('TransactionService.delete - Recurring transactions deleted');
    } catch (recurringError) {
      console.error('TransactionService.delete - Error deleting recurring transactions:', recurringError);
      // Continue with main deletion
    }
    
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    console.log('TransactionService.delete - Query result:', { error });

    if (error) {
      console.error('TransactionService.delete - Error:', error);
      throw error;
    }
  }

  static async getById(id: string): Promise<Transaction | null> {
    console.log('TransactionService.getById - Starting request:', { id });

    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        clients (name),
        events (title)
      `)
      .eq('id', id)
      .single();

    console.log('TransactionService.getById - Query result:', { data, error });

    if (error) {
      console.error('TransactionService.getById - Error:', error);
      throw error;
    }
    
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
