
import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { ArrowLeft, CalendarIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TransactionService } from '@/services/transactionService';
import { ClientService } from '@/services/clientService';
import { EventService } from '@/services/eventService';
import { TeamService } from '@/services/teamService';
import { Transaction, Client, Event, TeamMember } from '@/types';

interface TransactionFormData {
  description: string;
  amount: string;
  category: string;
  subcategory?: string;
  date: Date;
  type: 'income' | 'expense';
  status: 'paid' | 'not_paid' | 'canceled';
  isRecurring: boolean;
  recurrenceMonths?: string;
  clientId?: string;
  eventId?: string;
  notes?: string;
}

const NovaTransacao = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const navigate = useNavigate();
  
  const form = useForm<TransactionFormData>({
    defaultValues: {
      description: '',
      amount: '',
      category: '',
      subcategory: '',
      date: new Date(),
      type: 'income',
      status: 'not_paid',
      isRecurring: false,
      recurrenceMonths: '1',
      clientId: '',
      eventId: '',
      notes: '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsData, eventsData, teamData] = await Promise.all([
          ClientService.getAll(),
          EventService.getAll(),
          TeamService.getAll()
        ]);
        setClients(clientsData);
        setEvents(eventsData);
        setTeamMembers(teamData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados necessários.",
          variant: "destructive"
        });
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: TransactionFormData) => {
    setIsLoading(true);
    
    try {
      const transaction: Omit<Transaction, 'id'> = {
        amount: parseFloat(data.amount),
        description: data.description,
        date: data.date,
        category: data.category,
        subcategory: data.subcategory || undefined,
        type: data.type,
        status: data.status,
        isRecurring: data.isRecurring,
        recurrenceInterval: data.isRecurring ? 'monthly' : undefined,
        recurrenceMonths: data.isRecurring ? parseInt(data.recurrenceMonths || '1') : undefined,
        clientId: data.clientId || undefined,
        eventId: data.eventId || undefined,
        notes: data.notes || undefined,
        attachments: []
      };

      await TransactionService.create(transaction);

      toast({
        title: "Transação criada",
        description: `${data.type === 'income' ? 'Receita' : 'Despesa'} de ${data.amount} foi criada com sucesso!`,
      });
      
      navigate('/financas');
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a transação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    'Shows', 'Eventos', 'Publicidade', 'Equipamento', 'Transporte', 
    'Alimentação', 'Hospedagem', 'Pessoal', 'Marketing', 'Outros'
  ];

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
            <Link to="/financas">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nova Transação</h1>
            <p className="text-muted-foreground">
              Adicione uma nova receita ou despesa ao sistema.
            </p>
          </div>
        </div>
        
        <div className="dashboard-card p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Transação</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="income">Receita</SelectItem>
                          <SelectItem value="expense">Despesa</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="paid">Pago</SelectItem>
                          <SelectItem value="not_paid">Não Pago</SelectItem>
                          <SelectItem value="canceled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input placeholder="Descrição da transação" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0,00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data</FormLabel>
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
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subcategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategoria (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Subcategoria" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente (opcional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Nenhum cliente</SelectItem>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eventId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evento (opcional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um evento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Nenhum evento</SelectItem>
                          {events.map((event) => (
                            <SelectItem key={event.id} value={event.id}>
                              {event.title} ({format(new Date(event.date), "dd/MM/yyyy")})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Transação Recorrente</FormLabel>
                      <FormDescription>
                        Esta é uma transação mensal recorrente?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {form.watch("isRecurring") && (
                <FormField
                  control={form.control}
                  name="recurrenceMonths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Meses</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="60" 
                          placeholder="Número de meses" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Por quantos meses esta transação mensal se repetirá
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações (opcional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Informações adicionais sobre a transação" 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-gold-gradient text-black hover:brightness-110"
                disabled={isLoading}
              >
                {isLoading ? 'Salvando...' : 'Salvar Transação'}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
};

export default NovaTransacao;
