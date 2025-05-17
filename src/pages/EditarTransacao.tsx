
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
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { CalendarIcon, ArrowLeft, FileText, X, Paperclip } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Transaction } from '@/types';
import { mockTransactions } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

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

const EditarTransacao = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [selectedAttachmentIndex, setSelectedAttachmentIndex] = useState<number | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
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
    // In a real app, fetch the transaction from an API
    const fetchTransaction = () => {
      setLoading(true);
      try {
        // Find the transaction by ID - make sure to search in the actual array
        const foundTransaction = mockTransactions.find((t) => t.id === id);
        
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
            isRecurring: foundTransaction.isRecurring,
            recurrenceMonths: foundTransaction.recurrenceMonths || 1,
            notes: foundTransaction.notes || '',
            clientId: foundTransaction.clientId || '',
            eventId: foundTransaction.eventId || '',
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
      } catch (error) {
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao buscar os dados da transação.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id, navigate, form]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setNewFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    try {
      // Find the index of the transaction
      const index = mockTransactions.findIndex(t => t.id === id);
      
      if (index !== -1) {
        // Process new files (in a real app, you would upload these to a server)
        // For mock purposes, we'll create fake URLs
        const fakeFileUrls = newFiles.map(file => URL.createObjectURL(file));
        
        // Update the transaction in the mockTransactions array
        const updatedTransaction: Transaction = {
          ...mockTransactions[index],
          description: values.description,
          amount: values.amount,
          date: values.date,
          category: values.category,
          subcategory: values.subcategory || undefined,
          type: values.type,
          isRecurring: values.isRecurring,
          recurrenceInterval: values.isRecurring ? 'monthly' : undefined, // Default to monthly
          recurrenceMonths: values.isRecurring ? values.recurrenceMonths : undefined,
          notes: values.notes || undefined,
          clientId: values.clientId || undefined,
          eventId: values.eventId || undefined,
          status: values.status,
          attachments: [...attachments, ...fakeFileUrls],
        };
        
        // Replace the transaction in the array
        mockTransactions[index] = updatedTransaction;
        
        toast({
          title: "Transação atualizada",
          description: "A transação foi atualizada com sucesso.",
        });
        
        // Navigate after a short delay to make toast visible
        setTimeout(() => navigate('/financas'), 500);
      } else {
        toast({
          title: "Erro",
          description: "Transação não encontrada para atualização.",
          variant: "destructive",
        });
      }
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
    { value: 'Shows', label: 'Shows' },
    { value: 'Eventos', label: 'Eventos' },
    { value: 'Publicidade', label: 'Publicidade' },
    { value: 'Equipamento', label: 'Equipamento' },
    { value: 'Transporte', label: 'Transporte' },
    { value: 'Alimentação', label: 'Alimentação' },
    { value: 'Hospedagem', label: 'Hospedagem' },
    { value: 'Pessoal', label: 'Pessoal' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Outras Receitas', label: 'Outras Receitas' },
    { value: 'Outras Despesas', label: 'Outras Despesas' },
  ];

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
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Transação Recorrente Mensal</FormLabel>
                            <FormDescription>
                              Marque esta opção se for uma transação que se repete mensalmente.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {form.watch('isRecurring') && (
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
                              Por quantos meses esta transação se repetirá (incluindo este mês)
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
                        <FormItem className="col-span-full">
                          <FormLabel>Observações (opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Observações adicionais" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="col-span-full">
                      <Label>Anexos</Label>
                      <div className="mt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                          {attachments.map((attachment, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-2" />
                                <a href={attachment} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate">
                                  Anexo {index + 1}
                                </a>
                              </div>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removeAttachment(index)}
                                className="text-red-500 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          
                          {newFiles.map((file, index) => (
                            <div key={`new-${index}`} className="flex items-center justify-between p-2 border rounded-md bg-blue-50">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-2" />
                                <span className="truncate">{file.name}</span>
                              </div>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removeNewFile(index)}
                                className="text-red-500 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-center w-full">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Paperclip className="w-8 h-8 mb-3 text-gray-400" />
                              <p className="mb-1 text-sm text-gray-500">
                                <span className="font-medium">Clique para enviar</span> ou arraste um arquivo
                              </p>
                              <p className="text-xs text-gray-500">
                                Imagens ou documentos PDF (máx. 10MB)
                              </p>
                            </div>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*, application/pdf" 
                              onChange={handleFileChange}
                              multiple
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => navigate('/financas')}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Salvar Alterações
                  </Button>
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
