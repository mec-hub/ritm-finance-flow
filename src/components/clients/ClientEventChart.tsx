
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Client, Event } from '@/types';
import { mockEvents } from '@/data/mockData';

interface ClientEventChartProps {
  clients: Client[];
  events: Event[];
}

export function ClientEventChart({ clients, events }: ClientEventChartProps) {
  // Group events by month and count them
  const getEventsByMonth = () => {
    const eventCounts: Record<string, number> = {};
    
    // Initialize all months with 0 events
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    months.forEach(month => {
      eventCounts[month] = 0;
    });
    
    // Count events per month
    events.forEach(event => {
      const eventDate = new Date(event.date);
      const month = eventDate.toLocaleString('pt-BR', { month: 'short' });
      eventCounts[month] = (eventCounts[month] || 0) + 1;
    });
    
    // Convert to array for chart
    return months.map(month => ({
      month,
      events: eventCounts[month] || 0
    }));
  };
  
  const eventsByMonth = getEventsByMonth();
  
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Eventos por Mês</CardTitle>
        <CardDescription>Distribuição de eventos ao longo do ano</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={eventsByMonth}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                label={{ value: 'Número de Eventos', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip formatter={(value) => [`${value} eventos`, 'Eventos']} />
              <Legend />
              <Bar dataKey="events" fill="#8884d8" name="Eventos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
