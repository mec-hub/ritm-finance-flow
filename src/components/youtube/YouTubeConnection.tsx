
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Youtube, Loader2 } from 'lucide-react';

interface YouTubeConnectionProps {
  onSuccess?: () => void;
}

export function YouTubeConnection({ onSuccess }: YouTubeConnectionProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      // Get auth URL from Edge Function
      const { data, error } = await supabase.functions.invoke('youtube-auth-start');
      
      if (error) {
        throw error;
      }

      if (!data.authUrl) {
        throw new Error('Não foi possível obter URL de autenticação');
      }

      // Open popup window
      const popup = window.open(
        data.authUrl,
        'youtube-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Listen for auth success message
      const messageHandler = (event: MessageEvent) => {
        if (event.data?.type === 'youtube-auth-success') {
          popup?.close();
          window.removeEventListener('message', messageHandler);
          
          toast({
            title: "YouTube conectado",
            description: "Sua conta do YouTube foi conectada com sucesso!",
          });
          
          onSuccess?.();
          setIsConnecting(false);
        }
      };

      window.addEventListener('message', messageHandler);

      // Check if popup was closed without success
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          setIsConnecting(false);
        }
      }, 1000);

    } catch (error: any) {
      console.error('Connection error:', error);
      toast({
        title: "Erro na conexão",
        description: error.message || "Não foi possível conectar ao YouTube",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  return (
    <div className="text-center">
      <Button 
        onClick={handleConnect} 
        disabled={isConnecting}
        size="lg"
        className="bg-red-600 hover:bg-red-700 text-white"
      >
        {isConnecting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Conectando...
          </>
        ) : (
          <>
            <Youtube className="mr-2 h-4 w-4" />
            Conectar YouTube
          </>
        )}
      </Button>
      
      <p className="text-sm text-muted-foreground mt-4">
        Você será redirecionado para o Google para autorizar o acesso ao seu canal do YouTube
      </p>
    </div>
  );
}
