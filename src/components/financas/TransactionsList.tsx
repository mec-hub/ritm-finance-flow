
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ArrowDownIcon, ArrowUpIcon, MoreVertical, Edit, Trash2, Eye, Check, X, Paperclip } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Transaction } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { TransactionService } from '@/services/transactionService';
import { Link } from 'react-router-dom';

interface TransactionsListProps {
  transactions: Transaction[];
  onTransactionDeleted?: () => void;
}

export function TransactionsList({ transactions, onTransactionDeleted }: TransactionsListProps) {
  const [page, setPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(startIndex, startIndex + itemsPerPage);
  
  const handlePrevious = () => {
    setPage(p => Math.max(1, p - 1));
  };
  
  const handleNext = () => {
    setPage(p => Math.min(totalPages, p + 1));
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await TransactionService.delete(id);
      toast({
        title: "Transação excluída",
        description: "A transação foi excluída com sucesso."
      });
      if (onTransactionDeleted) {
        onTransactionDeleted();
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a transação.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    switch(status) {
      case 'paid':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20"><Check className="h-3 w-3 mr-1" /> Pago</Badge>;
      case 'not_paid':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Não Pago</Badge>;
      case 'canceled':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20"><X className="h-3 w-3 mr-1" /> Cancelado</Badge>;
      default:
        return null;
    }
  };

  const getAttachmentCount = (attachments?: string[]) => {
    if (!attachments || attachments.length === 0) return null;
    return (
      <div className="flex items-center">
        <Paperclip className="h-4 w-4 mr-1 text-gray-500" />
        <span className="text-gray-600">{attachments.length}</span>
      </div>
    );
  };

  const closeDialog = () => {
    setSelectedTransaction(null);
  };

  return (
    <>
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
                  <TableHead>Status</TableHead>
                  <TableHead>Anexos</TableHead>
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
                      <TableCell>
                        {getStatusBadge(transaction.status) || <Badge variant="outline">Não Definido</Badge>}
                      </TableCell>
                      <TableCell>
                        {getAttachmentCount(transaction.attachments)}
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
                                onClick={() => setSelectedTransaction(transaction)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                <span>Ver Detalhes</span>
                              </Button>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/financas/editar/${transaction.id}`} className="flex items-center w-full">
                                <Edit className="h-4 w-4 mr-2" />
                                <span>Editar</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Button 
                                variant="ghost" 
                                className="w-full justify-start text-red-500 hover:text-red-500" 
                                onClick={() => handleDelete(transaction.id)}
                                disabled={isDeleting}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                <span>{isDeleting ? 'Excluindo...' : 'Excluir'}</span>
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

      {/* Transaction Details Dialog */}
      <Dialog open={!!selectedTransaction} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Detalhes da Transação</DialogTitle>
            <DialogDescription>
              Informações detalhadas sobre a transação.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Descrição</h3>
                  <p>{selectedTransaction.description}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium">Valor</h3>
                  <p className={selectedTransaction.type === 'income' ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>
                    {formatCurrency(selectedTransaction.amount)}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium">Data</h3>
                  <p>{formatDate(selectedTransaction.date)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium">Categoria</h3>
                  <p>{selectedTransaction.category}{selectedTransaction.subcategory ? ` / ${selectedTransaction.subcategory}` : ''}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium">Tipo</h3>
                  <p className="flex items-center">
                    {selectedTransaction.type === 'income' ? (
                      <>
                        <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                        <span>Receita</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                        <span>Despesa</span>
                      </>
                    )}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium">Status</h3>
                  <p>{getStatusBadge(selectedTransaction.status) || 'Não definido'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium">Recorrência</h3>
                  {selectedTransaction.isRecurring ? (
                    <p>
                      Mensal
                      {selectedTransaction.recurrenceMonths && ` (${selectedTransaction.recurrenceMonths} meses)`}
                    </p>
                  ) : (
                    <p>Não recorrente</p>
                  )}
                </div>
                
                {selectedTransaction.notes && (
                  <div className="col-span-2">
                    <h3 className="text-sm font-medium">Observações</h3>
                    <p>{selectedTransaction.notes}</p>
                  </div>
                )}
                
                {selectedTransaction.attachments && selectedTransaction.attachments.length > 0 && (
                  <div className="col-span-2">
                    <h3 className="text-sm font-medium">Anexos</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedTransaction.attachments.map((attachment, index) => (
                        <div key={index} className="border p-2 rounded">
                          <a href={attachment} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-500 hover:underline">
                            Anexo {index + 1}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            {selectedTransaction && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={closeDialog}>
                  Fechar
                </Button>
                <Button asChild>
                  <Link to={`/financas/editar/${selectedTransaction.id}`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Link>
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
