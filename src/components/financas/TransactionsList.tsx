
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
import { ArrowDownIcon, ArrowUpIcon, MoreVertical, Edit, Trash2, Copy } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Transaction } from '@/types';
import { toast } from '@/hooks/use-toast';

interface TransactionsListProps {
  transactions: Transaction[];
}

export function TransactionsList({ transactions }: TransactionsListProps) {
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedTransactions = transactions
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(startIndex, startIndex + itemsPerPage);
  
  const handlePrevious = () => {
    setPage(p => Math.max(1, p - 1));
  };
  
  const handleNext = () => {
    setPage(p => Math.min(totalPages, p + 1));
  };

  const handleDelete = (id: string) => {
    // In a real app, this would delete the transaction
    toast({
      title: "Transação excluída",
      description: "A transação foi excluída com sucesso."
    });
  };

  const handleClone = (transaction: Transaction) => {
    // In a real app, this would clone the transaction
    toast({
      title: "Transação duplicada",
      description: "Uma cópia da transação foi criada."
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Transações</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell className="font-medium">
                      {transaction.description}
                      {transaction.isRecurring && (
                        <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                          Recorrente
                        </span>
                      )}
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
                              className="w-full justify-start"
                              onClick={() => handleClone(transaction)}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              <span>Duplicar</span>
                            </Button>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start text-red-500 hover:text-red-500" 
                              onClick={() => handleDelete(transaction.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              <span>Excluir</span>
                            </Button>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Nenhuma transação encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <div className="text-sm">
              Página {page} de {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={page === totalPages}
            >
              Próximo
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
