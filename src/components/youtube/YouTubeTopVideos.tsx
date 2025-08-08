
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { TopVideosTable } from './TopVideosTable';

export function YouTubeTopVideos() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['youtube-metrics', 'top-videos'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('youtube-metrics', {
        body: { type: 'top-videos' }
      });
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
  });

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Erro ao carregar vídeos</CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : 'Erro desconhecido'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando vídeos...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
                <Skeleton className="w-8 h-6" />
                <Skeleton className="w-32 h-20 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const videos = data?.topVideos || [];

  if (videos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5" />
            Seus Vídeos Mais Visualizados
          </CardTitle>
          <CardDescription>
            Nenhum vídeo encontrado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <PlayCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum vídeo disponível</h3>
            <p className="text-muted-foreground">
              Publique alguns vídeos no seu canal para vê-los aparecer aqui.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <TopVideosTable videos={videos} />;
}
