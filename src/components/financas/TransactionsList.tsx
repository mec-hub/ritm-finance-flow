
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Edit, Trash2, Users, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Transaction } from '@/types';
import { TransactionService } from '@/services/transactionService';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TransactionsListProps {
  filters?: {
    category?: string;
    type?: 'income' | 'expense';
    dateFrom?: Date;
    dateTo?: Date;
  };
}

export function TransactionsList({ filters }: TransactionsListProps) {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = filters 
        ? await TransactionService.getByFilters(filters)
        : await TransactionService.getAll();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as transações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return;

    try {
      await TransactionService.delete(id);
      toast({
        title: "Transação excluída",
        description: "A transação foi excluída com sucesso."
      });
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a transação.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: 'default',
      not_paid: 'secondary',
      canceled: 'destructive'
    };
    
    const labels = {
      paid: 'Pago',
      not_paid: 'Não Pago',
      canceled: 'Cancelado'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] as any}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    return (
      <Badge variant={type === 'income' ? 'default' : 'outline'}>
        {type === 'income' ? 'Receita' : 'Despesa'}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const renderTeamAssignments = (transaction: Transaction) => {
    if (!transaction.teamPercentages || transaction.teamPercentages.length === 0) {
      return null;
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className="ml-2">
              <Users className="w-3 h-3 mr-1" />
              {transaction.teamPercentages.length} membro(s)
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              {transaction.teamPercentages.map((assignment, index) => (
                <div key={index} className="text-xs">
                  {assignment.teamMemberName}: {assignment.percentageValue}%
                  ({formatCurrency((transaction.amount * assignment.percentageValue) / 100)})
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-32">
            <p>Carregando transações...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transações</CardTitle>
        <CardDescription>
          Lista de todas as suas transações financeiras
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhuma transação encontrada.</p>
            <Button 
              onClick={() => navigate('/financas/nova')} 
              className="mt-4"
            >
              Criar primeira transação
            </Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(transaction.date, "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {transaction.description}
                        {renderTeamAssignments(transaction)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{transaction.category}</div>
                        {transaction.subcategory && (
                          <div className="text-sm text-muted-foreground">
                            {transaction.subcategory}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                    <TableCell className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status || 'not_paid')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/financas/detalhes/${transaction.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/financas/editar/${transaction.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(transaction.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
