
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
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ClientService } from '@/services/clientService';
import { Client } from '@/types';

interface ClientFormData {
  name: string;
  contact: string;
  email: string;
  phone: string;
  websiteUrl: string;
  notes?: string;
}

const EditarCliente = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<Client | null>(null);
  const navigate = useNavigate();
  const { id } = useParams();
  
  const form = useForm<ClientFormData>({
    defaultValues: {
      name: '',
      contact: '',
      email: '',
      phone: '',
      websiteUrl: '',
      notes: '',
    },
  });

  useEffect(() => {
    const fetchClient = async () => {
      if (!id) {
        console.error('EditarCliente - No client ID provided');
        toast({
          title: "Erro",
          description: "ID do cliente não fornecido",
          variant: "destructive"
        });
        navigate('/clientes');
        return;
      }

      try {
        console.log('EditarCliente - Starting data fetch for client ID:', id);
        setLoading(true);
        
        const clientData = await ClientService.getById(id);
        console.log('EditarCliente - Client data received:', clientData);
        
        if (!clientData) {
          console.error('EditarCliente - Client not found');
          toast({
            title: "Erro",
            description: "Cliente não encontrado",
            variant: "destructive"
          });
          navigate('/clientes');
          return;
        }

        setClient(clientData);
        
        form.reset({
          name: clientData.name,
          contact: clientData.contact,
          email: clientData.email,
          phone: clientData.phone,
          websiteUrl: clientData.websiteUrl || '',
          notes: clientData.notes || '',
        });

        console.log('EditarCliente - Form reset completed');
        
      } catch (error) {
        console.error('EditarCliente - Error fetching client:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar o cliente. Tente novamente.",
          variant: "destructive"
        });
        navigate('/clientes');
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id, navigate, form]);

  const onSubmit = async (data: ClientFormData) => {
    if (!id) {
      console.error('EditarCliente - No client ID for update');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('EditarCliente - Starting update with form data:', data);
      
      await ClientService.update(id, {
        name: data.name,
        contact: data.contact,
        email: data.email,
        phone: data.phone,
        websiteUrl: data.websiteUrl,
        notes: data.notes,
      });
      
      console.log('EditarCliente - Update successful');
      
      toast({
        title: "Cliente atualizado",
        description: `${data.name} foi atualizado com sucesso!`,
      });
      
      navigate('/clientes');
    } catch (error) {
      console.error('EditarCliente - Error updating client:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o cliente. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p>Carregando dados do cliente...</p>
        </div>
      </Layout>
    );
  }

  if (!client) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p>Cliente não encontrado</p>
        </div>
      </Layout>
    );
  }

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
                name="websiteUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL</FormLabel>
                    <FormControl>
                      <Input 
                        type="url" 
                        placeholder="https://www.exemplo.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      URL do site do cliente (opcional). Este link será acessível clicando no nome do cliente na lista.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
