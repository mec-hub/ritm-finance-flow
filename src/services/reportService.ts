import { TransactionService } from './transactionService';
import { ClientService } from './clientService';
import { EventService } from './eventService';
import { Transaction, Client, Event, MonthlyData, CategoryData } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface ReportData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  monthlyTrends: MonthlyData[];
  categoryBreakdown: CategoryData[];
}

export class ReportService {
  static async generateBasicReport(
    startDate: Date,
    endDate: Date
  ): Promise<ReportData> {
    try {
      const transactions = await TransactionService.getByFilters({
        dateFrom: startDate,
        dateTo: endDate
      });

      const totalRevenue = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const netProfit = totalRevenue - totalExpenses;
      const monthlyTrends = this.generateCashFlowData(transactions);
      const categoryBreakdown = this.generateCategoryData(transactions);

      return {
        totalRevenue,
        totalExpenses,
        netProfit,
        monthlyTrends,
        categoryBreakdown
      };
    } catch (error) {
      console.error('Error generating basic report:', error);
      throw error;
    }
  }

  static async generateAdvancedReport(
    startDate: Date,
    endDate: Date,
    category?: string
  ): Promise<ReportData> {
    try {
      const filters: {
        dateFrom?: Date;
        dateTo?: Date;
        category?: string;
      } = {
        dateFrom: startDate,
        dateTo: endDate
      };

      if (category) {
        filters.category = category;
      }

      const transactions = await TransactionService.getByFilters(filters);

      const totalRevenue = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const netProfit = totalRevenue - totalExpenses;
      const monthlyTrends = this.generateCashFlowData(transactions);
      const categoryBreakdown = this.generateCategoryData(transactions);

      return {
        totalRevenue,
        totalExpenses,
        netProfit,
        monthlyTrends,
        categoryBreakdown
      };
    } catch (error) {
      console.error('Error generating advanced report:', error);
      throw error;
    }
  }

  static async generateClientReport(
    startDate: Date,
    endDate: Date,
    clientId: string
  ): Promise<ReportData> {
    try {
      const transactions = await TransactionService.getByFilters({
        dateFrom: startDate,
        dateTo: endDate,
        clientId: clientId
      });

      const client = await ClientService.getById(clientId);

      if (!client) {
        throw new Error('Client not found');
      }

      const totalRevenue = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const netProfit = totalRevenue - totalExpenses;
      const monthlyTrends = this.generateCashFlowData(transactions);
      const categoryBreakdown = this.generateCategoryData(transactions);

      return {
        totalRevenue,
        totalExpenses,
        netProfit,
        monthlyTrends,
        categoryBreakdown
      };
    } catch (error) {
      console.error('Error generating client report:', error);
      throw error;
    }
  }

  static async generateTeamReport(
    startDate: Date,
    endDate: Date,
    teamMemberId?: string
  ): Promise<ReportData> {
    try {
      const transactions = await TransactionService.getByFilters({
        dateFrom: startDate,
        dateTo: endDate
      });

      let teamTransactions = transactions;
      
      // Filter by team member if specified
      if (teamMemberId) {
        teamTransactions = transactions.filter(t => 
          t.teamPercentages?.some(tp => tp.teamMemberId === teamMemberId)
        );
      }

      const totalRevenue = teamTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => {
          const amount = typeof t.amount === 'number' ? t.amount : 0;
          if (teamMemberId && t.teamPercentages) {
            const memberAssignment = t.teamPercentages.find(tp => tp.teamMemberId === teamMemberId);
            return sum + (memberAssignment ? (amount * memberAssignment.percentageValue / 100) : 0);
          }
          return sum + amount;
        }, 0);

      const totalExpenses = teamTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => {
          const amount = typeof t.amount === 'number' ? t.amount : 0;
          if (teamMemberId && t.teamPercentages) {
            const memberAssignment = t.teamPercentages.find(tp => tp.teamMemberId === teamMemberId);
            return sum + (memberAssignment ? (amount * memberAssignment.percentageValue / 100) : 0);
          }
          return sum + amount;
        }, 0);

      const netProfit = totalRevenue - totalExpenses;
      const monthlyTrends = this.generateCashFlowData(teamTransactions);
      const categoryBreakdown = this.generateCategoryData(teamTransactions);

