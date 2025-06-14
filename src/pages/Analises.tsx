
import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  FinancialAreaChart,
  FinancialBarChart,
  CategoryPieChart,
  PerformanceTracker 
} from '@/components/analises';
import { CompactTeamFilter } from '@/components/analises/CompactTeamFilter';
import { FilteredTeamCharts } from '@/components/analises/FilteredTeamCharts';
import { formatCurrency } from '@/utils/formatters';
import { Calendar as CalendarIcon, ChartBar, PieChart, TrendingUp, Users } from 'lucide-react';
import { TransactionService } from '@/services/transactionService';
import { EventService } from '@/services/eventService';
import { ClientService } from '@/services/clientService';
import { TeamService } from '@/services/teamService';
import { TeamEarningsService } from '@/services/teamEarningsService';
import { Transaction, Event, Client, TeamMember } from '@/types';
import { toast } from '@/hooks/use-toast';

const Analises = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('6months');
  const [selectedAnalysisType, setSelectedAnalysisType] = useState('revenue');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  
  // Real data states
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamEarnings, setTeamEarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real data from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Analises - Fetching real data from database...');
        
        const [transactionsData, eventsData, clientsData, teamMembersData] = await Promise.all([
          TransactionService.getAll(),
          EventService.getAll(),
          ClientService.getAll(),
          TeamService.getAll()
        ]);

        console.log('Analises - Data fetched:', {
          transactions: transactionsData.length,
          events: eventsData.length,
          clients: clientsData.length,
          teamMembers: teamMembersData.length
        });

        setTransactions(transactionsData);
        setEvents(eventsData);
        setClients(clientsData);
        setTeamMembers(teamMembersData);

        // Update team member earnings calculations
        if (teamMembersData.length > 0) {
          console.log('Updating team member earnings calculations...');
          await TeamEarningsService.updateAllTeamMemberEarnings();
          
          // Fetch updated earnings
          const earningsData = await TeamEarningsService.getAllTeamMemberEarnings();
          setTeamEarnings(earningsData);
          console.log('Team earnings updated:', earningsData);
          
          // Auto-select all team members initially
          setSelectedTeamMembers(earningsData.map((member: any) => member.id));
        }
        
      } catch (error) {
        console.error('Error fetching analysis data:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados para análise.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Process the transactions based on filters - only paid transactions
  const processTransactions = () => {
    let filtered = transactions.filter(transaction => transaction.status === 'paid');

    // Filter by time range
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

  // Calculate summary stats - only paid transactions
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

  // Calculate event stats
  const filteredEvents = events.filter(event => {
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
    if (event.clientId) {
      clientsWithEvents.add(event.clientId);
    }
  });
  
  const activeClients = clientsWithEvents.size;
  const totalEvents = filteredEvents.length;
  const averageRevenuePerEvent = totalEvents > 0 
    ? (totalIncome / totalEvents).toFixed(2) 
    : '0';

  // Calculate team member earnings based on filtered transactions for the selected time period
  const getFilteredTeamEarnings = () => {
    const earnings: Record<string, { income: number; expenses: number }> = {};
    
    // Initialize with all team members from earnings data
    teamEarnings.forEach(member => {
      earnings[member.id] = { income: 0, expenses: 0 };
    });

    // Calculate earnings from filtered transactions only
    filteredTransactions
      .filter(t => t.teamPercentages && t.teamPercentages.length > 0)
      .forEach(transaction => {
        transaction.teamPercentages?.forEach(assignment => {
          if (earnings[assignment.teamMemberId]) {
            const amount = transaction.amount * (assignment.percentageValue / 100);
            if (transaction.type === 'income') {
              earnings[assignment.teamMemberId].income += amount;
            } else if (transaction.type === 'expense') {
              earnings[assignment.teamMemberId].expenses += amount;
            }
          }
        });
      });

    // Map back to team member format with calculated values for the time period
    return teamEarnings.map(member => ({
      id: member.id,
      name: member.name,
      role: member.role,
      income: earnings[member.id]?.income || 0,
      expenses: earnings[member.id]?.expenses || 0,
      profit: (earnings[member.id]?.income || 0) - (earnings[member.id]?.expenses || 0),
      lastCalculated: member.lastCalculated
    }));
  };

  const filteredTeamEarnings = getFilteredTeamEarnings();
  const selectedTeamMembersData = filteredTeamEarnings.filter(member => 
    selectedTeamMembers.includes(member.id)
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p>Carregando dados de análise...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Análises</h1>
            <p className="text-muted-foreground">
              Insights detalhados sobre seu negócio baseados em transações pagas
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
          <TabsList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
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
            <TabsTrigger value="team" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Equipe
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
                  <CardDescription>Maiores transações de receita pagas</CardDescription>
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
                        Nenhuma receita paga no período selecionado
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Top 5 Despesas</CardTitle>
                  <CardDescription>Maiores transações de despesa pagas</CardDescription>
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
                        Nenhuma despesa paga no período selecionado
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
              clients={clients}
              timeRange={selectedTimeRange}
            />
          </TabsContent>
          
          <TabsContent value="team" className="space-y-4">
            {/* Enhanced Team Analysis */}
            {filteredTeamEarnings.length > 0 ? (
              <div className="space-y-6">
                {/* Team Member Earnings Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Resumo dos Ganhos da Equipe</CardTitle>
                    <CardDescription>
                      Baseado em percentuais de transações pagas no período selecionado
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredTeamEarnings.map(member => {
                        return (
                          <div key={member.id} className="p-4 border rounded-lg">
                            <h4 className="font-medium">{member.name}</h4>
                            <p className="text-xs text-muted-foreground mb-2">{member.role}</p>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Receitas:</span>
                                <span className="text-green-500">
                                  {formatCurrency(member.income)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Despesas:</span>
                                <span className="text-red-500">
                                  {formatCurrency(member.expenses)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm font-medium pt-1 border-t">
                                <span>Líquido:</span>
                                <span className={member.profit >= 0 ? 'text-green-500' : 'text-red-500'}>
                                  {formatCurrency(member.profit)}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Período: {selectedTimeRange === 'all' ? 'Todo o período' : 
                                selectedTimeRange === '30days' ? 'Últimos 30 dias' : 
                                selectedTimeRange === '3months' ? 'Últimos 3 meses' : 
                                selectedTimeRange === '6months' ? 'Últimos 6 meses' : 'Último ano'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Compact Team Member Filter and Charts */}
                <CompactTeamFilter
                  teamMembers={filteredTeamEarnings}
                  selectedMembers={selectedTeamMembers}
                  onSelectionChange={setSelectedTeamMembers}
                />
                
                <FilteredTeamCharts
                  selectedTeamMembers={selectedTeamMembersData}
                  transactions={filteredTransactions}
                  timeRange={selectedTimeRange}
                />
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Análise da Equipe</CardTitle>
                  <CardDescription>
                    Nenhum dado de equipe disponível
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Não há membros da equipe com transações pagas no período selecionado para análise.
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Analises;
