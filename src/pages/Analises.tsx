
import { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FinancialAreaChart } from '@/components/ui/dashboard/AreaChart';
import { FinancialBarChart } from '@/components/ui/dashboard/BarChart';
import { CategoryPieChart } from '@/components/ui/dashboard/PieChart';
import { 
  mockMonthlyData, 
  mockTransactions,
  mockIncomeCategories,
  mockExpenseCategories
} from '@/data/mockData';
import { formatCurrency } from '@/utils/formatters';
import { Transaction, CategoryData } from '@/types';

// Pre-defined team members for analysis
const teamMembers = [
  { id: '1', name: 'DJ Davizão', role: 'Proprietário' },
  { id: '2', name: 'João Silva', role: 'DJ Assistente' },
  { id: '3', name: 'Maria Oliveira', role: 'Técnica de Som' },
  { id: '4', name: 'Carlos Santos', role: 'Agente' },
];

const Analises = () => {
  const [chartType, setChartType] = useState<'area' | 'bar' | 'pie'>('area');
  const [showContributorAnalysis, setShowContributorAnalysis] = useState(false);
  const [selectedContributor, setSelectedContributor] = useState<string>('all');

  // Get filtered transactions based on selected contributor
  const filteredTransactions = useMemo(() => {
    if (selectedContributor === 'all') {
      return mockTransactions;
    }
    
    return mockTransactions.filter(transaction => {
      // Check if transaction has the teamMemberId property (legacy)
      if (transaction.teamMemberId === selectedContributor) {
        return true;
      }
      
      // Check if transaction has teamPercentages with the selected contributor
      if (transaction.teamPercentages?.some(tp => tp.teamMemberId === selectedContributor)) {
        return true;
      }
      
      // Check notes as fallback (for older data)
      if (transaction.notes?.toLowerCase().includes(
        teamMembers.find(m => m.id === selectedContributor)?.name.toLowerCase() || ''
      )) {
        return true;
      }
      
      return false;
    });
  }, [selectedContributor]);

  // Process monthly data based on filtered transactions
  const processedMonthlyData = useMemo(() => {
    if (selectedContributor === 'all') {
      return mockMonthlyData;
    }
    
    // Create a map of months to initialize the data structure
    const monthsMap = mockMonthlyData.reduce((acc, item) => {
      acc[item.month] = { month: item.month, income: 0, expenses: 0, profit: 0 };
      return acc;
    }, {} as Record<string, { month: string; income: number; expenses: number; profit: number }>);
    
    // Process filtered transactions
    filteredTransactions.forEach(transaction => {
      const month = transaction.date.toLocaleString('default', { month: 'short' });
      
      if (monthsMap[month]) {
        if (transaction.type === 'income') {
          // For income, calculate the percentage if assigned to the contributor
          if (transaction.teamPercentages?.some(tp => tp.teamMemberId === selectedContributor)) {
            const contributorPercentage = transaction.teamPercentages.find(
              tp => tp.teamMemberId === selectedContributor
            )?.percentageValue || 0;
            monthsMap[month].income += (transaction.amount * contributorPercentage) / 100;
          } 
          else if (transaction.teamMemberId === selectedContributor && transaction.percentageValue) {
            monthsMap[month].income += (transaction.amount * transaction.percentageValue) / 100;
          }
          // If no percentage specified but directly assigned to contributor, count full amount
          else if (transaction.teamMemberId === selectedContributor) {
            monthsMap[month].income += transaction.amount;
          }
        } else {
          // For expenses, handle similarly
          if (transaction.teamPercentages?.some(tp => tp.teamMemberId === selectedContributor)) {
            const contributorPercentage = transaction.teamPercentages.find(
              tp => tp.teamMemberId === selectedContributor
            )?.percentageValue || 0;
            monthsMap[month].expenses += (transaction.amount * contributorPercentage) / 100;
          }
          else if (transaction.teamMemberId === selectedContributor && transaction.percentageValue) {
            monthsMap[month].expenses += (transaction.amount * transaction.percentageValue) / 100;
          }
          else if (transaction.teamMemberId === selectedContributor) {
            monthsMap[month].expenses += transaction.amount;
          }
        }
        
        // Recalculate profit
        monthsMap[month].profit = monthsMap[month].income - monthsMap[month].expenses;
      }
    });
    
    return Object.values(monthsMap);
  }, [selectedContributor, filteredTransactions]);

  // Process category data for pie charts based on filtered transactions
  const processedCategories = useMemo(() => {
    if (selectedContributor === 'all') {
      return {
        income: mockIncomeCategories,
        expense: mockExpenseCategories
      };
    }
    
    // Create maps to track category totals
    const incomeByCategory: Record<string, number> = {};
    const expensesByCategory: Record<string, number> = {};
    let totalIncome = 0;
    let totalExpenses = 0;
    
    // Process filtered transactions
    filteredTransactions.forEach(transaction => {
      const category = transaction.category;
      let amount = transaction.amount;
      
      // Adjust amount if percentage-based
      if (transaction.teamPercentages?.some(tp => tp.teamMemberId === selectedContributor)) {
        const contributorPercentage = transaction.teamPercentages.find(
          tp => tp.teamMemberId === selectedContributor
        )?.percentageValue || 0;
        amount = (amount * contributorPercentage) / 100;
      }
      else if (transaction.teamMemberId === selectedContributor && transaction.percentageValue) {
        amount = (amount * transaction.percentageValue) / 100;
      }
      else if (transaction.teamMemberId !== selectedContributor && !transaction.notes?.toLowerCase().includes(
        teamMembers.find(m => m.id === selectedContributor)?.name.toLowerCase() || ''
      )) {
        // Skip if not related to the selected contributor
        return;
      }
      
      if (transaction.type === 'income') {
        incomeByCategory[category] = (incomeByCategory[category] || 0) + amount;
        totalIncome += amount;
      } else {
        expensesByCategory[category] = (expensesByCategory[category] || 0) + amount;
        totalExpenses += amount;
      }
    });
    
    // Convert to CategoryData format
    const incomeCategories: CategoryData[] = Object.entries(incomeByCategory).map(([name, value]) => ({
      name,
      value,
      percentage: totalIncome > 0 ? (value / totalIncome) * 100 : 0
    }));
    
    const expenseCategories: CategoryData[] = Object.entries(expensesByCategory).map(([name, value]) => ({
      name,
      value,
      percentage: totalExpenses > 0 ? (value / totalExpenses) * 100 : 0
    }));
    
    return {
      income: incomeCategories,
      expense: expenseCategories
    };
  }, [selectedContributor, filteredTransactions]);

  // Convert MonthlyData to ChartData format for charts
  const chartData = processedMonthlyData.map(item => ({
    name: item.month,
    income: item.income,
    expenses: item.expenses,
    profit: item.profit
  }));

  // Calculate contributor statistics based on transactions with percentage notes
  const getContributorStats = () => {
    // Group by contributor
    const contributorTotals = teamMembers.map(member => {
      // Filter transactions for this team member
      const relatedTransactions = mockTransactions.filter(transaction => {
        // Check direct assignment
        if (transaction.teamMemberId === member.id) {
          return true;
        }
        
        // Check through teamPercentages
        if (transaction.teamPercentages?.some(tp => tp.teamMemberId === member.id)) {
          return true;
        }
        
        // Check notes as fallback
        if (transaction.notes && transaction.notes.toLowerCase().includes(member.name.toLowerCase())) {
          return true;
        }
        
        return false;
      });

      // Calculate income and expenses based on percentages when applicable
      let income = 0;
      let expenses = 0;
      
      relatedTransactions.forEach(transaction => {
        let amount = transaction.amount;
        // Adjust for percentage if applicable
        if (transaction.teamPercentages?.some(tp => tp.teamMemberId === member.id)) {
          const percentage = transaction.teamPercentages.find(
            tp => tp.teamMemberId === member.id
          )?.percentageValue || 0;
          amount = (amount * percentage) / 100;
        }
        else if (transaction.teamMemberId === member.id && transaction.percentageValue) {
          amount = (amount * transaction.percentageValue) / 100;
        }
        
        if (transaction.type === 'income') {
          income += amount;
        } else {
          expenses += amount;
        }
      });

      return {
        id: member.id,
        name: member.name,
        role: member.role,
        income,
        expenses,
        profit: income - expenses,
        transactionCount: relatedTransactions.length,
      };
    });

    return contributorTotals;
  };

  const contributorStats = getContributorStats();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Análises</h1>
          <p className="text-muted-foreground">
            Visualize dados e tendências do seu negócio.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="grid gap-2">
              <Label htmlFor="chart-type">Tipo de Gráfico</Label>
              <Select 
                value={chartType} 
                onValueChange={(value) => setChartType(value as 'area' | 'bar' | 'pie')}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Escolha o gráfico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="area">Área</SelectItem>
                  <SelectItem value="bar">Barras</SelectItem>
                  <SelectItem value="pie">Pizza</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="contributor-analysis"
              checked={showContributorAnalysis}
              onCheckedChange={setShowContributorAnalysis}
            />
            <Label htmlFor="contributor-analysis">Análise por Colaborador</Label>
          </div>
        </div>

        {showContributorAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle>Análise por Colaborador</CardTitle>
              <CardDescription>
                Visualize as finanças atribuídas a cada colaborador.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label htmlFor="contributor-select">Selecione um Colaborador</Label>
                <Select 
                  value={selectedContributor} 
                  onValueChange={setSelectedContributor}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos os colaboradores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os colaboradores</SelectItem>
                    {teamMembers.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} - {member.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {contributorStats.map(stat => (
                  <Card key={stat.id} className={`p-4 ${selectedContributor === stat.id ? 'border-primary' : ''}`}>
                    <CardTitle className="text-base">{stat.name}</CardTitle>
                    <CardDescription>{stat.role}</CardDescription>
                    <div className="space-y-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Receitas:</span>
                        <span className="text-green-500 font-medium">{formatCurrency(stat.income)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Despesas:</span>
                        <span className="text-red-500 font-medium">{formatCurrency(stat.expenses)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Lucro:</span>
                        <span className={`font-medium ${stat.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrency(stat.profit)}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        <Tabs defaultValue="financeiro" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
            <TabsTrigger value="categorias">Categorias</TabsTrigger>
            <TabsTrigger value="tendencias">Tendências</TabsTrigger>
          </TabsList>
          
          <TabsContent value="financeiro" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {chartType === 'area' && (
                <FinancialAreaChart data={chartData} title="Visão Financeira Mensal" />
              )}
              {chartType === 'bar' && (
                <FinancialBarChart data={chartData} title="Receitas vs Despesas" />
              )}
              {chartType === 'pie' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <CategoryPieChart
                    data={processedCategories.income}
                    title="Distribuição de Receitas"
                  />
                  <CategoryPieChart
                    data={processedCategories.expense}
                    title="Distribuição de Despesas"
                  />
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="categorias">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategoryPieChart
                data={processedCategories.income}
                title="Distribuição de Receitas"
              />
              <CategoryPieChart
                data={processedCategories.expense}
                title="Distribuição de Despesas"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="tendencias">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Tendências</CardTitle>
                <CardDescription>
                  Visão de tendências financeiras ao longo do tempo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FinancialAreaChart 
                  data={chartData} 
                  title="Tendências Financeiras" 
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Analises;
