
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Edit, Trash2, Calendar, DollarSign, Tag, Building, FileText, Users, Paperclip, X } from 'lucide-react';
import { Transaction } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TransactionService } from '@/services/transactionService';
import { EventService } from '@/services/eventService';
import { ClientService } from '@/services/clientService';
import { toast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { AttachmentPreview } from '@/components/transactions/AttachmentPreview';

interface TransactionDetailsModalProps {
  transactionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTransactionDeleted?: () => void;
}

export function TransactionDetailsModal({ transactionId, open, onOpenChange, onTransactionDeleted }: TransactionDetailsModalProps) {
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [eventData, setEventData] = useState<any>(null);
  const [clientData, setClientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (open && transactionId) {
      fetchTransaction();
    }
  }, [open, transactionId]);

  const fetchTransaction = async () => {
    try {
      setLoading(true);
      const transactionData = await TransactionService.getById(transactionId);
      if (transactionData) {
        setTransaction(transactionData);
        
        // Fetch related event data
        if (transactionData.eventId) {
          try {
            const event = await EventService.getById(transactionData.eventId);
            setEventData(event);
          } catch (error) {
            console.error('Error fetching event:', error);
          }
        }
        
        // Fetch related client data
        if (transactionData.clientId) {
          try {
            const client = await ClientService.getById(transactionData.clientId);
            setClientData(client);
          } catch (error) {
            console.error('Error fetching client:', error);
          }
        }
      } else {
        toast({
          title: "Transação não encontrada",
          description: "A transação que você está procurando não foi encontrada.",
          variant: "destructive",
        });
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error fetching transaction:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes da transação.",
        variant: "destructive"
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    onOpenChange(false);
    navigate(`/financas/editar/${transactionId}`);
  };

  const handleDelete = async () => {
    if (!transaction) return;

    try {
      setDeleting(true);
      await TransactionService.delete(transaction.id);
      toast({
        title: "Transação excluída",
        description: "A transação foi excluída com sucesso."
      });
      onTransactionDeleted?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a transação.",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Carregando...</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center h-32">
            <p>Carregando detalhes da transação...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!transaction) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Detalhes da Transação</DialogTitle>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={deleting}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
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
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Information */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Informações Principais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Descrição</label>
                      <p className="text-lg font-semibold">{transaction.description}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Valor</label>
                      <p className={`text-2xl font-bold ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                      <div className="mt-1">
                        <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                          {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <div className="mt-1">
                        <Badge 
                          variant={
                            transaction.status === 'paid' ? 'default' : 
                            transaction.status === 'canceled' ? 'destructive' : 'secondary'
                          }
                          className={
                            transaction.status === 'paid' ? 'bg-green-500 hover:bg-green-600' : 
                            transaction.status === 'canceled' ? '' : ''
                          }
                        >
                          {transaction.status === 'paid' ? 'Pago' : 
                           transaction.status === 'canceled' ? 'Cancelado' : 'Não Pago'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Categorização
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Categoria</label>
                      <p className="font-medium">{transaction.category}</p>
                    </div>
                    {transaction.subcategory && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Subcategoria</label>
                        <p className="font-medium">{transaction.subcategory}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Team Assignments */}
              {transaction.teamPercentages && transaction.teamPercentages.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Distribuição da Equipe
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {transaction.teamPercentages.map((assignment, index) => {
                        const memberAmount = (transaction.amount * assignment.percentageValue) / 100;
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div>
                              <p className="font-medium">{assignment.teamMemberName || 'Membro não encontrado'}</p>
                              <p className="text-sm text-muted-foreground">{assignment.percentageValue}% da transação</p>
                            </div>
                            <div className="text-right">
                              <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(memberAmount)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Attachments */}
              {transaction.attachments && transaction.attachments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Paperclip className="h-5 w-5" />
                      Anexos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {transaction.attachments.map((attachment, index) => (
                        <AttachmentPreview
                          key={index}
                          attachment={attachment}
                          index={index}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {transaction.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Observações
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{transaction.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Side Information */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Data e Recorrência
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Data da Transação</label>
                    <p className="text-lg font-semibold">
                      {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                  
                  {transaction.isRecurring && (
                    <>
                      <Separator />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Transação Recorrente</label>
                        <div className="mt-1">
                          <Badge variant="outline">
                            {transaction.recurrenceInterval === 'monthly' ? 'Mensal' : transaction.recurrenceInterval}
                          </Badge>
                        </div>
                      </div>
                      {transaction.recurrenceMonths && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Duração</label>
                          <p className="font-medium">{transaction.recurrenceMonths} meses</p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {(clientData || eventData) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Relacionamentos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {clientData && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Cliente</label>
                        <div className="mt-1">
                          <p className="font-medium">{clientData.name}</p>
                          <p className="text-sm text-muted-foreground">{clientData.email}</p>
                        </div>
                      </div>
                    )}
                    {eventData && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Evento</label>
                        <div className="mt-1">
                          <p className="font-medium">{eventData.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(eventData.date), 'dd/MM/yyyy', { locale: ptBR })} - {eventData.location}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
