
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
import { ArrowDownIcon, ArrowUpIcon, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Transaction } from '@/types';
import { toast } from '@/hooks/use-toast';
import { mockTransactions, mockEvents } from '@/data/mockData';

interface TransactionsListProps {
  transactions: Transaction[];
}

export function TransactionsList({ transactions }: TransactionsListProps) {
  const [page, setPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
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
    // Find the index of the transaction to remove
    const index = mockTransactions.findIndex(t => t.id === id);
    if (index !== -1) {
      // Remove the transaction from the array
      mockTransactions.splice(index, 1);
      toast({
        title: "Transação excluída",
        description: "A transação foi excluída com sucesso."
      });
      // Force re-render by creating a new array
      window.location.reload();
    }
  };

  const findEventName = (eventId: string | undefined) => {
    if (!eventId) return 'Não associado';
    const event = mockEvents.find(e => e.id === eventId);
    return event ? event.title : 'Evento não encontrado';
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
                
                {selectedTransaction.eventId && (
                  <div className="col-span-2">
                    <h3 className="text-sm font-medium">Evento Relacionado</h3>
                    <div className="mt-1 p-2 border rounded bg-muted/50">
                      <p className="font-medium">{findEventName(selectedTransaction.eventId)}</p>
                      {(() => {
                        const event = mockEvents.find(e => e.id === selectedTransaction.eventId);
                        return event ? (
                          <div className="text-sm text-muted-foreground mt-1">
                            <p>Data: {formatDate(event.date)}</p>
                            <p>Local: {event.location}</p>
                            {event.status && <p>Status: {event.status === 'upcoming' ? 'Próximo' : 
                                                         event.status === 'completed' ? 'Realizado' : 
                                                         'Cancelado'}</p>}
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>
                )}
                
                {!selectedTransaction.eventId && (
                  <div className="col-span-2">
                    <h3 className="text-sm font-medium">Evento Relacionado</h3>
                    <p>Não associado a nenhum evento</p>
                  </div>
                )}
                
                {selectedTransaction.teamPercentages && selectedTransaction.teamPercentages.length > 0 && (
                  <div className="col-span-2">
                    <h3 className="text-sm font-medium">Distribuição Percentual</h3>
                    <div className="mt-1 space-y-2">
                      {selectedTransaction.teamPercentages.map((tp, index) => (
                        <div key={index} className="flex justify-between items-center p-2 border rounded bg-muted/50">
                          <span>{tp.teamMemberId}</span>
                          <span className="font-medium">{tp.percentageValue}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
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
                          Anexo {index + 1}
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
                  <a href={`/editar-transacao/${selectedTransaction.id}`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </a>
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
