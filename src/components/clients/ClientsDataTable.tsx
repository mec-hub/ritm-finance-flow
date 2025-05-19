
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Client, Event } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { mockEvents } from '@/data/mockData';

interface ClientsDataTableProps {
  clients: Client[];
}

export function ClientsDataTable({ clients }: ClientsDataTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Client;
    direction: 'ascending' | 'descending';
  }>({ key: 'name', direction: 'ascending' });

  // Get client events count 
  const getClientEventsCount = (clientName: string): number => {
    return mockEvents.filter(event => event.client === clientName).length;
  };

  // Get last event date
  const getLastEventDate = (clientName: string): Date | null => {
    const clientEvents = mockEvents.filter(event => event.client === clientName);
    if (clientEvents.length === 0) return null;
    
    // Sort by date descending and get the first one
    const sortedEvents = [...clientEvents].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return new Date(sortedEvents[0].date);
  };

  const requestSort = (key: keyof Client) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedClients = [...clients].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  return (
    <Card>
      <CardContent className="p-0">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => requestSort('name')}
                >
                  Nome
                  {sortConfig.key === 'name' && (
                    <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                  )}
                </TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Número de Eventos</TableHead>
                <TableHead>Último Evento</TableHead>
                <TableHead 
                  className="cursor-pointer text-right"
                  onClick={() => requestSort('totalRevenue')}
                >
                  Faturamento Total
                  {sortConfig.key === 'totalRevenue' && (
                    <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                  )}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedClients.map((client) => {
                const eventCount = getClientEventsCount(client.name);
                const lastEventDate = getLastEventDate(client.name);
                
                return (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.contact}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone || '-'}</TableCell>
                    <TableCell>{eventCount}</TableCell>
                    <TableCell>
                      {lastEventDate ? formatDate(lastEventDate) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(client.totalRevenue)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
