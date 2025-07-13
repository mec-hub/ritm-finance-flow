
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
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Client } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { ClientService } from '@/services/clientService';
import { MoreHorizontal, Edit, Trash2, Search, MessageCircle, Instagram } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ClientsDataTableProps {
  clients: Client[];
  onClientUpdated?: () => void;
}

export function ClientsDataTable({ clients: initialClients, onClientUpdated }: ClientsDataTableProps) {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Client;
    direction: 'ascending' | 'descending';
  }>({ key: 'name', direction: 'ascending' });
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Filter clients based on search term
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contact?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const requestSort = (key: keyof Client) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedClients = [...filteredClients].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const handleEdit = (client: Client) => {
    console.log('ClientsDataTable - Edit client:', client);
    navigate(`/clientes/editar/${client.id}`);
  };

  const handleWhatsAppClick = (client: Client) => {
    if (client.whatsappUrl && client.whatsappUrl.trim()) {
      let url = client.whatsappUrl.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleInstagramClick = (client: Client) => {
    if (client.instagramUrl && client.instagramUrl.trim()) {
      let url = client.instagramUrl.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDelete = async () => {
    if (!selectedClient) return;

    try {
      await ClientService.delete(selectedClient.id);
      
      // Update local state
      const updatedClients = clients.filter(client => client.id !== selectedClient.id);
      setClients(updatedClients);
      
      // Close dialog
      setDeleteDialogOpen(false);
      
      // Notify parent component
      if (onClientUpdated) {
        onClientUpdated();
      }
      
      toast({
        title: "Cliente excluído",
        description: `O cliente "${selectedClient.name}" foi excluído com sucesso.`,
      });
      
      setSelectedClient(null);
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o cliente. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const renderSocialIcon = (client: Client, platform: 'whatsapp' | 'instagram') => {
    const url = platform === 'whatsapp' ? client.whatsappUrl : client.instagramUrl;
    const handler = platform === 'whatsapp' ? handleWhatsAppClick : handleInstagramClick;
    const Icon = platform === 'whatsapp' ? MessageCircle : Instagram;
    const color = platform === 'whatsapp' ? 'text-green-600 hover:text-green-800' : 'text-pink-600 hover:text-pink-800';
    
    if (!url || !url.trim()) {
      return <span className="text-muted-foreground">-</span>;
    }
    
    return (
      <button
        onClick={() => handler(client)}
        className={`${color} cursor-pointer transition-colors`}
        title={`Abrir ${platform === 'whatsapp' ? 'WhatsApp' : 'Instagram'}`}
      >
        <Icon className="h-5 w-5" />
      </button>
    );
  };

  return (
    <>
      <Card>
        <CardContent className="p-4">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar clientes por nome, email, telefone ou contato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
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
                  <TableHead className="text-center">WhatsApp</TableHead>
                  <TableHead className="text-center">Instagram</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'Nenhum cliente encontrado com os critérios de busca.' : 'Nenhum cliente cadastrado.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <span className="font-medium">{client.name}</span>
                      </TableCell>
                      <TableCell>
                        {client.contact || '-'}
                      </TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.phone || '-'}</TableCell>
                      <TableCell className="text-center">
                        {renderSocialIcon(client, 'whatsapp')}
                      </TableCell>
                      <TableCell className="text-center">
                        {renderSocialIcon(client, 'instagram')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
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
        </CardContent>
      </Card>

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
    </>
  );
}
