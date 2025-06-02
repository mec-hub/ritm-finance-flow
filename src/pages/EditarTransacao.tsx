import { useState, useEffect, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { CalendarIcon, ArrowLeft, Paperclip, X } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Transaction } from '@/types';
import { mockTransactions, mockEvents } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';
import { useTransactions } from '@/contexts/TransactionContext';

// Define the form schema
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
  const { transactions, updateTransaction } = useTransactions();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [attachments, setAttachments] = useState<string[]>([]);

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
    },
  });

  useEffect(() => {
    if (!id) return;

    // Find the transaction by ID from context
    const foundTransaction = transactions.find(t => t.id === id);
    
    if (foundTransaction) {
      setTransaction(foundTransaction);
      setAttachments(foundTransaction.attachments || []);
      
      // Set form values
      form.reset({
        description: foundTransaction.description,
        amount: foundTransaction.amount,
        date: new Date(foundTransaction.date),
        category: foundTransaction.category,
        subcategory: foundTransaction.subcategory || '',
        type: foundTransaction.type,
        isRecurring: foundTransaction.isRecurring || false,
        recurrenceMonths: foundTransaction.recurrenceMonths || 1,
        notes: foundTransaction.notes || '',
        clientId: foundTransaction.clientId || '',
        eventId: foundTransaction.eventId || undefined,
        status: foundTransaction.status || 'not_paid',
      });
    } else {
      toast({
        title: "Transação não encontrada",
        description: "A transação que você está tentando editar não foi encontrada.",
        variant: "destructive",
      });
      navigate('/financas');
    }
    
    setLoading(false);
  }, [id, navigate, form, transactions]);

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (values: FormValues) => {
    if (!id || !transaction) return;
    
    try {
      // Create updated transaction
      const updatedTransaction: Transaction = {
        ...transaction,
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
        clientId: values.clientId || undefined,
        eventId: values.eventId || undefined,
        status: values.status,
        attachments: [...attachments],
      };
      
      // Update the transaction using context
      updateTransaction(id, updatedTransaction);
      
      toast({
        title: "Transação atualizada",
        description: "A transação foi atualizada com sucesso.",
      });
      
      // Navigate back to finances
      navigate('/financas', { replace: true });
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar a transação.",
        variant: "destructive",
      });
    }
  };

  // Sample categories
  const categories = [
    { value: "Shows", label: "Shows" },
    { value: "Eventos", label: "Eventos" },
    { value: "Publicidade", label: "Publicidade" },
    { value: "Equipamento", label: "Equipamento" },
    { value: "Transporte", label: "Transporte" },
    { value: "Alimentação", label: "Alimentação" },
    { value: "Hospedagem", label: "Hospedagem" },
    { value: "Pessoal", label: "Pessoal" },
    { value: "Marketing", label: "Marketing" },
    { value: "Outras Receitas", label: "Outras Receitas" },
    { value: "Outras Despesas", label: "Outras Despesas" },
  ];

  // Filter only upcoming and completed events for selection
  const availableEvents = mockEvents.filter(event => 
    event.status === 'upcoming' || event.status === 'completed'
  );

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

        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center items-center h-64">
                <p>Carregando dados da transação...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
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
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
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
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
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
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma categoria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  {category.label}
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
                      name="isRecurring"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Transação Recorrente
                            </FormLabel>
                            <FormDescription>
                              Esta é uma transação mensal recorrente.
                            </FormDescription>
                          </div>
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
                                placeholder="Número de meses"
                                min={1}
                                max={60}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Por quantos meses esta transação se repetirá
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="eventId"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Evento Relacionado (opcional)</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || "none"}
                            defaultValue="none"
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um evento" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Nenhum evento</SelectItem>
                              {availableEvents.map((event) => (
                                <SelectItem key={event.id} value={event.id}>
                                  {event.title} ({new Date(event.date).toLocaleDateString()})
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
                      name="notes"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Observações (opcional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Observações sobre esta transação"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Attachments Section */}
                  <div className="space-y-2">
                    <Label>Anexos</Label>
                    {attachments.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center gap-2 border rounded-md p-2">
                            <Paperclip className="h-4 w-4" />
                            <span className="text-sm truncate max-w-[200px]">
                              {attachment.split('/').pop()}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttachment(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhum anexo</p>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => navigate('/financas')}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Salvar Alterações</Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default EditarTransacao;
