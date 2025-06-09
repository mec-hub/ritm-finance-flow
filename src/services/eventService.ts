
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types';
import { DebugService } from './debugService';

export class EventService {
  static async getAll(): Promise<Event[]> {
    console.log('=== EventService.getAll START ===');
    
    const user = await DebugService.logUserAuth();
    await DebugService.logDatabaseConnection();
    await DebugService.logRLSPolicies('events');
    
    if (!user) {
      console.error('EventService.getAll - No authenticated user');
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        clients (name)
      `)
      .order('date', { ascending: false });

    console.log('EventService.getAll - Raw result:', { data, error });

    if (error) {
      console.error('EventService.getAll - Database error:', error);
      throw error;
    }

    const mappedData = data.map(event => ({
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

    console.log('EventService.getAll - Mapped data:', mappedData);
    console.log('=== EventService.getAll END ===');
    
    return mappedData;
  }

  static async create(event: Omit<Event, 'id'>, clientId?: string): Promise<Event> {
    console.log('=== EventService.create START ===');
    console.log('EventService.create - Input:', { event, clientId });
    
    const user = await DebugService.logUserAuth();
    if (!user) {
      console.error('EventService.create - No authenticated user');
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
      user_id: user.id
    };

    console.log('EventService.create - Insert data:', insertData);

    const { data, error } = await supabase
      .from('events')
      .insert(insertData)
      .select()
      .single();

    console.log('EventService.create - Result:', { data, error });

    if (error) {
      console.error('EventService.create - Database error:', error);
      throw error;
    }
    
    const result = { ...event, id: data.id };
    console.log('EventService.create - Final result:', result);
    console.log('=== EventService.create END ===');
    
    return result;
  }

  static async update(id: string, updates: Partial<Event>, clientId?: string): Promise<void> {
    console.log('=== EventService.update START ===');
    console.log('EventService.update - Input:', { id, updates, clientId });

    const user = await DebugService.logUserAuth();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.date !== undefined) updateData.date = updates.date?.toISOString().split('T')[0];
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
      .eq('id', id);

    console.log('EventService.update - Result:', { error });

    if (error) {
      console.error('EventService.update - Database error:', error);
      throw error;
    }

    console.log('=== EventService.update END ===');
  }

  static async delete(id: string): Promise<void> {
    console.log('=== EventService.delete START ===');
    console.log('EventService.delete - ID:', id);

    const user = await DebugService.logUserAuth();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    console.log('EventService.delete - Result:', { error });

    if (error) {
      console.error('EventService.delete - Database error:', error);
      throw error;
    }

    console.log('=== EventService.delete END ===');
  }

  static async getById(id: string): Promise<Event | null> {
    console.log('=== EventService.getById START ===');
    console.log('EventService.getById - ID:', id);

    const user = await DebugService.logUserAuth();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        clients (name)
      `)
      .eq('id', id)
      .single();

    console.log('EventService.getById - Result:', { data, error });

    if (error) {
      console.error('EventService.getById - Database error:', error);
      throw error;
    }
    
    if (!data) {
      console.log('EventService.getById - No data found');
      return null;
    }

    const result = {
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

    console.log('EventService.getById - Mapped result:', result);
    console.log('=== EventService.getById END ===');
    
    return result;
  }
}
