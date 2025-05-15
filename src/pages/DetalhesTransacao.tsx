
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Calendar, User, Tag, FileText, Landmark, Calendar as CalendarIcon } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Transaction, Event } from '@/types';
import { mockTransactions, mockEvents } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const DetalhesTransacao = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [relatedEvent, setRelatedEvent] = useState<Event | null>(null);

  useEffect(() => {
    // In a real app, fetch the transaction from an API
    const fetchTransaction = () => {
      setLoading(true);
      try {
        // Find the transaction by ID
        const foundTransaction = mockTransactions.find((t) => t.id === id);
        
        if (foundTransaction) {
          setTransaction(foundTransaction);
          
          // If there's a related event, fetch it too
          if (foundTransaction.eventId) {
            const foundEvent = mockEvents.find((e) => e.id === foundTransaction.eventId);
            if (foundEvent) {
              setRelatedEvent(foundEvent);
            }
          }
        } else {
          toast({
            title: "Transação não encontrada",
            description: "A transação que você está buscando não foi encontrada.",
            variant: "destructive",
          });
          navigate('/financas');
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao buscar os dados da transação.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id, navigate]);

  const handleDuplicate = () => {
    if (!transaction) return;
    
    // Create a duplicate transaction with a new ID
    const duplicateTransaction: Transaction = {
      ...transaction,
      id: `trans-${Date.now()}`, // Generate new ID
      description: `${transaction.description} (Cópia)`
    };
    
    // Add to mockTransactions
    mockTransactions.push(duplicateTransaction);
    
    toast({
      title: "Transação duplicada",
      description: "Uma cópia da transação foi criada com sucesso."
    });
    
    navigate('/financas');
  };

  // Helper function to generate projected dates for recurring transactions
  const getProjectedDates = () => {
    if (!transaction || !transaction.isRecurring || !transaction.recurrenceMonths) return [];
    
    const dates = [];
    const baseDate = new Date(transaction.date);
    
    for (let i = 0; i < transaction.recurrenceMonths; i++) {
      const projectedDate = new Date(baseDate);
      projectedDate.setMonth(baseDate.getMonth() + i);
      dates.push(projectedDate);
    }
    
    return dates;
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => navigate('/financas')} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Detalhes da Transação</h1>
            </div>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center items-center h-64">
                <p>Carregando dados da transação...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!transaction) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => navigate('/financas')} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Transação não encontrada</h1>
            </div>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center items-center h-64">
                <p>A transação solicitada não foi encontrada.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate('/financas')}>Voltar para Finanças</Button>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }

  // Get projected dates for recurring transactions
  const projectedDates = getProjectedDates();

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
                Visualize informações detalhadas sobre esta transação.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDuplicate}>
              Duplicar
            </Button>
            <Button onClick={() => navigate(`/editar-transacao/${transaction.id}`)}>
              Editar
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className={`col-span-full ${transaction.type === 'income' ? "border-green-500/50" : "border-red-500/50"}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  {transaction.description}
                </span>
                <span className={transaction.type === 'income' ? "text-green-500" : "text-red-500"}>
                  {formatCurrency(transaction.amount)}
                </span>
              </CardTitle>
              <CardDescription>
                {transaction.type === 'income' ? 'Receita' : 'Despesa'} - {formatDate(transaction.date)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Categoria</h3>
                    <p className="text-lg font-semibold">{transaction.category}</p>
                    {transaction.subcategory && (
                      <p className="text-sm text-muted-foreground">{transaction.subcategory}</p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Data</h3>
                    <p className="text-lg font-semibold">{formatDate(transaction.date)}</p>
                  </div>
                  
                  {transaction.notes && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Observações</h3>
                      <p className="text-lg">{transaction.notes}</p>
                    </div>
                  )}
                </div>
                
                {transaction.isRecurring && (
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Recorrência</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tipo:</span>
                          <span className="font-medium">Mensal</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duração:</span>
                          <span className="font-medium">{transaction.recurrenceMonths} meses</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total:</span>
                          <span className="font-medium">{formatCurrency(transaction.amount * (transaction.recurrenceMonths || 1))}</span>
                        </div>
                        
                        <Separator className="my-2" />
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2">Datas projetadas:</h4>
                          <div className="grid grid-cols-3 gap-2">
                            {projectedDates.map((date, index) => (
                              <div 
                                key={index} 
                                className={`text-xs p-2 rounded-md flex items-center ${
                                  date <= new Date() ? 'bg-muted/80' : 'bg-muted/30'
                                }`}
                              >
                                <CalendarIcon className="h-3 w-3 mr-1 opacity-70" />
                                {formatDate(date)}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {relatedEvent && (
                <Card className="bg-muted/50 border-blue-400/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                      Evento Relacionado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-sm text-muted-foreground">Evento</h4>
                        <p className="text-lg font-semibold">{relatedEvent.title}</p>
                      </div>
                      <div>
                        <h4 className="text-sm text-muted-foreground">Data</h4>
                        <p className="text-base">{formatDate(relatedEvent.date)}</p>
                      </div>
                      <div>
                        <h4 className="text-sm text-muted-foreground">Local</h4>
                        <p className="text-base">{relatedEvent.location}</p>
                      </div>
                      <div>
                        <h4 className="text-sm text-muted-foreground">Cliente</h4>
                        <p className="text-base">{relatedEvent.client}</p>
                      </div>
                      <div>
                        <h4 className="text-sm text-muted-foreground">Status</h4>
                        <p className="text-base capitalize">{relatedEvent.status}</p>
                      </div>
                      <div>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/editar-evento/${relatedEvent.id}`)}>
                          Ver Evento
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {transaction.teamPercentages && transaction.teamPercentages.length > 0 && (
                <Card className="bg-muted/50 border-purple-400/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <User className="h-5 w-5 mr-2 text-purple-500" />
                      Distribuição Percentual
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {transaction.teamPercentages.map((tp, index) => (
                        <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold mr-2">
                              {tp.teamMemberId.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium">Colaborador ID: {tp.teamMemberId}</p>
                              <p className="text-sm text-muted-foreground">
                                {tp.percentageValue}% - {formatCurrency(transaction.amount * (tp.percentageValue / 100))}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="pt-2 border-t">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Total distribuído:</span>
                          <span>
                            {transaction.teamPercentages.reduce((sum, tp) => sum + tp.percentageValue, 0)}% - 
                            {formatCurrency(transaction.amount * (transaction.teamPercentages.reduce((sum, tp) => sum + tp.percentageValue, 0) / 100))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {(transaction.attachments && transaction.attachments.length > 0) && (
                <Card className="bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Anexos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {transaction.attachments.map((attachment, index) => (
                        <div key={index} className="border rounded p-2 text-center">
                          <p className="text-sm truncate">{attachment}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default DetalhesTransacao;
