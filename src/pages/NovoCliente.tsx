
import { useState } from 'react';
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
import { Link, useNavigate } from 'react-router-dom';
import { Client } from '@/types';
import { mockClients } from '@/data/mockData';

interface ClientFormData {
  name: string;
  contact: string;
  email: string;
  notes?: string;
}

const NovoCliente = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<ClientFormData>({
    defaultValues: {
      name: '',
      contact: '',
      email: '',
      notes: '',
    },
  });

  const onSubmit = (data: ClientFormData) => {
    setIsLoading(true);
    
    // Create a new client object
    const newClient: Client = {
      id: `client-${Date.now()}`, // Generate unique ID
      name: data.name,
      contact: data.contact,
      email: data.email,
      totalRevenue: 0, // Initial revenue is zero
      notes: data.notes,
    };

    // In a real app, this would be an API call
    // For now, we'll add it to our mock data
    setTimeout(() => {
      mockClients.push(newClient);
      setIsLoading(false);
      toast({
        title: "Cliente adicionado",
        description: `${data.name} foi adicionado com sucesso!`,
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
            <h1 className="text-3xl font-bold tracking-tight">Novo Cliente</h1>
            <p className="text-muted-foreground">
              Adicione um novo cliente ao sistema.
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
                {isLoading ? 'Salvando...' : 'Salvar Cliente'}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
};

export default NovoCliente;
