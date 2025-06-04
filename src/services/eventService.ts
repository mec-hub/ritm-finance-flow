
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types';

export class EventService {
  static async getAll(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        clients (name)
      `)
      .order('date', { ascending: false });

    if (error) throw error;

    return data.map(event => ({
      id: event.id,
      title: event.title,
      date: new Date(event.date),
      location: event.location || '',
      client: event.clients?.name || '',
      estimatedRevenue: event.estimated_revenue || 0,
      actualRevenue: event.actual_revenue,
      estimatedExpenses: event.estimated_expenses || 0,
      actualExpenses: event.actual_expenses,
      status: event.status as 'upcoming' | 'completed' | 'cancelled',
      notes: event.notes
    }));
  }

  static async create(event: Omit<Event, 'id'>): Promise<Event> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('events')
      .insert({
        title: event.title,
        date: event.date.toISOString().split('T')[0],
        location: event.location,
        estimated_revenue: event.estimatedRevenue,
        actual_revenue: event.actualRevenue,
        estimated_expenses: event.estimatedExpenses,
        actual_expenses: event.actualExpenses,
        status: event.status,
        notes: event.notes,
        user_id: userData.user.id
      })
      .select()
      .single();

    if (error) throw error;
    return { ...event, id: data.id };
  }

  static async update(id: string, updates: Partial<Event>): Promise<void> {
    const { error } = await supabase
      .from('events')
      .update({
        title: updates.title,
        date: updates.date?.toISOString().split('T')[0],
        location: updates.location,
        estimated_revenue: updates.estimatedRevenue,
        actual_revenue: updates.actualRevenue,
        estimated_expenses: updates.estimatedExpenses,
        actual_expenses: updates.actualExpenses,
        status: updates.status,
        notes: updates.notes
      })
      .eq('id', id);

    if (error) throw error;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getById(id: string): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        clients (name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      title: data.title,
      date: new Date(data.date),
      location: data.location || '',
      client: data.clients?.name || '',
      estimatedRevenue: data.estimated_revenue || 0,
      actualRevenue: data.actual_revenue,
      estimatedExpenses: data.estimated_expenses || 0,
      actualExpenses: data.actual_expenses,
      status: data.status as 'upcoming' | 'completed' | 'cancelled',
      notes: data.notes
    };
  }
}
