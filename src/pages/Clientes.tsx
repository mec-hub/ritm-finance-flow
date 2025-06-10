
import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ClientsDataTable } from '@/components/clients/ClientsDataTable';
import { ClientStats } from '@/components/clients/ClientStats';
import { ClientEventChart } from '@/components/clients/ClientEventChart';
import { Link } from 'react-router-dom';
import { ClientService } from '@/services/clientService';
import { EventService } from '@/services/eventService';
import { Client, Event } from '@/types';
import { toast } from '@/components/ui/use-toast';

const Clientes = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Clientes - Fetching clients and events...');
        const [clientsData, eventsData] = await Promise.all([
          ClientService.getAll(),
          EventService.getAll()
        ]);
        
        console.log('Clientes - Clients data:', clientsData);
        console.log('Clientes - Events data:', eventsData);
        
        setClients(clientsData);
        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p>Carregando clientes...</p>
        </div>
      </Layout>
    );
  }
  
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
            <Link to="/clientes/novo">
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Cliente
            </Link>
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <ClientStats clients={clients} events={events} />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <ClientEventChart clients={clients} events={events} />
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
