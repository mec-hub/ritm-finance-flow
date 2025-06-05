
import { supabase } from '@/integrations/supabase/client';
import { TeamMember } from '@/types';

export class TeamService {
  static async getAll(): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return data.map(member => ({
      id: member.id,
      name: member.name,
      role: member.role || '',
      percentageShare: member.percentage_share || 0,
      totalPaid: member.total_paid || 0,
      pendingAmount: member.pending_amount || 0
    }));
  }

  static async create(member: Omit<TeamMember, 'id'>): Promise<TeamMember> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('team_members')
      .insert({
        name: member.name,
        role: member.role,
        percentage_share: member.percentageShare,
        total_paid: member.totalPaid,
        pending_amount: member.pendingAmount,
        user_id: userData.user.id
      })
      .select()
      .single();

    if (error) throw error;
    return { ...member, id: data.id };
  }

  static async update(id: string, updates: Partial<TeamMember>): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .update({
        name: updates.name,
        role: updates.role,
        percentage_share: updates.percentageShare,
        total_paid: updates.totalPaid,
        pending_amount: updates.pendingAmount
      })
      .eq('id', id);

    if (error) throw error;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getById(id: string): Promise<TeamMember | null> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      role: data.role || '',
      percentageShare: data.percentage_share || 0,
      totalPaid: data.total_paid || 0,
      pendingAmount: data.pending_amount || 0
    };
  }
}
