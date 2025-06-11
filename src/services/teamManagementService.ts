
import { supabase } from '@/integrations/supabase/client';
import { TeamMember } from '@/types';

export interface NewMemberForm {
  name: string;
  role: string;
  percentageShare: number;
}

export interface PercentageTemplate {
  id: string;
  name: string;
  description: string;
  defaultAssignments: TeamPercentageAssignment[];
}

export interface TeamPercentageAssignment {
  teamMemberId: string;
  percentageValue: number;
  teamMemberName?: string;
}

export class TeamManagementService {
  static async getAllMembers(): Promise<TeamMember[]> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('name');

    if (error) throw error;

    return data?.map(member => ({
      id: member.id,
      name: member.name,
      role: member.role || '',
      percentageShare: member.percentage_share || 0,
      totalPaid: member.total_paid || 0,
      pendingAmount: member.pending_amount || 0
    })) || [];
  }

  static async createMember(memberData: NewMemberForm): Promise<TeamMember> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('team_members')
      .insert({
        name: memberData.name,
        role: memberData.role,
        percentage_share: memberData.percentageShare,
        user_id: userData.user.id,
        total_paid: 0,
        pending_amount: 0
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      role: data.role || '',
      percentageShare: data.percentage_share || 0,
      totalPaid: data.total_paid || 0,
      pendingAmount: data.pending_amount || 0
    };
  }

  static async updateMember(id: string, updates: Partial<NewMemberForm>): Promise<void> {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.role !== undefined) updateData.role = updates.role;
    if (updates.percentageShare !== undefined) updateData.percentage_share = updates.percentageShare;

    const { error } = await supabase
      .from('team_members')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
  }

  static async deleteMember(id: string): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getPercentageTemplates(): Promise<PercentageTemplate[]> {
    // For now, return some default templates
    return [
      {
        id: 'partners-only',
        name: 'Apenas Sócios',
        description: 'Rian (40%) e Davi (60%)',
        defaultAssignments: []
      },
      {
        id: 'with-employee',
        name: 'Com Funcionário',
        description: 'Inclui funcionário com percentual variável',
        defaultAssignments: []
      }
    ];
  }

  static async calculateMemberEarnings(memberId: string, startDate?: Date, endDate?: Date) {
    const { data, error } = await supabase
      .rpc('calculate_team_member_earnings', {
        member_id: memberId,
        start_date: startDate?.toISOString().split('T')[0] || null,
        end_date: endDate?.toISOString().split('T')[0] || null
      });

    if (error) throw error;

    return data?.[0] || {
      total_earnings: 0,
      total_transactions: 0,
      avg_percentage: 0
    };
  }
}
