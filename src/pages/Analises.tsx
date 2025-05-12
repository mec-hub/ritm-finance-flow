
import { useState } from 'react';
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
import { Transaction } from '@/types';

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

  // Convert MonthlyData to ChartData format for charts
  const chartData = mockMonthlyData.map(item => ({
    name: item.month,
    income: item.income,
    expenses: item.expenses,
    profit: item.profit
  }));

  // Calculate contributor statistics based on transactions with percentage notes
  const getContributorStats = () => {
    // Group by contributor
    const contributorTotals = teamMembers.map(member => {
      // In a real app, you would filter by actual teamMemberId
      // For mock data, we'll use notes that contain the member name
      const relatedTransactions = mockTransactions.filter(
        t => t.teamMemberId === member.id || 
             (t.notes && t.notes.toLowerCase().includes(member.name.toLowerCase()))
      );

      const income = relatedTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const expenses = relatedTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

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

  const getFilteredTransactions = (): Transaction[] => {
    if (selectedContributor === 'all') {
      return mockTransactions;
    }
    
    return mockTransactions.filter(
      t => t.teamMemberId === selectedContributor || 
           (t.notes && t.notes.toLowerCase().includes(
             teamMembers.find(m => m.id === selectedContributor)?.name.toLowerCase() || ''
           ))
    );
  };

  const filteredTransactions = getFilteredTransactions();

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
                    data={mockIncomeCategories}
                    title="Distribuição de Receitas"
                  />
                  <CategoryPieChart
                    data={mockExpenseCategories}
                    title="Distribuição de Despesas"
                  />
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="categorias">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategoryPieChart
                data={mockIncomeCategories}
                title="Distribuição de Receitas"
              />
              <CategoryPieChart
                data={mockExpenseCategories}
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
