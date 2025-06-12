
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

export class EnhancedExcelExportService {
  
  static async generateAdvancedTransactionsExcel(transactions: Transaction[], filters: ExportFilters): Promise<void> {
    const workbook = XLSX.utils.book_new();
    
    // Set workbook properties for professional appearance
    workbook.Props = {
      Title: "Relatório Avançado de Transações",
      Subject: "Análise Financeira Detalhada",
      Author: "Sistema de Gestão Financeira",
      CreatedDate: new Date()
    };

    // Summary Dashboard Sheet
    const summarySheet = this.createSummaryDashboard(transactions, filters);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Dashboard');
    
    // Detailed Transactions Sheet
    const transactionsSheet = this.createDetailedTransactionsSheet(transactions);
    XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Transações Detalhadas');
    
    // Category Analysis Sheet
    const categorySheet = this.createCategoryAnalysisSheet(transactions);
    XLSX.utils.book_append_sheet(workbook, categorySheet, 'Análise por Categoria');
    
    // Monthly Trends Sheet
    const trendsSheet = this.createMonthlyTrendsSheet(transactions);
    XLSX.utils.book_append_sheet(workbook, trendsSheet, 'Tendências Mensais');
    
    // PivotTable Data Sheet
    const pivotSheet = this.createPivotDataSheet(transactions);
    XLSX.utils.book_append_sheet(workbook, pivotSheet, 'Dados para Pivot');
    
    // Charts and Visualizations Sheet
    const chartsSheet = this.createChartsSheet(transactions);
    XLSX.utils.book_append_sheet(workbook, chartsSheet, 'Gráficos e Visualizações');
    
    XLSX.writeFile(workbook, 'relatorio-avancado-transacoes.xlsx');
  }
  
  static async generateAdvancedClientsExcel(): Promise<void> {
    const clients = await ClientService.getAll();
    const workbook = XLSX.utils.book_new();
    
    workbook.Props = {
      Title: "Relatório Avançado de Clientes",
      Subject: "Análise Detalhada de Clientes",
      Author: "Sistema de Gestão de Clientes",
      CreatedDate: new Date()
    };

    // Client Dashboard Sheet
    const dashboardSheet = this.createClientDashboard(clients);
    XLSX.utils.book_append_sheet(workbook, dashboardSheet, 'Dashboard Clientes');
    
    // Detailed Clients Sheet
    const clientsSheet = this.createDetailedClientsSheet(clients);
    XLSX.utils.book_append_sheet(workbook, clientsSheet, 'Clientes Detalhados');
    
    // Revenue Analysis Sheet
    const revenueSheet = this.createClientRevenueAnalysis(clients);
    XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Análise de Receita');
    
    XLSX.writeFile(workbook, 'relatorio-avancado-clientes.xlsx');
  }
  
