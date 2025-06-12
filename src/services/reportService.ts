
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
    return [
      {
        id: '1',
        name: 'Relatório de Transações',
        description: 'Relatório completo de todas as transações'
      },
      {
        id: '2',
        name: 'Relatório de Clientes',
        description: 'Informações detalhadas dos clientes'
      },
      {
        id: '3',
        name: 'Análise Financeira',
        description: 'Análise detalhada da performance financeira'
      }
    ];
  }
}
