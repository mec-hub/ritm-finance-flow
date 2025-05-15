
import { useState } from 'react';
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
import { useForm } from 'react-hook-form';
import { ArrowLeft, PlusCircle, Trash2, CalendarDays } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Transaction, Event } from '@/types';
import { mockTransactions, mockEvents } from '@/data/mockData';

// Team members for percentage allocation
const teamMembers = [
  { id: '1', name: 'DJ Davizão', role: 'Proprietário' },
  { id: '2', name: 'Rian Dultra', role: 'CEO' },
  { id: '3', name: 'Maria Clara', role: 'Lider de Marketing' },
];


interface TeamPercentage {
  teamMemberId: string;
  percentageValue: string;
}

interface TransactionFormData {
  descricao: string;
  valor: string;
  categoria: string;
  data: string;
  tipo: 'receita' | 'despesa';
  hasPercentage: boolean;
  teamPercentages: TeamPercentage[];
  isEventRelated: boolean;
  eventId: string;
  isRecurring: boolean;
  recurrenceMonths: string;
}

const NovaTransacao = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Filter only upcoming and completed events for selection
  const availableEvents = mockEvents.filter(event => 
    event.status === 'upcoming' || event.status === 'completed'
  );
  
  const form = useForm<TransactionFormData>({
    defaultValues: {
      descricao: '',
      valor: '',
      categoria: '',
      data: new Date().toISOString().split('T')[0], // Today's date as default
      tipo: 'receita',
      hasPercentage: false,
      teamPercentages: [{ teamMemberId: '', percentageValue: '' }],
      isEventRelated: false,
      eventId: '',
      isRecurring: false,
      recurrenceMonths: '1'
    },
  });

  const watchHasPercentage = form.watch("hasPercentage");
  const watchTipo = form.watch("tipo");
  const watchTeamPercentages = form.watch("teamPercentages");
  const watchIsEventRelated = form.watch("isEventRelated");
  const watchIsRecurring = form.watch("isRecurring");

  const addTeamMember = () => {
    const currentTeamPercentages = form.getValues("teamPercentages");
    form.setValue("teamPercentages", [
      ...currentTeamPercentages,
      { teamMemberId: '', percentageValue: '' }
    ]);
  };

  const removeTeamMember = (index: number) => {
    const currentTeamPercentages = form.getValues("teamPercentages");
    if (currentTeamPercentages.length > 1) {
      const updatedTeamPercentages = [...currentTeamPercentages];
      updatedTeamPercentages.splice(index, 1);
      form.setValue("teamPercentages", updatedTeamPercentages);
    }
  };

  const onSubmit = (data: TransactionFormData) => {
    setIsLoading(true);
    
    // Create a new transaction object with correct type mapping
    const newTransaction: Transaction = {
      id: `trans-${Date.now()}`, // Generate unique ID
      amount: parseFloat(data.valor),
      description: data.descricao,
      date: new Date(data.data),
      category: data.categoria,
      isRecurring: data.isRecurring,
      type: data.tipo === 'receita' ? 'income' : 'expense', // Map 'receita' to 'income' and 'despesa' to 'expense'
    };

    // Add recurrence information if it's a recurring transaction
    if (data.isRecurring) {
      // Assume monthly recurrence by default
      newTransaction.recurrenceInterval = 'monthly';
      newTransaction.recurrenceMonths = parseInt(data.recurrenceMonths);
    }

    // If percentage is enabled, add contributor data
    if (data.hasPercentage && data.teamPercentages.length > 0) {
      newTransaction.teamPercentages = data.teamPercentages
        .filter(item => item.teamMemberId && item.percentageValue)
        .map(item => ({
          teamMemberId: item.teamMemberId,
          percentageValue: parseFloat(item.percentageValue)
        }));
      
      // Create a note with all percentages
      const percentageNotes = data.teamPercentages
        .filter(item => item.teamMemberId && item.percentageValue)
        .map(item => {
          const teamMember = teamMembers.find(tm => tm.id === item.teamMemberId);
          return `${teamMember?.name || 'Colaborador'}: ${item.percentageValue}%`;
        })
        .join(', ');
      
      newTransaction.notes = `Porcentagens: ${percentageNotes}`;
    }

    // If event related, add event ID
    if (data.isEventRelated && data.eventId) {
      newTransaction.eventId = data.eventId;
      
      // Add event information to notes
      const selectedEvent = mockEvents.find(event => event.id === data.eventId);
      if (selectedEvent) {
        const eventNote = `Evento: ${selectedEvent.title} (${new Date(selectedEvent.date).toLocaleDateString()})`;
        newTransaction.notes = newTransaction.notes 
          ? `${newTransaction.notes}. ${eventNote}`
          : eventNote;
      }
    }

    // In a real app, this would be an API call
    // For now, we'll add it to our mock data
    setTimeout(() => {
      mockTransactions.push(newTransaction);
      setIsLoading(false);
      toast({
        title: "Transação adicionada",
        description: `${data.tipo === 'receita' ? 'Receita' : 'Despesa'} de ${data.valor} adicionada com sucesso!`,
      });
      
      // Navigate back to finance page
      navigate('/financas');
    }, 1000);
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
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Transação</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="receita">Receita</SelectItem>
                        <SelectItem value="despesa">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="descricao"
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
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input placeholder="0,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="data"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="categoria"
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
                        <SelectItem value="shows">Shows</SelectItem>
                        <SelectItem value="patrocinios">Patrocínios</SelectItem>
                        <SelectItem value="equipamentos">Equipamentos</SelectItem>
                        <SelectItem value="transporte">Transporte</SelectItem>
                        <SelectItem value="hospedagem">Hospedagem</SelectItem>
                        <SelectItem value="alimentacao">Alimentação</SelectItem>
                        <SelectItem value="equipe">Equipe</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
              
              {watchIsRecurring && (
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
                name="isEventRelated"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Relacionada a Evento</FormLabel>
                      <FormDescription>
                        Esta transação está relacionada a um evento específico?
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
              
              {watchIsEventRelated && (
                <FormField
                  control={form.control}
                  name="eventId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evento Relacionado</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um evento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableEvents.length > 0 ? (
                            availableEvents.map((event) => (
                              <SelectItem key={event.id} value={event.id}>
                                {event.title} ({new Date(event.date).toLocaleDateString()})
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-events" disabled>
                              Nenhum evento disponível
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Selecione o evento ao qual esta transação está relacionada.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="hasPercentage"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Atribuição Percentual</FormLabel>
                      <FormDescription>
                        Esta transação envolve distribuição percentual com colaboradores?
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
              
              {watchHasPercentage && (
                <div className="space-y-4 border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Atribuições percentuais</h3>
                    <Button 
                      type="button" 
                      onClick={addTeamMember} 
                      variant="outline"
                      size="sm"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Adicionar colaborador
                    </Button>
                  </div>
                  
                  {watchTeamPercentages.map((_, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4 first:border-t-0 first:pt-0">
                      <FormField
                        control={form.control}
                        name={`teamPercentages.${index}.teamMemberId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Colaborador {index + 1}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um colaborador" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {teamMembers.map((member) => (
                                  <SelectItem key={member.id} value={member.id}>
                                    {member.name} - {member.role}
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
                        name={`teamPercentages.${index}.percentageValue`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor Percentual (%)</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: 15" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex items-end">
                        {watchTeamPercentages.length > 1 && (
                          <Button 
                            type="button" 
                            onClick={() => removeTeamMember(index)}
                            variant="destructive"
                            size="sm"
                            className="mt-auto"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remover
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <FormDescription className="text-xs text-muted-foreground">
                    {watchTipo === 'receita' 
                      ? 'Porcentagem da receita que será destinada aos colaboradores' 
                      : 'Porcentagem da despesa que será atribuída aos colaboradores'}
                  </FormDescription>
                </div>
              )}
              
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
