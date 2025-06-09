
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types';

export class ClientService {
  static async getAll(): Promise<Client[]> {
    console.log('ClientService.getAll - Starting request');
    
    const { data: userData } = await supabase.auth.getUser();
    console.log('ClientService.getAll - Current user:', userData.user?.id);

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name', { ascending: true });

    console.log('ClientService.getAll - Query result:', { data, error });

    if (error) {
      console.error('ClientService.getAll - Error:', error);
      throw error;
    }

    return data.map(client => ({
      id: client.id,
      name: client.name,
      contact: client.contact || '',
      email: client.email || '',
      phone: client.phone,
      totalRevenue: client.total_revenue || 0,
      lastEvent: client.last_event ? new Date(client.last_event) : undefined,
      notes: client.notes
    }));
  }

  static async create(client: Omit<Client, 'id'>): Promise<Client> {
    console.log('ClientService.create - Starting request with data:', client);
    
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error('ClientService.create - User not authenticated');
      throw new Error('User not authenticated');
    }

    console.log('ClientService.create - User ID:', userData.user.id);

    const insertData = {
      name: client.name,
      contact: client.contact,
      email: client.email,
      phone: client.phone,
      total_revenue: client.totalRevenue,
      last_event: client.lastEvent?.toISOString().split('T')[0],
      notes: client.notes,
      user_id: userData.user.id
    };

    console.log('ClientService.create - Insert data:', insertData);

    const { data, error } = await supabase
      .from('clients')
      .insert(insertData)
      .select()
      .single();

    console.log('ClientService.create - Query result:', { data, error });

    if (error) {
      console.error('ClientService.create - Error:', error);
      throw error;
    }
    
    return { ...client, id: data.id };
  }

  static async update(id: string, updates: Partial<Client>): Promise<void> {
    console.log('ClientService.update - Starting request:', { id, updates });

    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.contact !== undefined) updateData.contact = updates.contact;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.totalRevenue !== undefined) updateData.total_revenue = updates.totalRevenue;
    if (updates.lastEvent !== undefined) updateData.last_event = updates.lastEvent?.toISOString().split('T')[0];
    if (updates.notes !== undefined) updateData.notes = updates.notes;

    console.log('ClientService.update - Update data:', updateData);

    const { error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', id);

    console.log('ClientService.update - Query result:', { error });

    if (error) {
      console.error('ClientService.update - Error:', error);
      throw error;
    }
  }

  static async delete(id: string): Promise<void> {
    console.log('ClientService.delete - Starting request:', { id });

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    console.log('ClientService.delete - Query result:', { error });

    if (error) {
      console.error('ClientService.delete - Error:', error);
      throw error;
    }
  }

  static async getById(id: string): Promise<Client | null> {
    console.log('ClientService.getById - Starting request:', { id });

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    console.log('ClientService.getById - Query result:', { data, error });

    if (error) {
      console.error('ClientService.getById - Error:', error);
      throw error;
    }
    
    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      contact: data.contact || '',
      email: data.email || '',
      phone: data.phone,
      totalRevenue: data.total_revenue || 0,
      lastEvent: data.last_event ? new Date(data.last_event) : undefined,
      notes: data.notes
    };
  }
}
