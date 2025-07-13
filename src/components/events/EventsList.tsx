
import { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { Event } from '@/types';
import { EventService } from '@/services/eventService';
import { MapPreview } from '@/components/MapPreview';
import { MoreHorizontal, Search, Eye, Trash2, Edit, Calendar, Clock, User, MapPin, DollarSign, Receipt, TrendingUp } from 'lucide-react';

interface EventsListProps {
  events: Event[];
  onEventUpdated?: () => void;
}

export function EventsList({ events: initialEvents, onEventUpdated }: EventsListProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const navigate = useNavigate();
  
  // For details and delete modals
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Update local events when prop changes
  useEffect(() => {
    console.log('EventsList - Events updated:', initialEvents);
    setEvents(initialEvents);
  }, [initialEvents]);

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      event.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesFilter = filter === 'all' || event.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Próximo</Badge>;
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600">Concluído</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500 hover:bg-red-600">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const handleDelete = async () => {
    if (!selectedEvent) return;

    try {
      console.log('EventsList - Deleting event:', selectedEvent.id);
      await EventService.delete(selectedEvent.id);
      
      // Update local state
      const updatedEvents = events.filter(event => event.id !== selectedEvent.id);
      setEvents(updatedEvents);
      
      // Close dialog
      setDeleteDialogOpen(false);
      
      // Notify parent component
      if (onEventUpdated) {
        onEventUpdated();
      }
      
      toast({
        title: "Evento excluído",
        description: `O evento "${selectedEvent.title}" foi excluído com sucesso.`,
      });
      
      setSelectedEvent(null);
    } catch (error) {
      console.error('EventsList - Error deleting event:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o evento. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  const handleViewDetails = (event: Event) => {
    console.log('EventsList - View details for event:', event);
    setSelectedEvent(event);
    setViewDetailsOpen(true);
  };
  
  const handleEdit = (event: Event) => {
    console.log('EventsList - Edit event:', event);
    navigate(`/eventos/editar/${event.id}`);
  };

  const formatTimeWithoutSeconds = (time: string) => {
    if (!time) return '';
    // Remove seconds from time format (HH:MM:SS -> HH:MM)
    return time.substring(0, 5);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar eventos..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Todos
          </Button>
          <Button 
            variant={filter === 'upcoming' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('upcoming')}
          >
            Próximos
          </Button>
          <Button 
            variant={filter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('completed')}
          >
            Concluídos
          </Button>
          <Button 
            variant={filter === 'cancelled' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('cancelled')}
          >
            Cancelados
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Local</TableHead>
              <TableHead>Valor Estimado</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  {searchQuery || filter !== 'all' ? 'Nenhum evento encontrado' : 'Nenhum evento cadastrado'}
                </TableCell>
              </TableRow>
            ) : (
              filteredEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>{formatDate(event.date)}</TableCell>
                  <TableCell>{event.client || 'Sem cliente'}</TableCell>
                  <TableCell>{event.location}</TableCell>
                  <TableCell>{formatCurrency(event.estimatedRevenue)}</TableCell>
                  <TableCell>{getStatusBadge(event.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(event)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(event)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedEvent(event);
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
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">{selectedEvent.title}</DialogTitle>
                <DialogDescription>
                  Detalhes completos do evento
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-6 py-4">
                {/* Status and Basic Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Badge variant="outline" className="w-3 h-3 p-0 rounded-full" />
                    Status
                  </div>
                  <div>{getStatusBadge(selectedEvent.status)}</div>
                </div>
                
                {/* Main Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                      <Calendar className="w-4 h-4" />
                      Data
                    </div>
                    <div className="text-sm">{formatDate(selectedEvent.date)}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                      <Clock className="w-4 h-4" />
                      Horário
                    </div>
                    <div className="text-sm">
                      {selectedEvent.startTime && selectedEvent.endTime 
                        ? `${formatTimeWithoutSeconds(selectedEvent.startTime)} às ${formatTimeWithoutSeconds(selectedEvent.endTime)}`
                        : 'Não definido'
                      }
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                      <User className="w-4 h-4" />
                      Cliente
                    </div>
                    <div className="text-sm">{selectedEvent.client || 'Sem cliente'}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                      <MapPin className="w-4 h-4" />
                      Local
                    </div>
                    <div className="text-sm">{selectedEvent.location}</div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                      <DollarSign className="w-4 h-4" />
                      Receita Estimada
                    </div>
                    <div className="text-sm text-green-600 font-medium">{formatCurrency(selectedEvent.estimatedRevenue)}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                      <Receipt className="w-4 h-4" />
                      Despesa Estimada
                    </div>
                    <div className="text-sm text-red-600 font-medium">{formatCurrency(selectedEvent.estimatedExpenses)}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                      <TrendingUp className="w-4 h-4" />
                      Lucro Estimado
                    </div>
                    <div className="text-sm text-blue-600 font-medium">{formatCurrency(selectedEvent.estimatedRevenue - selectedEvent.estimatedExpenses)}</div>
                  </div>
                </div>

                {/* Google Maps Preview */}
                {selectedEvent.latitude && selectedEvent.longitude && (
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                      <MapPin className="w-4 h-4" />
                      Localização
                    </div>
                    <MapPreview
                      latitude={selectedEvent.latitude}
                      longitude={selectedEvent.longitude}
                      placeName={selectedEvent.placeName || selectedEvent.location}
                      className="w-full h-48 rounded-lg border"
                    />
                    {selectedEvent.formattedAddress && (
                      <div className="text-xs text-muted-foreground mt-2">{selectedEvent.formattedAddress}</div>
                    )}
                  </div>
                )}
                
                {/* Notes */}
                {selectedEvent.notes && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Observações</div>
                    <div className="text-sm mt-1 p-2 bg-muted rounded-md">{selectedEvent.notes}</div>
                  </div>
                )}
              </div>
              
              <DialogFooter className="gap-2">
                <Button onClick={() => handleEdit(selectedEvent)} className="mr-2">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button variant="outline" onClick={() => setViewDetailsOpen(false)}>
                  Fechar
                </Button>
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
              Você tem certeza que deseja excluir o evento "{selectedEvent?.title}"? Esta ação não pode ser desfeita.
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
