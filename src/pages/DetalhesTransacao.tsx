
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Calendar, DollarSign, User, Building, MapPin, FileText, Users } from 'lucide-react';
import { TransactionService } from '@/services/transactionService';
import { ClientService } from '@/services/clientService';
import { EventService } from '@/services/eventService';
import { Transaction, Client, Event } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { toast } from '@/hooks/use-toast';
import { AttachmentPreview } from '@/components/transactions/AttachmentPreview';

const DetalhesTransacao = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const transactionData = await TransactionService.getById(id);
        
        if (transactionData) {
          setTransaction(transactionData);
          
          // Fetch related client and event data
          if (transactionData.clientId) {
            try {
              const clientData = await ClientService.getById(transactionData.clientId);
              setClient(clientData);
            } catch (error) {
              console.error('Error fetching client:', error);
            }
          }
          
          if (transactionData.eventId) {
            try {
              const eventData = await EventService.getById(transactionData.eventId);
              setEvent(eventData);
            } catch (error) {
              console.error('Error fetching event:', error);
            }
          }
        } else {
          toast({
            title: "Transação não encontrada",
            description: "A transação que você está tentando visualizar não foi encontrada.",
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

    fetchData();
  }, [id, navigate]);

  const getTypeVariant = (type: 'income' | 'expense') => {
    return type === 'income' ? 'default' : 'destructive';
  };

  const getStatusVariant = (status: 'paid' | 'not_paid' | 'canceled') => {
    switch (status) {
      case 'paid':
        return 'default';
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
            <div className="text-center py-8">
              <p className="text-muted-foreground">Transação não encontrada.</p>
            </div>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => navigate('/financas')} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Detalhes da Transação</h1>
              <p className="text-muted-foreground">
                Visualize todas as informações desta transação.
              </p>
            </div>
          </div>
          <Button onClick={() => navigate(`/financas/editar/${transaction.id}`)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>

        {/* Main Transaction Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{transaction.description}</span>
              <div className="flex gap-2">
                <Badge variant={getTypeVariant(transaction.type)}>
                  {getTypeText(transaction.type)}
                </Badge>
                <Badge variant={getStatusVariant(transaction.status || 'not_paid')}>
                  {getStatusText(transaction.status || 'not_paid')}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center space-x-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valor</p>
                  <p className={`text-lg font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data</p>
                  <p className="text-lg font-semibold">{formatDate(transaction.date)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Categoria</p>
                  <p className="text-lg font-semibold">{transaction.category}</p>
                  {transaction.subcategory && (
                    <p className="text-sm text-muted-foreground">{transaction.subcategory}</p>
                  )}
                </div>
              </div>

              {transaction.isRecurring && (
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Recorrência</p>
                    <p className="text-lg font-semibold">
                      {transaction.recurrenceMonths} meses
                    </p>
                    <p className="text-sm text-muted-foreground">Mensal</p>
                  </div>
                </div>
              )}
            </div>

            {transaction.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Observações</p>
                  <p className="text-sm">{transaction.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Related Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client Information */}
          {client && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Cliente Relacionado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold">{client.name}</p>
                  <p className="text-sm text-muted-foreground">{client.contact}</p>
                  {client.email && (
                    <p className="text-sm text-muted-foreground">{client.email}</p>
                  )}
                  {client.phone && (
                    <p className="text-sm text-muted-foreground">{client.phone}</p>
                  )}
                </div>
                {client.notes && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Observações</p>
                    <p className="text-sm">{client.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Event Information */}
          {event && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Evento Relacionado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold">{event.title}</p>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(event.date)}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    {event.location}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Receita Estimada</p>
                    <p className="font-medium">{formatCurrency(event.estimatedRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Despesa Estimada</p>
                    <p className="font-medium">{formatCurrency(event.estimatedExpenses)}</p>
                  </div>
                </div>
                {event.notes && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Observações</p>
                    <p className="text-sm">{event.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Team Assignments */}
        {transaction.teamPercentages && transaction.teamPercentages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Distribuição da Equipe
              </CardTitle>
              <CardDescription>
                Membros da equipe e suas respectivas participações nesta transação.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transaction.teamPercentages.map((assignment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{assignment.teamMemberName || 'Membro não identificado'}</p>
                      <p className="text-sm text-muted-foreground">
                        {assignment.percentageValue}% da transação
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency((transaction.amount * assignment.percentageValue) / 100)}
                      </p>
                      <Badge variant="outline">{assignment.percentageValue}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Attachments */}
        {transaction.attachments && transaction.attachments.length > 0 && (
          <AttachmentPreview attachments={transaction.attachments} />
        )}
      </div>
    </Layout>
  );
};

export default DetalhesTransacao;
