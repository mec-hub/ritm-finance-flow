
import { StatCard } from '@/components/ui/dashboard/StatCard';
import { Client, Event, Transaction } from '@/types';
import { Users, CalendarDays, DollarSign } from 'lucide-react';
import { TransactionService } from '@/services/transactionService';
import { useState, useEffect } from 'react';

interface ClientStatsProps {
  clients: Client[];
  events: Event[];
}

export function ClientStats({ clients, events }: ClientStatsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const transactionsData = await TransactionService.getAll();
        setTransactions(transactionsData);
      } catch (error) {
        console.error('Error fetching transactions for client stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Calculate client revenues from transactions linked to clients
  const calculateClientsRevenue = (): Map<string, number> => {
    const clientRevenueMap = new Map<string, number>();
    
    // Initialize all clients with 0 revenue
    clients.forEach(client => {
      clientRevenueMap.set(client.id, 0);
    });
    
    // Process transactions to calculate revenue per client
    transactions.forEach(transaction => {
      // Only consider income transactions with 'paid' status
      if (transaction.type === 'income' && transaction.status === 'paid') {
        
        // Method 1: Direct client relationship via clientId
        if (transaction.clientId) {
          const currentRevenue = clientRevenueMap.get(transaction.clientId) || 0;
          clientRevenueMap.set(transaction.clientId, currentRevenue + transaction.amount);
          return;
        }
        
        // Method 2: Indirect client relationship via eventId
        if (transaction.eventId) {
          // Find the event linked to this transaction
          const linkedEvent = events.find(event => event.id === transaction.eventId);
          
          if (linkedEvent && linkedEvent.clientId) {
            // Direct client reference in event
            const currentRevenue = clientRevenueMap.get(linkedEvent.clientId) || 0;
            clientRevenueMap.set(linkedEvent.clientId, currentRevenue + transaction.amount);
          } else if (linkedEvent) {
            // Fallback: Find client by name matching (legacy support)
            const client = clients.find(c => c.name === linkedEvent.client);
            if (client) {
              const currentRevenue = clientRevenueMap.get(client.id) || 0;
              clientRevenueMap.set(client.id, currentRevenue + transaction.amount);
            }
          }
        }
      }
    });
    
    return clientRevenueMap;
  };
  
  if (loading) {
    return (
      <>
        <StatCard
          title="Total de Clientes"
          value="Carregando..."
          icon={Users}
          description="Clientes cadastrados"
        />
        <StatCard
          title="Eventos por Cliente"
          value="Carregando..."
          icon={CalendarDays}
          description="Média de eventos"
        />
        <StatCard
          title="Receita Média por Cliente"
          value="Carregando..."
          icon={DollarSign}
          description="Valor médio por cliente"
        />
      </>
    );
  }

  // Get the calculated revenues
  const clientsRevenueMap = calculateClientsRevenue();
  
  // Calculate statistics
  const totalClients = clients.length;
  
  // Calculate total events
  const totalEvents = events.length;
  const eventsPerClient = totalClients > 0 ? (totalEvents / totalClients).toFixed(1) : '0';
  
  // Calculate total revenue from all clients based on actual transactions
  const totalRevenue = Array.from(clientsRevenueMap.values()).reduce((sum, val) => sum + val, 0);
  const averageRevenuePerClient = totalClients > 0 
    ? (totalRevenue / totalClients).toFixed(2)
    : '0.00';

  console.log('ClientStats - Revenue calculation:', {
    totalClients,
    totalRevenue,
    averageRevenuePerClient,
    clientsRevenueMap: Object.fromEntries(clientsRevenueMap),
    transactionsCount: transactions.length,
    paidIncomeTransactions: transactions.filter(t => t.type === 'income' && t.status === 'paid').length
  });
  
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
        description="Baseado em transações pagas"
      />
    </>
  );
}
