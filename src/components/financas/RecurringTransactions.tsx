
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ArrowDownIcon, ArrowUpIcon, MoreVertical, Edit, Calendar, Eye, X, Paperclip } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Transaction } from '@/types';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '@/contexts/TransactionContext';

interface RecurringTransactionsProps {
  transactions: Transaction[];
}

export function RecurringTransactions({ transactions }: RecurringTransactionsProps) {
  const navigate = useNavigate();
  const { transactions: allTransactions, addTransaction, updateTransaction } = useTransactions();
  
  // Helper function to get the next occurrence date
  const getNextOccurrenceDate = (transaction: Transaction): Date => {
    // Find the latest instance of this transaction
    const instances = allTransactions.filter(t => 
      t.id === transaction.id || t.id.startsWith(`${transaction.id}-instance-`)
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Get the latest date
    const latestDate = instances.length > 0 
      ? new Date(instances[0].date)
      : new Date(transaction.date);
    
    // Add one month to that date
    const nextDate = new Date(latestDate);
    nextDate.setMonth(latestDate.getMonth() + 1);
    
    return nextDate;
  };
  
  // Helper function to get the number of remaining instances
  const getRemainingInstances = (transaction: Transaction): number => {
    // Count existing instances
    const instanceCount = allTransactions.filter(
      t => t.id !== transaction.id && 
      t.id.startsWith(`${transaction.id}-instance-`)
    ).length;
    
    // Return remaining instances count
    return transaction.recurrenceMonths && transaction.recurrenceMonths > 0 
      ? Math.max(0, transaction.recurrenceMonths - instanceCount - 1)
      : 0;
  };

  // Helper function to get month name
  const getMonthName = (date: Date): string => {
    return date.toLocaleString('pt-BR', { month: 'long' });
  };

  const handleCreateInstance = (transaction: Transaction) => {
    // Create a new instance of the recurring transaction
    const nextOccurrence = getNextOccurrenceDate(transaction);
    
    // Count existing instances to generate the next ID
    const existingInstanceCount = allTransactions.filter(
      t => t.id !== transaction.id && 
      t.id.startsWith(`${transaction.id}-instance-`)
    ).length;
    
    const newInstanceId = `${transaction.id}-instance-${existingInstanceCount + 1}`;
    
    // Add month to description - but preserve original description
    const monthName = getMonthName(nextOccurrence);
    const baseDescription = transaction.description;
    const newDescription = `${baseDescription} - ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`;
    
    const newTransaction: Transaction = {
      ...transaction,
      id: newInstanceId,
      date: nextOccurrence,
      status: 'not_paid', // Default status is "Not paid" for new instances
      attachments: [], // No attachments for the new instance
      description: newDescription,
      isRecurring: false, // Important: instance is NOT recurring
      recurrenceInterval: undefined,
      recurrenceMonths: undefined
    };
    
    // Add using the context
    addTransaction(newTransaction);
    
    // Show toast
    toast({
      title: "Instância criada",
      description: `Nova instância para ${transaction.description} criada para ${nextOccurrence.toLocaleDateString()}.`,
    });
  };

  const handleStopRecurring = (transaction: Transaction) => {
    // Update the transaction to not be recurring using the context
    const updatedTransaction = {
      ...transaction,
      isRecurring: false,
      recurrenceInterval: undefined,
      recurrenceMonths: undefined
    };
    
    updateTransaction(transaction.id, updatedTransaction);
    
    toast({
      title: "Recorrência interrompida",
      description: "A transação não será mais recorrente."
    });
  };
  
  const handleViewDetails = (id: string) => {
    navigate(`/detalhes-transacao/${id}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transações Recorrentes</CardTitle>
        <CardDescription>
          Gerencie as transações que ocorrem regularmente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Próxima Ocorrência</TableHead>
                <TableHead>Restam</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Anexos</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {transaction.description}
                    </TableCell>
                    <TableCell>{formatDate(getNextOccurrenceDate(transaction))}</TableCell>
                    <TableCell>
                      {transaction.recurrenceMonths 
                        ? `${getRemainingInstances(transaction)} de ${transaction.recurrenceMonths}`
                        : 'Indefinido'}
                    </TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>
                      {transaction.type === 'income' ? (
                        <div className="flex items-center">
                          <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                          <span>Receita</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                          <span>Despesa</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {transaction.attachments && transaction.attachments.length > 0 ? (
                        <div className="flex items-center">
                          <Paperclip className="h-4 w-4 mr-1 text-gray-400" />
                          <span>{transaction.attachments.length}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          transaction.type === 'income' ? 'text-green-500 font-medium' : 'text-red-500 font-medium'
                        }
                      >
                        {formatCurrency(transaction.amount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start" 
                              onClick={() => handleViewDetails(transaction.id)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              <span>Ver Detalhes</span>
                            </Button>
                          </DropdownMenuItem>
                          {getRemainingInstances(transaction) > 0 && (
                            <DropdownMenuItem>
                              <Button 
                                variant="ghost" 
                                className="w-full justify-start" 
                                onClick={() => handleCreateInstance(transaction)}
                              >
                                <Calendar className="h-4 w-4 mr-2" />
                                <span>Criar Instância</span>
                              </Button>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem asChild>
                            <Button variant="ghost" className="w-full justify-start" asChild>
                              <a href={`/editar-transacao/${transaction.id}`}>
                                <Edit className="h-4 w-4 mr-2" />
                                <span>Editar</span>
                              </a>
                            </Button>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start text-red-500 hover:text-red-500" 
                              onClick={() => handleStopRecurring(transaction)}
                            >
                              <X className="h-4 w-4 mr-2" />
                              <span>Interromper Recorrência</span>
                            </Button>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    Nenhuma transação recorrente encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
