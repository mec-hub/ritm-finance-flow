
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Client, Event, Transaction } from '@/types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface EventsCustomersChartsProps {
  clients: Client[];
  events: Event[];
  transactions: Transaction[];
}

export function EventsCustomersCharts({ clients, events, transactions }: EventsCustomersChartsProps) {
  // Get list of available years from events
  const availableYears = [...new Set(events.map(event => 
    new Date(event.date).getFullYear()
  ))].sort((a, b) => b - a); // Sort descending
  
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(
    availableYears.includes(currentYear) ? currentYear : availableYears[0] || currentYear
  );
  
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  
  // Prepare data for events per month chart
  const eventsPerMonth = monthNames.map(month => ({
    month,
    eventos: 0
  }));
  
  events.forEach(event => {
    const eventDate = new Date(event.date);
    if (eventDate.getFullYear() === selectedYear) {
      eventsPerMonth[eventDate.getMonth()].eventos++;
    }
  });
  
  // Prepare data for top clients chart (events count)
  const eventsPerClient = clients.map(client => {
    const clientEvents = events.filter(event => 
      event.clientId === client.id &&
      new Date(event.date).getFullYear() === selectedYear
    ).length;
    return {
      name: client.name,
      eventos: clientEvents
    };
  }).sort((a, b) => b.eventos - a.eventos).slice(0, 5);

  // Prepare data for revenue by client chart
  const revenuePerClient = clients.map(client => {
    // Get revenue from paid transactions for the selected year
    const clientRevenue = transactions
      .filter(transaction => 
        transaction.clientId === client.id &&
        transaction.type === 'income' &&
        transaction.status === 'paid' &&
        new Date(transaction.date).getFullYear() === selectedYear
      )
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    
    return {
      name: client.name,
      receita: clientRevenue
    };
  }).sort((a, b) => b.receita - a.receita).slice(0, 5);

  const navigateYear = (direction: 'next' | 'prev') => {
    const currentIndex = availableYears.indexOf(selectedYear);
    
    if (direction === 'next' && currentIndex > 0) {
      setSelectedYear(availableYears[currentIndex - 1]);
    } else if (direction === 'prev' && currentIndex < availableYears.length - 1) {
      setSelectedYear(availableYears[currentIndex + 1]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Events per Month */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Eventos por Mês</CardTitle>
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
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventsPerMonth}>
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip
                  formatter={(value) => [`${value} eventos`, 'Quantidade']}
                  contentStyle={{
                    backgroundColor: '#121212',
                    borderColor: '#333',
                    borderRadius: 6,
                    fontSize: 12
                  }}
                />
                <Bar dataKey="eventos" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Top Clients by Events */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Principais Clientes por Eventos</CardTitle>
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
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventsPerClient} layout="vertical">
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={120} />
                <Tooltip
                  formatter={(value) => [`${value} eventos`, 'Quantidade']}
                  contentStyle={{
                    backgroundColor: '#121212',
                    borderColor: '#333',
                    borderRadius: 6,
                    fontSize: 12
                  }}
                />
                <Bar dataKey="eventos" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Revenue by Client */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Receita por Cliente</CardTitle>
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
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenuePerClient} layout="vertical">
                <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                <YAxis type="category" dataKey="name" width={120} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Receita']}
                  contentStyle={{
                    backgroundColor: '#121212',
                    borderColor: '#333',
                    borderRadius: 6,
                    fontSize: 12
                  }}
                />
                <Bar dataKey="receita" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
