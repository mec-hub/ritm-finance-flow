
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Client, Event } from '@/types';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ClientEventChartProps {
  clients: Client[];
  events: Event[];
}

export function ClientEventChart({ clients, events }: ClientEventChartProps) {
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
  
  // Prepare data for top clients chart
  const eventsPerClient = clients.map(client => {
    const clientEvents = events.filter(event => event.client === client.name).length;
    return {
      name: client.name,
      eventos: clientEvents
    };
  }).sort((a, b) => b.eventos - a.eventos).slice(0, 5);

  const navigateYear = (direction: 'next' | 'prev') => {
    const currentIndex = availableYears.indexOf(selectedYear);
    
    if (direction === 'next' && currentIndex > 0) {
      setSelectedYear(availableYears[currentIndex - 1]);
    } else if (direction === 'prev' && currentIndex < availableYears.length - 1) {
      setSelectedYear(availableYears[currentIndex + 1]);
    }
  };

  return (
    <>
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
