import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockTransactions, mockEvents, mockClients } from '@/data/mockData';
import { formatCurrency } from '@/utils/formatters';
import { ArrowDownIcon, ArrowUpIcon, CalendarIcon, UsersIcon } from 'lucide-react';
import { EventsCalendar } from '@/components/events/EventsCalendar';
import { ClientStats } from '@/components/clients/ClientStats';
import { FinancialBarChart } from '@/components/ui/dashboard/BarChart';
import { RecentTransactions } from '@/components/ui/dashboard/RecentTransactions';

// Components
const StatCards = () => {
  // Calculate dashboard stats
  const totalRevenue = mockTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = mockTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netProfit = totalRevenue - totalExpenses;
  
  const upcomingEventsCount = mockEvents
    .filter(e => e.status === 'upcoming')
    .length;
  
  const completedEventsCount = mockEvents
    .filter(e => e.status === 'completed')
    .length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          <ArrowUpIcon className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            +20.1% em relação ao mês anterior
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Despesas</CardTitle>
          <ArrowDownIcon className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
          <p className="text-xs text-muted-foreground">
            +12% em relação ao mês anterior
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-blue-600"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(netProfit)}
          </div>
          <p className="text-xs text-muted-foreground">
            +18.7% em relação ao mês anterior
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Eventos</CardTitle>
          <CalendarIcon className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{upcomingEventsCount + completedEventsCount}</div>
          <p className="text-xs text-muted-foreground">
            {upcomingEventsCount} próximos, {completedEventsCount} realizados
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

// Original design of Upcoming Events
const UpcomingEventsList = () => {
  // Get upcoming events
  const upcomingEvents = mockEvents
    .filter(event => event.status === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Próximos Eventos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingEvents.map((event) => (
          <div key={event.id} className="rounded-lg border border-border/40 bg-background/60 p-4 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-yellow-500/20">
                <CalendarIcon className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{event.title}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1 text-sm">
                  <div>
                    <p className="text-muted-foreground">Data: {new Date(event.date).toLocaleDateString('pt-BR')}</p>
                    <p className="text-muted-foreground">Local: {event.location}</p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-muted-foreground">Cliente: {event.client}</p>
                    <p className="text-muted-foreground">Receita Estimada: {formatCurrency(event.estimatedRevenue)}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-md bg-blue-500 px-2 py-1 text-xs text-white">
                Próximo
              </div>
            </div>
          </div>
        ))}
        {upcomingEvents.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            Nenhum evento próximo.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// Events by Month Component - Updated to show event count instead of financial values
const EventsByMonth = () => {
  // Get current year
  const currentYear = new Date().getFullYear();
  
  // Get all events for the current year
  const currentYearEvents = mockEvents.filter(
    event => new Date(event.date).getFullYear() === currentYear
  );
  
  // Create data for monthly events count
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const eventsByMonth = months.map(month => ({
    name: month,
    events: 0
  }));
  
  // Count events by month
  currentYearEvents.forEach(event => {
    const month = new Date(event.date).getMonth();
    eventsByMonth[month].events += 1;
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Eventos por Mês</CardTitle>
        <CardDescription>Número de eventos em {currentYear}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <FinancialBarChart
            data={eventsByMonth}
            title="Número de Eventos"
            dataKeys={['events']}
            colors={['#ffbf00']}
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Income vs Expenses Component
const IncomeVsExpensesChart = () => {
  const currentYear = new Date().getFullYear();
  
  // Get all transactions for the current year
  const yearTransactions = mockTransactions.filter(
    transaction => transaction.date.getFullYear() === currentYear
  );
  
  // Create data for monthly income and expenses
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const monthlyData = months.map(month => ({
    name: month,
    income: 0,
    expenses: 0
  }));
  
  // Calculate income and expenses by month
  yearTransactions.forEach(transaction => {
    const month = transaction.date.getMonth();
    if (transaction.type === 'income') {
      monthlyData[month].income += transaction.amount;
    } else {
      monthlyData[month].expenses += transaction.amount;
    }
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Receitas vs Despesas</CardTitle>
        <CardDescription>Visão financeira de {currentYear}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <FinancialBarChart
            data={monthlyData}
            title=""
            dataKeys={['income', 'expenses']}
            colors={['#10B981', '#EF4444']}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default function Dashboard() {
  // Get upcoming events
  const upcomingEvents = mockEvents
    .filter(event => event.status === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);
  
  // Get recent transactions
  const recentTransactions = [...mockTransactions]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);
  
  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <StatCards />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Total de Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientStats clients={mockClients} events={mockEvents} />
            </CardContent>
          </Card>
          
          <UpcomingEventsList />
          
          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
              <CardDescription>Últimas movimentações financeiras</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentTransactions transactions={recentTransactions} />
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <IncomeVsExpensesChart />
          <EventsByMonth />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Calendário de Eventos</CardTitle>
              <CardDescription>
                Visualize seus eventos agendados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EventsCalendar events={mockEvents} />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
