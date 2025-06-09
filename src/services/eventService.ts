
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types';

export class EventService {
  static async getAll(): Promise<Event[]> {
    console.log('EventService.getAll - Starting request');
    
    const { data: userData } = await supabase.auth.getUser();
    console.log('EventService.getAll - Current user:', userData.user?.id);

    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        clients (name)
      `)
      .order('date', { ascending: false });

    console.log('EventService.getAll - Query result:', { data, error });

    if (error) {
      console.error('EventService.getAll - Error:', error);
      throw error;
    }

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
    console.log('EventService.create - Starting request with data:', event);
    
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error('EventService.create - User not authenticated');
      throw new Error('User not authenticated');
    }

    console.log('EventService.create - User ID:', userData.user.id);

    const insertData = {
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
    };

    console.log('EventService.create - Insert data:', insertData);

    const { data, error } = await supabase
      .from('events')
      .insert(insertData)
      .select()
      .single();

    console.log('EventService.create - Query result:', { data, error });

    if (error) {
      console.error('EventService.create - Error:', error);
      throw error;
    }
    
    return { ...event, id: data.id };
  }

  static async update(id: string, updates: Partial<Event>): Promise<void> {
    console.log('EventService.update - Starting request:', { id, updates });

    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.date !== undefined) updateData.date = updates.date?.toISOString().split('T')[0];
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.estimatedRevenue !== undefined) updateData.estimated_revenue = updates.estimatedRevenue;
    if (updates.actualRevenue !== undefined) updateData.actual_revenue = updates.actualRevenue;
    if (updates.estimatedExpenses !== undefined) updateData.estimated_expenses = updates.estimatedExpenses;
    if (updates.actualExpenses !== undefined) updateData.actual_expenses = updates.actualExpenses;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.notes !== undefined) updateData.notes = updates.notes;

    console.log('EventService.update - Update data:', updateData);

    const { error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id);

    console.log('EventService.update - Query result:', { error });

    if (error) {
      console.error('EventService.update - Error:', error);
      throw error;
    }
  }

  static async delete(id: string): Promise<void> {
    console.log('EventService.delete - Starting request:', { id });

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    console.log('EventService.delete - Query result:', { error });

    if (error) {
      console.error('EventService.delete - Error:', error);
      throw error;
    }
  }

  static async getById(id: string): Promise<Event | null> {
    console.log('EventService.getById - Starting request:', { id });

    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        clients (name)
      `)
      .eq('id', id)
      .single();

    console.log('EventService.getById - Query result:', { data, error });

    if (error) {
      console.error('EventService.getById - Error:', error);
      throw error;
    }
    
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