      return {
        totalRevenue,
        totalExpenses,
        netProfit,
        monthlyTrends,
        categoryBreakdown
      };
    } catch (error) {
      console.error('Error generating team report:', error);
      throw error;
    }
  }

  static async generatePeriodComparison(
    startDate1: Date,
    endDate1: Date,
    startDate2: Date,
    endDate2: Date
  ): Promise<{ period1: ReportData; period2: ReportData }> {
    try {
      const period1 = await this.generateBasicReport(startDate1, endDate1);
      const period2 = await this.generateBasicReport(startDate2, endDate2);

      return { period1, period2 };
    } catch (error) {
      console.error('Error generating period comparison:', error);
      throw error;
    }
  }

  static async getMonthlyTrends(
    startDate: Date,
    endDate: Date
  ): Promise<MonthlyData[]> {
    try {
      const transactions = await TransactionService.getByFilters({
        dateFrom: startDate,
        dateTo: endDate
      });

      return this.generateCashFlowData(transactions);
    } catch (error) {
      console.error('Error getting monthly trends:', error);
      throw error;
    }
  }

  static async getCategoryBreakdown(
    startDate: Date,
    endDate: Date
  ): Promise<CategoryData[]> {
    try {
      const transactions = await TransactionService.getByFilters({
        dateFrom: startDate,
        dateTo: endDate
      });

      return this.generateCategoryData(transactions);
    } catch (error) {
      console.error('Error getting category breakdown:', error);
      throw error;
    }
  }

  static async exportToPDF(reportData: ReportData, title: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(title, 14, 22);

      // Basic data
      let y = 40;
      doc.setFontSize(12);
      doc.text(`Total Revenue: ${reportData.totalRevenue.toFixed(2)}`, 14, y);
      y += 8;
      doc.text(`Total Expenses: ${reportData.totalExpenses.toFixed(2)}`, 14, y);
      y += 8;
      doc.text(`Net Profit: ${reportData.netProfit.toFixed(2)}`, 14, y);

      // Monthly Trends table
      y += 16;
      doc.setFontSize(14);
      doc.text('Monthly Trends', 14, y);
      y += 10;

      const monthlyTrendsHeaders = ['Month', 'Income', 'Expenses', 'Profit'];
      const monthlyTrendsData = reportData.monthlyTrends.map(item => [
        item.month,
        item.income.toFixed(2),
        item.expenses.toFixed(2),
        item.profit.toFixed(2)
      ]);

      (doc as any).autoTable({
        head: [monthlyTrendsHeaders],
        body: monthlyTrendsData,
        startY: y,
        margin: { left: 14 },
        styles: { overflow: 'linebreak' },
        columnStyles: { 0: { columnWidth: 40 } }
      });

      // Category Breakdown table
      y = (doc as any).autoTable.previous.finalY + 16;
      doc.setFontSize(14);
      doc.text('Category Breakdown', 14, y);
      y += 10;

      const categoryBreakdownHeaders = ['Category', 'Value', 'Percentage'];
      const categoryBreakdownData = reportData.categoryBreakdown.map(item => [
        item.name,
        item.value.toFixed(2),
        item.percentage.toFixed(2) + '%'
      ]);

      (doc as any).autoTable({
        head: [categoryBreakdownHeaders],
        body: categoryBreakdownData,
        startY: y,
        margin: { left: 14 },
        styles: { overflow: 'linebreak' },
        columnStyles: { 0: { columnWidth: 40 } }
      });

      doc.save(`${title}.pdf`);
      resolve();
    });
  }

  static async exportToExcel(reportData: ReportData, title: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const wb = XLSX.utils.book_new();

      // Prepare monthly trends data
      const monthlyTrendsHeaders = ['Month', 'Income', 'Expenses', 'Profit'];
      const monthlyTrendsData = reportData.monthlyTrends.map(item => [
        item.month,
        item.income,
        item.expenses,
        item.profit
      ]);
      const monthlyTrendsSheet = XLSX.utils.aoa_to_sheet([monthlyTrendsHeaders, ...monthlyTrendsData]);
      XLSX.utils.book_append_sheet(wb, monthlyTrendsSheet, 'Monthly Trends');

      // Prepare category breakdown data
      const categoryBreakdownHeaders = ['Category', 'Value', 'Percentage'];
      const categoryBreakdownData = reportData.categoryBreakdown.map(item => [
        item.name,
        item.value,
        item.percentage
      ]);
      const categoryBreakdownSheet = XLSX.utils.aoa_to_sheet([categoryBreakdownHeaders, ...categoryBreakdownData]);
      XLSX.utils.book_append_sheet(wb, categoryBreakdownSheet, 'Category Breakdown');

      // Save the Excel file
      XLSX.writeFile(wb, `${title}.xlsx`);
      resolve();
    });
  }

  static async scheduleReport(
    reportType: string,
    startDate: Date,
    endDate: Date,
    frequency: string,
    emailList: string[]
  ): Promise<void> {
    // TODO: Implement report scheduling logic
    console.log(`Report scheduled: ${reportType}, ${startDate}, ${endDate}, ${frequency}, ${emailList}`);
  }

  static async getScheduledReports(): Promise<any[]> {
    // TODO: Implement logic to fetch scheduled reports
    return [];
  }

  static async deleteScheduledReport(reportId: string): Promise<void> {
    // TODO: Implement logic to delete a scheduled report
    console.log(`Scheduled report deleted: ${reportId}`);
  }

  private static generateCashFlowData(transactions: Transaction[]): MonthlyData[] {
    const monthlyData: { [key: string]: MonthlyData } = {};

    transactions.forEach(transaction => {
      const amount = typeof transaction.amount === 'number' ? transaction.amount : 0;
      const month = format(transaction.date, 'MMM yyyy', { locale: ptBR });
      
      if (!monthlyData[month]) {
        monthlyData[month] = {
          month,
          income: 0,
          expenses: 0,
          profit: 0
        };
      }

      if (transaction.type === 'income') {
        monthlyData[month].income += amount;
      } else {
        monthlyData[month].expenses += amount;
      }
      
      monthlyData[month].profit = monthlyData[month].income - monthlyData[month].expenses;
    });

    return Object.values(monthlyData).sort((a, b) => 
      new Date(a.month).getTime() - new Date(b.month).getTime()
    );
  }

  private static generateCategoryData(transactions: Transaction[]): CategoryData[] {
    const categoryData: { [key: string]: CategoryData } = {};
  
    transactions.forEach(transaction => {
      const amount = typeof transaction.amount === 'number' ? transaction.amount : 0;
      if (!categoryData[transaction.category]) {
        categoryData[transaction.category] = {
          name: transaction.category,
          value: 0,
          percentage: 0
        };
      }
      categoryData[transaction.category].value += amount;
    });
  
    const totalValue = Object.values(categoryData).reduce((sum, data) => sum + data.value, 0);
  
    Object.values(categoryData).forEach(data => {
      data.percentage = (data.value / totalValue) * 100;
    });
  
    return Object.values(categoryData).sort((a, b) => b.value - a.value);
  }
}
