import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: 'income' | 'expense';
  amount: number;
  status: 'paid' | 'pending' | 'not_paid';
  notes?: string;
}

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  contact?: string;
  totalRevenue: number;
  lastEvent?: string;
  notes?: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  location?: string;
  client?: string;
  status: string;
  estimatedRevenue: number;
  actualRevenue: number;
  estimatedExpenses: number;
  actualExpenses: number;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

export class ReportService {
  static async generatePDF(reportType: string, data: any, filters: any): Promise<void> {
    const doc = new jsPDF();
    
    switch (reportType) {
      case 'financial':
        this.addFinancialTable(doc, data);
        break;
      case 'clients':
        this.addClientsTable(doc, data);
        break;
      case 'events':
        this.addEventsTable(doc, data);
        break;
      case 'tax':
        this.addTaxTable(doc, data);
        break;
    }
    
    doc.save(`${reportType}-report-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  static async generateExcel(reportType: string, data: any, filters: any): Promise<void> {
    const workbook = XLSX.utils.book_new();
    
    switch (reportType) {
      case 'financial':
        this.addFinancialExcelSheet(workbook, data);
        break;
      case 'clients':
        this.addClientsExcelSheet(workbook, data);
        break;
      case 'events':
        this.addEventsExcelSheet(workbook, data);
        break;
      case 'tax':
        this.addTaxExcelSheet(workbook, data);
        break;
    }
    
    XLSX.writeFile(workbook, `${reportType}-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  private static addFinancialTable(doc: jsPDF, data: any): void {
    const { transactions, summary } = data;
    
    doc.text('Relatório Financeiro', 10, 10);
    
    const head = [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Status']];
    const body = transactions.map((transaction: Transaction) => [
      this.formatDate(transaction.date),
      transaction.description,
      transaction.category,
      transaction.type === 'income' ? 'Receita' : 'Despesa',
      transaction.amount.toString(),
      transaction.status === 'paid' ? 'Pago' : transaction.status === 'pending' ? 'Pendente' : 'Não pago'
    ]);
    
    autoTable(doc, { head: head, body: body, startY: 20 });
  }

  private static addClientsTable(doc: jsPDF, data: any): void {
    const { clients } = data;
    
    doc.text('Relatório de Clientes', 10, 10);
    
    const head = [['Cliente', 'Email', 'Telefone', 'Contato', 'Receita Total', 'Último Evento', 'Observações']];
    const body = clients.map((client: Client) => [
      client.name,
      client.email || '',
      client.phone || '',
      client.contact || '',
      client.totalRevenue.toString(),
      client.lastEvent ? this.formatDate(client.lastEvent) : '',
      client.notes || ''
    ]);
    
    autoTable(doc, { head: head, body: body, startY: 20 });
  }

  private static addEventsTable(doc: jsPDF, data: any): void {
    const { events } = data;
    
    doc.text('Relatório de Eventos', 10, 10);
    
    const head = [['Evento', 'Data', 'Local', 'Cliente', 'Status', 'Receita Estimada', 'Receita Real', 'Despesas Estimadas', 'Despesas Reais', 'Lucro']];
    const body = events.map((event: Event) => [
      event.title,
      this.formatDate(event.date),
      event.location || '',
      event.client || '',
      event.status,
      event.estimatedRevenue.toString(),
      event.actualRevenue.toString(),
      event.estimatedExpenses.toString(),
      event.actualExpenses.toString(),
      (event.actualRevenue - event.actualExpenses).toString()
    ]);
    
    autoTable(doc, { head: head, body: body, startY: 20 });
  }

  private static addTaxTable(doc: jsPDF, data: any): void {
    const { categorizedExpenses, transactions } = data;
    
    doc.text('Relatório de Impostos', 10, 10);
    
    // Calculate total for percentage calculation
    const total = Object.values(categorizedExpenses).reduce((sum: number, amount: unknown) => {
      return sum + (typeof amount === 'number' ? amount : 0);
    }, 0);
    
    // Summary by category
    const categoryHead = [['Categoria', 'Valor Total', 'Percentual']];
    const categoryBody = Object.entries(categorizedExpenses).map(([category, amount]) => [
      category,
      typeof amount === 'number' ? amount.toString() : '0',
      total > 0 ? (((typeof amount === 'number' ? amount : 0) / total) * 100).toFixed(2) + '%' : '0%'
    ]);
    
    autoTable(doc, { head: categoryHead, body: categoryBody, startY: 20 });
    
    // Detailed transactions
    const transactionHead = [['Data', 'Descrição', 'Categoria', 'Valor', 'Observações']];
    const transactionBody = transactions.map((transaction: Transaction) => [
      this.formatDate(transaction.date),
      transaction.description,
      transaction.category,
      transaction.amount.toString(),
      transaction.notes || ''
    ]);
    
    autoTable(doc, { head: transactionHead, body: transactionBody, startY: doc.lastAutoTable.finalY + 10 });
  }

  private static addFinancialExcelSheet(workbook: XLSX.WorkBook, data: any): void {
    const { transactions, summary } = data;
    
    const transactionData = [
      ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Status'],
      ...transactions.map((transaction: Transaction) => [
        this.formatDate(transaction.date),
        transaction.description,
        transaction.category,
        transaction.type === 'income' ? 'Receita' : 'Despesa',
        Number(transaction.amount) || 0,
        transaction.status === 'paid' ? 'Pago' : transaction.status === 'pending' ? 'Pendente' : 'Não pago'
      ])
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(transactionData);
    XLSX.utils.book_append_sheet(workbook, ws, 'Transações');
  }

  private static addClientsExcelSheet(workbook: XLSX.WorkBook, data: any): void {
    const { clients } = data;
    
    const clientData = [
      ['Cliente', 'Email', 'Telefone', 'Contato', 'Receita Total', 'Último Evento', 'Observações'],
      ...clients.map((client: Client) => [
        client.name,
        client.email || '',
        client.phone || '',
        client.contact || '',
        Number(client.totalRevenue) || 0,
        client.lastEvent ? this.formatDate(client.lastEvent) : '',
        client.notes || ''
      ])
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(clientData);
    XLSX.utils.book_append_sheet(workbook, ws, 'Clientes');
  }

  private static addEventsExcelSheet(workbook: XLSX.WorkBook, data: any): void {
    const { events } = data;
    
    const eventData = [
      ['Evento', 'Data', 'Local', 'Cliente', 'Status', 'Receita Estimada', 'Receita Real', 'Despesas Estimadas', 'Despesas Reais', 'Lucro'],
      ...events.map((event: Event) => [
        event.title,
        this.formatDate(event.date),
        event.location || '',
        event.client || '',
        event.status,
        Number(event.estimatedRevenue) || 0,
        Number(event.actualRevenue) || 0,
        Number(event.estimatedExpenses) || 0,
        Number(event.actualExpenses) || 0,
        (Number(event.actualRevenue) || Number(event.estimatedRevenue) || 0) - (Number(event.actualExpenses) || Number(event.estimatedExpenses) || 0)
      ])
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(eventData);
    XLSX.utils.book_append_sheet(workbook, ws, 'Eventos');
  }

  private static addTaxExcelSheet(workbook: XLSX.WorkBook, data: any): void {
    const { categorizedExpenses, transactions } = data;
    
    // Calculate total for percentage calculation
    const total = Object.values(categorizedExpenses).reduce((sum: number, amount: unknown) => {
      return sum + (typeof amount === 'number' ? amount : 0);
    }, 0);
    
    // Summary by category
    const categoryData = [
      ['Categoria', 'Valor Total', 'Percentual'],
      ...Object.entries(categorizedExpenses).map(([category, amount]) => [
        category,
        typeof amount === 'number' ? amount : 0,
        total > 0 ? (((typeof amount === 'number' ? amount : 0) / total) * 100).toFixed(2) + '%' : '0%'
      ])
    ];
    
    const ws1 = XLSX.utils.aoa_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(workbook, ws1, 'Resumo por Categoria');
    
    // Detailed transactions
    const transactionData = [
      ['Data', 'Descrição', 'Categoria', 'Valor', 'Observações'],
      ...transactions.map((transaction: Transaction) => [
        this.formatDate(transaction.date),
        transaction.description,
        transaction.category,
        Number(transaction.amount) || 0,
        transaction.notes || ''
      ])
    ];
    
    const ws2 = XLSX.utils.aoa_to_sheet(transactionData);
    XLSX.utils.book_append_sheet(workbook, ws2, 'Transações Detalhadas');
  }

  private static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
}
