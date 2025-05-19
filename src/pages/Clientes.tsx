
import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { mockClients, mockEvents, mockTransactions } from '@/data/mockData';
import { ClientsDataTable } from '@/components/clients/ClientsDataTable';
import { ClientStats } from '@/components/clients/ClientStats';
import { ClientEventChart } from '@/components/clients/ClientEventChart';
import { Link } from 'react-router-dom';

const Clientes = () => {
  // Calculate client revenue based on events and transactions
  const calculateClientRevenue = (clientName: string) => {
    // Find all events for this client
    const clientEvents = mockEvents.filter(event => event.client === clientName);
    
    let totalRevenue = 0;
    
    // For each event, find related transactions
    clientEvents.forEach(event => {
      const eventTransactions = mockTransactions.filter(
        transaction => transaction.eventId === event.id && transaction.type === 'income'
      );
      
      // Sum up transaction amounts
      eventTransactions.forEach(transaction => {
        totalRevenue += transaction.amount;
      });
    });
    
    return totalRevenue;
  };

  const [clients] = useState(() => {
    // Update client data with actual revenue calculations
    return mockClients.map(client => ({
      ...client,
      totalRevenue: calculateClientRevenue(client.name)
    }));
  });
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
            <p className="text-muted-foreground">
              Gerencie seus contatos e histórico de clientes.
            </p>
          </div>
          <Button asChild>
            <Link to="/novo-cliente">
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Cliente
            </Link>
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <ClientStats clients={clients} events={mockEvents} />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <ClientEventChart clients={clients} events={mockEvents} />
        </div>
        
        {/* Client List with Number of Events Column */}
        <div className="dashboard-card">
          <h2 className="dashboard-card-title mb-4">Lista de Clientes</h2>
          <ClientsDataTable clients={clients} />
        </div>
      </div>
    </Layout>
  );
};

export default Clientes;
