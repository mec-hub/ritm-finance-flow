
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
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EventService } from '@/services/eventService';
import { ClientService } from '@/services/clientService';
import { Client } from '@/types';

interface EventFormData {
  title: string;
  date: Date;
  location: string;
  clientId: string;
  estimatedRevenue: string;
  estimatedExpenses: string;
  notes?: string;
}

const NovoEvento = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const navigate = useNavigate();
  
  const form = useForm<EventFormData>({
    defaultValues: {
      title: '',
      date: new Date(),
      location: '',
      clientId: '',
      estimatedRevenue: '',
      estimatedExpenses: '',
      notes: '',
    },
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientsData = await ClientService.getAll();
        setClients(clientsData);
      } catch (error) {
        console.error('Error fetching clients:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a lista de clientes.",
          variant: "destructive"
        });
      }
    };

    fetchClients();
  }, []);

  const onSubmit = async (data: EventFormData) => {
    setIsLoading(true);
    
    try {
      await EventService.create({
        title: data.title,
        date: data.date,
        location: data.location,
        client: '', // This will be set by the service based on clientId
        estimatedRevenue: parseFloat(data.estimatedRevenue) || 0,
        estimatedExpenses: parseFloat(data.estimatedExpenses) || 0,
        status: 'upcoming',
        notes: data.notes,
      });
      
      toast({
        title: "Evento adicionado",
        description: `O evento "${data.title}" foi adicionado com sucesso!`,
      });
      
      navigate('/eventos');
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o evento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
            <h1 className="text-3xl font-bold tracking-tight">Novo Evento</h1>
            <p className="text-muted-foreground">
              Adicione um novo evento ao sistema.
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
                        <Input placeholder="Endereço ou nome do local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
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
              
              <Button 
                type="submit" 
                className="w-full bg-gold-gradient text-black hover:brightness-110"
                disabled={isLoading}
              >
                {isLoading ? 'Salvando...' : 'Salvar Evento'}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
};

export default NovoEvento;
