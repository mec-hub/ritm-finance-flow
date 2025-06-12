
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Trash2, Calendar, DollarSign, Tag, User, Building, FileText, Users, Paperclip, Download } from 'lucide-react';
import { Transaction } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TransactionService } from '@/services/transactionService';
import { EventService } from '@/services/eventService';
import { ClientService } from '@/services/clientService';
import { toast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const DetalhesTransacao = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [eventData, setEventData] = useState<any>(null);
  const [clientData, setClientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!id) return;

      try {
        const transactionData = await TransactionService.getById(id);
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
          navigate('/financas');
        }
      } catch (error) {
        console.error('Error fetching transaction:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os detalhes da transação.",
          variant: "destructive"
        });
        navigate('/financas');
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!transaction) return;

    try {
      setDeleting(true);
      await TransactionService.delete(transaction.id);
      toast({
        title: "Transação excluída",
        description: "A transação foi excluída com sucesso."
      });
      navigate('/financas');
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
      <Layout>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center h-64">
              <p>Carregando detalhes da transação...</p>
            </div>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  if (!transaction) {
    return (
      <Layout>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <h3 className="text-lg font-semibold">Transação não encontrada</h3>
              <p className="text-muted-foreground">
                A transação que você está procurando não existe ou foi removida.
              </p>
              <Button 
                onClick={() => navigate('/financas')} 
                className="mt-4"
              >
                Voltar para Finanças
              </Button>
            </div>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => navigate('/financas')} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Detalhes da Transação</h1>
              <p className="text-muted-foreground">
                Visualize todos os detalhes desta transação
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/financas/editar/${transaction.id}`)}>
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
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
                  <div className="space-y-2">
                    {transaction.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">Anexo {index + 1}</span>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
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
          <div className="space-y-6">
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
      </div>
    </Layout>
  );
};

export default DetalhesTransacao;
