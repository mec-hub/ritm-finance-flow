import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Transaction } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Eye, Edit, Calendar, ArrowUpDown, Play, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RecurringTransactionService } from '@/services/recurringTransactionService';
import { useToast } from '@/hooks/use-toast';
import { TransactionDetailsModal } from '@/components/transactions/TransactionDetailsModal';

interface RecurringTransactionsProps {
  transactions: Transaction[];
  onTransactionGenerated?: () => void;
}

interface RecurringScheduleItem {
  id: string;
  parentTransactionId: string;
  scheduledDate: Date;
  isGenerated: boolean;
  generatedTransactionId?: string;
  parentTransaction: Transaction;
  installmentNumber: number;
  isFuture: boolean;
}

export function RecurringTransactions({ transactions, onTransactionGenerated }: RecurringTransactionsProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
  const [allScheduleItems, setAllScheduleItems] = useState<RecurringScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const handleViewDetails = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTransactionId(null);
  };

  // Load all recurring schedule items from database
  useEffect(() => {
    const loadRecurringSchedule = async () => {
      try {
        setLoading(true);
        console.log('Loading recurring schedule for transactions:', transactions.length);
        
        const scheduleItems: RecurringScheduleItem[] = [];
        
        for (const transaction of transactions) {
          if (!transaction.isRecurring || !transaction.recurrenceMonths) continue;
          
          // Add the original transaction as installment 1
          scheduleItems.push({
            id: transaction.id,
            parentTransactionId: transaction.id,
            scheduledDate: new Date(transaction.date),
            isGenerated: true,
            generatedTransactionId: transaction.id,
            parentTransaction: transaction,
            installmentNumber: 1,
            isFuture: false
          });
          
          // Get recurring schedule from database
          const recurringTransactions = await RecurringTransactionService.getRecurringTransactionsByParent(transaction.id);
          console.log(`Found ${recurringTransactions.length} recurring entries for transaction ${transaction.id}`);
          
          // Add scheduled future installments
          recurringTransactions.forEach((recurring, index) => {
            scheduleItems.push({
              id: recurring.id,
              parentTransactionId: recurring.parentTransactionId,
              scheduledDate: recurring.scheduledDate,
              isGenerated: recurring.isGenerated,
              generatedTransactionId: recurring.generatedTransactionId,
              parentTransaction: transaction,
              installmentNumber: index + 2, // +2 because original is installment 1
              isFuture: !recurring.isGenerated
            });
          });
        }
        
        console.log('Total schedule items loaded:', scheduleItems.length);
        setAllScheduleItems(scheduleItems);
      } catch (error) {
        console.error('Error loading recurring schedule:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar o cronograma de recorrências.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadRecurringSchedule();
  }, [transactions, toast]);

  // Sort schedule items
  const sortedScheduleItems = [...allScheduleItems].sort((a, b) => {
    const dateA = new Date(a.scheduledDate).getTime();
    const dateB = new Date(b.scheduledDate).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const handleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleGenerateInstallment = async (recurringId: string) => {
    try {
      setGeneratingIds(prev => new Set(prev).add(recurringId));
      
      console.log('Generating installment for recurring transaction:', recurringId);
      
      // Generate the next installment
      await RecurringTransactionService.generateNextInstallment(recurringId);
      
      toast({
        title: "Sucesso",
        description: "Parcela gerada com sucesso!",
      });
      
      // Reload the schedule
      onTransactionGenerated?.();
      
      // Refresh the local data
      window.location.reload();
      
    } catch (error) {
      console.error('Error generating installment:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar a parcela.",
        variant: "destructive"
      });
    } finally {
      setGeneratingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(recurringId);
        return newSet;
      });
    }
  };

  const isGenerating = (id: string) => generatingIds.has(id);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transações Recorrentes</CardTitle>
          <CardDescription>Carregando cronograma...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p>Carregando...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transações Recorrentes</CardTitle>
          <CardDescription>Gerencie suas receitas e despesas mensais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Nenhuma transação recorrente</h3>
            <p className="text-muted-foreground">
              Configure transações recorrentes para automatizar seus lançamentos mensais.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalMonthlyIncome = allScheduleItems
    .filter(item => item.parentTransaction.type === 'income' && !item.isFuture)
    .reduce((sum, item) => sum + item.parentTransaction.amount, 0);

  const totalMonthlyExpenses = allScheduleItems
    .filter(item => item.parentTransaction.type === 'expense' && !item.isFuture)
    .reduce((sum, item) => sum + item.parentTransaction.amount, 0);

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Receitas Mensais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {formatCurrency(totalMonthlyIncome)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Despesas Mensais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {formatCurrency(totalMonthlyExpenses)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Saldo Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalMonthlyIncome - totalMonthlyExpenses >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(totalMonthlyIncome - totalMonthlyExpenses)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cronograma de Transações Recorrentes</CardTitle>
            <CardDescription>
              Visualize suas transações recorrentes atuais e futuras. Use o botão "Gerar" para criar manualmente uma parcela futura.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={handleSort} className="p-0 h-auto">
                        Data
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Parcela</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedScheduleItems.map((item) => (
                    <TableRow key={item.id} className={item.isFuture ? 'opacity-60' : ''}>
                      <TableCell className="font-medium">
                        {item.parentTransaction.description}
                      </TableCell>
                      <TableCell>{item.parentTransaction.category}</TableCell>
                      <TableCell>
                        <Badge variant={item.parentTransaction.type === 'income' ? 'default' : 'destructive'}>
                          {item.parentTransaction.type === 'income' ? 'Receita' : 'Despesa'}
                        </Badge>
                      </TableCell>
                      <TableCell className={item.parentTransaction.type === 'income' ? 'text-green-500' : 'text-red-500'}>
                        {formatCurrency(item.parentTransaction.amount)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(item.scheduledDate), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {item.installmentNumber}/{item.parentTransaction.recurrenceMonths}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            item.isFuture ? 'outline' :
                            item.isGenerated ? 'default' : 'secondary'
                          }
                        >
                          {item.isFuture ? 'Projetada' :
                           item.isGenerated ? 'Gerada' : 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {!item.isFuture && item.generatedTransactionId ? (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => handleViewDetails(item.generatedTransactionId!)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button asChild variant="ghost" size="sm">
                                <Link to={`/financas/editar/${item.generatedTransactionId}`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                            </>
                          ) : item.isFuture ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleGenerateInstallment(item.id)}
                              disabled={isGenerating(item.id)}
                              title="Gerar esta parcela agora"
                            >
                              {isGenerating(item.id) ? (
                                <CheckCircle className="h-4 w-4 animate-spin" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedTransactionId && (
        <TransactionDetailsModal
          transactionId={selectedTransactionId}
          open={isModalOpen}
          onOpenChange={handleModalClose}
          onTransactionDeleted={onTransactionGenerated}
        />
      )}
    </>
  );
}
