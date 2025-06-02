
import { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Download, TrendingUp, TrendingDown, DollarSign, Calendar, Users, MapPin } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { mockTransactions, mockEvents, mockClients } from '@/data/mockData';
import { Transaction, Event, Client } from '@/types';

const Relatorios = () => {
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Get current date for filtering
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Filter transactions based on date filter
  const filteredTransactions = useMemo(() => {
    let filtered = [...mockTransactions];
    
    if (dateFilter === 'thisMonth') {
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      });
    } else if (dateFilter === 'lastMonth') {
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === lastMonth && 
               transactionDate.getFullYear() === lastMonthYear;
      });
    } else if (dateFilter === 'thisYear') {
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getFullYear() === currentYear;
      });
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }
    
    return filtered;
  }, [dateFilter, categoryFilter, currentMonth, currentYear]);

  // Calculate financial metrics
  const financialMetrics = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const profit = income - expenses;
    
    return { income, expenses, profit };
  }, [filteredTransactions]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(mockTransactions.map(t => t.category))
    );
    return uniqueCategories;
  }, []);

  // Event performance metrics
  const eventMetrics = useMemo(() => {
    const completedEvents = mockEvents.filter(e => e.status === 'completed');
    const upcomingEvents = mockEvents.filter(e => e.status === 'upcoming');
    const cancelledEvents = mockEvents.filter(e => e.status === 'cancelled');
    
    const totalRevenue = completedEvents.reduce((sum, e) => sum + (e.actualRevenue || 0), 0);
    const totalExpenses = completedEvents.reduce((sum, e) => sum + (e.actualExpenses || 0), 0);
    
    return {
      completed: completedEvents.length,
      upcoming: upcomingEvents.length,
      cancelled: cancelledEvents.length,
      totalRevenue,
      totalExpenses,
      profit: totalRevenue - totalExpenses
    };
  }, []);

  // Client metrics
  const clientMetrics = useMemo(() => {
    const topClients = mockClients
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);
    
    const totalRevenue = mockClients.reduce((sum, c) => sum + c.totalRevenue, 0);
    
    return {
      total: mockClients.length,
      topClients,
      totalRevenue
    };
  }, []);

  const exportReport = (reportType: string) => {
    // In a real app, this would generate and download a PDF/Excel file
    console.log(`Exporting ${reportType} report...`);
    // Placeholder for export functionality
    alert(`Relatório de ${reportType} seria exportado aqui. Funcionalidade em desenvolvimento.`);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
            <p className="text-muted-foreground">
              Análises detalhadas e métricas de performance do seu negócio.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => exportReport('completo')}>
              <Download className="h-4 w-4 mr-2" />
              Exportar Relatório
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os períodos</SelectItem>
                <SelectItem value="thisMonth">Este mês</SelectItem>
                <SelectItem value="lastMonth">Mês passado</SelectItem>
                <SelectItem value="thisYear">Este ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="financial" className="space-y-4">
          <TabsList>
            <TabsTrigger value="financial">Relatório Financeiro</TabsTrigger>
            <TabsTrigger value="events">Relatório de Eventos</TabsTrigger>
            <TabsTrigger value="clients">Relatório de Clientes</TabsTrigger>
          </TabsList>

          {/* Financial Report */}
          <TabsContent value="financial" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receitas</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">
                    {formatCurrency(financialMetrics.income)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {filteredTransactions.filter(t => t.type === 'income').length} transações
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Despesas</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">
                    {formatCurrency(financialMetrics.expenses)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {filteredTransactions.filter(t => t.type === 'expense').length} transações
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
                  <DollarSign className={`h-4 w-4 ${financialMetrics.profit >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${financialMetrics.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(financialMetrics.profit)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Margem: {financialMetrics.income > 0 ? ((financialMetrics.profit / financialMetrics.income) * 100).toFixed(1) : 0}%
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Transaction List */}
            <Card>
              <CardHeader>
                <CardTitle>Transações Detalhadas</CardTitle>
                <CardDescription>
                  Lista completa das transações no período selecionado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{transaction.description}</h4>
                              <Badge variant="outline">{transaction.category}</Badge>
                              {transaction.status && (
                                <Badge 
                                  variant={
                                    transaction.status === 'paid' ? 'default' : 
                                    transaction.status === 'not_paid' ? 'secondary' : 'destructive'
                                  }
                                >
                                  {transaction.status === 'paid' ? 'Pago' : 
                                   transaction.status === 'not_paid' ? 'Não Pago' : 'Cancelado'}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(transaction.date)}
                              {transaction.notes && ` • ${transaction.notes}`}
                            </p>
                          </div>
                          <div className={`text-lg font-semibold ${
                            transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </div>
                        </div>
                      ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma transação encontrada para o período selecionado.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => exportReport('financeiro')}>
                <Download className="h-4 w-4 mr-2" />
                Exportar Relatório Financeiro
              </Button>
            </div>
          </TabsContent>

          {/* Events Report */}
          <TabsContent value="events" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Eventos Realizados</CardTitle>
                  <Calendar className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{eventMetrics.completed}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Eventos Futuros</CardTitle>
                  <Calendar className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{eventMetrics.upcoming}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Eventos Cancelados</CardTitle>
                  <Calendar className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{eventMetrics.cancelled}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita de Eventos</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">
                    {formatCurrency(eventMetrics.totalRevenue)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhes dos Eventos</CardTitle>
                <CardDescription>
                  Performance detalhada de cada evento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{event.title}</h4>
                          <Badge 
                            variant={
                              event.status === 'completed' ? 'default' : 
                              event.status === 'upcoming' ? 'secondary' : 'destructive'
                            }
                          >
                            {event.status === 'completed' ? 'Realizado' : 
                             event.status === 'upcoming' ? 'Próximo' : 'Cancelado'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(event.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </span>
                          <span>Cliente: {event.client}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-500">
                          {formatCurrency(event.actualRevenue || event.estimatedRevenue)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Despesas: {formatCurrency(event.actualExpenses || event.estimatedExpenses)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => exportReport('eventos')}>
                <Download className="h-4 w-4 mr-2" />
                Exportar Relatório de Eventos
              </Button>
            </div>
          </TabsContent>

          {/* Clients Report */}
          <TabsContent value="clients" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
                  <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{clientMetrics.total}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">
                    {formatCurrency(clientMetrics.totalRevenue)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(clientMetrics.totalRevenue / clientMetrics.total)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Clients */}
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Clientes</CardTitle>
                <CardDescription>
                  Clientes com maior receita gerada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clientMetrics.topClients.map((client, index) => (
                    <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{client.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Contato: {client.contact} • {client.email}
                          </p>
                          {client.lastEvent && (
                            <p className="text-xs text-muted-foreground">
                              Último evento: {formatDate(client.lastEvent)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-500">
                          {formatCurrency(client.totalRevenue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* All Clients */}
            <Card>
              <CardHeader>
                <CardTitle>Todos os Clientes</CardTitle>
                <CardDescription>
                  Lista completa de clientes e suas métricas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockClients.map((client) => (
                    <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{client.name}</h4>
                        <div className="text-sm text-muted-foreground mt-1">
                          <p>Contato: {client.contact}</p>
                          <p>Email: {client.email}</p>
                          {client.lastEvent && (
                            <p>Último evento: {formatDate(client.lastEvent)}</p>
                          )}
                          {client.notes && <p>Notas: {client.notes}</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-500">
                          {formatCurrency(client.totalRevenue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => exportReport('clientes')}>
                <Download className="h-4 w-4 mr-2" />
                Exportar Relatório de Clientes
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Relatorios;
