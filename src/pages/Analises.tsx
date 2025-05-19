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
import { 
  FinancialAreaChart,
  FinancialBarChart,
  CategoryPieChart,
  ComparisonBarChart,
  PerformanceTracker,
  ProjectionChart 
} from '@/components/analises';
import { 
  mockTransactions,
  mockEvents,
  mockClients,
} from '@/data/mockData';
import { formatCurrency } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar as CalendarIcon, ChartBar, PieChart, ArrowUpDown, Percent, TrendingUp, FileText } from 'lucide-react';

// Pre-defined team members for analysis
const teamMembers = [
  { id: '1', name: 'DJ Davizão', role: 'Proprietário' },
  { id: '2', name: 'Rian Dultra', role: 'CEO' },
  { id: '3', name: 'Maria Clara', role: 'Lider de Marketing' },
];

const Analises = () => {
  const [selectedContributor, setSelectedContributor] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('6months');
  const [selectedAnalysisType, setSelectedAnalysisType] = useState('revenue');

  // Process the transactions based on filters - Fix for 30 days view
  const processTransactions = () => {
    let filtered = [...mockTransactions];

    // Filter by contributor if selected
    if (selectedContributor !== 'all') {
      filtered = filtered.filter(transaction => {
        // Check if transaction is assigned to this contributor
        if (transaction.teamMemberId === selectedContributor) return true;
        
        // Check if transaction has teamPercentages with the selected contributor
        if (transaction.teamPercentages?.some(tp => tp.teamMemberId === selectedContributor)) {
          return true;
        }
        
        return false;
      });
    }

    // Filter by time range - FIX for 30 days view
    const now = new Date();
    if (selectedTimeRange !== 'all') {
      let cutoffDate = new Date();
      
      switch (selectedTimeRange) {
        case '30days':
          cutoffDate.setDate(now.getDate() - 30);
          break;
        case '3months':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case '6months':
          cutoffDate.setMonth(now.getMonth() - 6);
          break;
        case '1year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(transaction => 
        new Date(transaction.date) >= cutoffDate && new Date(transaction.date) <= now
      );
    }

    return filtered;
  };

  // Get filtered transactions
  const filteredTransactions = processTransactions();

  // Calculate summary stats
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0';

  // Find most profitable category
  const incomeByCategory: Record<string, number> = {};
  filteredTransactions
    .filter(t => t.type === 'income')
    .forEach(t => {
      incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
    });
  
  const mostProfitableCategory = Object.entries(incomeByCategory)
    .sort((a, b) => b[1] - a[1])[0] || ['Nenhum', 0];

  // Calculate event stats - Fix for 30 days filter
  const filteredEvents = mockEvents.filter(event => {
    if (selectedTimeRange === 'all') return true;
    
    const eventDate = new Date(event.date);
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (selectedTimeRange) {
      case '30days':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '3months':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return eventDate >= cutoffDate && eventDate <= now;
  });

  // Calculate active client stats
  const clientsWithEvents = new Set();
  filteredEvents.forEach(event => {
    clientsWithEvents.add(event.client);
  });
  
  const activeClients = clientsWithEvents.size;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Análises</h1>
            <p className="text-muted-foreground">
              Insights detalhados sobre seu negócio
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Select
              value={selectedTimeRange}
              onValueChange={setSelectedTimeRange}
            >
              <SelectTrigger className="w-[150px]">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30days">Últimos 30 dias</SelectItem>
                <SelectItem value="3months">Últimos 3 meses</SelectItem>
                <SelectItem value="6months">Últimos 6 meses</SelectItem>
                <SelectItem value="1year">Último ano</SelectItem>
                <SelectItem value="all">Todo o período</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={selectedContributor}
              onValueChange={setSelectedContributor}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Colaborador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos colaboradores</SelectItem>
                {teamMembers.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {formatCurrency(totalIncome)}
              </div>
              <div className="text-xs text-muted-foreground">
                {selectedTimeRange === 'all' ? 'Total acumulado' : `Nos últimos ${
                  selectedTimeRange === '30days' ? '30 dias' : 
                  selectedTimeRange === '3months' ? '3 meses' : 
                  selectedTimeRange === '6months' ? '6 meses' : '12 meses'
                }`}
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
              <div className="flex items-center text-xs">
                <span className="text-muted-foreground">Margem:</span>
                <span className={`ml-1 ${parseFloat(profitMargin) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {profitMargin}%
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEvents}</div>
              <div className="text-xs text-muted-foreground">
                {activeClients} clientes ativos
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Receita por Evento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(parseFloat(averageRevenuePerEvent))}
              </div>
              <div className="text-xs text-muted-foreground">
                Média por evento
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="revenue" value={selectedAnalysisType} onValueChange={setSelectedAnalysisType}>
          <TabsList className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 mb-6">
            <TabsTrigger value="revenue" className="flex items-center">
              <ChartBar className="mr-2 h-4 w-4" /> 
              Receitas & Despesas
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center">
              <PieChart className="mr-2 h-4 w-4" />
              Categorias
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="comparisons" className="flex items-center">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Comparações
            </TabsTrigger>
            <TabsTrigger value="projections" className="flex items-center">
              <Percent className="mr-2 h-4 w-4" />
              Projeções
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="revenue" className="space-y-4">
            {/* Financial Charts */}
            <FinancialAreaChart 
              transactions={filteredTransactions} 
              timeRange={selectedTimeRange}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top 5 Receitas</CardTitle>
                  <CardDescription>Maiores transações de receita</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {filteredTransactions
                      .filter(t => t.type === 'income')
                      .sort((a, b) => b.amount - a.amount)
                      .slice(0, 5)
                      .map((t, i) => (
                        <div 
                          key={t.id} 
                          className="flex justify-between items-center p-2 rounded-md even:bg-muted/50"
                        >
                          <div className="flex items-center gap-2">
                            <div className="font-medium flex-shrink-0 w-5 text-center">{i + 1}</div>
                            <div className="truncate">{t.description}</div>
                          </div>
                          <div className="font-medium text-green-500">
                            {formatCurrency(t.amount)}
                          </div>
                        </div>
                      ))}
                    
                    {filteredTransactions.filter(t => t.type === 'income').length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        Nenhuma receita no período selecionado
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Top 5 Despesas</CardTitle>
                  <CardDescription>Maiores transações de despesa</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {filteredTransactions
                      .filter(t => t.type === 'expense')
                      .sort((a, b) => b.amount - a.amount)
                      .slice(0, 5)
                      .map((t, i) => (
                        <div 
                          key={t.id} 
                          className="flex justify-between items-center p-2 rounded-md even:bg-muted/50"
                        >
                          <div className="flex items-center gap-2">
                            <div className="font-medium flex-shrink-0 w-5 text-center">{i + 1}</div>
                            <div className="truncate">{t.description}</div>
                          </div>
                          <div className="font-medium text-red-500">
                            {formatCurrency(t.amount)}
                          </div>
                        </div>
                      ))}
                    
                    {filteredTransactions.filter(t => t.type === 'expense').length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        Nenhuma despesa no período selecionado
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="categories" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CategoryPieChart
                transactions={filteredTransactions.filter(t => t.type === 'income')}
                title="Receitas por Categoria"
                type="income"
              />
              
              <CategoryPieChart
                transactions={filteredTransactions.filter(t => t.type === 'expense')}
                title="Despesas por Categoria"
                type="expense"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-4">
            <PerformanceTracker 
              transactions={filteredTransactions}
              events={filteredEvents}
              clients={mockClients}
              timeRange={selectedTimeRange}
            />
          </TabsContent>
          
          <TabsContent value="comparisons" className="space-y-4">
            <ComparisonBarChart 
              transactions={filteredTransactions}
              events={filteredEvents}
              timeRange={selectedTimeRange}
              selectedContributor={selectedContributor}
              teamMembers={teamMembers}
            />
          </TabsContent>
          
          <TabsContent value="projections" className="space-y-4">
            <ProjectionChart 
              transactions={mockTransactions}
              timeRange={selectedTimeRange}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Recomendações</CardTitle>
                <CardDescription>
                  Baseadas nos dados históricos e projeções
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="font-medium mb-2">Oportunidades de Crescimento</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        {mostProfitableCategory[0] !== 'Nenhum'
                          ? `Invista mais em "${mostProfitableCategory[0]}" - sua categoria mais rentável (${formatCurrency(mostProfitableCategory[1])}).`
                          : 'Ainda não há dados suficientes para análise de categorias.'}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        {filteredEvents.length > 0
                          ? `A média de ${formatCurrency(parseFloat(averageRevenuePerEvent))} por evento pode ser melhorada com estratégias de cross-selling.`
                          : 'Não há eventos no período selecionado para análise.'}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        {activeClients > 0
                          ? `Concentre esforços em fidelizar os ${activeClients} clientes ativos que geraram eventos no período.`
                          : 'Considere estratégias para atrair novos clientes e eventos.'}
                      </span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="font-medium mb-2">Áreas de Otimização</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        {parseFloat(profitMargin) < 20
                          ? `Margem de lucro atual (${profitMargin}%) está abaixo do ideal. Considere revisar custos operacionais.`
                          : `Sua margem de lucro (${profitMargin}%) está saudável. Continue monitorando custos.`}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        Analise a sazonalidade de vendas para otimizar a alocação de recursos durante os períodos de pico.
                      </span>
                    </li>
                  </ul>
                </div>
              </CardContent>
              <div className="px-6 py-4 border-t">
                <Button variant="outline" className="w-full" asChild>
                  <a href="#" className="flex items-center justify-center">
                    <FileText className="mr-2 h-4 w-4" />
                    Gerar Relatório Completo
                  </a>
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Analises;
