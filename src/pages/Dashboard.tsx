
import { useState } from 'react';
import { 
  ChartBar, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Users, 
  BarChart4,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/Layout';
import { StatCard } from '@/components/ui/dashboard/StatCard';
import { FinancialBarChart } from '@/components/ui/dashboard/BarChart';
import { CategoryPieChart } from '@/components/ui/dashboard/PieChart';
import { RecentTransactions } from '@/components/ui/dashboard/RecentTransactions';
import { EventsList } from '@/components/ui/dashboard/EventsList';
import { ClientEventChart } from '@/components/clients/ClientEventChart';
import { formatCurrency } from '@/utils/formatters';
import { Link } from 'react-router-dom';
import {
  mockDashboardStats,
  mockMonthlyData,
  mockTransactions,
  mockEvents,
  mockIncomeCategories,
  mockExpenseCategories,
  mockClients
} from '@/data/mockData';

const Dashboard = () => {
  // Track selected year for financial charts
  const availableYears = [...new Set(
    mockMonthlyData.map(item => new Date(item.month + ' 1, 2023').getFullYear())
  )].sort((a, b) => b - a);
  
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(
    availableYears.includes(currentYear) ? currentYear : availableYears[0] || currentYear
  );
  
  // Only get most recent transactions for display
  const recentTransactions = [...mockTransactions]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  // Only get upcoming events
  const upcomingEvents = mockEvents
    .filter((event) => event.status === 'upcoming')
    .slice(0, 3);

  // Filter monthly data by selected year
  const filteredMonthlyData = mockMonthlyData.filter(item => {
    const itemYear = new Date(item.month + ' 1, 2023').getFullYear();
    return itemYear === selectedYear;
  });

  // Convert MonthlyData to ChartData format for charts
  const chartData = filteredMonthlyData.map(item => ({
    name: item.month,
    income: item.income,
    expenses: item.expenses,
    profit: item.profit
  }));

  // Calculate updated dashboard stats
  const calculateDashboardStats = () => {
    // Total revenue from transactions
    const totalRevenue = mockTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    // Total expenses from transactions
    const totalExpenses = mockTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    // Net profit
    const netProfit = totalRevenue - totalExpenses;
    
    // Count of events
    const eventCount = mockEvents.length;
    
    // Count of upcoming events
    const upcomingEvents = mockEvents.filter(event => event.status === 'upcoming').length;
    
    // Average revenue per show
    const completedEvents = mockEvents.filter(event => event.status === 'completed');
    const averageRevenuePerShow = completedEvents.length > 0 
      ? completedEvents.reduce((sum, event) => sum + (event.actualRevenue || event.estimatedRevenue), 0) / completedEvents.length
      : 0;
    
    // Average cost per event
    const averageCostPerEvent = eventCount > 0
      ? mockEvents.reduce((sum, event) => sum + event.estimatedExpenses, 0) / eventCount
      : 0;
    
    // Count of active clients
    const clientCount = mockClients.length;
    
    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      eventCount,
      upcomingEvents,
      averageRevenuePerShow,
      averageCostPerEvent,
      clientCount
    };
  };
  
  const dashboardStats = calculateDashboardStats();
  
  const navigateYear = (direction: 'next' | 'prev') => {
    const currentIndex = availableYears.indexOf(selectedYear);
    
    if (direction === 'next' && currentIndex > 0) {
      setSelectedYear(availableYears[currentIndex - 1]);
    } else if (direction === 'prev' && currentIndex < availableYears.length - 1) {
      setSelectedYear(availableYears[currentIndex + 1]);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Visão geral das finanças e próximos eventos.
            </p>
          </div>
          <Button asChild>
            <Link to="/nova-transacao">
              Nova Transação
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Key stats section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Receita Total"
            value={formatCurrency(dashboardStats.totalRevenue)}
            description="Receita acumulada no ano"
            trend="up"
            trendValue="+12%"
            icon={DollarSign}
          />
          <StatCard
            title="Despesas Totais"
            value={formatCurrency(dashboardStats.totalExpenses)}
            description="Despesas acumuladas no ano"
            trend="up"
            trendValue="+8%"
            icon={TrendingUp}
          />
          <StatCard
            title="Lucro Líquido"
            value={formatCurrency(dashboardStats.netProfit)}
            description="Lucro acumulado no ano"
            trend="up"
            trendValue="+15%"
            icon={ChartBar}
          />
          <StatCard
            title="Eventos"
            value={dashboardStats.eventCount.toString()}
            description={`${dashboardStats.upcomingEvents} próximos eventos`}
            icon={Calendar}
          />
        </div>

        {/* Charts section with year selector */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Visão Financeira</h2>
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
            </div>
            <FinancialBarChart
              data={chartData}
              title={`Receitas vs Despesas (${selectedYear})`}
            />
          </div>
          <div>
            <FinancialBarChart
              data={chartData}
              title={`Lucro Mensal (${selectedYear})`}
              dataKeys={['profit']}
              colors={['#10B981']}
            />
          </div>
        </div>

        {/* Client events chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ClientEventChart clients={mockClients} events={mockEvents} />
        </div>

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

        {/* Recent transactions and upcoming events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentTransactions transactions={recentTransactions} />
          <EventsList events={upcomingEvents} />
        </div>

        {/* KPIs section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Média por Show"
            value={formatCurrency(dashboardStats.averageRevenuePerShow)}
            description="Receita média por apresentação"
            icon={BarChart4}
          />
          <StatCard
            title="Custo por Evento"
            value={formatCurrency(dashboardStats.averageCostPerEvent)}
            description="Despesa média por evento"
            icon={TrendingUp}
          />
          <StatCard
            title="Total de Clientes"
            value={dashboardStats.clientCount.toString()}
            description="Clientes ativos"
            icon={Users}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
