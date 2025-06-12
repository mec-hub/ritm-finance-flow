
import { Transaction } from '@/types';

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
}

export class ReportService {
  static async getReportTemplates(): Promise<ReportTemplate[]> {
    // Simplified templates for development
    return [
      {
        id: '1',
        name: 'Relatório Básico',
        description: 'Relatório simples de transações'
      },
      {
        id: '2',
        name: 'Relatório Mensal',
        description: 'Relatório mensal básico'
      }
    ];
  }

  static async exportToCSV(transactions: Transaction[]): Promise<string> {
    // Basic CSV export placeholder
    const headers = ['Data', 'Descrição', 'Valor', 'Tipo'];
    const rows = transactions.map(t => [
      t.date.toLocaleDateString('pt-BR'),
      t.description,
      `R$ ${t.amount.toFixed(2)}`,
      t.type === 'income' ? 'Receita' : 'Despesa'
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  }
}
