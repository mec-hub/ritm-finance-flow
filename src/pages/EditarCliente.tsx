
import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Client } from '@/types';
import { mockClients } from '@/data/mockData';

interface ClientFormData {
  name: string;
  contact: string;
  email: string;
  phone: string;
  notes?: string;
}

const EditarCliente = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const clientData = location.state?.clientData;
  
  // Find the client if not provided in location state
  useEffect(() => {
    if (!clientData && id) {
      const client = mockClients.find(client => client.id === id);
      if (!client) {
        toast({
          title: "Erro",
          description: "Cliente não encontrado",
          variant: "destructive"
        });
        navigate('/clientes');
      }
    }
  }, [clientData, id, navigate]);
  
  const form = useForm<ClientFormData>({
    defaultValues: {
      name: clientData?.name || '',
      contact: clientData?.contact || '',
      email: clientData?.email || '',
      phone: clientData?.phone || '',
      notes: clientData?.notes || '',
    },
  });

  const onSubmit = (data: ClientFormData) => {
    setIsLoading(true);
    
    // Create an updated client object
    const updatedClient: Client = {
      id: id || clientData.id,
      name: data.name,
      contact: data.contact,
      email: data.email,
      phone: data.phone,
      totalRevenue: clientData?.totalRevenue || 0,
      lastEvent: clientData?.lastEvent,
      notes: data.notes,
    };

    // In a real app, this would be an API call
    setTimeout(() => {
      // Update the client in the mockClients array
      const clientIndex = mockClients.findIndex(client => client.id === id || client.id === clientData.id);
      if (clientIndex !== -1) {
        mockClients[clientIndex] = updatedClient;
      }
      
      setIsLoading(false);
      toast({
        title: "Cliente atualizado",
        description: `${data.name} foi atualizado com sucesso!`,
      });
      
      // Navigate back to clients page
      navigate('/clientes');
    }, 1000);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            asChild 
            className="mr-2"
          >
            <Link to="/clientes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Editar Cliente</h1>
            <p className="text-muted-foreground">
              Atualize as informações do cliente.
            </p>
          </div>
        </div>
        
        <div className="dashboard-card p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Cliente</FormLabel>
                    <FormControl>
                      <Input placeholder="Razão social ou nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contato Principal</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da pessoa de contato" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 00000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Informações adicionais sobre o cliente" 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Inclua detalhes relevantes como preferências, histórico ou outras informações importantes.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-gold-gradient text-black hover:brightness-110"
                disabled={isLoading}
              >
                {isLoading ? 'Atualizando...' : 'Atualizar Cliente'}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
};

export default EditarCliente;
