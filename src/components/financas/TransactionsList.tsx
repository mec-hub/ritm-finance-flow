
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Transaction } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Eye, Edit, Trash2, Filter, Search, Calendar, ArrowUpDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TransactionService } from '@/services/transactionService';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TransactionsListProps {
  transactions: Transaction[];
  onTransactionDeleted: () => void;
}

export function TransactionsList({ transactions, onTransactionDeleted }: TransactionsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'date' | 'amount' | 'description'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await TransactionService.delete(id);
      toast({
        title: "Transação excluída",
        description: "A transação foi excluída com sucesso."
      });
      onTransactionDeleted();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a transação.",
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Filter and search transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.notes?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      case 'description':
        comparison = a.description.localeCompare(b.description);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: 'date' | 'amount' | 'description') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transações</CardTitle>
          <CardDescription>Seus lançamentos financeiros aparecerão aqui</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Nenhuma transação encontrada</h3>
            <p className="text-muted-foreground">
              Comece criando sua primeira transação financeira.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Transações</CardTitle>
        <CardDescription>
          Visualize e gerencie todas as suas transações financeiras
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por descrição, categoria ou notas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="income">Receitas</SelectItem>
              <SelectItem value="expense">Despesas</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos status</SelectItem>
              <SelectItem value="paid">Pago</SelectItem>
              <SelectItem value="not_paid">Não pago</SelectItem>
              <SelectItem value="canceled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('description')} className="p-0 h-auto">
                    Descrição
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('amount')} className="p-0 h-auto">
                    Valor
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('date')} className="p-0 h-auto">
                    Data
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recorrente</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{transaction.description}</div>
                      {transaction.notes && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {transaction.notes.substring(0, 50)}
                          {transaction.notes.length > 50 && '...'}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{transaction.category}</div>
                      {transaction.subcategory && (
                        <div className="text-xs text-muted-foreground">
                          {transaction.subcategory}
                        </div>
                      )}
                    </div>
                  </TableCell>
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
                    <Badge 
                      variant={
                        transaction.status === 'paid' ? 'default' : 
                        transaction.status === 'canceled' ? 'destructive' : 'secondary'
                      }
                    >
                      {transaction.status === 'paid' ? 'Pago' : 
                       transaction.status === 'canceled' ? 'Cancelado' : 'Não Pago'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {transaction.isRecurring && (
                      <Badge variant="outline">
                        {transaction.recurrenceMonths}x mensais
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
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
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={deletingId === transaction.id}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir a transação "{transaction.description}"? 
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(transaction.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {sortedTransactions.length === 0 && transactions.length > 0 && (
          <div className="text-center py-6">
            <Filter className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Nenhuma transação encontrada</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros ou termos de busca.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
