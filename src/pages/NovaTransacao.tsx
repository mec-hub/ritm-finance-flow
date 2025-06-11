
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TeamAssignmentManager } from '@/components/financas/TeamAssignmentManager';
import { CalendarIcon, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TransactionService } from '@/services/transactionService';
import { toast } from '@/hooks/use-toast';
import { Transaction } from '@/types';

const NovaTransacao = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [isRecurring, setIsRecurring] = useState(false);
  const [teamAssignments, setTeamAssignments] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    subcategory: '',
    type: 'expense' as 'income' | 'expense',
    status: 'not_paid' as 'paid' | 'not_paid' | 'canceled',
    notes: '',
    recurrenceInterval: 'monthly' as 'weekly' | 'monthly' | 'quarterly' | 'yearly',
    recurrenceMonths: 1,
    eventId: '',
    clientId: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const transaction: Omit<Transaction, 'id'> = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        date: date,
        type: formData.type,
        status: formData.status,
        notes: formData.notes || undefined,
        isRecurring: isRecurring,
        recurrenceInterval: isRecurring ? formData.recurrenceInterval : undefined,
        recurrenceMonths: isRecurring ? formData.recurrenceMonths : undefined,
        eventId: formData.eventId || undefined,
        clientId: formData.clientId || undefined,
        teamMemberId: undefined,
        teamPercentages: teamAssignments,
        percentageValue: undefined
      };

      await TransactionService.create(transaction);
      
      toast({
        title: "Transação criada",
        description: "A transação foi criada com sucesso."
      });
      
      navigate('/financas');
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a transação.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/financas')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nova Transação</h1>
            <p className="text-muted-foreground">
              Adicione uma nova receita ou despesa ao sistema.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição *</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Ex: Pagamento DJ evento casamento"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Valor *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => handleInputChange('amount', e.target.value)}
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo *</Label>
                      <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Receita</SelectItem>
                          <SelectItem value="expense">Despesa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria *</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        placeholder="Ex: Eventos, Equipamentos"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subcategory">Subcategoria</Label>
                      <Input
                        id="subcategory"
                        value={formData.subcategory}
                        onChange={(e) => handleInputChange('subcategory', e.target.value)}
                        placeholder="Ex: Casamentos, Som"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Data *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(date) => date && setDate(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paid">Pago</SelectItem>
                          <SelectItem value="not_paid">Não Pago</SelectItem>
                          <SelectItem value="canceled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Informações adicionais sobre a transação..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Recurring Transaction Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Recorrência</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="recurring"
                      checked={isRecurring}
                      onCheckedChange={(checked) => setIsRecurring(checked === true)}
                    />
                    <Label htmlFor="recurring">Esta é uma transação recorrente</Label>
                  </div>

                  {isRecurring && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="recurrenceInterval">Intervalo</Label>
                        <Select 
                          value={formData.recurrenceInterval} 
                          onValueChange={(value) => handleInputChange('recurrenceInterval', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Semanal</SelectItem>
                            <SelectItem value="monthly">Mensal</SelectItem>
                            <SelectItem value="quarterly">Trimestral</SelectItem>
                            <SelectItem value="yearly">Anual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="recurrenceMonths">Repetições</Label>
                        <Input
                          id="recurrenceMonths"
                          type="number"
                          min="1"
                          max="12"
                          value={formData.recurrenceMonths}
                          onChange={(e) => handleInputChange('recurrenceMonths', parseInt(e.target.value))}
                          placeholder="1"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Team Assignment */}
            <div className="space-y-6">
              {formData.type === 'income' && (
                <TeamAssignmentManager
                  onAssignmentsChange={setTeamAssignments}
                  transactionAmount={parseFloat(formData.amount) || 0}
                />
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <Button type="button" variant="outline" onClick={() => navigate('/financas')}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Transação'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default NovaTransacao;
