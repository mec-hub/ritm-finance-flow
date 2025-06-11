
import { supabase } from '@/integrations/supabase/client';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  status: 'active' | 'pending' | 'inactive';
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
  assignments: {
    role: string;
    percentage: number;
  }[];
  userId: string;
  createdAt: string;
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: string;
  status: 'pending' | 'accepted' | 'declined';
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
}

export class TeamManagementService {
  static async getTeamMembers(userId: string): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        profiles(email, full_name, avatar_url)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching team members:', error);
      return [];
    }

    return data?.map(member => ({
      id: member.id,
      name: member.name || member.profiles?.full_name || 'Unknown',
      email: member.profiles?.email || '',
      role: member.role || 'member',
      status: 'active', // You might want to add this field to your database
      joinDate: member.created_at,
      avatar: member.profiles?.avatar_url,
      percentageShare: Number(member.percentage_share) || 0,
      totalPaid: Number(member.total_paid) || 0,
      pendingAmount: Number(member.pending_amount) || 0,
      profileId: member.profile_id
    })) || [];
  }

  static async addTeamMember(userId: string, memberData: Partial<TeamMember>): Promise<boolean> {
    const { error } = await supabase
      .from('team_members')
      .insert({
        user_id: userId,
        name: memberData.name,
        role: memberData.role || 'member',
        percentage_share: memberData.percentageShare || 0,
        total_paid: 0,
        pending_amount: 0
      });

    if (error) {
      console.error('Error adding team member:', error);
      return false;
    }

    return true;
  }

  static async updateTeamMember(memberId: string, updates: Partial<TeamMember>): Promise<boolean> {
    const updateData: any = {};
    
    if (updates.name) updateData.name = updates.name;
    if (updates.role) updateData.role = updates.role;
    if (updates.percentageShare !== undefined) updateData.percentage_share = updates.percentageShare;

    const { error } = await supabase
      .from('team_members')
      .update(updateData)
      .eq('id', memberId);

    if (error) {
      console.error('Error updating team member:', error);
      return false;
    }

    return true;
  }

  static async removeTeamMember(memberId: string): Promise<boolean> {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      console.error('Error removing team member:', error);
      return false;
    }

    return true;
  }

  static async getPercentageTemplates(userId: string): Promise<PercentageTemplate[]> {
    const { data, error } = await supabase
      .from('percentage_templates')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching percentage templates:', error);
      return [];
    }

    return data || [];
  }

  static async createPercentageTemplate(userId: string, template: Omit<PercentageTemplate, 'id' | 'userId' | 'createdAt'>): Promise<boolean> {
    const { error } = await supabase
      .from('percentage_templates')
      .insert({
        user_id: userId,
        name: template.name,
        description: template.description,
        assignments: template.assignments
      });

    if (error) {
      console.error('Error creating percentage template:', error);
      return false;
    }

    return true;
  }

  static async applyPercentageTemplate(templateId: string, transactionId: string): Promise<boolean> {
    try {
      // Get template assignments
      const { data: template, error: templateError } = await supabase
        .from('percentage_templates')
        .select('assignments')
        .eq('id', templateId)
        .single();

      if (templateError || !template) {
        console.error('Error fetching template:', templateError);
        return false;
      }

      // Get team members for this user
      const { data: teamMembers, error: membersError } = await supabase
        .from('team_members')
        .select('id, role');

      if (membersError) {
        console.error('Error fetching team members:', membersError);
        return false;
      }

      // Create assignments based on template
      const assignments = [];
      for (const assignment of template.assignments) {
        const member = teamMembers?.find(m => m.role === assignment.role);
        if (member) {
          assignments.push({
            transaction_id: transactionId,
            team_member_id: member.id,
            percentage_value: assignment.percentage
          });
        }
      }

      if (assignments.length > 0) {
        const { error: assignmentError } = await supabase
          .from('team_transaction_assignments')
          .insert(assignments);

        if (assignmentError) {
          console.error('Error creating assignments:', assignmentError);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error applying percentage template:', error);
      return false;
    }
  }

  static async sendTeamInvitation(email: string, role: string, invitedBy: string): Promise<boolean> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    const { error } = await supabase
      .from('team_invitations')
      .insert({
        email,
        role,
        invited_by: invitedBy,
        status: 'pending',
        expires_at: expiresAt.toISOString()
      });

    if (error) {
      console.error('Error sending team invitation:', error);
      return false;
    }

    // Here you would also send an email notification
    return true;
  }

  static async getTeamEarnings(userId: string, startDate?: string, endDate?: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .rpc('calculate_team_member_earnings', {
          member_id: userId,
          start_date: startDate || null,
          end_date: endDate || null
        });

      if (error) {
        console.error('Error calculating team earnings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching team earnings:', error);
      return null;
    }
  }
}
