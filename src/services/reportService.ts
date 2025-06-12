
import { supabase } from '@/integrations/supabase/client';
import { Transaction, Event, Client, TeamMember } from '@/types';
import { TransactionService } from './transactionService';
import { EventService } from './eventService';
import { ClientService } from './clientService';

export interface ReportFilters {
  dateFrom?: Date;
  dateTo?: Date;
  category?: string;
  type?: 'income' | 'expense' | 'all';
  clientId?: string;
  eventId?: string;
  teamMemberId?: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  filters: ReportFilters;
  type: 'financial' | 'team' | 'client' | 'event';
  fields?: string[];
}

export class ReportService {
  static async generateFinancialReport(filters: ReportFilters = {}) {
    try {
      // Filter out 'all' type before passing to TransactionService
      const serviceFilters: {
        category?: string;
        type?: 'income' | 'expense';
        dateFrom?: Date;
        dateTo?: Date;
        eventId?: string;
        clientId?: string;
      } = { ...filters };
      
      if (serviceFilters.type === 'all') {
        delete serviceFilters.type;
      }
      
      const transactions = await TransactionService.getByFilters(serviceFilters);
      
      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        transactions,
        summary: {
          totalIncome: income,
          totalExpenses: expenses,
          netProfit: income - expenses,
          transactionCount: transactions.length
        }
      };
    } catch (error) {
      console.error('Error generating financial report:', error);
      throw error;
    }
  }

  static async generateTeamReport(teamMemberId?: string) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      let query = supabase
        .from('team_transaction_assignments')
        .select(`
          *,
          team_members(name, role),
          transactions(amount, type, date, description, status)
        `)
        .eq('transactions.user_id', userData.user.id);

      if (teamMemberId) {
        query = query.eq('team_member_id', teamMemberId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error generating team report:', error);
      throw error;
    }
  }

  static async generatePDFReport(reportData: any, title: string) {
    // Placeholder for PDF generation
    console.log('PDF generation not implemented yet');
    return null;
  }

  static async generateExcelReport(reportData: any, title: string) {
    // Placeholder for Excel generation
    console.log('Excel generation not implemented yet');
    return null;
  }

  static getReportTemplates(): ReportTemplate[] {
    return [
      {
        id: '1',
        name: 'Relatório Mensal',
        description: 'Relatório financeiro mensal completo',
        type: 'financial',
        filters: {},
        fields: ['description', 'amount', 'date', 'category']
      },
      {
        id: '2',
        name: 'Relatório por Equipe',
        description: 'Análise de performance da equipe',
        type: 'team',
        filters: {},
        fields: ['team_member', 'percentage', 'amount']
      }
    ];
  }
}
