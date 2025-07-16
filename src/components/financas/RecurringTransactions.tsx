
import { useState } from 'react';
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

interface RecurringTransactionsProps {
  transactions: Transaction[];
  onTransactionGenerated?: () => void;
}

export function RecurringTransactions({ transactions, onTransactionGenerated }: RecurringTransactionsProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Generate future recurring transactions - Fix: only generate recurrenceMonths - 1 projections
  const generateFutureTransactions = (transaction: Transaction) => {
    if (!transaction.isRecurring || !transaction.recurrenceMonths) return [];
    
    const futureTransactions = [];
    const baseDate = new Date(transaction.date);
    
    // Fix: Generate only recurrenceMonths - 1 future transactions since the original is the first installment
    for (let i = 1; i < transaction.recurrenceMonths; i++) {
      const futureDate = new Date(baseDate);
      futureDate.setMonth(baseDate.getMonth() + i);
      
      futureTransactions.push({
        ...transaction,
        id: `${transaction.id}-future-${i}`,
        date: futureDate,
        status: 'not_paid' as const,
        isFuture: true,
        installmentNumber: i + 1
      });
    }
    
    return futureTransactions;
  };

  // Get all transactions including future ones
  const allRecurringTransactions = transactions.flatMap(transaction => [
    { ...transaction, isFuture: false, installmentNumber: 1 },
    ...generateFutureTransactions(transaction)
  ]);

  // Sort transactions
  const sortedTransactions = [...allRecurringTransactions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const handleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleGenerateInstallment = async (transactionId: string, futureTransactionId: string) => {
    try {
      setGeneratingIds(prev => new Set(prev).add(futureTransactionId));
      
      // Get recurring transactions for this parent
      const recurringTransactions = await RecurringTransactionService.getRecurringTransactionsByParent(transactionId);
      
      // Find the first non-generated recurring transaction
      const nextRecurring = recurringTransactions.find(rt => !rt.isGenerated);
      
      if (!nextRecurring) {
        throw new Error('Nenhuma parcela pendente encontrada');
      }
      
      // Generate the next installment
      await RecurringTransactionService.generateNextInstallment(nextRecurring.id);
      
      toast({
        title: "Sucesso",
        description: "Parcela gerada com sucesso!",
      });
      
      onTransactionGenerated?.();
      
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
        newSet.delete(futureTransactionId);
        return newSet;
      });
    }
  };

  const isGenerating = (id: string) => generatingIds.has(id);

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

  const totalMonthlyIncome = allRecurringTransactions
    .filter(t => t.type === 'income' && !t.isFuture)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalMonthlyExpenses = allRecurringTransactions
    .filter(t => t.type === 'expense' && !t.isFuture)
    .reduce((sum, t) => sum + t.amount, 0);

  return (
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
                {sortedTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className={transaction.isFuture ? 'opacity-60' : ''}>
                    <TableCell className="font-medium">
                      {transaction.description}
                    </TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>
                      <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                        {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                      </Badge>
                    </TableCell>
                    <TableCell className={transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}>
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {transaction.installmentNumber}/{transaction.recurrenceMonths}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          transaction.isFuture ? 'outline' :
                          transaction.status === 'paid' ? 'default' : 
                          transaction.status === 'canceled' ? 'destructive' : 'secondary'
                        }
                      >
                        {transaction.isFuture ? 'Projetada' :
                         transaction.status === 'paid' ? 'Pago' : 
                         transaction.status === 'canceled' ? 'Cancelado' : 'Não Pago'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {!transaction.isFuture ? (
                          <>
                            <Button asChild variant="ghost" size="sm">
                              <Link to={`/financas/detalhes/${transaction.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button asChild variant="ghost" size="sm">
                              <Link to={`/financas/editar/${transaction.id}`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGenerateInstallment(transaction.id.split('-future-')[0], transaction.id)}
                            disabled={isGenerating(transaction.id)}
                            title="Gerar esta parcela agora"
                          >
                            {isGenerating(transaction.id) ? (
                              <CheckCircle className="h-4 w-4 animate-spin" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        )}
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
  );
}