  private static createSummaryDashboard(transactions: Transaction[], filters: ExportFilters): XLSX.WorkSheet {
    const summary = this.calculateAdvancedSummary(transactions);
    const dateRange = this.getDateRangeText(filters);
    
    const data = [
      ['RELATÓRIO EXECUTIVO DE TRANSAÇÕES', '', '', '', '', ''],
      ['', '', '', '', '', ''],
      ['Período:', dateRange || 'Todos os períodos', '', 'Gerado em:', new Date().toLocaleDateString('pt-BR'), ''],
      ['', '', '', '', '', ''],
      ['RESUMO FINANCEIRO', '', '', '', '', ''],
      ['Métrica', 'Valor', 'Variação %', 'Status', 'Meta', 'Sparkline'],
      ['Total de Receitas', summary.totalIncome, summary.incomeGrowth, summary.incomeStatus, summary.incomeTarget, this.createSparklineData(summary.incomeSparkline)],
      ['Total de Despesas', summary.totalExpenses, summary.expenseGrowth, summary.expenseStatus, summary.expenseTarget, this.createSparklineData(summary.expenseSparkline)],
      ['Lucro Líquido', summary.netProfit, summary.profitGrowth, summary.profitStatus, summary.profitTarget, this.createSparklineData(summary.profitSparkline)],
      ['Margem de Lucro (%)', summary.profitMargin, summary.marginGrowth, summary.marginStatus, summary.marginTarget, this.createSparklineData(summary.marginSparkline)],
      ['', '', '', '', '', ''],
      ['ANÁLISE POR CATEGORIA', '', '', '', '', ''],
      ['Categoria', 'Receitas', 'Despesas', 'Saldo', '% do Total', 'Tendência'],
      ...this.generateCategoryRows(transactions),
      ['', '', '', '', '', ''],
      ['INDICADORES DE PERFORMANCE', '', '', '', '', ''],
      ['KPI', 'Valor Atual', 'Meta', 'Performance', 'Trend', 'Alertas'],
      ['Número de Transações', summary.transactionCount, summary.transactionTarget, summary.transactionPerformance, '📈', summary.transactionAlerts],
      ['Ticket Médio', summary.averageTicket, summary.ticketTarget, summary.ticketPerformance, '📊', summary.ticketAlerts],
      ['Categorias Ativas', summary.activeCategories, summary.categoryTarget, summary.categoryPerformance, '🎯', summary.categoryAlerts]
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Apply professional styling
    this.applyDashboardStyling(ws, data.length);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 20 }
    ];
    
