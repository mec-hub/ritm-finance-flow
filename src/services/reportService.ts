
import { Transaction, Event, Client } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface ReportFilters {
  dateFrom?: Date;
  dateTo?: Date;
  category?: string;
  type?: 'income' | 'expense' | 'all';
  eventId?: string;
  clientId?: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'financial' | 'client' | 'event' | 'tax' | 'team';
  fields: string[];
}

export class ReportService {
  private static getCompanyInfo() {
    return {
      name: 'Sua Empresa',
      address: 'Endereço da Empresa',
      phone: '(11) 99999-9999',
      email: 'contato@empresa.com',
      website: 'www.empresa.com'
    };
  }

  static generatePDFReport(
    reportType: string,
    data: any,
    filters: ReportFilters,
    template?: ReportTemplate
  ): void {
    const doc = new jsPDF();
    const company = this.getCompanyInfo();
    
    // Header with company info
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text(company.name, 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(company.address, 20, 30);
    doc.text(`${company.phone} | ${company.email}`, 20, 35);
    
    // Report title
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    const reportTitle = this.getReportTitle(reportType);
    doc.text(reportTitle, 20, 50);
    
    // Date range
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const dateRange = this.getDateRangeText(filters);
    doc.text(dateRange, 20, 60);
    doc.text(`Gerado em: ${formatDate(new Date())}`, 20, 65);
    
    // Line separator
    doc.setLineWidth(0.5);
    doc.line(20, 75, 190, 75);
    
    let yPosition = 85;
    
    switch (reportType) {
      case 'financial':
        yPosition = this.addFinancialReportContent(doc, data, yPosition);
        break;
      case 'client':
        yPosition = this.addClientReportContent(doc, data, yPosition);
        break;
      case 'event':
        yPosition = this.addEventReportContent(doc, data, yPosition);
        break;
      case 'tax':
        yPosition = this.addTaxReportContent(doc, data, yPosition);
        break;
      case 'team':
        yPosition = this.addTeamReportContent(doc, data, yPosition);
        break;
    }
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Página ${i} de ${pageCount}`, 170, 285);
      doc.text(company.website, 20, 285);
    }
    
    doc.save(`relatorio-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  static generateExcelReport(
    reportType: string,
    data: any,
    filters: ReportFilters
  ): void {
    const workbook = XLSX.utils.book_new();
    
    switch (reportType) {
      case 'financial':
        this.addFinancialExcelSheet(workbook, data);
        break;
      case 'client':
        this.addClientExcelSheet(workbook, data);
        break;
      case 'event':
        this.addEventExcelSheet(workbook, data);
        break;
      case 'tax':
        this.addTaxExcelSheet(workbook, data);
        break;
      case 'team':
        this.addTeamExcelSheet(workbook, data);
        break;
    }
    
    XLSX.writeFile(workbook, `relatorio-${reportType}-${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  private static getReportTitle(reportType: string): string {
    const titles = {
      financial: 'Relatório Financeiro',
      client: 'Relatório de Clientes',
      event: 'Relatório de Eventos',
      tax: 'Relatório Fiscal',
      team: 'Relatório de Equipe'
    };
    return titles[reportType as keyof typeof titles] || 'Relatório';
  }

  private static getDateRangeText(filters: ReportFilters): string {
    if (filters.dateFrom && filters.dateTo) {
      return `Período: ${formatDate(filters.dateFrom)} até ${formatDate(filters.dateTo)}`;
    } else if (filters.dateFrom) {
      return `A partir de: ${formatDate(filters.dateFrom)}`;
    } else if (filters.dateTo) {
      return `Até: ${formatDate(filters.dateTo)}`;
    }
    return 'Período: Todos os registros';
  }

  private static addFinancialReportContent(doc: jsPDF, data: any, yPosition: number): number {
    const { transactions, summary } = data;
    
    // Summary section
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('Resumo Financeiro', 20, yPosition);
    yPosition += 10;
    
    const summaryData = [
      ['Receitas', formatCurrency(summary.totalIncome)],
      ['Despesas', formatCurrency(summary.totalExpenses)],
      ['Lucro Líquido', formatCurrency(summary.netProfit)],
      ['Margem de Lucro', `${summary.profitMargin}%`]
    ];
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Métrica', 'Valor']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 20;
    
    // Transactions table
    doc.setFontSize(12);
    doc.text('Transações Detalhadas', 20, yPosition);
    yPosition += 10;
    
    const transactionData = transactions.map((t: Transaction) => [
      formatDate(t.date),
      t.description,
      t.category,
      t.type === 'income' ? 'Receita' : 'Despesa',
      formatCurrency(t.amount),
      t.status === 'paid' ? 'Pago' : t.status === 'not_paid' ? 'Não Pago' : 'Cancelado'
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Status']],
      body: transactionData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
      columnStyles: {
        4: { halign: 'right' }
      }
    });
    
    return (doc as any).lastAutoTable.finalY + 10;
  }

  private static addClientReportContent(doc: jsPDF, data: any, yPosition: number): number {
    const { clients, totalRevenue } = data;
    
    doc.setFontSize(12);
    doc.text(`Análise de Clientes - Receita Total: ${formatCurrency(totalRevenue)}`, 20, yPosition);
    yPosition += 15;
    
    const clientData = clients.map((client: Client) => [
      client.name,
      client.email,
      client.contact,
      formatCurrency(client.totalRevenue),
      client.lastEvent ? formatDate(client.lastEvent) : 'N/A'
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Cliente', 'Email', 'Contato', 'Receita Total', 'Último Evento']],
      body: clientData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
      columnStyles: {
        3: { halign: 'right' }
      }
    });
    
    return (doc as any).lastAutoTable.finalY + 10;
  }

  private static addEventReportContent(doc: jsPDF, data: any, yPosition: number): number {
    const { events, summary } = data;
    
    doc.setFontSize(12);
    doc.text('Análise de Performance de Eventos', 20, yPosition);
    yPosition += 15;
    
    const eventData = events.map((event: Event) => [
      event.title,
      formatDate(event.date),
      event.client,
      event.status === 'completed' ? 'Realizado' : event.status === 'upcoming' ? 'Próximo' : 'Cancelado',
      formatCurrency(event.actualRevenue || event.estimatedRevenue),
      formatCurrency(event.actualExpenses || event.estimatedExpenses),
      formatCurrency((event.actualRevenue || event.estimatedRevenue) - (event.actualExpenses || event.estimatedExpenses))
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Evento', 'Data', 'Cliente', 'Status', 'Receita', 'Despesas', 'Lucro']],
      body: eventData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
      columnStyles: {
        4: { halign: 'right' },
        5: { halign: 'right' },
        6: { halign: 'right' }
      }
    });
    
    return (doc as any).lastAutoTable.finalY + 10;
  }

  private static addTaxReportContent(doc: jsPDF, data: any, yPosition: number): number {
    const { categorizedExpenses, totalDeductible } = data;
    
    doc.setFontSize(12);
    doc.text(`Relatório Fiscal - Total Dedutível: ${formatCurrency(totalDeductible)}`, 20, yPosition);
    yPosition += 15;
    
    const taxData = Object.entries(categorizedExpenses).map(([category, amount]) => [
      category,
      formatCurrency(amount as number),
      `${(((amount as number) / totalDeductible) * 100).toFixed(1)}%`
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Categoria', 'Valor', '% do Total']],
      body: taxData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
      columnStyles: {
        1: { halign: 'right' },
        2: { halign: 'right' }
      }
    });
    
    return (doc as any).lastAutoTable.finalY + 10;
  }

  private static addTeamReportContent(doc: jsPDF, data: any, yPosition: number): number {
    const { teamMembers, totalPaid } = data;
    
    doc.setFontSize(12);
    doc.text(`Relatório de Equipe - Total Pago: ${formatCurrency(totalPaid)}`, 20, yPosition);
    yPosition += 15;
    
    const teamData = teamMembers.map((member: any) => [
      member.name,
      member.role,
      `${member.percentageShare}%`,
      formatCurrency(member.totalPaid),
      formatCurrency(member.pendingAmount)
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Membro', 'Função', '% Participação', 'Total Pago', 'Pendente']],
      body: teamData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
      columnStyles: {
        3: { halign: 'right' },
        4: { halign: 'right' }
      }
    });
    
    return (doc as any).lastAutoTable.finalY + 10;
  }

  private static addFinancialExcelSheet(workbook: XLSX.WorkBook, data: any): void {
    const { transactions, summary } = data;
    
    // Summary sheet
    const summaryData = [
      ['Métrica', 'Valor'],
      ['Receitas', summary.totalIncome],
      ['Despesas', summary.totalExpenses],
      ['Lucro Líquido', summary.netProfit],
      ['Margem de Lucro (%)', summary.profitMargin]
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');
    
    // Transactions sheet
    const transactionData = [
      ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Status', 'Observações'],
      ...transactions.map((t: Transaction) => [
        formatDate(t.date),
        t.description,
        t.category,
        t.type === 'income' ? 'Receita' : 'Despesa',
        t.amount,
        t.status === 'paid' ? 'Pago' : t.status === 'not_paid' ? 'Não Pago' : 'Cancelado',
        t.notes || ''
      ])
    ];
    
    const transactionSheet = XLSX.utils.aoa_to_sheet(transactionData);
    XLSX.utils.book_append_sheet(workbook, transactionSheet, 'Transações');
  }

  private static addClientExcelSheet(workbook: XLSX.WorkBook, data: any): void {
    const { clients } = data;
    
    const clientData = [
      ['Cliente', 'Email', 'Telefone', 'Contato', 'Receita Total', 'Último Evento', 'Observações'],
      ...clients.map((client: Client) => [
        client.name,
        client.email,
        client.phone || '',
        client.contact,
        client.totalRevenue,
        client.lastEvent ? formatDate(client.lastEvent) : '',
        client.notes || ''
      ])
    ];
    
    const clientSheet = XLSX.utils.aoa_to_sheet(clientData);
    XLSX.utils.book_append_sheet(workbook, clientSheet, 'Clientes');
  }

  private static addEventExcelSheet(workbook: XLSX.WorkBook, data: any): void {
    const { events } = data;
    
    const eventData = [
      ['Evento', 'Data', 'Local', 'Cliente', 'Status', 'Receita Estimada', 'Receita Real', 'Despesas Estimadas', 'Despesas Reais', 'Lucro'],
      ...events.map((event: Event) => [
        event.title,
        formatDate(event.date),
        event.location,
        event.client,
        event.status,
        event.estimatedRevenue,
        event.actualRevenue || '',
        event.estimatedExpenses,
        event.actualExpenses || '',
        (event.actualRevenue || event.estimatedRevenue) - (event.actualExpenses || event.estimatedExpenses)
      ])
    ];
    
    const eventSheet = XLSX.utils.aoa_to_sheet(eventData);
    XLSX.utils.book_append_sheet(workbook, eventSheet, 'Eventos');
  }

  private static addTaxExcelSheet(workbook: XLSX.WorkBook, data: any): void {
    const { categorizedExpenses, transactions } = data;
    
    // Summary by category
    const categoryData = [
      ['Categoria', 'Valor Total', '% do Total'],
      ...Object.entries(categorizedExpenses).map(([category, amount]) => [
        category,
        amount,
        ((amount as number) / Object.values(categorizedExpenses).reduce((a: number, b: number) => a + b, 0) * 100).toFixed(2)
      ])
    ];
    
    const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(workbook, categorySheet, 'Por Categoria');
    
    // Detailed transactions
    const transactionData = [
      ['Data', 'Descrição', 'Categoria', 'Valor', 'Status'],
      ...transactions.filter((t: Transaction) => t.type === 'expense').map((t: Transaction) => [
        formatDate(t.date),
        t.description,
        t.category,
        t.amount,
        t.status
      ])
    ];
    
    const transactionSheet = XLSX.utils.aoa_to_sheet(transactionData);
    XLSX.utils.book_append_sheet(workbook, transactionSheet, 'Despesas Detalhadas');
  }

  private static addTeamExcelSheet(workbook: XLSX.WorkBook, data: any): void {
    const { teamMembers } = data;
    
    const teamData = [
      ['Membro', 'Função', '% Participação', 'Total Pago', 'Valor Pendente'],
      ...teamMembers.map((member: any) => [
        member.name,
        member.role,
        member.percentageShare,
        member.totalPaid,
        member.pendingAmount
      ])
    ];
    
    const teamSheet = XLSX.utils.aoa_to_sheet(teamData);
    XLSX.utils.book_append_sheet(workbook, teamSheet, 'Equipe');
  }

  static getReportTemplates(): ReportTemplate[] {
    return [
      {
        id: 'financial-summary',
        name: 'Resumo Financeiro',
        description: 'Relatório com resumo de receitas, despesas e lucro',
        type: 'financial',
        fields: ['summary', 'transactions']
      },
      {
        id: 'financial-detailed',
        name: 'Financeiro Detalhado',
        description: 'Relatório financeiro completo com todas as transações',
        type: 'financial',
        fields: ['summary', 'transactions', 'categories', 'trends']
      },
      {
        id: 'client-performance',
        name: 'Performance de Clientes',
        description: 'Análise de receita por cliente e histórico',
        type: 'client',
        fields: ['revenue', 'events', 'timeline']
      },
      {
        id: 'event-roi',
        name: 'ROI de Eventos',
        description: 'Análise de retorno sobre investimento por evento',
        type: 'event',
        fields: ['revenue', 'expenses', 'profit', 'comparison']
      },
      {
        id: 'tax-preparation',
        name: 'Preparação Fiscal',
        description: 'Relatório de despesas categorizadas para declaração',
        type: 'tax',
        fields: ['deductible-expenses', 'categories', 'receipts']
      },
      {
        id: 'team-compensation',
        name: 'Compensação da Equipe',
        description: 'Relatório de pagamentos e participações da equipe',
        type: 'team',
        fields: ['payments', 'percentages', 'pending']
      }
    ];
  }
}
