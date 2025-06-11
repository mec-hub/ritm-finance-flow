
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types';

export class ClientService {
  static async getAll(): Promise<Client[]> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('name', { ascending: true });

    if (error) {
      console.error('ClientService.getAll error:', error);
      throw error;
    }

    return data.map(client => ({
      id: client.id,
      name: client.name,
      contact: client.contact || '',
      email: client.email || '',
      phone: client.phone || '',
      totalRevenue: client.total_revenue || 0,
      lastEvent: client.last_event ? new Date(client.last_event) : undefined,
      notes: client.notes || ''
    }));
  }

  static async create(client: Omit<Client, 'id'>): Promise<Client> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const insertData = {
      name: client.name,
      contact: client.contact || null,
      email: client.email || null,
      phone: client.phone || null,
      total_revenue: client.totalRevenue || 0,
      last_event: client.lastEvent?.toISOString().split('T')[0] || null,
      notes: client.notes || null,
      user_id: userData.user.id
    };

    const { data, error } = await supabase
      .from('clients')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('ClientService.create error:', error);
      throw error;
    }

    return { ...client, id: data.id };
  }

  static async update(id: string, updates: Partial<Client>): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    console.log('ClientService.update - Starting update for client:', id);
    console.log('ClientService.update - Updates:', updates);

    const updateData: any = {};
    
    // Only include fields that are actually being updated
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.contact !== undefined) updateData.contact = updates.contact || null;
    if (updates.email !== undefined) updateData.email = updates.email || null;
    if (updates.phone !== undefined) updateData.phone = updates.phone || null;
    if (updates.totalRevenue !== undefined) updateData.total_revenue = updates.totalRevenue;
    if (updates.lastEvent !== undefined) updateData.last_event = updates.lastEvent?.toISOString().split('T')[0] || null;
    if (updates.notes !== undefined) updateData.notes = updates.notes || null;

    console.log('ClientService.update - Final update data:', updateData);

    const { data, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userData.user.id)
      .select()
      .single();

    if (error) {
      console.error('ClientService.update error:', error);
      throw error;
    }

    console.log('ClientService.update - Update successful:', data);
  }

  static async delete(id: string): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
      .eq('user_id', userData.user.id);

    if (error) {
      console.error('ClientService.delete error:', error);
      throw error;
    }
  }

  static async getById(id: string): Promise<Client | null> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    console.log('ClientService.getById - Fetching client with id:', id);

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .eq('user_id', userData.user.id)
      .maybeSingle();

    if (error) {
      console.error('ClientService.getById error:', error);
      throw error;
    }
    
    if (!data) {
      console.log('ClientService.getById - No client found for id:', id);
      return null;
    }

    console.log('ClientService.getById - Client found:', data);

    const result = {
      id: data.id,
      name: data.name,
      contact: data.contact || '',
      email: data.email || '',
      phone: data.phone || '',
      totalRevenue: data.total_revenue || 0,
      lastEvent: data.last_event ? new Date(data.last_event) : undefined,
      notes: data.notes || ''
    };

    console.log('ClientService.getById - Returning client:', result);
    return result;
  }
}