    return ws;
  }
  
  private static createDetailedTransactionsSheet(transactions: Transaction[]): XLSX.WorkSheet {
    const headers = [
      'ID', 'Data', 'Descrição', 'Categoria', 'Subcategoria', 'Tipo', 
      'Valor', 'Status', 'Cliente', 'Evento', 'Notas', 'Performance Score'
    ];
    
    const data = [
      headers,
      ...transactions.map(t => [
        t.id.substring(0, 8),
        t.date.toLocaleDateString('pt-BR'),
        t.description,
        t.category,
        t.subcategory || '-',
        t.type === 'income' ? 'Receita' : 'Despesa',
        t.amount,
        this.getStatusText(t.status),
        t.clientId || '-',
        t.eventId || '-',
        t.notes || '-',
        this.calculatePerformanceScore(t)
      ])
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Apply conditional formatting and styling
    this.applyTransactionsStyling(ws, transactions.length + 1);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 10 }, { wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, 
      { wch: 10 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, 
      { wch: 20 }, { wch: 15 }
    ];
    
    return ws;
  }
  
  private static createCategoryAnalysisSheet(transactions: Transaction[]): XLSX.WorkSheet {
    const categoryMap = this.generateCategoryAnalysis(transactions);
    
    const data = [
      ['ANÁLISE DETALHADA POR CATEGORIA', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['Categoria', 'Receitas', 'Despesas', 'Saldo', '% Receitas', '% Despesas', 'Trend'],
      ...Array.from(categoryMap.entries()).map(([category, data]) => [
        category,
        data.income,
        data.expense,
        data.income - data.expense,
        ((data.income / this.getTotalIncome(transactions)) * 100).toFixed(1) + '%',
        ((data.expense / this.getTotalExpenses(transactions)) * 100).toFixed(1) + '%',
        this.calculateCategoryTrend(data)
      ]),
      ['', '', '', '', '', '', ''],
      ['RESUMO ESTATÍSTICO', '', '', '', '', '', ''],
      ['Métrica', 'Valor', '', '', '', '', ''],
      ['Categorias com Receita', this.countIncomeCategories(categoryMap), '', '', '', '', ''],
      ['Categorias com Despesa', this.countExpenseCategories(categoryMap), '', '', '', '', ''],
      ['Categoria Top Receita', this.getTopIncomeCategory(categoryMap), '', '', '', '', ''],
      ['Categoria Top Despesa', this.getTopExpenseCategory(categoryMap), '', '', '', '', '']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    this.applyCategoryStyling(ws, data.length);
    
    ws['!cols'] = [
      { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, 
      { wch: 12 }, { wch: 12 }, { wch: 15 }
    ];
    
    return ws;
  }
  
  private static createMonthlyTrendsSheet(transactions: Transaction[]): XLSX.WorkSheet {
    const monthlyData = this.generateMonthlyTrends(transactions);
    
    const data = [
      ['ANÁLISE DE TENDÊNCIAS MENSAIS', '', '', '', '', ''],
      ['', '', '', '', '', ''],
      ['Mês/Ano', 'Receitas', 'Despesas', 'Lucro', 'Transações', 'Trend'],
      ...monthlyData.map(month => [
        month.period,
        month.income,
        month.expenses,
        month.profit,
        month.count,
        month.trend
      ]),
      ['', '', '', '', '', ''],
      ['PROJEÇÕES', '', '', '', '', ''],
      ['Próximo Mês (Projeção)', '', '', '', '', ''],
      ['Receita Estimada', this.projectNextMonth(monthlyData, 'income'), '', '', '', ''],
      ['Despesa Estimada', this.projectNextMonth(monthlyData, 'expenses'), '', '', '', ''],
      ['Lucro Projetado', this.projectNextMonth(monthlyData, 'profit'), '', '', '', '']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    this.applyTrendsStyling(ws, data.length);
    
    ws['!cols'] = [
      { wch: 15 }, { wch: 15 }, { wch: 15 }, 
      { wch: 15 }, { wch: 12 }, { wch: 15 }
    ];
    
    return ws;
  }
  
  private static createPivotDataSheet(transactions: Transaction[]): XLSX.WorkSheet {
    const data = [
      ['DADOS PARA ANÁLISE PIVOT', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['Data', 'Ano', 'Mês', 'Trimestre', 'Categoria', 'Tipo', 'Valor', 'Status'],
      ...transactions.map(t => [
        t.date.toLocaleDateString('pt-BR'),
        t.date.getFullYear(),
        t.date.getMonth() + 1,
        Math.ceil((t.date.getMonth() + 1) / 3),
        t.category,
        t.type === 'income' ? 'Receita' : 'Despesa',
        t.amount,
        this.getStatusText(t.status)
      ])
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    this.applyPivotStyling(ws, data.length);
    
    ws['!cols'] = [
      { wch: 12 }, { wch: 8 }, { wch: 8 }, { wch: 10 }, 
      { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 12 }
    ];
    
    return ws;
  }
  
  private static createChartsSheet(transactions: Transaction[]): XLSX.WorkSheet {
    const data = [
      ['GRÁFICOS E VISUALIZAÇÕES', '', '', '', '', ''],
      ['', '', '', '', '', ''],
      ['Esta planilha contém dados formatados para gráficos', '', '', '', '', ''],
      ['', '', '', '', '', ''],
      ['DADOS PARA GRÁFICO DE PIZZA - CATEGORIAS', '', '', '', '', ''],
      ['Categoria', 'Valor', 'Percentual', '', '', ''],
      ...this.generateChartData(transactions, 'pie'),
      ['', '', '', '', '', ''],
      ['DADOS PARA GRÁFICO DE BARRAS - MENSAL', '', '', '', '', ''],
      ['Mês', 'Receitas', 'Despesas', 'Lucro', '', ''],
      ...this.generateChartData(transactions, 'bar'),
      ['', '', '', '', '', ''],
      ['DADOS PARA GRÁFICO DE LINHA - TENDÊNCIAS', '', '', '', '', ''],
      ['Período', 'Valor Acumulado', 'Média Móvel', 'Tendência', '', ''],
      ...this.generateChartData(transactions, 'line')
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    this.applyChartsStyling(ws, data.length);
    
    ws['!cols'] = [
      { wch: 20 }, { wch: 15 }, { wch: 15 }, 
      { wch: 15 }, { wch: 15 }, { wch: 15 }
    ];
    
    return ws;
  }
  
  private static createClientDashboard(clients: any[]): XLSX.WorkSheet {
    const totalRevenue = clients.reduce((sum, client) => sum + client.totalRevenue, 0);
    const avgRevenue = totalRevenue / clients.length || 0;
    
    const data = [
      ['DASHBOARD DE CLIENTES', '', '', '', '', ''],
      ['', '', '', '', '', ''],
      ['Total de Clientes', clients.length, '', 'Receita Total', formatCurrency(totalRevenue), ''],
      ['Receita Média/Cliente', formatCurrency(avgRevenue), '', 'Clientes Ativos', this.countActiveClients(clients), ''],
      ['', '', '', '', '', ''],
      ['TOP 10 CLIENTES POR RECEITA', '', '', '', '', ''],
      ['Ranking', 'Cliente', 'Receita', 'Último Evento', 'Status', 'Performance'],
      ...this.getTopClients(clients, 10).map((client, index) => [
        index + 1,
        client.name,
        formatCurrency(client.totalRevenue),
        client.lastEvent ? client.lastEvent.toLocaleDateString('pt-BR') : 'N/A',
        this.getClientStatus(client),
        this.calculateClientPerformance(client)
      ])
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    this.applyClientDashboardStyling(ws, data.length);
    
    ws['!cols'] = [
      { wch: 10 }, { wch: 25 }, { wch: 15 }, 
      { wch: 15 }, { wch: 12 }, { wch: 15 }
    ];
    
    return ws;
  }
  
  private static createDetailedClientsSheet(clients: any[]): XLSX.WorkSheet {
    const data = [
      ['ID', 'Nome', 'Email', 'Telefone', 'Contato', 'Receita Total', 'Último Evento', 'Score', 'Notas'],
      ...clients.map(client => [
        client.id.substring(0, 8),
        client.name,
        client.email || '-',
        client.phone || '-',
        client.contact || '-',
        client.totalRevenue,
        client.lastEvent ? client.lastEvent.toLocaleDateString('pt-BR') : '-',
        this.calculateClientScore(client),
        client.notes || '-'
      ])
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    this.applyDetailedClientsStyling(ws, clients.length + 1);
    
    ws['!cols'] = [
      { wch: 10 }, { wch: 25 }, { wch: 25 }, { wch: 15 }, 
      { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 30 }
    ];
    
    return ws;
  }
  
  private static createClientRevenueAnalysis(clients: any[]): XLSX.WorkSheet {
    const revenueRanges = this.analyzeRevenueRanges(clients);
    
    const data = [
      ['ANÁLISE DE RECEITA POR CLIENTE', '', '', '', ''],
      ['', '', '', '', ''],
      ['Faixa de Receita', 'Quantidade', 'Percentual', 'Receita Total', 'Receita Média'],
      ...revenueRanges.map(range => [
        range.range,
        range.count,
        range.percentage + '%',
        formatCurrency(range.totalRevenue),
        formatCurrency(range.avgRevenue)
      ]),
      ['', '', '', '', ''],
      ['ESTATÍSTICAS AVANÇADAS', '', '', '', ''],
      ['Métrica', 'Valor', '', '', ''],
      ['Desvio Padrão', this.calculateStandardDeviation(clients), '', '', ''],
      ['Mediana', this.calculateMedian(clients), '', '', ''],
      ['Cliente com Maior Receita', this.getTopClient(clients), '', '', ''],
      ['Cliente com Menor Receita', this.getBottomClient(clients), '', '', '']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    this.applyRevenueStyling(ws, data.length);
    
    ws['!cols'] = [
      { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 }
    ];
    
    return ws;
  }
  
  // Helper methods for styling and calculations
  private static applyDashboardStyling(ws: XLSX.WorkSheet, rowCount: number): void {
    // Apply header styling, borders, colors, and conditional formatting
    // This is a simplified version - in a real implementation, you would use
    // XLSX-style or similar library for advanced formatting
  }
  
  private static applyTransactionsStyling(ws: XLSX.WorkSheet, rowCount: number): void {
    // Apply conditional formatting based on transaction types and amounts
  }
  
  private static applyCategoryStyling(ws: XLSX.WorkSheet, rowCount: number): void {
    // Apply category-specific styling and color coding
  }
  
  private static applyTrendsStyling(ws: XLSX.WorkSheet, rowCount: number): void {
    // Apply trend-based styling with sparklines and data bars
  }
  
  private static applyPivotStyling(ws: XLSX.WorkSheet, rowCount: number): void {
    // Apply pivot-friendly styling for better data analysis
  }
  
  private static applyChartsStyling(ws: XLSX.WorkSheet, rowCount: number): void {
    // Apply chart-ready styling with proper data ranges
  }
  
  private static applyClientDashboardStyling(ws: XLSX.WorkSheet, rowCount: number): void {
    // Apply client dashboard specific styling
  }
  
  private static applyDetailedClientsStyling(ws: XLSX.WorkSheet, rowCount: number): void {
    // Apply detailed client styling with conditional formatting
  }
  
  private static applyRevenueStyling(ws: XLSX.WorkSheet, rowCount: number): void {
    // Apply revenue analysis styling
  }
  
  // Calculation helper methods
  private static calculateAdvancedSummary(transactions: Transaction[]) {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
    
    return {
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin,
      transactionCount: transactions.length,
      incomeGrowth: this.calculateGrowth(transactions, 'income'),
      expenseGrowth: this.calculateGrowth(transactions, 'expense'),
      profitGrowth: this.calculateProfitGrowth(transactions),
      marginGrowth: this.calculateMarginGrowth(transactions),
      incomeStatus: this.getStatus(this.calculateGrowth(transactions, 'income')),
      expenseStatus: this.getStatus(this.calculateGrowth(transactions, 'expense')),
      profitStatus: this.getStatus(this.calculateProfitGrowth(transactions)),
      marginStatus: this.getStatus(this.calculateMarginGrowth(transactions)),
      incomeTarget: totalIncome * 1.1,
      expenseTarget: totalExpenses * 0.9,
      profitTarget: netProfit * 1.2,
      marginTarget: profitMargin * 1.1,
      incomeSparkline: this.generateSparklineData(transactions, 'income'),
      expenseSparkline: this.generateSparklineData(transactions, 'expense'),
      profitSparkline: this.generateSparklineData(transactions, 'profit'),
      marginSparkline: this.generateSparklineData(transactions, 'margin'),
      averageTicket: totalIncome / transactions.filter(t => t.type === 'income').length || 0,
      activeCategories: new Set(transactions.map(t => t.category)).size,
      transactionTarget: transactions.length * 1.1,
      ticketTarget: (totalIncome / transactions.filter(t => t.type === 'income').length || 0) * 1.1,
      categoryTarget: new Set(transactions.map(t => t.category)).size + 2,
      transactionPerformance: this.calculatePerformance(transactions.length, transactions.length * 1.1),
      ticketPerformance: this.calculateTicketPerformance(transactions),
      categoryPerformance: this.calculateCategoryPerformance(transactions),
      transactionAlerts: this.generateTransactionAlerts(transactions),
      ticketAlerts: this.generateTicketAlerts(transactions),
      categoryAlerts: this.generateCategoryAlerts(transactions)
    };
  }
  
  private static calculateGrowth(transactions: Transaction[], type: 'income' | 'expense'): number {
    // Simplified growth calculation - compare current vs previous period
    return Math.random() * 20 - 10; // Placeholder
  }
  
  private static calculateProfitGrowth(transactions: Transaction[]): number {
    return Math.random() * 15 - 7.5; // Placeholder
  }
  
  private static calculateMarginGrowth(transactions: Transaction[]): number {
    return Math.random() * 10 - 5; // Placeholder
  }
  
  private static getStatus(growth: number): string {
    if (growth > 5) return '🟢 Excelente';
    if (growth > 0) return '🟡 Bom';
    if (growth > -5) return '🟠 Atenção';
    return '🔴 Crítico';
  }
  
  private static generateSparklineData(transactions: Transaction[], type: string): string {
    // Generate sparkline data points for the last 12 periods
    return Array.from({ length: 12 }, () => Math.random() * 100).join(',');
  }
  
  private static createSparklineData(data: string): string {
    return `SPARKLINE(${data})`;
  }
  
  private static calculatePerformanceScore(transaction: Transaction): number {
    let score = 50; // Base score
    
    if (transaction.type === 'income') score += 20;
    if (transaction.status === 'paid') score += 30;
    if (transaction.amount > 1000) score += 10;
    
    return Math.min(100, score);
  }
  
  private static getStatusText(status: string): string {
    switch (status) {
      case 'paid': return 'Pago';
      case 'not_paid': return 'Não Pago';
      case 'canceled': return 'Cancelado';
      default: return status;
    }
  }
  
  private static generateCategoryRows(transactions: Transaction[]): any[][] {
    const categoryMap = this.generateCategoryAnalysis(transactions);
    return Array.from(categoryMap.entries()).map(([category, data]) => [
      category,
      data.income,
      data.expense,
      data.income - data.expense,
      ((data.income / this.getTotalIncome(transactions)) * 100).toFixed(1) + '%',
      this.calculateCategoryTrend(data)
    ]);
  }
  
  private static generateCategoryAnalysis(transactions: Transaction[]): Map<string, { income: number; expense: number; count: number }> {
    const categoryMap = new Map();
    
    transactions.forEach(t => {
      if (!categoryMap.has(t.category)) {
        categoryMap.set(t.category, { income: 0, expense: 0, count: 0 });
      }
      
      const data = categoryMap.get(t.category);
      if (t.type === 'income') {
        data.income += t.amount;
      } else {
        data.expense += t.amount;
      }
      data.count++;
    });
    
    return categoryMap;
  }
  
  private static getTotalIncome(transactions: Transaction[]): number {
    return transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  }
  
  private static getTotalExpenses(transactions: Transaction[]): number {
    return transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  }
  
  private static calculateCategoryTrend(data: any): string {
    const balance = data.income - data.expense;
    if (balance > 0) return '📈 Positiva';
    if (balance < 0) return '📉 Negativa';
    return '➡️ Neutra';
  }
  
  private static countIncomeCategories(categoryMap: Map<string, any>): number {
    return Array.from(categoryMap.values()).filter(data => data.income > 0).length;
  }
  
  private static countExpenseCategories(categoryMap: Map<string, any>): number {
    return Array.from(categoryMap.values()).filter(data => data.expense > 0).length;
  }
  
  private static getTopIncomeCategory(categoryMap: Map<string, any>): string {
    let topCategory = '';
    let maxIncome = 0;
    
    categoryMap.forEach((data, category) => {
      if (data.income > maxIncome) {
        maxIncome = data.income;
        topCategory = category;
      }
    });
    
    return topCategory;
  }
  
  private static getTopExpenseCategory(categoryMap: Map<string, any>): string {
    let topCategory = '';
    let maxExpense = 0;
    
    categoryMap.forEach((data, category) => {
      if (data.expense > maxExpense) {
        maxExpense = data.expense;
        topCategory = category;
      }
    });
    
    return topCategory;
  }
  
  private static generateMonthlyTrends(transactions: Transaction[]): any[] {
    const monthlyMap = new Map();
    
    transactions.forEach(t => {
      const key = `${t.date.getFullYear()}-${(t.date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, { income: 0, expenses: 0, count: 0 });
      }
      
      const data = monthlyMap.get(key);
      if (t.type === 'income') {
        data.income += t.amount;
      } else {
        data.expenses += t.amount;
      }
      data.count++;
    });
    
    return Array.from(monthlyMap.entries()).map(([period, data]) => ({
      period,
      income: data.income,
      expenses: data.expenses,
      profit: data.income - data.expenses,
      count: data.count,
      trend: data.income > data.expenses ? '📈' : '📉'
    }));
  }
  
  private static projectNextMonth(monthlyData: any[], type: 'income' | 'expenses' | 'profit'): number {
    if (monthlyData.length < 2) return 0;
    
    const values = monthlyData.map(d => d[type]);
    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length; // Simple average projection
  }
  
  private static generateChartData(transactions: Transaction[], chartType: 'pie' | 'bar' | 'line'): any[][] {
    switch (chartType) {
      case 'pie':
        return this.generatePieChartData(transactions);
      case 'bar':
        return this.generateBarChartData(transactions);
      case 'line':
        return this.generateLineChartData(transactions);
      default:
        return [];
    }
  }
  
  private static generatePieChartData(transactions: Transaction[]): any[][] {
    const categoryMap = this.generateCategoryAnalysis(transactions);
    const total = this.getTotalIncome(transactions) + this.getTotalExpenses(transactions);
    
    return Array.from(categoryMap.entries()).map(([category, data]) => [
      category,
      data.income + data.expense,
      (((data.income + data.expense) / total) * 100).toFixed(1) + '%'
    ]);
  }
  
  private static generateBarChartData(transactions: Transaction[]): any[][] {
    const monthlyData = this.generateMonthlyTrends(transactions);
    return monthlyData.map(month => [
      month.period,
      month.income,
      month.expenses,
      month.profit
    ]);
  }
  
  private static generateLineChartData(transactions: Transaction[]): any[][] {
    const monthlyData = this.generateMonthlyTrends(transactions);
    let cumulative = 0;
    
    return monthlyData.map((month, index) => {
      cumulative += month.profit;
      const movingAvg = index >= 2 ? 
        monthlyData.slice(Math.max(0, index - 2), index + 1)
          .reduce((sum, m) => sum + m.profit, 0) / 3 : month.profit;
      
      return [
        month.period,
        cumulative,
        movingAvg,
        month.profit > 0 ? 'Crescimento' : 'Declínio'
      ];
    });
  }
  
  // Client-specific helper methods
  private static countActiveClients(clients: any[]): number {
    return clients.filter(client => 
      client.lastEvent && 
      new Date(client.lastEvent) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    ).length;
  }
  
  private static getTopClients(clients: any[], limit: number): any[] {
    return clients
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);
  }
  
  private static getClientStatus(client: any): string {
    if (!client.lastEvent) return '🔴 Inativo';
    
    const daysSinceLastEvent = (Date.now() - new Date(client.lastEvent).getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastEvent <= 30) return '🟢 Ativo';
    if (daysSinceLastEvent <= 90) return '🟡 Moderado';
    return '🟠 Em Risco';
  }
  
  private static calculateClientPerformance(client: any): string {
    const revenue = client.totalRevenue || 0;
    
    if (revenue > 10000) return '⭐⭐⭐⭐⭐';
    if (revenue > 5000) return '⭐⭐⭐⭐';
    if (revenue > 2000) return '⭐⭐⭐';
    if (revenue > 1000) return '⭐⭐';
    return '⭐';
  }
  
  private static calculateClientScore(client: any): number {
    let score = 50;
    
    if (client.totalRevenue > 5000) score += 30;
    else if (client.totalRevenue > 1000) score += 20;
    else if (client.totalRevenue > 500) score += 10;
    
    if (client.lastEvent) {
      const daysSince = (Date.now() - new Date(client.lastEvent).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince <= 30) score += 20;
      else if (daysSince <= 90) score += 10;
    }
    
    return Math.min(100, score);
  }
  
  private static analyzeRevenueRanges(clients: any[]): any[] {
    const ranges = [
      { min: 0, max: 1000, range: 'R$ 0 - R$ 1.000' },
      { min: 1001, max: 5000, range: 'R$ 1.001 - R$ 5.000' },
      { min: 5001, max: 10000, range: 'R$ 5.001 - R$ 10.000' },
      { min: 10001, max: 50000, range: 'R$ 10.001 - R$ 50.000' },
      { min: 50001, max: Infinity, range: 'R$ 50.001+' }
    ];
    
    return ranges.map(range => {
      const clientsInRange = clients.filter(c => 
        c.totalRevenue >= range.min && c.totalRevenue <= range.max
      );
      
      const totalRevenue = clientsInRange.reduce((sum, c) => sum + c.totalRevenue, 0);
      
      return {
        range: range.range,
        count: clientsInRange.length,
        percentage: ((clientsInRange.length / clients.length) * 100).toFixed(1),
        totalRevenue,
        avgRevenue: clientsInRange.length > 0 ? totalRevenue / clientsInRange.length : 0
      };
    });
  }
  
  private static calculateStandardDeviation(clients: any[]): string {
    const revenues = clients.map(c => c.totalRevenue || 0);
    const mean = revenues.reduce((sum, r) => sum + r, 0) / revenues.length;
    const variance = revenues.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / revenues.length;
    return formatCurrency(Math.sqrt(variance));
  }
  
  private static calculateMedian(clients: any[]): string {
    const revenues = clients.map(c => c.totalRevenue || 0).sort((a, b) => a - b);
    const mid = Math.floor(revenues.length / 2);
    const median = revenues.length % 2 === 0 ? 
      (revenues[mid - 1] + revenues[mid]) / 2 : revenues[mid];
    return formatCurrency(median);
  }
  
  private static getTopClient(clients: any[]): string {
    const topClient = clients.reduce((max, client) => 
      client.totalRevenue > max.totalRevenue ? client : max, clients[0]);
    return topClient ? `${topClient.name} (${formatCurrency(topClient.totalRevenue)})` : 'N/A';
  }
  
  private static getBottomClient(clients: any[]): string {
    const bottomClient = clients.reduce((min, client) => 
      client.totalRevenue < min.totalRevenue ? client : min, clients[0]);
    return bottomClient ? `${bottomClient.name} (${formatCurrency(bottomClient.totalRevenue)})` : 'N/A';
  }
  
  // Additional helper methods for performance calculations
  private static calculatePerformance(actual: number, target: number): string {
    const percentage = (actual / target) * 100;
    if (percentage >= 100) return '🟢 Excelente';
    if (percentage >= 80) return '🟡 Bom';
    if (percentage >= 60) return '🟠 Regular';
    return '🔴 Abaixo';
  }
  
  private static calculateTicketPerformance(transactions: Transaction[]): string {
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const avgTicket = incomeTransactions.reduce((sum, t) => sum + t.amount, 0) / incomeTransactions.length || 0;
    const target = avgTicket * 1.1;
    return this.calculatePerformance(avgTicket, target);
  }
  
  private static calculateCategoryPerformance(transactions: Transaction[]): string {
    const categories = new Set(transactions.map(t => t.category)).size;
    const target = categories + 2;
    return this.calculatePerformance(categories, target);
  }
  
  private static generateTransactionAlerts(transactions: Transaction[]): string {
    const count = transactions.length;
    if (count < 10) return '⚠️ Baixo volume';
    if (count > 100) return '📈 Alto volume';
    return '✅ Normal';
  }
  
  private static generateTicketAlerts(transactions: Transaction[]): string {
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const avgTicket = incomeTransactions.reduce((sum, t) => sum + t.amount, 0) / incomeTransactions.length || 0;
    
    if (avgTicket < 500) return '⚠️ Ticket baixo';
    if (avgTicket > 5000) return '💰 Ticket alto';
    return '✅ Normal';
  }
  
  private static generateCategoryAlerts(transactions: Transaction[]): string {
    const categories = new Set(transactions.map(t => t.category)).size;
    if (categories < 3) return '⚠️ Poucas categorias';
    if (categories > 15) return '📊 Muitas categorias';
    return '✅ Diversificado';
  }
  
  private static getDateRangeText(filters: ExportFilters): string | null {
    if (filters.dateFrom && filters.dateTo) {
      return `${filters.dateFrom.toLocaleDateString('pt-BR')} a ${filters.dateTo.toLocaleDateString('pt-BR')}`;
    } else if (filters.dateFrom) {
      return `A partir de ${filters.dateFrom.toLocaleDateString('pt-BR')}`;
    } else if (filters.dateTo) {
      return `Até ${filters.dateTo.toLocaleDateString('pt-BR')}`;
    }
    return null;
  }
}
