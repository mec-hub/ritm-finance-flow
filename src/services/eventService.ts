
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types';

export class EventService {
  static async getAll(): Promise<Event[]> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    console.log('EventService.getAll - Fetching events for user:', userData.user.id);

    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        clients (id, name)
      `)
      .eq('user_id', userData.user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('EventService.getAll error:', error);
      throw error;
    }

    console.log('EventService.getAll - Raw data from database:', data);

    return data.map(event => ({
      id: event.id,
      title: event.title,
      date: new Date(event.date + 'T00:00:00'), // Fix timezone issue
      location: event.location || '',
      client: event.clients?.name || '',
      clientId: event.clients?.id || undefined,
      estimatedRevenue: event.estimated_revenue || 0,
      actualRevenue: event.actual_revenue || undefined,
      estimatedExpenses: event.estimated_expenses || 0,
      actualExpenses: event.actual_expenses || undefined,
      status: event.status as 'upcoming' | 'completed' | 'cancelled',
      notes: event.notes || '',
      // Add new location fields
      placeName: event.place_name || undefined,
      formattedAddress: event.formatted_address || undefined,
      latitude: event.latitude || undefined,
      longitude: event.longitude || undefined,
      placeId: event.place_id || undefined,
      // Add new time fields
      startTime: event.start_time || undefined,
      endTime: event.end_time || undefined,
    }));
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
        clients (id, name)
      `)
      .eq('id', id)
      .eq('user_id', userData.user.id)
      .maybeSingle();

    if (error) {
      console.error('EventService.getById error:', error);
      throw error;
    }
    
    if (!data) {
      console.log('EventService.getById - No event found for id:', id);
      return null;
    }

    console.log('EventService.getById - Event found:', data);

    return {
      id: data.id,
      title: data.title,
      date: new Date(data.date + 'T00:00:00'), // Fix timezone issue
      location: data.location || '',
      client: data.clients?.name || '',
      clientId: data.clients?.id || undefined,
      estimatedRevenue: data.estimated_revenue || 0,
      actualRevenue: data.actual_revenue || undefined,
      estimatedExpenses: data.estimated_expenses || 0,
      actualExpenses: data.actual_expenses || undefined,
      status: data.status as 'upcoming' | 'completed' | 'cancelled',
      notes: data.notes || '',
      // Add new location fields
      placeName: data.place_name || undefined,
      formattedAddress: data.formatted_address || undefined,
      latitude: data.latitude || undefined,
      longitude: data.longitude || undefined,
      placeId: data.place_id || undefined,
      // Add new time fields
      startTime: data.start_time || undefined,
      endTime: data.end_time || undefined,
    };
  }

  static async create(event: Omit<Event, 'id'>, clientId?: string): Promise<Event> {
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
      title: event.title,
      date: formatDateForDB(event.date),
      location: event.location || null,
      client_id: clientId || null,
      estimated_revenue: event.estimatedRevenue || 0,
      actual_revenue: event.actualRevenue || null,
      estimated_expenses: event.estimatedExpenses || 0,
      actual_expenses: event.actualExpenses || null,
      status: event.status,
      notes: event.notes || null,
      user_id: userData.user.id,
      // Add new location fields
      place_name: event.placeName || null,
      formatted_address: event.formattedAddress || null,
      latitude: event.latitude || null,
      longitude: event.longitude || null,
      place_id: event.placeId || null,
      // Add new time fields
      start_time: event.startTime || null,
      end_time: event.endTime || null,
    };

    console.log('EventService.create - Insert data:', insertData);

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

    console.log('EventService.update - Starting update for event:', id);
    console.log('EventService.update - Updates:', updates);
    console.log('EventService.update - Client ID:', clientId);

    // Format date to YYYY-MM-DD without timezone conversion
    const formatDateForDB = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Build update data object with proper database column names
    const updateData: any = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.date !== undefined) updateData.date = formatDateForDB(updates.date);
    if (updates.location !== undefined) updateData.location = updates.location || null;
    if (clientId !== undefined) updateData.client_id = clientId || null;
    if (updates.estimatedRevenue !== undefined) updateData.estimated_revenue = updates.estimatedRevenue;
    if (updates.actualRevenue !== undefined) updateData.actual_revenue = updates.actualRevenue || null;
    if (updates.estimatedExpenses !== undefined) updateData.estimated_expenses = updates.estimatedExpenses;
    if (updates.actualExpenses !== undefined) updateData.actual_expenses = updates.actualExpenses || null;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.notes !== undefined) updateData.notes = updates.notes || null;
    
    // Add new location fields
    if (updates.placeName !== undefined) updateData.place_name = updates.placeName || null;
    if (updates.formattedAddress !== undefined) updateData.formatted_address = updates.formattedAddress || null;
    if (updates.latitude !== undefined) updateData.latitude = updates.latitude || null;
    if (updates.longitude !== undefined) updateData.longitude = updates.longitude || null;
    if (updates.placeId !== undefined) updateData.place_id = updates.placeId || null;

    // Add new time fields
    if (updates.startTime !== undefined) updateData.start_time = updates.startTime || null;
    if (updates.endTime !== undefined) updateData.end_time = updates.endTime || null;

    console.log('EventService.update - Final update data:', updateData);

    const { data, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userData.user.id)
      .select()
      .single();

    if (error) {
      console.error('EventService.update error:', error);
      throw error;
    }

    console.log('EventService.update - Update successful:', data);
  }

  static async delete(id: string): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    console.log('EventService.delete - Deleting event:', id);

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
      .eq('user_id', userData.user.id);

    if (error) {
      console.error('EventService.delete error:', error);
      throw error;
    }

    console.log('EventService.delete - Delete successful');
  }
}
