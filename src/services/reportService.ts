
import { TransactionService } from './transactionService';
import { ClientService } from './clientService';
import { EventService } from './eventService';
import { TeamManagementService } from './teamManagementService';
import { Transaction, Client, Event, TeamMember } from '@/types';

export interface ReportFilters {
  dateFrom?: Date;
  dateTo?: Date;
  category?: string;
  type?: 'income' | 'expense';
  clientId?: string;
  eventId?: string;
  teamMemberId?: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  transactionCount: number;
  averageTransaction: number;
}

export interface TeamMemberPerformance {
  memberId: string;
  memberName: string;
  totalEarnings: number;
  transactionCount: number;
  averagePercentage: number;
}

export class ReportService {
  static async getTransactionsByFilters(filters: ReportFilters): Promise<Transaction[]> {
    // Convert filters to match TransactionService expected format
    const serviceFilters: any = {};
    
    if (filters.dateFrom) serviceFilters.dateFrom = filters.dateFrom;
    if (filters.dateTo) serviceFilters.dateTo = filters.dateTo;
    if (filters.category) serviceFilters.category = filters.category;
    if (filters.type && filters.type !== 'all') serviceFilters.type = filters.type;
    if (filters.clientId) serviceFilters.clientId = filters.clientId;
    if (filters.eventId) serviceFilters.eventId = filters.eventId;

    let transactions = await TransactionService.getByFilters(serviceFilters);

    // Apply additional filtering that couldn't be done at the service level
    if (filters.teamMemberId) {
      transactions = transactions.filter(t => 
        t.teamPercentages?.some(tp => tp.teamMemberId === filters.teamMemberId)
      );
    }

    return transactions;
  }

  static async getFinancialSummary(filters: ReportFilters): Promise<FinancialSummary> {
    const transactions = await this.getTransactionsByFilters(filters);
    
    const paidTransactions = transactions.filter(t => t.status === 'paid');
    
    const totalIncome = paidTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = paidTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netProfit = totalIncome - totalExpenses;
    const transactionCount = paidTransactions.length;
    const averageTransaction = transactionCount > 0 ? (totalIncome + totalExpenses) / transactionCount : 0;

    return {
      totalIncome,
      totalExpenses,
      netProfit,
      transactionCount,
      averageTransaction
    };
  }

  static async getTeamPerformance(filters: ReportFilters): Promise<TeamMemberPerformance[]> {
    const transactions = await this.getTransactionsByFilters(filters);
    const teamMembers = await TeamManagementService.getAllMembers();
    
    const performance: TeamMemberPerformance[] = [];
    
    for (const member of teamMembers) {
      const memberTransactions = transactions.filter(t => 
        t.teamPercentages?.some(tp => tp.teamMemberId === member.id) &&
        t.type === 'income' &&
        t.status === 'paid'
      );
      
      let totalEarnings = 0;
      let totalPercentage = 0;
      let assignmentCount = 0;
      
      memberTransactions.forEach(transaction => {
        const assignment = transaction.teamPercentages?.find(tp => tp.teamMemberId === member.id);
        if (assignment) {
          totalEarnings += transaction.amount * (assignment.percentageValue / 100);
          totalPercentage += assignment.percentageValue;
          assignmentCount++;
        }
      });
      
      const averagePercentage = assignmentCount > 0 ? totalPercentage / assignmentCount : 0;
      
      performance.push({
        memberId: member.id,
        memberName: member.name,
        totalEarnings,
        transactionCount: memberTransactions.length,
        averagePercentage
      });
    }
    
    return performance.sort((a, b) => b.totalEarnings - a.totalEarnings);
  }

  static async getClientAnalysis(filters: ReportFilters): Promise<any[]> {
    const transactions = await this.getTransactionsByFilters(filters);
    const clients = await ClientService.getAll();
    
    const clientAnalysis = clients.map(client => {
      const clientTransactions = transactions.filter(t => t.clientId === client.id);
      const revenue = clientTransactions
        .filter(t => t.type === 'income' && t.status === 'paid')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = clientTransactions
        .filter(t => t.type === 'expense' && t.status === 'paid')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        clientId: client.id,
        clientName: client.name,
        revenue,
        expenses,
        profit: revenue - expenses,
        transactionCount: clientTransactions.length
      };
    });
    
    return clientAnalysis
      .filter(c => c.transactionCount > 0)
      .sort((a, b) => b.revenue - a.revenue);
  }

  static async getEventAnalysis(filters: ReportFilters): Promise<any[]> {
    const transactions = await this.getTransactionsByFilters(filters);
    const events = await EventService.getAll();
    
    const eventAnalysis = events.map(event => {
      const eventTransactions = transactions.filter(t => t.eventId === event.id);
      const revenue = eventTransactions
        .filter(t => t.type === 'income' && t.status === 'paid')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = eventTransactions
        .filter(t => t.type === 'expense' && t.status === 'paid')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        revenue,
        expenses,
        profit: revenue - expenses,
        transactionCount: eventTransactions.length
      };
    });
    
    return eventAnalysis
      .filter(e => e.transactionCount > 0)
      .sort((a, b) => b.revenue - a.revenue);
  }

  static async exportToCSV(transactions: Transaction[]): Promise<string> {
    const headers = [
      'Data',
      'Descrição',
      'Categoria',
      'Tipo',
      'Valor',
      'Status',
      'Cliente',
      'Evento',
      'Observações'
    ];
    
    const rows = transactions.map(transaction => [
      transaction.date.toLocaleDateString('pt-BR'),
      transaction.description,
      transaction.category,
      transaction.type === 'income' ? 'Receita' : 'Despesa',
      `R$ ${transaction.amount.toFixed(2)}`,
      transaction.status === 'paid' ? 'Pago' : transaction.status === 'not_paid' ? 'Não Pago' : 'Cancelado',
      transaction.clientId || '',
      transaction.eventId || '',
      transaction.notes || ''
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    return csvContent;
  }

  static async exportToPDF(transactions: Transaction[]): Promise<void> {
    // This would require a PDF library like jsPDF
    // For now, we'll just download as CSV
    const csvContent = await this.exportToCSV(transactions);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_transacoes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
