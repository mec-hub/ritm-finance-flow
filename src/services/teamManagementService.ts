
import { supabase } from '@/integrations/supabase/client';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
  avatar?: string;
  percentageShare: number;
  totalPaid: number;
  pendingAmount: number;
  profileId?: string;
}

export interface PercentageTemplate {
  id: string;
  name: string;
  description: string;
  percentages: { [role: string]: number };
  userId: string;
  createdAt: string;
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  status: 'pending' | 'accepted' | 'rejected';
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
}

export class TeamManagementService {
  static async getTeamMembers(userId: string): Promise<TeamMember[]> {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching team members:', error);
        return [];
      }

      return data?.map((member: any) => ({
        id: member.id,
        name: member.name,
        email: member.email || '',
        role: member.role || 'member',
        status: 'active',
        joinDate: member.created_at,
        avatar: member.avatar || '',
        percentageShare: Number(member.percentage_share) || 0,
        totalPaid: Number(member.total_paid) || 0,
        pendingAmount: Number(member.pending_amount) || 0,
        profileId: member.profile_id
      })) || [];
    } catch (error) {
      console.error('Error in getTeamMembers:', error);
      return [];
    }
  }

  static async createTeamMember(teamMember: Omit<TeamMember, 'id' | 'joinDate'>): Promise<TeamMember | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('team_members')
        .insert({
          name: teamMember.name,
          role: teamMember.role,
          percentage_share: teamMember.percentageShare,
          total_paid: teamMember.totalPaid,
          pending_amount: teamMember.pendingAmount,
          profile_id: teamMember.profileId,
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating team member:', error);
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        email: teamMember.email,
        role: data.role,
        status: 'active',
        joinDate: data.created_at,
        avatar: teamMember.avatar,
        percentageShare: Number(data.percentage_share),
        totalPaid: Number(data.total_paid),
        pendingAmount: Number(data.pending_amount),
        profileId: data.profile_id
      };
    } catch (error) {
      console.error('Error in createTeamMember:', error);
      return null;
    }
  }

  static async updateTeamMember(teamMember: TeamMember): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({
          name: teamMember.name,
          role: teamMember.role,
          percentage_share: teamMember.percentageShare,
          total_paid: teamMember.totalPaid,
          pending_amount: teamMember.pendingAmount
        })
        .eq('id', teamMember.id);

      if (error) {
        console.error('Error updating team member:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateTeamMember:', error);
      return false;
    }
  }

  static async removeTeamMember(memberId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) {
        console.error('Error removing team member:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in removeTeamMember:', error);
      return false;
    }
  }

  // Mock implementation for percentage templates - would need separate table
  static async getPercentageTemplates(userId: string): Promise<PercentageTemplate[]> {
    // Mock data - in real implementation, this would fetch from database
    return [
      {
        id: '1',
        name: 'Distribuição Padrão',
        description: 'Divisão igualitária entre membros',
        percentages: { admin: 40, manager: 35, member: 25 },
        userId,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Por Senioridade',
        description: 'Baseado na experiência do membro',
        percentages: { admin: 50, manager: 30, member: 20 },
        userId,
        createdAt: new Date().toISOString()
      }
    ];
  }

  static async createPercentageTemplate(template: Omit<PercentageTemplate, 'id' | 'createdAt'>): Promise<PercentageTemplate | null> {
    // Mock implementation - would create in database
    const newTemplate: PercentageTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      ...template,
      createdAt: new Date().toISOString()
    };
    return newTemplate;
  }

  // Mock implementation for team invitations - would need separate table
  static async getTeamInvitations(userId: string): Promise<TeamInvitation[]> {
    // Mock data - in real implementation, this would fetch from database
    return [];
  }

  static async createTeamInvitation(invitation: Omit<TeamInvitation, 'id' | 'createdAt' | 'expiresAt'>): Promise<TeamInvitation | null> {
    // Mock implementation - would create in database
    const newInvitation: TeamInvitation = {
      id: Math.random().toString(36).substr(2, 9),
      ...invitation,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
    };
    return newInvitation;
  }

  static async updateInvitationStatus(invitationId: string, status: 'accepted' | 'rejected'): Promise<boolean> {
    // Mock implementation - would update in database
    return true;
  }
}
