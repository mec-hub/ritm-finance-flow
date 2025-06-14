
import { supabase } from '@/integrations/supabase/client';

export class TeamEarningsService {
  static async updateTeamMemberEarnings(memberId: string): Promise<void> {
    const { error } = await supabase.rpc('update_team_member_earnings', {
      member_id_param: memberId
    });

    if (error) throw error;
  }

  static async updateAllTeamMemberEarnings(): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');

    const { error } = await supabase.rpc('update_all_team_member_earnings', {
      user_id_param: userData.user.id
    });

    if (error) throw error;
  }

  static async getTeamMemberEarnings(memberId: string) {
    const { data, error } = await supabase
      .from('team_members')
      .select('calculated_income, calculated_expenses, last_calculation_date')
      .eq('id', memberId)
      .single();

    if (error) throw error;

    return {
      income: data.calculated_income || 0,
      expenses: data.calculated_expenses || 0,
      profit: (data.calculated_income || 0) - (data.calculated_expenses || 0),
      lastCalculated: data.last_calculation_date
    };
  }

  static async getAllTeamMemberEarnings() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('team_members')
      .select('id, name, role, calculated_income, calculated_expenses, last_calculation_date')
      .eq('user_id', userData.user.id);

    if (error) throw error;

    return data.map(member => ({
      id: member.id,
      name: member.name,
      role: member.role,
      income: member.calculated_income || 0,
      expenses: member.calculated_expenses || 0,
      profit: (member.calculated_income || 0) - (member.calculated_expenses || 0),
      lastCalculated: member.last_calculation_date
    }));
  }
}
