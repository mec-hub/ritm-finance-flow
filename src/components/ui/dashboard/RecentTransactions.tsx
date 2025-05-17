
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Transaction } from '@/types';
import { ArrowDownIcon, ArrowUpIcon, Check, X } from 'lucide-react';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{formatDate(transaction.date)}</TableCell>
                <TableCell className="font-medium">{transaction.description}</TableCell>
                <TableCell>{getStatusBadge(transaction.status) || <Badge variant="outline">Não Definido</Badge>}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-1">
                    {transaction.type === 'income' ? (
                      <ArrowUpIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}
                    >
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
