
import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { mockClients, mockEvents } from '@/data/mockData';
import { ClientsDataTable } from '@/components/clients/ClientsDataTable';
import { ClientStats } from '@/components/clients/ClientStats';
import { ClientEventChart } from '@/components/clients/ClientEventChart';
import { Link } from 'react-router-dom';

const Clientes = () => {
  const [clients] = useState(mockClients);
  
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
        
        <div className="dashboard-card">
          <h2 className="dashboard-card-title mb-4">Lista de Clientes</h2>
          <ClientsDataTable clients={clients} />
        </div>
      </div>
    </Layout>
  );
};

export default Clientes;
