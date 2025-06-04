
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types';

export class ClientService {
  static async getAll(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

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
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('clients')
      .insert({
        name: client.name,
        contact: client.contact,
        email: client.email,
        phone: client.phone,
        total_revenue: client.totalRevenue,
        last_event: client.lastEvent?.toISOString().split('T')[0],
        notes: client.notes,
        user_id: userData.user.id
      })
      .select()
      .single();

    if (error) throw error;
    return { ...client, id: data.id };
  }

  static async update(id: string, updates: Partial<Client>): Promise<void> {
    const { error } = await supabase
      .from('clients')
      .update({
        name: updates.name,
        contact: updates.contact,
        email: updates.email,
        phone: updates.phone,
        total_revenue: updates.totalRevenue,
        last_event: updates.lastEvent?.toISOString().split('T')[0],
        notes: updates.notes
      })
      .eq('id', id);

    if (error) throw error;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getById(id: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
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
