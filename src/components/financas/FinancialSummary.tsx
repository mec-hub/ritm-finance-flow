
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FinancialBarChart } from '@/components/ui/dashboard/BarChart';
import { formatCurrency } from '@/utils/formatters';
import { Transaction } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { FinancialBarChart } from '@/components/ui/dashboard/BarChart';
import { CategoryPieChart } from '@/components/ui/dashboard/PieChart';

interface FinancialSummaryProps {
  transactions: Transaction[];
}

export function FinancialSummary({ transactions }: FinancialSummaryProps) {
  const availableYears = [...new Set(
    transactions.map((t) => t.date.getFullYear())
  )].sort((a, b) => b - a);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(
    availableYears.includes(currentYear) ? currentYear : availableYears[0] || currentYear
  );

  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');

  // Filter transactions by year
  const yearTransactions = transactions.filter((t) => t.date.getFullYear() === selectedYear);

  // Income transactions for the selected year
  const incomeTransactions = yearTransactions.filter((t) => t.type === 'income');
  // Expense transactions for the selected year
  const expenseTransactions = yearTransactions.filter((t) => t.type === 'expense');

  // Calculate income by category
  const incomeByCategory = incomeTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  // Calculate expenses by category
  const expensesByCategory = expenseTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  // Convert to category data format
  const totalIncome = Object.values(incomeByCategory).reduce((a, b) => a + b, 0);
  const totalExpenses = Object.values(expensesByCategory).reduce((a, b) => a + b, 0);

  const incomeCategoryData = Object.entries(incomeByCategory).map(([name, value]) => ({
    name,
    value,
    percentage: totalIncome > 0 ? (value / totalIncome) * 100 : 0,
  }));

  const expenseCategoryData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value,
    percentage: totalExpenses > 0 ? (value / totalExpenses) * 100 : 0,
  }));

  // Prepare monthly data for charts
    
    return expandedTransactions;
  };

  // Expand recurring transactions
  const expandedTransactions = expandRecurringTransactions(yearTransactions);
  
  // Get monthly data with expanded recurring transactions
  const getMonthlyData = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthlyData = months.map(month => ({
      name: month,
      income: 0,
      expenses: 0,
      profit: 0
    }));
    
    expandedTransactions.forEach(transaction => {
      const month = transaction.date.getMonth();
      if (transaction.type === 'income') {
        monthlyData[month].income += transaction.amount;
      } else {
        monthlyData[month].expenses += transaction.amount;
      }
    });
    
    // Calculate profit for each month
    monthlyData.forEach(data => {
      data.profit = data.income - data.expenses;
    });
    
    return monthlyData;
  };
  
  // Get quarterly data
  const getQuarterlyData = () => {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const quarterlyData = quarters.map(quarter => ({
      name: quarter,
      income: 0,
      expenses: 0,
      profit: 0
    }));
    
    expandedTransactions.forEach(transaction => {
      const month = transaction.date.getMonth();
      const quarter = Math.floor(month / 3);
      if (transaction.type === 'income') {
        quarterlyData[quarter].income += transaction.amount;
      } else {
        quarterlyData[quarter].expenses += transaction.amount;
      }
    });
    
    // Calculate profit for each quarter
    quarterlyData.forEach(data => {
      data.profit = data.income - data.expenses;
    });
    
    return quarterlyData;
  };
  
  // Get annual data
  const getAnnualData = () => {
    const yearData = [{
      name: year.toString(),
      income: 0,
      expenses: 0,
      profit: 0
    }];
    
    expandedTransactions.forEach(transaction => {
      if (transaction.type === 'income') {
        yearData[0].income += transaction.amount;
      } else {
        yearData[0].expenses += transaction.amount;
      }
    });
    
    yearData[0].profit = yearData[0].income - yearData[0].expenses;
    
    return yearData;
  };
  
  // Calculate category distributions
  const getCategoryDistribution = (type: 'income' | 'expense') => {
    const categories: Record<string, number> = {};
    
    expandedTransactions
      .filter(t => t.type === type)
      .forEach(transaction => {
        const category = transaction.category;
        if (!categories[category]) {
          categories[category] = 0;
        }
        categories[category] += transaction.amount;
      });
    
    // Convert to array for chart
    const total = Object.values(categories).reduce((sum, value) => sum + value, 0);
    const categoryData = Object.entries(categories).map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / total) * 100)
    }));
    
    // Sort by value descending
    return categoryData.sort((a, b) => b.value - a.value);
  };
  
  // Get current view data
  const currentViewData = 
    viewType === 'monthly' ? getMonthlyData() : 
    viewType === 'quarterly' ? getQuarterlyData() : 
    getAnnualData();

  // Get years for the select
  const getAvailableYears = () => {
    const years = new Set<number>();
    
    transactions.forEach(transaction => {
      years.add(transaction.date.getFullYear());
      
      // Add years for recurring transactions
      if (transaction.isRecurring && transaction.recurrenceMonths) {
        const lastDate = new Date(transaction.date);
        lastDate.setMonth(lastDate.getMonth() + transaction.recurrenceMonths - 1);
        years.add(lastDate.getFullYear());
      }
    });
    
    return Array.from(years).sort();
  };
  
  const availableYears = getAvailableYears();
  const incomeCategories = getCategoryDistribution('income');
  const expenseCategories = getCategoryDistribution('expense');

  // Calculate summary stats with expanded transactions
  const totalIncome = expandedTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = expandedTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netProfit = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <h2 className="text-2xl font-bold">Resumo Financeiro</h2>
        <div className="flex gap-2">
          <select 
            className="border rounded px-3 py-1 bg-background"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
          >
            {availableYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <Tabs value={viewType} onValueChange={setViewType} className="w-fit">
            <TabsList>
              <TabsTrigger value="monthly">Mensal</TabsTrigger>
              <TabsTrigger value="quarterly">Trimestral</TabsTrigger>
              <TabsTrigger value="yearly">Anual</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {formatCurrency(totalIncome)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {formatCurrency(totalExpenses)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(netProfit)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Receitas vs Despesas</CardTitle>
            <CardDescription>Visão financeira de {year}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <FinancialBarChart
                data={currentViewData}
                title=""
                dataKeys={['income', 'expenses', 'profit']}
                colors={['#10B981', '#EF4444', '#6366F1']}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Receitas</CardTitle>
            <CardDescription>Por categoria em {year}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {incomeCategories.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">{category.name}</span>
                    <span className="text-sm font-medium">{formatCurrency(category.value)} ({category.percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
              {incomeCategories.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Sem dados de receitas para este período.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Despesas</CardTitle>
            <CardDescription>Por categoria em {year}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenseCategories.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">{category.name}</span>
                    <span className="text-sm font-medium">{formatCurrency(category.value)} ({category.percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
              {expenseCategories.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Sem dados de despesas para este período.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
