
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Transaction } from '@/types';
import { ClientService } from './clientService';
import { formatCurrency } from '@/utils/formatters';

export interface ExportFilters {
  dateFrom?: Date;
  dateTo?: Date;
  category?: string;
  type?: 'income' | 'expense' | 'all';
  clientId?: string;
}

export interface ClientReportData {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalRevenue: number;
  transactionCount: number;
  lastTransactionDate?: Date;
}

export class ReportExportService {
  
  static async generateTransactionsPDF(transactions: Transaction[], filters: ExportFilters): Promise<void> {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text('Relatório de Transações', 20, 20);
    
    // Date range
    const dateRange = this.getDateRangeText(filters);
    if (dateRange) {
      doc.setFontSize(12);
      doc.setTextColor(80);
      doc.text(dateRange, 20, 30);
    }
    
    // Summary
    const summary = this.calculateSummary(transactions);
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text('Resumo:', 20, 45);
    
    doc.setFontSize(11);
    doc.text(`Total de Receitas: ${formatCurrency(summary.totalIncome)}`, 20, 55);
    doc.text(`Total de Despesas: ${formatCurrency(summary.totalExpenses)}`, 20, 65);
    doc.text(`Lucro Líquido: ${formatCurrency(summary.netProfit)}`, 20, 75);
    doc.text(`Total de Transações: ${summary.count}`, 20, 85);
    
    // Transactions table
    const tableColumns = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Status'];
    const tableRows = transactions.map(t => [
      t.date.toLocaleDateString('pt-BR'),
      t.description,
      t.category,
      t.type === 'income' ? 'Receita' : 'Despesa',
      formatCurrency(t.amount),
      t.status === 'paid' ? 'Pago' : t.status === 'not_paid' ? 'Não Pago' : 'Cancelado'
    ]);
    
    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: 95,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });
    
    // Footer - Fixed API usage
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Página ${i} de ${pageCount}`, (doc as any).internal.pageSize.width - 30, (doc as any).internal.pageSize.height - 10);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, (doc as any).internal.pageSize.height - 10);
    }
    
    doc.save('relatorio-transacoes.pdf');
  }
  
  static async generateClientsReportPDF(): Promise<void> {
    const clients = await ClientService.getAll();
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text('Relatório de Clientes', 20, 20);
    
    // Summary
    const totalClients = clients.length;
    const totalRevenue = clients.reduce((sum, client) => sum + client.totalRevenue, 0);
    
    doc.setFontSize(14);
    doc.text('Resumo:', 20, 35);
    
    doc.setFontSize(11);
    doc.text(`Total de Clientes: ${totalClients}`, 20, 45);
    doc.text(`Receita Total: ${formatCurrency(totalRevenue)}`, 20, 55);
    
    // Clients table
    const tableColumns = ['Nome', 'Email', 'Telefone', 'Receita Total', 'Último Evento'];
    const tableRows = clients.map(client => [
      client.name,
      client.email || '-',
      client.phone || '-',
      formatCurrency(client.totalRevenue),
      client.lastEvent ? client.lastEvent.toLocaleDateString('pt-BR') : '-'
    ]);
    
    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: 65,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });
    
    // Footer - Fixed API usage
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Página ${i} de ${pageCount}`, (doc as any).internal.pageSize.width - 30, (doc as any).internal.pageSize.height - 10);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, (doc as any).internal.pageSize.height - 10);
    }
    
    doc.save('relatorio-clientes.pdf');
  }
  
  static async generateTransactionsExcel(transactions: Transaction[], filters: ExportFilters): Promise<void> {
    const workbook = XLSX.utils.book_new();
    
    // Summary sheet
    const summary = this.calculateSummary(transactions);
    const summaryData = [
      ['Relatório de Transações'],
      [''],
      ['Total de Receitas', formatCurrency(summary.totalIncome)],
      ['Total de Despesas', formatCurrency(summary.totalExpenses)],
      ['Lucro Líquido', formatCurrency(summary.netProfit)],
      ['Total de Transações', summary.count.toString()],
      [''],
      ['Período:', this.getDateRangeText(filters) || 'Todos os períodos'],
      ['Gerado em:', new Date().toLocaleDateString('pt-BR')]
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');
    
    // Transactions sheet
    const transactionsData = [
      ['Data', 'Descrição', 'Categoria', 'Subcategoria', 'Tipo', 'Valor', 'Status', 'Notas']
    ];
    
    transactions.forEach(t => {
      transactionsData.push([
        t.date.toLocaleDateString('pt-BR'),
        t.description,
        t.category,
        t.subcategory || '',
        t.type === 'income' ? 'Receita' : 'Despesa',
        t.amount.toString(),
        t.status === 'paid' ? 'Pago' : t.status === 'not_paid' ? 'Não Pago' : 'Cancelado',
        t.notes || ''
      ]);
    });
    
    const transactionsSheet = XLSX.utils.aoa_to_sheet(transactionsData);
    XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Transações');
    
    // Category analysis sheet
    const categoryAnalysis = this.generateCategoryAnalysis(transactions);
    const categorySheet = XLSX.utils.aoa_to_sheet(categoryAnalysis);
    XLSX.utils.book_append_sheet(workbook, categorySheet, 'Análise por Categoria');
    
    XLSX.writeFile(workbook, 'relatorio-transacoes.xlsx');
  }
  
  static async generateClientsExcel(): Promise<void> {
    const clients = await ClientService.getAll();
    const workbook = XLSX.utils.book_new();
    
    // Summary sheet
    const totalRevenue = clients.reduce((sum, client) => sum + client.totalRevenue, 0);
    const summaryData = [
      ['Relatório de Clientes'],
      [''],
      ['Total de Clientes', clients.length.toString()],
      ['Receita Total', formatCurrency(totalRevenue)],
      ['Receita Média por Cliente', formatCurrency(totalRevenue / clients.length || 0)],
      [''],
      ['Gerado em:', new Date().toLocaleDateString('pt-BR')]
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');
    
    // Clients sheet
    const clientsData = [
      ['Nome', 'Email', 'Telefone', 'Contato', 'Receita Total', 'Último Evento', 'Notas']
    ];
    
    clients.forEach(client => {
      clientsData.push([
        client.name,
        client.email || '',
        client.phone || '',
        client.contact || '',
        client.totalRevenue.toString(),
        client.lastEvent ? client.lastEvent.toLocaleDateString('pt-BR') : '',
        client.notes || ''
      ]);
    });
    
    const clientsSheet = XLSX.utils.aoa_to_sheet(clientsData);
    XLSX.utils.book_append_sheet(workbook, clientsSheet, 'Clientes');
    
    XLSX.writeFile(workbook, 'relatorio-clientes.xlsx');
  }
  
  private static calculateSummary(transactions: Transaction[]) {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      count: transactions.length
    };
  }
  
  private static getDateRangeText(filters: ExportFilters): string | null {
    if (filters.dateFrom && filters.dateTo) {
      return `Período: ${filters.dateFrom.toLocaleDateString('pt-BR')} a ${filters.dateTo.toLocaleDateString('pt-BR')}`;
    } else if (filters.dateFrom) {
      return `A partir de: ${filters.dateFrom.toLocaleDateString('pt-BR')}`;
    } else if (filters.dateTo) {
      return `Até: ${filters.dateTo.toLocaleDateString('pt-BR')}`;
    }
    return null;
  }
  
  private static generateCategoryAnalysis(transactions: Transaction[]): any[][] {
    const categoryMap = new Map<string, { income: number; expense: number; count: number }>();
    
    transactions.forEach(t => {
      const category = t.category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { income: 0, expense: 0, count: 0 });
      }
      
      const data = categoryMap.get(category)!;
      if (t.type === 'income') {
        data.income += t.amount;
      } else {
        data.expense += t.amount;
      }
      data.count++;
    });
    
    const result = [
      ['Categoria', 'Receitas', 'Despesas', 'Saldo', 'Total de Transações']
    ];
    
    categoryMap.forEach((data, category) => {
      result.push([
        category,
        data.income.toString(),
        data.expense.toString(),
        (data.income - data.expense).toString(),
        data.count.toString()
      ]);
    });
    
    return result;
  }
}
