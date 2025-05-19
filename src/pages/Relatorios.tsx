
import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, Download, Filter, Printer } from 'lucide-react';
import { mockTransactions, mockEvents, mockClients } from '@/data/mockData';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Transaction } from '@/types';

const Relatorios = () => {
  const [activeTab, setActiveTab] = useState('financeiro');
  const [period, setPeriod] = useState('month');
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear.toString());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  
  // Filter transactions based on selected period
  const getFilteredTransactions = () => {
    let startDate = new Date();
    let endDate = new Date();
    
    switch (period) {
      case 'month':
        startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        endDate = new Date(parseInt(year), parseInt(month), 0); // Last day of month
        break;
      case 'quarter':
        const quarter = Math.floor((parseInt(month) - 1) / 3);
        startDate = new Date(parseInt(year), quarter * 3, 1);
        endDate = new Date(parseInt(year), (quarter + 1) * 3, 0);
        break;
      case 'year':
        startDate = new Date(parseInt(year), 0, 1);
        endDate = new Date(parseInt(year), 11, 31);
        break;
    }
    
    return mockTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  };

  const filteredTransactions = getFilteredTransactions();
  
  // Calculate financial summary
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const netProfit = totalIncome - totalExpenses;
  
  // Group transactions by category
  const getCategoryReport = (type: 'income' | 'expense') => {
    const categories: Record<string, number> = {};
    
    filteredTransactions
      .filter(t => t.type === type)
      .forEach(transaction => {
        if (!categories[transaction.category]) {
          categories[transaction.category] = 0;
        }
        categories[transaction.category] += transaction.amount;
      });
    
    return Object.entries(categories)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  };
  
  // Get events in period
  const getEventsInPeriod = () => {
    let startDate = new Date();
    let endDate = new Date();
    
    switch (period) {
      case 'month':
        startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        endDate = new Date(parseInt(year), parseInt(month), 0);
        break;
      case 'quarter':
        const quarter = Math.floor((parseInt(month) - 1) / 3);
        startDate = new Date(parseInt(year), quarter * 3, 1);
        endDate = new Date(parseInt(year), (quarter + 1) * 3, 0);
        break;
      case 'year':
        startDate = new Date(parseInt(year), 0, 1);
        endDate = new Date(parseInt(year), 11, 31);
        break;
    }
    
    return mockEvents.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate >= startDate && eventDate <= endDate;
    });
  };
  
  const eventsInPeriod = getEventsInPeriod();
  
  // Methods to handle reports
  const printReport = () => {
    window.print();
  };
  
  const downloadReport = () => {
    // In a real app, this would generate a PDF or Excel file
    alert('Relatório baixado com sucesso!');
  };
  
  // Helper functions for period display
  const getMonthName = (monthNum: string) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[parseInt(monthNum) - 1];
  };
  
  const getPeriodDisplay = () => {
    switch (period) {
      case 'month':
        return `${getMonthName(month)} de ${year}`;
      case 'quarter':
        const quarter = Math.floor((parseInt(month) - 1) / 3) + 1;
        return `${quarter}º Trimestre de ${year}`;
      case 'year':
        return `Ano de ${year}`;
      default:
        return '';
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
            <p className="text-muted-foreground">
              Visualize e exporte relatórios detalhados.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={printReport}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button onClick={downloadReport}>
              <Download className="h-4 w-4 mr-2" />
              Baixar
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between bg-muted/50 p-4 rounded-lg">
          <div>
            <h2 className="font-semibold">Período: {getPeriodDisplay()}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Mensal</SelectItem>
                <SelectItem value="quarter">Trimestral</SelectItem>
                <SelectItem value="year">Anual</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {period !== 'year' && (
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')).map((monthNum) => (
                    <SelectItem key={monthNum} value={monthNum}>
                      {getMonthName(monthNum)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        
        <Tabs defaultValue="financeiro" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="financeiro">Relatório Financeiro</TabsTrigger>
            <TabsTrigger value="eventos">Relatório de Eventos</TabsTrigger>
            <TabsTrigger value="clientes">Relatório de Clientes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="financeiro" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className={netProfit >= 0 ? "border-green-500/50" : "border-red-500/50"}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Resultado Líquido</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {formatCurrency(netProfit)}
                  </div>
                </CardContent>
              </Card>
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
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Receitas por Categoria</CardTitle>
                  <CardDescription>
                    Distribuição de receitas no período selecionado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getCategoryReport('income').map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">{item.category}</span>
                          <span className="text-sm font-medium">{formatCurrency(item.amount)}</span>
                        </div>
                        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${(item.amount / totalIncome) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    {getCategoryReport('income').length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        Sem dados de receitas para este período.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Despesas por Categoria</CardTitle>
                  <CardDescription>
                    Distribuição de despesas no período selecionado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getCategoryReport('expense').map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">{item.category}</span>
                          <span className="text-sm font-medium">{formatCurrency(item.amount)}</span>
                        </div>
                        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-500 rounded-full"
                            style={{ width: `${(item.amount / totalExpenses) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    {getCategoryReport('expense').length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        Sem dados de despesas para este período.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Transações do Período</CardTitle>
                <CardDescription>
                  Lista de todas as transações no período selecionado
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredTransactions.length > 0 ? (
                  <div className="rounded-md border">
                    <table className="min-w-full divide-y divide-border">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Data</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Descrição</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Categoria</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredTransactions
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((transaction, index) => (
                            <tr key={transaction.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{formatDate(transaction.date)}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{transaction.description}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{transaction.category}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                  ${transaction.status === 'paid' ? 'bg-green-100 text-green-800' : 
                                    transaction.status === 'not_paid' ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-red-100 text-red-800'}`}>
                                  {transaction.status === 'paid' ? 'Pago' : 
                                   transaction.status === 'not_paid' ? 'Não Pago' : 'Cancelado'}
                                </span>
                              </td>
                              <td className={`px-4 py-2 whitespace-nowrap text-sm font-medium text-right ${
                                transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                              }`}>
                                {formatCurrency(transaction.amount)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">Nenhuma transação encontrada para o período selecionado.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="eventos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Eventos do Período</CardTitle>
                <CardDescription>
                  Lista de todos os eventos no período selecionado
                </CardDescription>
              </CardHeader>
              <CardContent>
                {eventsInPeriod.length > 0 ? (
                  <div className="rounded-md border">
                    <table className="min-w-full divide-y divide-border">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Data</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Título</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Cliente</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Local</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {eventsInPeriod
                          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .map((event, index) => (
                            <tr key={event.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{formatDate(event.date)}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{event.title}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{event.client}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{event.location}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                  ${event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : 
                                    event.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                    'bg-red-100 text-red-800'}`}>
                                  {event.status === 'upcoming' ? 'Próximo' : 
                                   event.status === 'completed' ? 'Realizado' : 'Cancelado'}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">Nenhum evento encontrado para o período selecionado.</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Resumo de Eventos</CardTitle>
                <CardDescription>
                  Estatísticas de eventos do período
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total de Eventos</p>
                    <p className="text-2xl font-bold">{eventsInPeriod.length}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Eventos Realizados</p>
                    <p className="text-2xl font-bold">{eventsInPeriod.filter(e => e.status === 'completed').length}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Eventos Cancelados</p>
                    <p className="text-2xl font-bold">{eventsInPeriod.filter(e => e.status === 'canceled').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="clientes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Clientes</CardTitle>
                <CardDescription>
                  Resumo de atividades de clientes no período
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Clientes Ativos</p>
                      <p className="text-2xl font-bold">{mockClients.length}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Faturado com Clientes</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(
                          mockTransactions
                            .filter(t => 
                              t.type === 'income' && 
                              t.clientId && 
                              new Date(t.date) >= new Date(parseInt(year), 0, 1) &&
                              new Date(t.date) <= new Date(parseInt(year), 11, 31)
                            )
                            .reduce((sum, t) => sum + t.amount, 0)
                        )}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Média por Cliente</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(
                          mockTransactions
                            .filter(t => 
                              t.type === 'income' && 
                              t.clientId && 
                              new Date(t.date) >= new Date(parseInt(year), 0, 1) &&
                              new Date(t.date) <= new Date(parseInt(year), 11, 31)
                            )
                            .reduce((sum, t) => sum + t.amount, 0) / 
                            (mockClients.length || 1)
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Clientes com Maior Faturamento</CardTitle>
                <CardDescription>
                  Top clientes em receita no período selecionado
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mockClients.length > 0 ? (
                  <div className="rounded-md border">
                    <table className="min-w-full divide-y divide-border">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Cliente</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Eventos</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {mockClients.map((client, index) => {
                          // Calculate total revenue for this client
                          const clientRevenue = mockTransactions
                            .filter(t => 
                              t.type === 'income' && 
                              t.clientId === client.id &&
                              new Date(t.date) >= new Date(parseInt(year), 0, 1) &&
                              new Date(t.date) <= new Date(parseInt(year), 11, 31)
                            )
                            .reduce((sum, t) => sum + t.amount, 0);
                            
                          // Count events for this client
                          const clientEvents = mockEvents
                            .filter(e => 
                              e.clientId === client.id &&
                              new Date(e.date) >= new Date(parseInt(year), 0, 1) &&
                              new Date(e.date) <= new Date(parseInt(year), 11, 31)
                            ).length;
                            
                          return clientRevenue > 0 ? (
                            <tr key={client.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{client.name}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{clientEvents}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-right text-green-500">
                                {formatCurrency(clientRevenue)}
                              </td>
                            </tr>
                          ) : null;
                        }).filter(Boolean)}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">Nenhum cliente com faturamento no período selecionado.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Relatorios;
