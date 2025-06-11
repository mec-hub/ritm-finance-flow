
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types';

export class EventService {
  static async getAll(): Promise<Event[]> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        clients (name)
      `)
      .eq('user_id', userData.user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('EventService.getAll error:', error);
      throw error;
    }

    return data.map(event => ({
      id: event.id,
      title: event.title,
      date: new Date(event.date),
      location: event.location || '',
      client: event.clients?.name || '',
      estimatedRevenue: event.estimated_revenue || 0,
      actualRevenue: event.actual_revenue || undefined,
      estimatedExpenses: event.estimated_expenses || 0,
      actualExpenses: event.actual_expenses || undefined,
      status: event.status as 'upcoming' | 'completed' | 'cancelled',
      notes: event.notes || ''
    }));
  }

  static async create(event: Omit<Event, 'id'>, clientId?: string): Promise<Event> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const insertData = {
      title: event.title,
      date: event.date.toISOString().split('T')[0],
      location: event.location || null,
      client_id: clientId || null,
      estimated_revenue: event.estimatedRevenue || 0,
      actual_revenue: event.actualRevenue || null,
      estimated_expenses: event.estimatedExpenses || 0,
      actual_expenses: event.actualExpenses || null,
      status: event.status,
      notes: event.notes || null,
      user_id: userData.user.id
    };

    const { data, error } = await supabase
      .from('events')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('EventService.create error:', error);
      throw error;
    }
    
    return { ...event, id: data.id };
  }

  static async update(id: string, updates: Partial<Event>, clientId?: string): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    console.log('EventService.update - Input params:', { id, updates, clientId });

    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.date !== undefined) updateData.date = updates.date.toISOString().split('T')[0];
    if (updates.location !== undefined) updateData.location = updates.location || null;
    if (clientId !== undefined) updateData.client_id = clientId || null;
    if (updates.estimatedRevenue !== undefined) updateData.estimated_revenue = updates.estimatedRevenue;
    if (updates.actualRevenue !== undefined) updateData.actual_revenue = updates.actualRevenue || null;
    if (updates.estimatedExpenses !== undefined) updateData.estimated_expenses = updates.estimatedExpenses;
    if (updates.actualExpenses !== undefined) updateData.actual_expenses = updates.actualExpenses || null;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.notes !== undefined) updateData.notes = updates.notes || null;

    console.log('EventService.update - Update data:', updateData);

    const { error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userData.user.id);

    if (error) {
      console.error('EventService.update error:', error);
      throw error;
    }

    console.log('EventService.update - Success');
  }

  static async delete(id: string): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
      .eq('user_id', userData.user.id);

    if (error) {
      console.error('EventService.delete error:', error);
      throw error;
    }
  }

  static async getById(id: string): Promise<Event | null> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    console.log('EventService.getById - Fetching event with id:', id);

    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        clients (name)
      `)
      .eq('id', id)
      .eq('user_id', userData.user.id)
      .single();

    if (error) {
      console.error('EventService.getById error:', error);
      throw error;
    }
    
    if (!data) {
      console.log('EventService.getById - No event found');
      return null;
    }

    console.log('EventService.getById - Event found:', data);

    return {
      id: data.id,
      title: data.title,
      date: new Date(data.date),
      location: data.location || '',
      client: data.clients?.name || '',
      estimatedRevenue: data.estimated_revenue || 0,
      actualRevenue: data.actual_revenue || undefined,
      estimatedExpenses: data.estimated_expenses || 0,
      actualExpenses: data.actual_expenses || undefined,
      status: data.status as 'upcoming' | 'completed' | 'cancelled',
      notes: data.notes || ''
    };
  }
}
