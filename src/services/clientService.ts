
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types';
import { DebugService } from './debugService';

export class ClientService {
  static async getAll(): Promise<Client[]> {
    console.log('=== ClientService.getAll START ===');
    
    // Debug authentication and database
    const user = await DebugService.logUserAuth();
    await DebugService.logDatabaseConnection();
    await DebugService.logRLSPolicies('clients');
    
    if (!user) {
      console.error('ClientService.getAll - No authenticated user');
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name', { ascending: true });

    console.log('ClientService.getAll - Raw result:', { data, error });

    if (error) {
      console.error('ClientService.getAll - Database error:', error);
      throw error;
    }

    const mappedData = data.map(client => ({
      id: client.id,
      name: client.name,
      contact: client.contact || '',
      email: client.email || '',
      phone: client.phone || '',
      totalRevenue: client.total_revenue || 0,
      lastEvent: client.last_event ? new Date(client.last_event) : undefined,
      notes: client.notes || ''
    }));

    console.log('ClientService.getAll - Mapped data:', mappedData);
    console.log('=== ClientService.getAll END ===');
    
    return mappedData;
  }

  static async create(client: Omit<Client, 'id'>): Promise<Client> {
    console.log('=== ClientService.create START ===');
    console.log('ClientService.create - Input data:', client);
    
    const user = await DebugService.logUserAuth();
    if (!user) {
      console.error('ClientService.create - No authenticated user');
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
      user_id: user.id
    };

    console.log('ClientService.create - Insert data:', insertData);

    const { data, error } = await supabase
      .from('clients')
      .insert(insertData)
      .select()
      .single();

    console.log('ClientService.create - Result:', { data, error });

    if (error) {
      console.error('ClientService.create - Database error:', error);
      throw error;
    }

    const result = { ...client, id: data.id };
    console.log('ClientService.create - Final result:', result);
    console.log('=== ClientService.create END ===');
    
    return result;
  }

  static async update(id: string, updates: Partial<Client>): Promise<void> {
    console.log('=== ClientService.update START ===');
    console.log('ClientService.update - Input:', { id, updates });

    const user = await DebugService.logUserAuth();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.contact !== undefined) updateData.contact = updates.contact || null;
    if (updates.email !== undefined) updateData.email = updates.email || null;
    if (updates.phone !== undefined) updateData.phone = updates.phone || null;
    if (updates.totalRevenue !== undefined) updateData.total_revenue = updates.totalRevenue;
    if (updates.lastEvent !== undefined) updateData.last_event = updates.lastEvent?.toISOString().split('T')[0] || null;
    if (updates.notes !== undefined) updateData.notes = updates.notes || null;

    console.log('ClientService.update - Update data:', updateData);

    const { error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', id);

    console.log('ClientService.update - Result:', { error });

    if (error) {
      console.error('ClientService.update - Database error:', error);
      throw error;
    }

    console.log('=== ClientService.update END ===');
  }

  static async delete(id: string): Promise<void> {
    console.log('=== ClientService.delete START ===');
    console.log('ClientService.delete - ID:', id);

    const user = await DebugService.logUserAuth();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    console.log('ClientService.delete - Result:', { error });

    if (error) {
      console.error('ClientService.delete - Database error:', error);
      throw error;
    }

    console.log('=== ClientService.delete END ===');
  }

  static async getById(id: string): Promise<Client | null> {
    console.log('=== ClientService.getById START ===');
    console.log('ClientService.getById - ID:', id);

    const user = await DebugService.logUserAuth();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    console.log('ClientService.getById - Result:', { data, error });

    if (error) {
      console.error('ClientService.getById - Database error:', error);
      throw error;
    }
    
    if (!data) {
      console.log('ClientService.getById - No data found');
      return null;
    }

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

    console.log('ClientService.getById - Mapped result:', result);
    console.log('=== ClientService.getById END ===');
    
    return result;
  }
}
