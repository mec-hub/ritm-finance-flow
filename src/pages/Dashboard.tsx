import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockTransactions, mockEvents } from '@/data/mockData';
import { formatCurrency } from '@/utils/formatters';
import { ArrowDownIcon, ArrowUpIcon, CalendarIcon, UsersIcon } from 'lucide-react';
import { FinancialSummary } from '@/components/financas/FinancialSummary';

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

const EventsList = ({ events }) => {
  return (
    <div className="space-y-4">
      {events.length > 0 ? (
        events.map((event) => (
          <div key={event.id} className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium">{event.title}</h3>
              <p className="text-xs text-muted-foreground">
                {new Date(event.date).toLocaleDateString()} - {event.location}
              </p>
            </div>
            <div className="text-sm font-medium">
              {formatCurrency(event.estimatedRevenue)}
            </div>
          </div>
        ))
      ) : (
        <p className="text-muted-foreground text-center py-4">Nenhum evento próximo.</p>
      )}
    </div>
  );
};

const RecentTransactions = ({ transactions }) => {
  return (
    <div className="space-y-4">
      {transactions.length > 0 ? (
        transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
              transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {transaction.type === 'income' ? (
                <ArrowUpIcon className="h-5 w-5" />
              ) : (
                <ArrowDownIcon className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium">{transaction.description}</h3>
              <p className="text-xs text-muted-foreground">
                {new Date(transaction.date).toLocaleDateString()} - {transaction.category}
              </p>
            </div>
            <div className={`text-sm font-medium ${
              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
            </div>
          </div>
        ))
      ) : (
        <p className="text-muted-foreground text-center py-4">Nenhuma transação recente.</p>
      )}
    </div>
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
        
        <Card>
          <CardHeader>
            <CardTitle>Visão Geral Financeira</CardTitle>
            <CardDescription>
              Acompanhe suas receitas e despesas ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FinancialSummary transactions={mockTransactions} />
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Próximos Eventos</CardTitle>
              <CardDescription>Eventos agendados para os próximos dias</CardDescription>
            </CardHeader>
            <CardContent>
              <EventsList events={upcomingEvents} />
            </CardContent>
          </Card>
          
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
      </div>
    </Layout>
  );
}
