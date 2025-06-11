
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Users, 
  ArrowRight,
  Eye,
  Download
} from 'lucide-react';
import { Transaction, Event, Client } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface InteractiveDashboardProps {
  transactions: Transaction[];
  events: Event[];
  clients: Client[];
  onDrillDown: (type: string, filter: any) => void;
  onExportSegment: (data: any, type: string) => void;
}

export const InteractiveDashboard = ({
  transactions,
  events,
  clients,
  onDrillDown,
  onExportSegment
}: InteractiveDashboardProps) => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
    
    const completedEvents = events.filter(e => e.status === 'completed').length;
    const totalEvents = events.length;
    const avgRevenuePerEvent = completedEvents > 0 ? totalIncome / completedEvents : 0;
    
    return {
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin,
      completedEvents,
      totalEvents,
      avgRevenuePerEvent,
      totalClients: clients.length
    };
  }, [transactions, events, clients]);

  // Monthly data for charts
  const monthlyData = useMemo(() => {
    const data: { [key: string]: { income: number; expenses: number; month: string } } = {};
    
    transactions.forEach(t => {
      const monthKey = new Date(t.date).toISOString().slice(0, 7);
      const monthName = new Date(t.date).toLocaleDateString('pt-BR', { 
        month: 'short', 
        year: 'numeric' 
      });
      
      if (!data[monthKey]) {
        data[monthKey] = { income: 0, expenses: 0, month: monthName };
      }
      
      if (t.type === 'income') {
        data[monthKey].income += t.amount;
      } else {
        data[monthKey].expenses += t.amount;
      }
    });
    
    return Object.values(data).sort((a, b) => a.month.localeCompare(b.month));
  }, [transactions]);

  // Category data for pie chart
  const categoryData = useMemo(() => {
    const categories: { [key: string]: number } = {};
    
    transactions.forEach(t => {
      if (t.type === 'expense') {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      }
    });
    
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  // Client revenue data
  const clientRevenueData = useMemo(() => {
    return clients
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10)
      .map(client => ({
        name: client.name,
        value: client.totalRevenue
      }));
  }, [clients]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedMetric === 'profit' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setSelectedMetric('profit')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <DollarSign className={`h-4 w-4 ${
              metrics.netProfit >= 0 ? 'text-green-500' : 'text-red-500'
            }`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              metrics.netProfit >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {formatCurrency(metrics.netProfit)}
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                Margem: {metrics.profitMargin.toFixed(1)}%
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDrillDown('profit', { type: 'all' });
                }}
              >
                <Eye className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedMetric === 'income' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setSelectedMetric('income')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {formatCurrency(metrics.totalIncome)}
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                Média/evento: {formatCurrency(metrics.avgRevenuePerEvent)}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDrillDown('income', { type: 'income' });
                }}
              >
                <Eye className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedMetric === 'expenses' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setSelectedMetric('expenses')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {formatCurrency(metrics.totalExpenses)}
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                {categoryData.length} categorias
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDrillDown('expenses', { type: 'expense' });
                }}
              >
                <Eye className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedMetric === 'events' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setSelectedMetric('events')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.completedEvents}/{metrics.totalEvents}
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                {metrics.totalClients} clientes
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDrillDown('events', { status: 'all' });
                }}
              >
                <Eye className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Charts */}
      <Tabs defaultValue="financial" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Receitas vs Despesas por Mês</CardTitle>
                  <CardDescription>
                    Comparação mensal de receitas e despesas
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExportSegment(monthlyData, 'monthly-financial')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar dataKey="income" fill="#10B981" name="Receitas" />
                  <Bar dataKey="expenses" fill="#EF4444" name="Despesas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Distribuição de Despesas por Categoria</CardTitle>
                  <CardDescription>
                    Clique em uma fatia para ver detalhes
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExportSegment(categoryData, 'category-expenses')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    onClick={(data) => onDrillDown('category', { category: data.name })}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Top 10 Clientes por Receita</CardTitle>
                  <CardDescription>
                    Clique em uma barra para ver detalhes do cliente
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExportSegment(clientRevenueData, 'top-clients')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={clientRevenueData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar 
                    dataKey="value" 
                    fill="#3B82F6" 
                    onClick={(data) => onDrillDown('client', { clientName: data.name })}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tendência de Lucro Mensal</CardTitle>
                  <CardDescription>
                    Evolução do lucro líquido ao longo do tempo
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExportSegment(
                    monthlyData.map(d => ({ ...d, profit: d.income - d.expenses })), 
                    'profit-trends'
                  )}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData.map(d => ({ ...d, profit: d.income - d.expenses }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    name="Lucro Líquido"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      {selectedMetric && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Ações Rápidas
              <Badge variant="outline">{selectedMetric}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDrillDown(selectedMetric, {})}
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Detalhes
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExportSegment({ metric: selectedMetric }, 'metric-detail')}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Dados
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
