import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { CalendarIcon, ArrowLeft } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { TransactionService } from '@/services/transactionService';
import { ClientService } from '@/services/clientService';
import { EventService } from '@/services/eventService';
import { Transaction, Client, Event } from '@/types';

const formSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.coerce.number().positive('Valor deve ser positivo'),
  date: z.date(),
  category: z.string().min(1, 'Categoria é obrigatória'),
  subcategory: z.string().optional(),
  type: z.enum(['income', 'expense'], {
    required_error: 'Selecione o tipo de transação',
  }),
  isRecurring: z.boolean().default(false),
  recurrenceMonths: z.coerce.number().min(1).max(60).optional(),
  notes: z.string().optional(),
  clientId: z.string().optional(),
  eventId: z.string().optional(),
  status: z.enum(['paid', 'not_paid', 'canceled']).default('not_paid'),
});

type FormValues = z.infer<typeof formSchema>;

const EditarTransacao = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      amount: 0,
      date: new Date(),
      category: '',
      subcategory: '',
      type: 'income',
      isRecurring: false,
      recurrenceMonths: 1,
      notes: '',
      status: 'not_paid',
      clientId: 'no_client',
      eventId: 'no_event',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const [transactionData, clientsData, eventsData] = await Promise.all([
          TransactionService.getById(id),
          ClientService.getAll(),
          EventService.getAll()
        ]);
        
        if (transactionData) {
          setTransaction(transactionData);
          setClients(clientsData);
          setEvents(eventsData);
          
          form.reset({
            description: transactionData.description,
            amount: transactionData.amount,
            date: new Date(transactionData.date),
            category: transactionData.category,
            subcategory: transactionData.subcategory || '',
            type: transactionData.type,
            isRecurring: transactionData.isRecurring || false,
            recurrenceMonths: transactionData.recurrenceMonths || 1,
            notes: transactionData.notes || '',
            clientId: transactionData.clientId || 'no_client',
            eventId: transactionData.eventId || 'no_event',
            status: transactionData.status || 'not_paid',
          });
        } else {
          toast({
            title: "Transação não encontrada",
            description: "A transação que você está tentando editar não foi encontrada.",
            variant: "destructive",
          });
          navigate('/financas');
        }
      } catch (error) {
        console.error('Error fetching transaction:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a transação.",
          variant: "destructive"
        });
        navigate('/financas');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, form]);

  const onSubmit = async (values: FormValues) => {
    if (!id || !transaction) return;
    
    try {
      const updatedTransaction: Partial<Transaction> = {
        description: values.description,
        amount: values.amount,
        date: values.date,
        category: values.category,
        subcategory: values.subcategory || undefined,
        type: values.type,
        isRecurring: values.isRecurring,
        recurrenceInterval: values.isRecurring ? 'monthly' as const : undefined,
        recurrenceMonths: values.isRecurring ? values.recurrenceMonths : undefined,
        notes: values.notes || undefined,
        clientId: values.clientId === 'no_client' ? undefined : values.clientId,
        eventId: values.eventId === 'no_event' ? undefined : values.eventId,
        status: values.status,
      };
      
      await TransactionService.update(id, updatedTransaction);
      
      toast({
        title: "Transação atualizada",
        description: "A transação foi atualizada com sucesso.",
      });
      
      navigate('/financas');
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar a transação.",
        variant: "destructive",
      });
    }
  };

  const categories = [
    'Shows', 'Eventos', 'Publicidade', 'Equipamento', 'Transporte', 
    'Alimentação', 'Hospedagem', 'Pessoal', 'Marketing', 'Outros'
  ];

  if (loading) {
    return (
      <Layout>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center h-64">
              <p>Carregando dados da transação...</p>
            </div>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => navigate('/financas')} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Editar Transação</h1>
              <p className="text-muted-foreground">
                Atualize os detalhes da transação abaixo.
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalhes da Transação</CardTitle>
            <CardDescription>
              Atualize as informações da transação conforme necessário.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
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

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            <SelectItem value="no_client">Nenhum cliente</SelectItem>
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
                            <SelectItem value="no_event">Nenhum evento</SelectItem>
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
                >
                  Atualizar Transação
                </Button>
              </CardContent>
            </form>
          </Form>
        </Card>
      </div>
    </Layout>
  );
};

export default EditarTransacao;
