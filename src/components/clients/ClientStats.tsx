
import { StatCard } from '@/components/ui/dashboard/StatCard';
import { Client, Event } from '@/types';
import { Users, CalendarDays, DollarSign } from 'lucide-react';

interface ClientStatsProps {
  clients: Client[];
  events: Event[];
}

export function ClientStats({ clients, events }: ClientStatsProps) {
  // Calculate statistics
  const totalClients = clients.length;
  
  const totalEvents = events.length;
  const eventsPerClient = totalClients > 0 ? (totalEvents / totalClients).toFixed(1) : '0';
  
  const totalRevenue = clients.reduce((sum, client) => sum + client.totalRevenue, 0);
  const averageRevenuePerClient = totalClients > 0 
    ? (totalRevenue / totalClients).toFixed(2)
    : '0.00';
  
  return (
    <>
      <StatCard
        title="Total de Clientes"
        value={totalClients.toString()}
        icon={Users}
        description="Clientes cadastrados"
      />
      <StatCard
        title="Eventos por Cliente"
        value={eventsPerClient}
        icon={CalendarDays}
        description="Média de eventos"
      />
      <StatCard
        title="Receita Média por Cliente"
        value={`R$ ${averageRevenuePerClient}`}
        icon={DollarSign}
        description="Valor médio por cliente"
      />
    </>
  );
}
