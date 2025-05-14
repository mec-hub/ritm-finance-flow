
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Index = () => {
  const navigate = useNavigate();

  // Automatically redirect to dashboard after a short delay
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
    
    return () => clearTimeout(redirectTimer);
  }, [navigate]);

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <Card className="p-6 md:p-8 shadow-lg bg-gradient-to-br from-amber-50 to-yellow-100">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gold-gradient bg-clip-text text-transparent">
              DJ Davizão - Plataforma Financeira
            </h1>
            <p className="text-xl text-gray-700 mb-6">
              Bem-vindo à plataforma de gestão completa para o seu negócio
            </p>
            
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={() => navigate('/dashboard')}
                className="bg-gold-gradient hover:bg-amber-600 text-black"
              >
                Acessar Dashboard
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/eventos')}
                className="border-amber-400 text-amber-700 hover:bg-amber-50"
              >
                Ver Eventos
              </Button>
            </div>
            
            <p className="mt-6 text-muted-foreground">
              Redirecionando para o dashboard em instantes...
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;
