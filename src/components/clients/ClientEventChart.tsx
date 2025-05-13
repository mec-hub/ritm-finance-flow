
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Client, Event } from '@/types';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ClientEventChartProps {
  clients: Client[];
  events: Event[];
}

export function ClientEventChart({ clients, events }: ClientEventChartProps) {
  // Prepare data for events per month chart
  const currentYear = new Date().getFullYear();
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  
  const eventsPerMonth = monthNames.map(month => ({
    month,
    eventos: 0
  }));
  
  events.forEach(event => {
    const eventDate = new Date(event.date);
    if (eventDate.getFullYear() === currentYear) {
      eventsPerMonth[eventDate.getMonth()].eventos++;
    }
  });
  
  // Prepare data for top clients chart
  const eventsPerClient = clients.map(client => {
    const clientEvents = events.filter(event => event.client === client.name).length;
    return {
      name: client.name,
      eventos: clientEvents
    };
  }).sort((a, b) => b.eventos - a.eventos).slice(0, 5);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Eventos por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              eventos: {
                label: "Eventos",
                color: "#2563eb"
              }
            }}
          >
            <BarChart data={eventsPerMonth}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<ChartTooltipContent />} />
              <Bar dataKey="eventos" fill="var(--color-eventos, #2563eb)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Principais Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              eventos: {
                label: "Eventos",
                color: "#f59e0b"
              }
            }}
          >
            <BarChart data={eventsPerClient} layout="vertical">
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip content={<ChartTooltipContent />} />
              <Bar dataKey="eventos" fill="var(--color-eventos, #f59e0b)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </>
  );
}
