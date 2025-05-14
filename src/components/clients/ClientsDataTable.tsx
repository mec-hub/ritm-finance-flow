import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/utils/formatters';
import { Client } from '@/types';
import { MoreHorizontal, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ClientsDataTableProps {
  clients: Client[];
}

export function ClientsDataTable({ clients: initialClients }: ClientsDataTableProps) {
  const [clients, setClients] = useState(initialClients);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  // For details, edit, delete modals
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    client.contact.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleViewDetails = (client: Client) => {
    setSelectedClient(client);
    setViewDetailsOpen(true);
  };
  
  const handleEdit = (client: Client) => {
    // Navigate to edit page with client data
    navigate(`/editar-cliente/${client.id}`, { state: { clientData: client } });
  };
  
  const handleDelete = () => {
    if (selectedClient) {
      // Filter out the client we want to delete
      const updatedClients = clients.filter(client => client.id !== selectedClient.id);
      setClients(updatedClients);
      
      // Close dialog
      setDeleteDialogOpen(false);
      
      // Show toast notification
      toast({
        title: "Cliente excluído",
        description: `O cliente "${selectedClient.name}" foi excluído com sucesso.`,
      });
      
      // Clear selection
      setSelectedClient(null);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar clientes..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Receita Total</TableHead>
              <TableHead>Último Evento</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Nenhum cliente encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.contact}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>R$ {client.totalRevenue.toFixed(2)}</TableCell>
                  <TableCell>{client.lastEvent ? formatDate(client.lastEvent) : 'N/A'}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(client)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(client)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedClient(client);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedClient && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedClient.name}</DialogTitle>
                <DialogDescription>
                  Detalhes completos do cliente
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium">Contato Principal</div>
                    <div className="text-sm">{selectedClient.contact}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">E-mail</div>
                    <div className="text-sm">{selectedClient.email}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Receita Total</div>
                    <div className="text-sm">R$ {selectedClient.totalRevenue.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Último Evento</div>
                    <div className="text-sm">{selectedClient.lastEvent ? formatDate(selectedClient.lastEvent) : 'N/A'}</div>
                  </div>
                </div>
                
                {selectedClient.notes && (
                  <div>
                    <div className="text-sm font-medium">Observações</div>
                    <div className="text-sm mt-1">{selectedClient.notes}</div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button onClick={() => handleEdit(selectedClient)} className="mr-2">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <DialogClose asChild>
                  <Button variant="outline">Fechar</Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja excluir o cliente "{selectedClient?.name}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
