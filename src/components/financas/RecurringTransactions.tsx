
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
import { mockTransactions } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';

interface RecurringTransactionsProps {
  transactions: Transaction[];
}

export function RecurringTransactions({ transactions }: RecurringTransactionsProps) {
  const navigate = useNavigate();
  
  // Helper function to get next occurrence date - one month after the original date
  const getNextOccurrenceDate = (transaction: Transaction): Date => {
    // Find all instances of this recurring transaction
    const allInstancesOfThisTransaction = mockTransactions.filter(t => 
      (t.id.startsWith(`${transaction.id}-instance-`) || t.id === transaction.id) && 
      t.description === transaction.description
    );
    
    // Sort by date to find the latest one
    const sortedInstances = allInstancesOfThisTransaction.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Get the latest date
    const lastDate = sortedInstances.length > 0 
      ? new Date(sortedInstances[0].date) 
      : new Date(transaction.date);
    
    // Calculate next occurrence - one month after the latest instance
    const nextDate = new Date(lastDate);
    nextDate.setMonth(nextDate.getMonth() + 1);
    
    return nextDate;
  };
  
  // Helper function to calculate remaining occurrences
  const getRemainingOccurrences = (transaction: Transaction): number => {
    if (!transaction.recurrenceMonths) return 0;
    
    // Count how many instances of this transaction already exist
    const instanceCount = mockTransactions.filter(t => 
      t.id.startsWith(`${transaction.id}-instance-`) && 
      t.description === transaction.description
    ).length;
    
    // Original transaction plus instances created minus total allowed recurrences
    return Math.max(0, transaction.recurrenceMonths - instanceCount - 1);
  };

  const handleCreateInstance = (transaction: Transaction) => {
    // Create a new instance of the recurring transaction
    const nextOccurrence = getNextOccurrenceDate(transaction);
    
    // Count existing instances to create a proper ID
    const existingInstanceCount = mockTransactions.filter(t => 
      t.id.startsWith(`${transaction.id}-instance-`) &&
      t.description === transaction.description
    ).length;
    
    const newInstanceId = `${transaction.id}-instance-${existingInstanceCount + 1}`;
    
    const newTransaction: Transaction = {
      ...transaction,
      id: newInstanceId,
      date: nextOccurrence,
      status: 'not_paid', // Default status is "Not paid" for new instances
      attachments: [], // No attachments for the new instance
    };
    
    // Add to mockTransactions
    mockTransactions.push(newTransaction);
    
    toast({
      title: "Instância criada",
      description: "Uma nova instância da transação recorrente foi criada com sucesso."
    });
    
    // Force a refresh by re-navigating to the current page
    navigate('/financas');
  };

  const handleStopRecurring = (transaction: Transaction) => {
    // Find the transaction in the array
    const index = mockTransactions.findIndex(t => t.id === transaction.id);
    
    if (index !== -1) {
      // Update the transaction to not be recurring
      mockTransactions[index] = {
        ...mockTransactions[index],
        isRecurring: false,
        recurrenceInterval: undefined,
        recurrenceMonths: undefined
      };
      
      toast({
        title: "Recorrência interrompida",
        description: "A transação não será mais recorrente."
      });
      
      // Force a refresh by re-navigating to the current page
      navigate('/financas');
    }
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
                        ? `${getRemainingOccurrences(transaction)} de ${transaction.recurrenceMonths}`
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
                          {getRemainingOccurrences(transaction) > 0 && (
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
