
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction, Event, Client } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

interface PerformanceTrackerProps {
  transactions: Transaction[];
  events: Event[];
  clients: Client[];
  timeRange: string;
}

export function PerformanceTracker({
  transactions,
  events,
  clients,
  timeRange,
}: PerformanceTrackerProps) {
  // Calculate KPIs
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
  
  // Calculate event metrics
  const averageRevenuePerEvent = events.length > 0 
    ? totalIncome / events.length 
    : 0;
  
  // Get trend data
  const getTrendData = () => {
    // Determine date range based on timeRange
    const today = new Date();
    let startDate = new Date();
    let dataPoints = 12; // Default
    let format: (date: Date) => string;
    
    switch (timeRange) {
      case '30days':
        startDate.setDate(today.getDate() - 30);
        dataPoints = 10;
        format = (date) => date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        break;
      case '3months':
        startDate.setMonth(today.getMonth() - 3);
        dataPoints = 12;
        format = (date) => date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        break;
      case '6months':
        startDate.setMonth(today.getMonth() - 6);
        dataPoints = 12;
        format = (date) => date.toLocaleDateString('pt-BR', { month: 'short' });
        break;
      case '1year':
        startDate.setFullYear(today.getFullYear() - 1);
        dataPoints = 12;
        format = (date) => date.toLocaleDateString('pt-BR', { month: 'short' });
        break;
      default: // 'all'
        // Default to last 2 years
        startDate.setFullYear(today.getFullYear() - 2);
        dataPoints = 8;
        format = (date) => date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        break;
    }
    
    // Create array of date points for the chart
    const dateRange: Date[] = [];
    const step = (today.getTime() - startDate.getTime()) / dataPoints;
    
    for (let i = 0; i < dataPoints; i++) {
      const date = new Date(startDate.getTime() + step * i);
      dateRange.push(date);
    }
    
    // Aggregate transaction data by date point
    const aggregatedData = dateRange.map(date => {
      const formattedDate = format(date);
      const nextDate = new Date(date.getTime() + step);
      
      const periodTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= date && transactionDate < nextDate;
      });
      
      const periodIncome = periodTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const periodExpenses = periodTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const periodEvents = events.filter(e => {
        const eventDate = new Date(e.date);
        return eventDate >= date && eventDate < nextDate;
      }).length;
      
      return {
        date: formattedDate,
        income: periodIncome,
        expenses: periodExpenses,
        profit: periodIncome - periodExpenses,
        margin: periodIncome > 0 ? ((periodIncome - periodExpenses) / periodIncome) * 100 : 0,
        events: periodEvents
      };
    });
    
    return aggregatedData;
  };
  
  const trendData = getTrendData();
  
  // Calculate trend indicators
  const calculateTrend = (data: any[], key: string) => {
    if (data.length < 2) return { value: 0, isPositive: true };
    
    const latest = data[data.length - 1][key];
    const previous = data[data.length - 2][key];
    
    if (previous === 0) return { value: 0, isPositive: true };
    
    const change = ((latest - previous) / previous) * 100;
    return { value: change, isPositive: change >= 0 };
  };
  
  const profitTrend = calculateTrend(trendData, 'profit');
  const marginTrend = calculateTrend(trendData, 'margin');
  const eventsTrend = calculateTrend(trendData, 'events');
  
  // Get future events
  const upcomingEvents = events
    .filter(e => new Date(e.date) > new Date() && e.status === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance Financeira</CardTitle>
            <CardDescription>Evolução de lucros e margens ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" />
                  <YAxis 
                    yAxisId="left"
                    tickFormatter={(value) => `R$${value / 1000}k`}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'margin') return [`${value.toFixed(1)}%`, 'Margem'];
                      return [formatCurrency(value as number), name];
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="income"
                    name="Receitas"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="expenses"
                    name="Despesas"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="profit"
                    name="Lucro"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="margin"
                    name="Margem"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Margem de Lucro</span>
                <span className="text-sm font-medium">
                  {profitMargin.toFixed(1)}%
                </span>
              </div>
              <Progress value={profitMargin} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm">Meta de Margem</span>
                <span className="text-xs font-medium">30%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Tendência</span>
                <span 
                  className={`text-xs font-medium flex items-center ${
                    marginTrend.isPositive ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {marginTrend.value.toFixed(1)}%
                  <ArrowRight className={`h-3 w-3 ml-1 ${
                    marginTrend.isPositive ? 'text-green-500' : 'text-red-500'
                  }`} />
                </span>
              </div>
            </div>
            
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium">Receita por Evento</div>
                  <div className="text-xs text-muted-foreground">Média atual</div>
                </div>
                <div className="text-lg font-bold">
                  {formatCurrency(averageRevenuePerEvent)}
                </div>
              </div>
            </div>
            
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium">Tendência de Eventos</div>
                  <div className="text-xs text-muted-foreground">Comparado ao período anterior</div>
                </div>
                <Badge variant={eventsTrend.isPositive ? "success" : "destructive"}>
                  {eventsTrend.value.toFixed(0)}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {upcomingEvents.length > 0 ? (
              <div className="divide-y">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="p-4">
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {formatDate(new Date(event.date))} • {event.location}
                    </div>
                    <div className="text-sm mt-2">
                      <span className="text-muted-foreground">Cliente:</span> {event.client}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                Nenhum evento futuro agendado
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
