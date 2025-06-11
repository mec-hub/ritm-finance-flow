
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types';

export class TransactionService {
  static async getAll(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    return data.map(transaction => ({
      id: transaction.id,
      amount: transaction.amount,
      description: transaction.description,
      date: new Date(transaction.date),
      category: transaction.category,
      subcategory: transaction.subcategory,
      isRecurring: transaction.is_recurring || false,
      recurrenceInterval: transaction.recurrence_interval,
      recurrenceMonths: transaction.recurrence_months,
      type: transaction.type as 'income' | 'expense',
      eventId: transaction.event_id,
      clientId: transaction.client_id,
      teamMemberId: undefined, // Will be handled by team_transaction_assignments
      teamPercentages: [], // Will be populated from team_transaction_assignments
      notes: transaction.notes,
      percentageValue: undefined, // Legacy field
      status: transaction.status as 'paid' | 'not_paid' | 'canceled'
    }));
  }

  static async getById(id: string): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
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
      subcategory: data.subcategory,
      isRecurring: data.is_recurring || false,
      recurrenceInterval: data.recurrence_interval,
      recurrenceMonths: data.recurrence_months,
      type: data.type as 'income' | 'expense',
      eventId: data.event_id,
      clientId: data.client_id,
      teamMemberId: undefined,
      teamPercentages: [],
      notes: data.notes,
      percentageValue: undefined,
      status: data.status as 'paid' | 'not_paid' | 'canceled'
    };
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
        is_recurring: transaction.isRecurring,
        recurrence_interval: transaction.recurrenceInterval,
        recurrence_months: transaction.recurrenceMonths,
        type: transaction.type,
        event_id: transaction.eventId,
        client_id: transaction.clientId,
        notes: transaction.notes,
        status: transaction.status || 'not_paid',
        user_id: userData.user.id
      })
      .select()
      .single();

    if (error) throw error;
    return { ...transaction, id: data.id };
  }

  static async update(id: string, updates: Partial<Transaction>): Promise<void> {
    const updateData: any = {};
    
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.date !== undefined) updateData.date = updates.date.toISOString().split('T')[0];
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.subcategory !== undefined) updateData.subcategory = updates.subcategory;
    if (updates.isRecurring !== undefined) updateData.is_recurring = updates.isRecurring;
    if (updates.recurrenceInterval !== undefined) updateData.recurrence_interval = updates.recurrenceInterval;
    if (updates.recurrenceMonths !== undefined) updateData.recurrence_months = updates.recurrenceMonths;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.eventId !== undefined) updateData.event_id = updates.eventId;
    if (updates.clientId !== undefined) updateData.client_id = updates.clientId;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.status !== undefined) updateData.status = updates.status;

    const { error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getByFilters(filters: {
    category?: string;
    type?: 'income' | 'expense';
    dateFrom?: Date;
    dateTo?: Date;
    eventId?: string;
    clientId?: string;
  }): Promise<Transaction[]> {
    let query = supabase
      .from('transactions')
      .select('*');

    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.dateFrom) {
      query = query.gte('date', filters.dateFrom.toISOString().split('T')[0]);
    }
    if (filters.dateTo) {
      query = query.lte('date', filters.dateTo.toISOString().split('T')[0]);
    }
    if (filters.eventId) {
      query = query.eq('event_id', filters.eventId);
    }
    if (filters.clientId) {
      query = query.eq('client_id', filters.clientId);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) throw error;

    return data.map(transaction => ({
      id: transaction.id,
      amount: transaction.amount,
      description: transaction.description,
      date: new Date(transaction.date),
      category: transaction.category,
      subcategory: transaction.subcategory,
      isRecurring: transaction.is_recurring || false,
      recurrenceInterval: transaction.recurrence_interval,
      recurrenceMonths: transaction.recurrence_months,
      type: transaction.type as 'income' | 'expense',
      eventId: transaction.event_id,
      clientId: transaction.client_id,
      teamMemberId: undefined,
      teamPercentages: [],
      notes: transaction.notes,
      percentageValue: undefined,
      status: transaction.status as 'paid' | 'not_paid' | 'canceled'
    }));
  }
}
