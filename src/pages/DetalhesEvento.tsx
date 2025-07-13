
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Trash2, Calendar, DollarSign, User, MapPin, Clock, Building } from 'lucide-react';
import { Event } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EventService } from '@/services/eventService';
import { ClientService } from '@/services/clientService';
import { toast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MapPreview } from '@/components/MapPreview';

const DetalhesEvento = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [clientData, setClientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;

      try {
        const eventData = await EventService.getById(id);
        if (eventData) {
          setEvent(eventData);
          
          // Fetch related client data
          if (eventData.clientId) {
            try {
              const client = await ClientService.getById(eventData.clientId);
              setClientData(client);
            } catch (error) {
              console.error('Error fetching client:', error);
            }
          }
        } else {
          toast({
            title: "Evento não encontrado",
            description: "O evento que você está procurando não foi encontrado.",
            variant: "destructive",
          });
          navigate('/eventos');
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os detalhes do evento.",
          variant: "destructive"
        });
        navigate('/eventos');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!event) return;

    try {
      setDeleting(true);
      await EventService.delete(event.id);
      toast({
        title: "Evento excluído",
        description: "O evento foi excluído com sucesso."
      });
      navigate('/eventos');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o evento.",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Próximo</Badge>;
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600">Concluído</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500 hover:bg-red-600">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Layout>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center h-64">
              <p>Carregando detalhes do evento...</p>
            </div>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <h3 className="text-lg font-semibold">Evento não encontrado</h3>
              <p className="text-muted-foreground">
                O evento que você está procurando não existe ou foi removido.
              </p>
              <Button 
                onClick={() => navigate('/eventos')} 
                className="mt-4"
              >
                Voltar para Eventos
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
            <Button variant="ghost" onClick={() => navigate('/eventos')} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Detalhes do Evento</h1>
              <p className="text-muted-foreground">
                Visualize todos os detalhes deste evento
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/eventos/editar/${event.id}`)}>
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
                    Tem certeza que deseja excluir o evento "{event.title}"? 
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
                  <Calendar className="h-5 w-5" />
                  Informações Principais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Título</label>
                    <p className="text-lg font-semibold">{event.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">
                      {getStatusBadge(event.status)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Data</label>
                    <p className="text-lg font-semibold">
                      {format(new Date(event.date), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                  {(event.startTime || event.endTime) && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Horário</label>
                      <div className="flex items-center gap-2 text-lg font-semibold">
                        <Clock className="h-4 w-4" />
                        <span>
                          {event.startTime && event.endTime 
                            ? `${event.startTime} às ${event.endTime}`
                            : event.startTime 
                              ? `A partir das ${event.startTime}`
                              : event.endTime 
                                ? `Até às ${event.endTime}`
                                : ''
                          }
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Location and Map */}
            {(event.location || event.placeName) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Localização
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {event.placeName && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Local</label>
                      <p className="font-medium">{event.placeName}</p>
                    </div>
                  )}
                  {event.formattedAddress && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Endereço</label>
                      <p className="text-sm text-muted-foreground">{event.formattedAddress}</p>
                    </div>
                  )}
                  {event.location && !event.placeName && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Local</label>
                      <p className="font-medium">{event.location}</p>
                    </div>
                  )}
                  
                  {event.latitude && event.longitude && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Mapa</label>
                      <MapPreview
                        latitude={event.latitude}
                        longitude={event.longitude}
                        placeName={event.placeName || event.location}
                        className="w-full h-64 rounded-md border"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Informações Financeiras
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Receita Estimada</label>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(event.estimatedRevenue)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Despesas Estimadas</label>
                    <p className="text-lg font-semibold text-red-600">
                      {formatCurrency(event.estimatedExpenses)}
                    </p>
                  </div>
                  {event.actualRevenue !== undefined && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Receita Real</label>
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(event.actualRevenue)}
                      </p>
                    </div>
                  )}
                  {event.actualExpenses !== undefined && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Despesas Reais</label>
                      <p className="text-lg font-semibold text-red-600">
                        {formatCurrency(event.actualExpenses)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {event.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Observações</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{event.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Side Information */}
          <div className="space-y-6">
            {clientData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="font-medium">{clientData.name}</p>
                    <p className="text-sm text-muted-foreground">{clientData.email}</p>
                    {clientData.phone && (
                      <p className="text-sm text-muted-foreground">{clientData.phone}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Resumo Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Lucro Estimado</label>
                  <p className={`text-lg font-bold ${
                    (event.estimatedRevenue - event.estimatedExpenses) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(event.estimatedRevenue - event.estimatedExpenses)}
                  </p>
                </div>
                {(event.actualRevenue !== undefined && event.actualExpenses !== undefined) && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Lucro Real</label>
                    <p className={`text-lg font-bold ${
                      (event.actualRevenue - event.actualExpenses) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(event.actualRevenue - event.actualExpenses)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DetalhesEvento;
