
import { 
  ChartBar, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Users, 
  BarChart4,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/Layout';
import { StatCard } from '@/components/ui/dashboard/StatCard';
import { FinancialAreaChart } from '@/components/ui/dashboard/AreaChart';
import { FinancialBarChart } from '@/components/ui/dashboard/BarChart';
import { CategoryPieChart } from '@/components/ui/dashboard/PieChart';
import { RecentTransactions } from '@/components/ui/dashboard/RecentTransactions';
import { EventsList } from '@/components/ui/dashboard/EventsList';
import { formatCurrency } from '@/utils/formatters';
import {
  mockDashboardStats,
  mockMonthlyData,
  mockTransactions,
  mockEvents,
  mockIncomeCategories,
  mockExpenseCategories,
} from '@/data/mockData';

const Dashboard = () => {
  // Only get most recent transactions for display
  const recentTransactions = [...mockTransactions]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  // Only get upcoming events
  const upcomingEvents = mockEvents
    .filter((event) => event.status === 'upcoming')
    .slice(0, 3);

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
          <Button>
            Nova Transação
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Key stats section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Receita Total"
            value={formatCurrency(mockDashboardStats.totalRevenue)}
            description="Receita acumulada no ano"
            trend="up"
            trendValue="+12%"
            icon={DollarSign}
          />
          <StatCard
            title="Despesas Totais"
            value={formatCurrency(mockDashboardStats.totalExpenses)}
            description="Despesas acumuladas no ano"
            trend="up"
            trendValue="+8%"
            icon={TrendingUp}
          />
          <StatCard
            title="Lucro Líquido"
            value={formatCurrency(mockDashboardStats.netProfit)}
            description="Lucro acumulado no ano"
            trend="up"
            trendValue="+15%"
            icon={ChartBar}
          />
          <StatCard
            title="Eventos"
            value={mockDashboardStats.eventCount.toString()}
            description={`${mockDashboardStats.upcomingEvents} próximos eventos`}
            icon={Calendar}
          />
        </div>

        {/* Charts section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FinancialAreaChart
            data={mockMonthlyData}
            title="Visão Financeira Mensal"
          />
          <FinancialBarChart
            data={mockMonthlyData}
            title="Receitas vs Despesas"
          />
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
            value={formatCurrency(mockDashboardStats.averageRevenuePerShow)}
            description="Receita média por apresentação"
            icon={BarChart4}
          />
          <StatCard
            title="Custo por Evento"
            value={formatCurrency(mockDashboardStats.averageCostPerEvent)}
            description="Despesa média por evento"
            icon={TrendingUp}
          />
          <StatCard
            title="Total de Clientes"
            value={mockDashboardStats.clientCount.toString()}
            description="Clientes ativos"
            icon={Users}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
