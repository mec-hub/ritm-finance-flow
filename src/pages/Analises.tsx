
import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar
} from 'lucide-react';
import { Transaction, Event, Client } from '@/types';
import { useTransactions } from '@/contexts/TransactionContext';
import { EventService } from '@/services/eventService';
import { ClientService } from '@/services/clientService';

// Import existing components (removing PerformanceTracker)
import { FinancialAreaChart } from '@/components/analises/FinancialAreaChart';
import { FinancialBarChart } from '@/components/analises/FinancialBarChart';
import { CategoryPieChart } from '@/components/analises/CategoryPieChart';
import { ComparisonBarChart } from '@/components/analises/ComparisonBarChart';
import { TeamAnalysisCharts } from '@/components/analises/TeamAnalysisCharts';
import { EventsCustomersCharts } from '@/components/analises/EventsCustomersCharts';
import { ProjectionChart } from '@/components/analises/ProjectionChart';

const Analises = () => {
  const { transactions } = useTransactions();
  const [events, setEvents] = useState<Event[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsData, clientsData] = await Promise.all([
          EventService.getAll(),
          ClientService.getAll()
        ]);
        setEvents(eventsData);
        setClients(clientsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p>Carregando análises...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-blue-500" />
          <h1 className="text-3xl font-bold tracking-tight">Análises</h1>
        </div>

        <Tabs defaultValue="financial" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Financeiro
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Equipe
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Eventos & Clientes
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="financial" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FinancialAreaChart 
                  transactions={transactions}
                />
                <FinancialBarChart 
                  transactions={transactions}
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <CategoryPieChart 
                  transactions={transactions}
                  type="expense"
                />
                <ComparisonBarChart 
                  transactions={transactions}
                />
              </div>
            </TabsContent>

            <TabsContent value="team" className="space-y-6">
              <TeamAnalysisCharts 
                transactions={transactions} 
                teamMembers={teamMembers}
                timeRange="all"
              />
            </TabsContent>

            <TabsContent value="events" className="space-y-6">
              <EventsCustomersCharts 
                events={events}
                clients={clients}
                transactions={transactions}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Analises;
