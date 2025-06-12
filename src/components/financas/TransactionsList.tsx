
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Eye, Trash2 } from 'lucide-react';
import { Transaction } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useNavigate } from 'react-router-dom';

interface TransactionsListProps {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
}

export const TransactionsList: React.FC<TransactionsListProps> = ({
  transactions,
  onEdit,
  onDelete
}) => {
  const navigate = useNavigate();

  const getTypeVariant = (type: 'income' | 'expense') => {
    return type === 'income' ? 'default' : 'destructive';
  };

  const getStatusVariant = (status: 'paid' | 'not_paid' | 'canceled') => {
    switch (status) {
      case 'paid':
        return 'default'; // This will use the green background from the design system
      case 'not_paid':
        return 'secondary';
      case 'canceled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: 'paid' | 'not_paid' | 'canceled') => {
    switch (status) {
      case 'paid':
        return 'Pago';
      case 'not_paid':
        return 'Não Pago';
      case 'canceled':
        return 'Cancelado';
      default:
        return 'Não Pago';
    }
  };

  const getTypeText = (type: 'income' | 'expense') => {
    return type === 'income' ? 'Receita' : 'Despesa';
  };

  const handleViewDetails = (transactionId: string) => {
    navigate(`/financas/detalhes/${transactionId}`);
  };

  const handleEdit = (transactionId: string) => {
    navigate(`/financas/editar/${transactionId}`);
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhuma transação encontrada.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transações</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">
                  {transaction.description}
                </TableCell>
                <TableCell>
                  <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(transaction.amount)}
                  </span>
                </TableCell>
                <TableCell>{formatDate(transaction.date)}</TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell>
                  <Badge variant={getTypeVariant(transaction.type)}>
                    {getTypeText(transaction.type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(transaction.status || 'not_paid')}>
                    {getStatusText(transaction.status || 'not_paid')}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(transaction.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(transaction.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(transaction.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
