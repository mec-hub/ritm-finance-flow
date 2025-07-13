
import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { ArrowLeft, CalendarIcon } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EventService } from '@/services/eventService';
import { ClientService } from '@/services/clientService';
import { Event, Client } from '@/types';
import { LocationSearch } from '@/components/LocationSearch';
import { MapPreview } from '@/components/MapPreview';

interface LocationData {
  place_id: string;
  formatted_address: string;
  place_name: string;
  latitude: number;
  longitude: number;
}

interface EventFormData {
  title: string;
  date: Date;
  location: string;
  clientId: string;
  estimatedRevenue: string;
  estimatedExpenses: string;
  actualRevenue?: string;
  actualExpenses?: string;
  status: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
}

const EditarEvento = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const navigate = useNavigate();
  const { id } = useParams();
  
  const form = useForm<EventFormData>({
    defaultValues: {
      title: '',
      date: new Date(),
      location: '',
      clientId: 'no_client',
      estimatedRevenue: '0',
      estimatedExpenses: '0',
      actualRevenue: '',
      actualExpenses: '',
      status: 'upcoming',
      startTime: '',
      endTime: '',
      notes: '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        console.error('EditarEvento - No event ID provided');
        setError('ID do evento não fornecido');
        toast({
          title: "Erro",
          description: "ID do evento não fornecido",
          variant: "destructive"
        });
        navigate('/eventos');
        return;
      }

      try {
        console.log('EditarEvento - Starting data fetch for event ID:', id);
        setLoading(true);
        setError(null);
        
        // Fetch both event and clients data
        const [eventData, clientsData] = await Promise.all([
          EventService.getById(id),
          ClientService.getAll()
        ]);
        
        console.log('EditarEvento - Event data received:', eventData);
        console.log('EditarEvento - Clients data received:', clientsData);
        
        if (!eventData) {
          console.error('EditarEvento - Event not found');
          setError('Evento não encontrado');
          toast({
            title: "Erro",
            description: "Evento não encontrado",
            variant: "destructive"
          });
          navigate('/eventos');
          return;
        }

        setEvent(eventData);
        setClients(clientsData);
        
        // Set location data if available
        if (eventData.placeName && eventData.formattedAddress && eventData.latitude && eventData.longitude && eventData.placeId) {
          setSelectedLocation({
            place_id: eventData.placeId,
            formatted_address: eventData.formattedAddress,
            place_name: eventData.placeName,
            latitude: eventData.latitude,
            longitude: eventData.longitude,
          });
        }
        
        // Populate form with event data
        const clientId = eventData.clientId || 'no_client';
        console.log('EditarEvento - Setting form with client ID:', clientId);
        
        form.reset({
          title: eventData.title,
          date: new Date(eventData.date),
          location: eventData.location,
          clientId: clientId,
          estimatedRevenue: eventData.estimatedRevenue.toString(),
          estimatedExpenses: eventData.estimatedExpenses.toString(),
          actualRevenue: eventData.actualRevenue?.toString() || '',
          actualExpenses: eventData.actualExpenses?.toString() || '',
          status: eventData.status,
          startTime: eventData.startTime || '',
          endTime: eventData.endTime || '',
          notes: eventData.notes || '',
        });

        console.log('EditarEvento - Form populated successfully');
        
      } catch (error) {
        console.error('EditarEvento - Error fetching data:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        setError(errorMessage);
        toast({
          title: "Erro",
          description: `Não foi possível carregar o evento: ${errorMessage}`,
          variant: "destructive"
        });
        navigate('/eventos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, form]);

  const onSubmit = async (data: EventFormData) => {
    if (!id) {
      console.error('EditarEvento - No event ID for update');
      toast({
        title: "Erro",
        description: "ID do evento não encontrado",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('EditarEvento - Starting update with form data:', data);
      console.log('EditarEvento - Selected location:', selectedLocation);
      
      // Prepare update data
      const clientId = data.clientId === 'no_client' ? undefined : data.clientId;
      
      const updateData = {
        title: data.title,
        date: data.date,
        location: data.location,
        estimatedRevenue: parseFloat(data.estimatedRevenue) || 0,
        estimatedExpenses: parseFloat(data.estimatedExpenses) || 0,
        actualRevenue: data.actualRevenue ? parseFloat(data.actualRevenue) : undefined,
        actualExpenses: data.actualExpenses ? parseFloat(data.actualExpenses) : undefined,
        status: data.status as 'upcoming' | 'completed' | 'cancelled',
        notes: data.notes,
        // Add location data
        placeName: selectedLocation?.place_name,
        formattedAddress: selectedLocation?.formatted_address,
        latitude: selectedLocation?.latitude,
        longitude: selectedLocation?.longitude,
        placeId: selectedLocation?.place_id,
        // Add time data
        startTime: data.startTime || undefined,
        endTime: data.endTime || undefined,
      };

      console.log('EditarEvento - Update data prepared:', updateData);
      console.log('EditarEvento - Client ID for update:', clientId);
      
      await EventService.update(id, updateData, clientId);
      
      console.log('EditarEvento - Update successful');
      
      toast({
        title: "Evento atualizado",
        description: `O evento "${data.title}" foi atualizado com sucesso!`,
      });
      
      navigate('/eventos');
    } catch (error) {
      console.error('EditarEvento - Error updating event:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro",
        description: `Não foi possível atualizar o evento: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-lg">Carregando dados do evento...</p>
            <p className="text-sm text-muted-foreground mt-2">ID: {id}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-lg text-destructive">Erro: {error}</p>
            <Button asChild className="mt-4">
              <Link to="/eventos">Voltar para Eventos</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-lg">Evento não encontrado</p>
            <Button asChild className="mt-4">
              <Link to="/eventos">Voltar para Eventos</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            asChild 
            className="mr-2"
          >
            <Link to="/eventos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Editar Evento</h1>
            <p className="text-muted-foreground">
              Atualize as informações do evento: {event?.title}
            </p>
          </div>
        </div>
        
        <div className="dashboard-card p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título do Evento</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do evento ou apresentação" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data do Evento</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy", { locale: ptBR })
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Local</FormLabel>
                      <FormControl>
                        <Input placeholder="Endereço ou nome do local (opcional)" {...field} />
                      </FormControl>
                      <FormDescription>
                        Campo para referência adicional, se necessário
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário de Início</FormLabel>
                      <FormControl>
                        <Input 
                          type="time" 
                          placeholder="--:--"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Horário de início do evento (opcional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário de Término</FormLabel>
                      <FormControl>
                        <Input 
                          type="time" 
                          placeholder="--:--"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Horário de término do evento (opcional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormItem>
                <FormLabel>Localização com Busca</FormLabel>
                <LocationSearch
                  value={selectedLocation}
                  onChange={setSelectedLocation}
                  placeholder="Pesquisar local do evento..."
                />
                <FormDescription>
                  Use a busca para encontrar e selecionar a localização exata do evento
                </FormDescription>
              </FormItem>

              {selectedLocation && (
                <div className="space-y-4">
                  <FormLabel>Pré-visualização do Local</FormLabel>
                  <MapPreview
                    latitude={selectedLocation.latitude}
                    longitude={selectedLocation.longitude}
                    placeName={selectedLocation.place_name}
                    className="w-full h-64 rounded-md border"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="no_client">Nenhum cliente</SelectItem>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Selecione o cliente relacionado a este evento.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status do Evento</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="upcoming">Próximo</SelectItem>
                          <SelectItem value="completed">Concluído</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="estimatedRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Receita Estimada (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0,00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="estimatedExpenses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Despesas Estimadas (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0,00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="actualRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Receita Real (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0,00" {...field} />
                      </FormControl>
                      <FormDescription>
                        Preencha após a realização do evento
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="actualExpenses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Despesas Reais (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0,00" {...field} />
                      </FormControl>
                      <FormDescription>
                        Preencha após a realização do evento
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detalhes adicionais sobre o evento" 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Inclua requisitos especiais, informações logísticas ou outras notas importantes.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-gold-gradient text-black hover:brightness-110"
                  disabled={isLoading}
                >
                  {isLoading ? 'Atualizando...' : 'Atualizar Evento'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate('/eventos')}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
};

export default EditarEvento;
