import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types';

export class TransactionService {
  static async getAll(): Promise<Transaction[]> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        clients (name),
        events (title)
      `)
      .order('date', { ascending: false });

    if (error) {
      console.error('TransactionService.getAll error:', error);
      throw error;
    }

    return data.map(transaction => ({
      id: transaction.id,
      description: transaction.description,
      amount: transaction.amount,
      date: new Date(transaction.date + 'T00:00:00'), // Fix timezone issue
      category: transaction.category,
      subcategory: transaction.subcategory || '',
      type: transaction.type as 'income' | 'expense',
      status: transaction.status as 'paid' | 'not_paid' | 'canceled',
      isRecurring: transaction.is_recurring || false,
      recurrenceInterval: transaction.recurrence_interval as 'monthly' | undefined,
      recurrenceMonths: transaction.recurrence_months || undefined,
      notes: transaction.notes || '',
      clientId: transaction.client_id || undefined,
      eventId: transaction.event_id || undefined,
      attachments: transaction.attachments || []
    }));
  }

  static async create(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    // Format date to YYYY-MM-DD without timezone conversion
    const formatDateForDB = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const insertData = {
      description: transaction.description,
      amount: transaction.amount,
      date: formatDateForDB(transaction.date),
      category: transaction.category,
      subcategory: transaction.subcategory || null,
      type: transaction.type,
      status: transaction.status || 'not_paid',
      is_recurring: transaction.isRecurring || false,
      recurrence_interval: transaction.recurrenceInterval || null,
      recurrence_months: transaction.recurrenceMonths || null,
      notes: transaction.notes || null,
      client_id: transaction.clientId || null,
      event_id: transaction.eventId || null,
      attachments: transaction.attachments || null,
      user_id: userData.user.id
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('TransactionService.create error:', error);
      throw error;
    }

    return { ...transaction, id: data.id };
  }

  static async update(id: string, updates: Partial<Transaction>): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    // Format date to YYYY-MM-DD without timezone conversion
    const formatDateForDB = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const updateData: any = {};
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.date !== undefined) updateData.date = formatDateForDB(updates.date);
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.subcategory !== undefined) updateData.subcategory = updates.subcategory || null;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.isRecurring !== undefined) updateData.is_recurring = updates.isRecurring;
    if (updates.recurrenceInterval !== undefined) updateData.recurrence_interval = updates.recurrenceInterval || null;
    if (updates.recurrenceMonths !== undefined) updateData.recurrence_months = updates.recurrenceMonths || null;
    if (updates.notes !== undefined) updateData.notes = updates.notes || null;
    if (updates.clientId !== undefined) updateData.client_id = updates.clientId || null;
    if (updates.eventId !== undefined) updateData.event_id = updates.eventId || null;
    if (updates.attachments !== undefined) updateData.attachments = updates.attachments || null;

    const { error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('TransactionService.update error:', error);
      throw error;
    }
  }

  static async delete(id: string): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('TransactionService.delete error:', error);
      throw error;
    }
  }

  static async getById(id: string): Promise<Transaction | null> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        clients (name),
        events (title)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('TransactionService.getById error:', error);
      throw error;
    }
    
    if (!data) {
      return null;
    }

    return {
      id: data.id,
      description: data.description,
      amount: data.amount,
      date: new Date(data.date + 'T00:00:00'), // Fix timezone issue
      category: data.category,
      subcategory: data.subcategory || '',
      type: data.type as 'income' | 'expense',
      status: data.status as 'paid' | 'not_paid' | 'canceled',
      isRecurring: data.is_recurring || false,
      recurrenceInterval: data.recurrence_interval as 'monthly' | undefined,
      recurrenceMonths: data.recurrence_months || undefined,
      notes: data.notes || '',
      clientId: data.client_id || undefined,
      eventId: data.event_id || undefined,
      attachments: data.attachments || []
    };
  }
}
