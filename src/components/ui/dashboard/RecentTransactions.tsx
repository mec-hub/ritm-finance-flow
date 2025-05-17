
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
import { ArrowDownIcon, ArrowUpIcon, Check, X, Paperclip } from 'lucide-react';

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

  const getAttachmentCount = (attachments?: string[]) => {
    if (!attachments || attachments.length === 0) return null;
    return (
      <div className="flex items-center text-gray-500 ml-2">
        <Paperclip className="h-3 w-3 mr-1" />
        <span className="text-xs">{attachments.length}</span>
      </div>
    );
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
              <TableHead>Anexos</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{formatDate(transaction.date)}</TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    {transaction.description}
                    {transaction.isRecurring && (
                      <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                        Recorrente
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(transaction.status) || <Badge variant="outline">Não Definido</Badge>}</TableCell>
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
