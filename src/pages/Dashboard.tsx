
import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/dashboard/StatCard';
import { RecentTransactions } from '@/components/ui/dashboard/RecentTransactions';
import { EventsList } from '@/components/ui/dashboard/EventsList';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Users,
  AlertCircle
} from 'lucide-react';
import { useTransactions } from '@/contexts/TransactionContext';
import { formatCurrency } from '@/utils/formatters';
import { DashboardStats, MonthlyData } from '@/types';
import { EventService } from '@/services/eventService';
import { ClientService } from '@/services/clientService';

const Dashboard = () => {
  const { transactions } = useTransactions();
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    averageRevenuePerShow: 0,
    averageCostPerEvent: 0,
    eventCount: 0,
    upcomingEvents: 0,
    clientCount: 0
  });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsData, clientsData] = await Promise.all([
          EventService.getAll(),
          ClientService.getAll()
        ]);
        
        setEvents(eventsData);
        
        // Calculate stats
        const totalRevenue = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpenses = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const netProfit = totalRevenue - totalExpenses;
        const completedEvents = eventsData.filter(e => e.status === 'completed').length;
        const upcomingEvents = eventsData.filter(e => e.status === 'upcoming').length;
        
        setStats({
          totalRevenue,
          totalExpenses,
          netProfit,
          averageRevenuePerShow: completedEvents > 0 ? totalRevenue / completedEvents : 0,
          averageCostPerEvent: completedEvents > 0 ? totalExpenses / completedEvents : 0,
          eventCount: eventsData.length,
          upcomingEvents,
          clientCount: clientsData.length
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [transactions]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p>Carregando dashboard...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do seu negócio de DJ
          </p>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Receita Total"
            value={formatCurrency(stats.totalRevenue)}
            icon={DollarSign}
            trend={stats.totalRevenue > 0 ? "up" : "neutral"}
            className="bg-green-50 border-green-200"
          />
          
          <StatCard
            title="Despesas Totais"
            value={formatCurrency(stats.totalExpenses)}
            icon={TrendingDown}
            trend="down"
            className="bg-red-50 border-red-200"
          />
          
          <StatCard
            title="Lucro Líquido"
            value={formatCurrency(stats.netProfit)}
            icon={TrendingUp}
            trend={stats.netProfit > 0 ? "up" : "down"}
            className={stats.netProfit > 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}
          />
          
          <StatCard
            title="Eventos Próximos"
            value={stats.upcomingEvents.toString()}
            icon={Calendar}
            trend="neutral"
            className="bg-blue-50 border-blue-200"
          />
        </div>

        {/* Additional Stats Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total de Eventos"
            value={stats.eventCount.toString()}
            icon={Calendar}
            trend="neutral"
          />
          
          <StatCard
            title="Total de Clientes"
            value={stats.clientCount.toString()}
            icon={Users}
            trend="neutral"
          />
          
          <StatCard
            title="Receita Média/Evento"
            value={formatCurrency(stats.averageRevenuePerShow)}
            icon={DollarSign}
            trend="neutral"
          />
          
          <StatCard
            title="Custo Médio/Evento"
            value={formatCurrency(stats.averageCostPerEvent)}
            icon={TrendingDown}
            trend="neutral"
          />
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          <RecentTransactions transactions={transactions.slice(0, 5)} />
          <EventsList events={events.slice(0, 5)} />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
