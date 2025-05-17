
import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { mockClients, mockEvents } from '@/data/mockData';
import { ClientsDataTable } from '@/components/clients/ClientsDataTable';
import { ClientStats } from '@/components/clients/ClientStats';
import { ClientEventChart } from '@/components/clients/ClientEventChart';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';

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
        
        {/* Client List with Number of Clients Column */}
        <div className="dashboard-card">
          <h2 className="dashboard-card-title mb-4">Lista de Clientes</h2>
          
          <Card>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Número de Eventos</TableHead>
                    <TableHead>Última Interação</TableHead>
                    <TableHead className="text-right">Total Faturado</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.length > 0 ? (
                    clients.map((client) => {
                      // Count events for this client
                      const clientEvents = mockEvents.filter(event => event.client === client.name);
                      
                      return (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">{client.name}</TableCell>
                          <TableCell>{client.contact}</TableCell>
                          <TableCell>{client.email}</TableCell>
                          <TableCell>{client.phone || '-'}</TableCell>
                          <TableCell>{clientEvents.length}</TableCell>
                          <TableCell>
                            {client.lastEvent ? new Date(client.lastEvent).toLocaleDateString() : 'Nenhuma'}
                          </TableCell>
                          <TableCell className="text-right">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.totalRevenue)}
                          </TableCell>
                          <TableCell>
                            <Link to={`/editar-cliente/${client.id}`}>
                              <Button variant="ghost" size="sm">
                                Editar
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        Nenhum cliente encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Clientes;
