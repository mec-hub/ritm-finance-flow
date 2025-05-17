
import { StatCard } from '@/components/ui/dashboard/StatCard';
import { Client, Event, Transaction } from '@/types';
import { Users, CalendarDays, DollarSign } from 'lucide-react';
import { mockTransactions } from '@/data/mockData';

interface ClientStatsProps {
  clients: Client[];
  events: Event[];
}

export function ClientStats({ clients, events }: ClientStatsProps) {
  // Calculate client revenues from transactions linked to events
  const calculateClientsRevenue = (): Map<string, number> => {
    const clientRevenueMap = new Map<string, number>();
    
    // Initialize all clients with 0 revenue
    clients.forEach(client => {
      clientRevenueMap.set(client.id, 0);
    });
    
    // Find transactions linked to events
    mockTransactions.forEach(transaction => {
      if (transaction.eventId) {
        // Find the event linked to this transaction
        const linkedEvent = events.find(event => event.id === transaction.eventId);
        
        if (linkedEvent) {
          // Find client by name (in a real app, this would be by ID)
          const client = clients.find(c => c.name === linkedEvent.client);
          
          if (client && transaction.type === 'income') {
            // Add transaction amount to client's revenue
            const currentRevenue = clientRevenueMap.get(client.id) || 0;
            clientRevenueMap.set(client.id, currentRevenue + transaction.amount);
          }
        }
      }
    });
    
    return clientRevenueMap;
  };
  
  // Get the calculated revenues
  const clientsRevenueMap = calculateClientsRevenue();
  
  // Calculate statistics
  const totalClients = clients.length;
  
  // Calculate total events
  const totalEvents = events.length;
  const eventsPerClient = totalClients > 0 ? (totalEvents / totalClients).toFixed(1) : '0';
  
  // Calculate total revenue from all clients
  const totalRevenue = Array.from(clientsRevenueMap.values()).reduce((sum, val) => sum + val, 0);
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
