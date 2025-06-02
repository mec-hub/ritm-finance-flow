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

  // Calculate actual client revenue from transactions
  const clientMetrics = useMemo(() => {
    // Calculate client revenues from transactions linked to events
    const calculateClientRevenue = (clientName: string): number => {
      // Find all events for this client
      const clientEvents = mockEvents.filter(event => event.client === clientName);
      
      let totalRevenue = 0;
      
      // For each event, find related income transactions
      clientEvents.forEach(event => {
        const eventTransactions = mockTransactions.filter(
          transaction => transaction.eventId === event.id && transaction.type === 'income'
        );
        
        // Sum up transaction amounts
        eventTransactions.forEach(transaction => {
          totalRevenue += transaction.amount;
        });
      });
      
      return totalRevenue;
    };

    // Update clients with actual calculated revenues
    const clientsWithRevenue = mockClients.map(client => ({
      ...client,
      totalRevenue: calculateClientRevenue(client.name)
    }));

    const topClients = clientsWithRevenue
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);
    
    const totalRevenue = clientsWithRevenue.reduce((sum, c) => sum + c.totalRevenue, 0);
    
    return {
      total: clientsWithRevenue.length,
      topClients,
      totalRevenue,
      allClients: clientsWithRevenue
    };
  }, []);

  const exportReport = (reportType: string) => {
    let reportContent = '';
    
    switch(reportType) {
      case 'financeiro':
        reportContent = generateFinancialReport();
        break;
      case 'eventos':
        reportContent = generateEventsReport();
        break;
      case 'clientes':
        reportContent = generateClientsReport();
        break;
      case 'completo':
        reportContent = generateCompleteReport();
        break;
      default:
        reportContent = generateCompleteReport();
    }
    
    // Create and download the report
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-${reportType}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateFinancialReport = () => {
    let report = `RELATÓRIO FINANCEIRO\n`;
    report += `Data de Geração: ${formatDate(new Date())}\n`;
    report += `Período: ${dateFilter === 'all' ? 'Todos os períodos' : 
                dateFilter === 'thisMonth' ? 'Este mês' :
                dateFilter === 'lastMonth' ? 'Mês passado' : 'Este ano'}\n\n`;
    
    report += `RESUMO FINANCEIRO:\n`;
    report += `Receitas: ${formatCurrency(financialMetrics.income)}\n`;
    report += `Despesas: ${formatCurrency(financialMetrics.expenses)}\n`;
    report += `Lucro Líquido: ${formatCurrency(financialMetrics.profit)}\n`;
    report += `Margem de Lucro: ${financialMetrics.income > 0 ? ((financialMetrics.profit / financialMetrics.income) * 100).toFixed(1) : 0}%\n\n`;
    
    report += `TRANSAÇÕES DETALHADAS:\n`;
    filteredTransactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .forEach((transaction, index) => {
        report += `${index + 1}. ${transaction.description}\n`;
        report += `   Data: ${formatDate(transaction.date)}\n`;
        report += `   Categoria: ${transaction.category}\n`;
        report += `   Tipo: ${transaction.type === 'income' ? 'Receita' : 'Despesa'}\n`;
        report += `   Valor: ${formatCurrency(transaction.amount)}\n`;
        report += `   Status: ${transaction.status === 'paid' ? 'Pago' : 
                     transaction.status === 'not_paid' ? 'Não Pago' : 'Cancelado'}\n`;
        if (transaction.notes) {
          report += `   Observações: ${transaction.notes}\n`;
        }
        report += `\n`;
      });
    
    return report;
  };

  const generateEventsReport = () => {
    let report = `RELATÓRIO DE EVENTOS\n`;
    report += `Data de Geração: ${formatDate(new Date())}\n\n`;
    
    report += `RESUMO DE EVENTOS:\n`;
    report += `Eventos Realizados: ${eventMetrics.completed}\n`;
    report += `Eventos Futuros: ${eventMetrics.upcoming}\n`;
    report += `Eventos Cancelados: ${eventMetrics.cancelled}\n`;
    report += `Receita Total de Eventos: ${formatCurrency(eventMetrics.totalRevenue)}\n\n`;
    
    report += `DETALHES DOS EVENTOS:\n`;
    mockEvents.forEach((event, index) => {
      report += `${index + 1}. ${event.title}\n`;
      report += `   Data: ${formatDate(event.date)}\n`;
      report += `   Local: ${event.location}\n`;
      report += `   Cliente: ${event.client}\n`;
      report += `   Status: ${event.status === 'completed' ? 'Realizado' : 
                   event.status === 'upcoming' ? 'Próximo' : 'Cancelado'}\n`;
      report += `   Receita: ${formatCurrency(event.actualRevenue || event.estimatedRevenue)}\n`;
      report += `   Despesas: ${formatCurrency(event.actualExpenses || event.estimatedExpenses)}\n`;
      if (event.notes) {
        report += `   Observações: ${event.notes}\n`;
      }
      report += `\n`;
    });
    
    return report;
  };

  const generateClientsReport = () => {
    let report = `RELATÓRIO DE CLIENTES\n`;
    report += `Data de Geração: ${formatDate(new Date())}\n\n`;
    
    report += `RESUMO DE CLIENTES:\n`;
    report += `Total de Clientes: ${clientMetrics.total}\n`;
    report += `Receita Total: ${formatCurrency(clientMetrics.totalRevenue)}\n`;
    report += `Ticket Médio: ${formatCurrency(clientMetrics.totalRevenue / clientMetrics.total)}\n\n`;
    
    report += `TOP 5 CLIENTES:\n`;
    clientMetrics.topClients.forEach((client, index) => {
      report += `${index + 1}. ${client.name} - ${formatCurrency(client.totalRevenue)}\n`;
    });
    report += `\n`;
    
    report += `TODOS OS CLIENTES:\n`;
    clientMetrics.allClients.forEach((client, index) => {
      report += `${index + 1}. ${client.name}\n`;
      report += `   Contato: ${client.contact}\n`;
      report += `   Email: ${client.email}\n`;
      report += `   Receita Total: ${formatCurrency(client.totalRevenue)}\n`;
      if (client.lastEvent) {
        report += `   Último Evento: ${formatDate(client.lastEvent)}\n`;
      }
      if (client.notes) {
        report += `   Observações: ${client.notes}\n`;
      }
      report += `\n`;
    });
    
    return report;
  };

  const generateCompleteReport = () => {
    let report = `RELATÓRIO COMPLETO DO SISTEMA\n`;
    report += `Data de Geração: ${formatDate(new Date())}\n\n`;
    
    report += generateFinancialReport();
    report += `\n${'='.repeat(50)}\n\n`;
    report += generateEventsReport();
    report += `\n${'='.repeat(50)}\n\n`;
    report += generateClientsReport();
    
    return report;
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
              Exportar Relatório Completo
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
                    {formatCurrency(clientMetrics.total > 0 ? clientMetrics.totalRevenue / clientMetrics.total : 0)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Clients */}
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Clientes</CardTitle>
                <CardDescription>
                  Clientes com maior receita gerada (baseado em transações)
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
                  Lista completa de clientes e suas receitas (calculadas a partir das transações)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clientMetrics.allClients.map((client) => (
                    <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{client.name}</h4>
                        <div className="text-sm text-muted-foreground mt-1">
                          <p>Contato: {client.contact}</p>
                          <p>Email: {client.email}</p>
                          {client.phone && <p>Telefone: {client.phone}</p>}
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
                        <div className="text-sm text-muted-foreground">
                          {mockEvents.filter(e => e.client === client.name).length} eventos
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
