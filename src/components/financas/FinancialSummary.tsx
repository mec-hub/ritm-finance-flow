
import { useState } from 'react';
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
  const getMonthlyData = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthlyData = months.map(month => ({
      name: month,
      income: 0,
      expenses: 0,
      profit: 0,
    }));

    yearTransactions.forEach(t => {
      const monthIndex = t.date.getMonth();
      if (t.type === 'income') {
        monthlyData[monthIndex].income += t.amount;
      } else {
        monthlyData[monthIndex].expenses += t.amount;
      }
    });

    // Calculate profit
    monthlyData.forEach(data => {
      data.profit = data.income - data.expenses;
    });

    return monthlyData;
  };

  // Prepare quarterly data
  const getQuarterlyData = () => {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const quarterlyData = quarters.map(quarter => ({
      name: quarter,
      income: 0,
      expenses: 0,
      profit: 0,
    }));

    yearTransactions.forEach(t => {
      const monthIndex = t.date.getMonth();
      const quarterIndex = Math.floor(monthIndex / 3);
      
      if (t.type === 'income') {
        quarterlyData[quarterIndex].income += t.amount;
      } else {
        quarterlyData[quarterIndex].expenses += t.amount;
      }
    });

    // Calculate profit
    quarterlyData.forEach(data => {
      data.profit = data.income - data.expenses;
    });

    return quarterlyData;
  };

  // Prepare yearly data
  const getYearlyData = () => {
    const yearlyIncome = yearTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const yearlyExpenses = yearTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return [{
      name: selectedYear.toString(),
      income: yearlyIncome,
      expenses: yearlyExpenses,
      profit: yearlyIncome - yearlyExpenses,
    }];
  };

  // Get data based on selected period
  const getPeriodData = () => {
    switch (selectedPeriod) {
      case 'monthly':
        return getMonthlyData();
      case 'quarterly':
        return getQuarterlyData();
      case 'yearly':
        return getYearlyData();
      default:
        return getMonthlyData();
    }
  };

  const navigateYear = (direction: 'next' | 'prev') => {
    const currentIndex = availableYears.indexOf(selectedYear);
    
    if (direction === 'next' && currentIndex > 0) {
      setSelectedYear(availableYears[currentIndex - 1]);
    } else if (direction === 'prev' && currentIndex < availableYears.length - 1) {
      setSelectedYear(availableYears[currentIndex + 1]);
    }
  };

  const chartData = getPeriodData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigateYear('prev')}
              disabled={availableYears.indexOf(selectedYear) === availableYears.length - 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{selectedYear}</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigateYear('next')}
              disabled={availableYears.indexOf(selectedYear) === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-4">
            <Select
              value={selectedPeriod}
              onValueChange={(value) => setSelectedPeriod(value as 'monthly' | 'quarterly' | 'yearly')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="quarterly">Trimestral</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Receitas vs Despesas</CardTitle>
          <CardDescription>
            Visão geral financeira para {selectedYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <FinancialBarChart
              data={chartData}
              title=""
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Receitas</CardTitle>
            <CardDescription>
              Por categoria em {selectedYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryPieChart
              data={incomeCategoryData}
              title=""
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Despesas</CardTitle>
            <CardDescription>
              Por categoria em {selectedYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryPieChart
              data={expenseCategoryData}
              title=""
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo por Categoria</CardTitle>
          <CardDescription>
            Totais por categoria em {selectedYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Receitas</h3>
              <div className="space-y-3">
                {incomeCategoryData.length > 0 ? (
                  incomeCategoryData
                    .sort((a, b) => b.value - a.value)
                    .map(category => (
                      <div key={category.name} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                          <span>{category.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(category.value)}</div>
                          <div className="text-xs text-muted-foreground">{category.percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-muted-foreground">Nenhuma receita registrada.</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Despesas</h3>
              <div className="space-y-3">
                {expenseCategoryData.length > 0 ? (
                  expenseCategoryData
                    .sort((a, b) => b.value - a.value)
                    .map(category => (
                      <div key={category.name} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                          <span>{category.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(category.value)}</div>
                          <div className="text-xs text-muted-foreground">{category.percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-muted-foreground">Nenhuma despesa registrada.</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
