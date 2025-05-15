
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
import { ArrowDownIcon, ArrowUpIcon, MoreVertical, Edit, Trash2, Calendar } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Transaction } from '@/types';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { mockTransactions } from '@/data/mockData';

interface RecurringTransactionsProps {
  transactions: Transaction[];
}

export function RecurringTransactions({ transactions }: RecurringTransactionsProps) {
  // Helper function to get next occurrence date
  const getNextOccurrenceDate = (transaction: Transaction): Date => {
    const today = new Date();
    const lastDate = transaction.date;
    let nextDate = new Date(lastDate);
    
    while (nextDate <= today) {
      if (transaction.recurrenceInterval === 'weekly') {
        nextDate.setDate(nextDate.getDate() + 7);
      } else if (transaction.recurrenceInterval === 'monthly') {
        nextDate.setMonth(nextDate.getMonth() + 1);
      } else if (transaction.recurrenceInterval === 'quarterly') {
        nextDate.setMonth(nextDate.getMonth() + 3);
      } else if (transaction.recurrenceInterval === 'yearly') {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }
    }
    
    return nextDate;
  };
  
  // Helper function to calculate remaining occurrences
  const getRemainingOccurrences = (transaction: Transaction): number => {
    if (!transaction.recurrenceMonths) return 0;
    
    const startDate = transaction.date;
    const today = new Date();
    const monthsPassed = (today.getFullYear() - startDate.getFullYear()) * 12 + 
                         (today.getMonth() - startDate.getMonth());
    
    return Math.max(0, transaction.recurrenceMonths - monthsPassed);
  };

  const handleCreateInstance = (transaction: Transaction) => {
    // Create a new instance of the recurring transaction
    const nextOccurrence = getNextOccurrenceDate(transaction);
    
    const newTransaction: Transaction = {
      ...transaction,
      id: `trans-${Date.now()}`, // Generate new ID
      date: nextOccurrence,
      description: `${transaction.description} (Recorrência)`,
      isRecurring: false, // This instance is not recurring anymore
      recurrenceInterval: undefined,
      recurrenceMonths: undefined
    };
    
    // Add to mockTransactions
    mockTransactions.push(newTransaction);
    
    toast({
      title: "Instância criada",
      description: "Uma nova instância da transação recorrente foi criada."
    });
    
    // Force re-render by refreshing the page
    window.location.reload();
  };

  const handleStopRecurring = (id: string) => {
    // Find the transaction in the array
    const index = mockTransactions.findIndex(t => t.id === id);
    
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
      
      // Force re-render by refreshing the page
      window.location.reload();
    }
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
                <TableHead>Frequência</TableHead>
                <TableHead>Próxima Ocorrência</TableHead>
                <TableHead>Restam</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Tipo</TableHead>
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
                    <TableCell>
                      <Badge variant="outline">
                        {transaction.recurrenceInterval === 'weekly' && 'Semanal'}
                        {transaction.recurrenceInterval === 'monthly' && 'Mensal'}
                        {transaction.recurrenceInterval === 'quarterly' && 'Trimestral'}
                        {transaction.recurrenceInterval === 'yearly' && 'Anual'}
                      </Badge>
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
                              onClick={() => handleCreateInstance(transaction)}
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>Criar Instância</span>
                            </Button>
                          </DropdownMenuItem>
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
                              onClick={() => handleStopRecurring(transaction.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
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
