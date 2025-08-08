
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, Eye, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function YouTubeTopVideos() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['youtube-metrics', 'overview'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('youtube-metrics', {
        body: { type: 'overview' }
      });
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 5 * 60 * 1000,
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

  const videos = data?.recentVideos || [];

  if (videos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5" />
            Seus Vídeos
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlayCircle className="h-5 w-5" />
          Vídeos Recentes
        </CardTitle>
        <CardDescription>
          Seus últimos vídeos publicados no YouTube
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {videos.map((video: any) => (
            <div 
              key={video.id.videoId} 
              className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              {video.snippet.thumbnails?.medium && (
                <div className="relative">
                  <img 
                    src={video.snippet.thumbnails.medium.url}
                    alt={video.snippet.title}
                    className="w-32 h-20 object-cover rounded-md"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                      <PlayCircle className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium line-clamp-2 mb-2">
                  {video.snippet.title}
                </h4>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {video.snippet.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Publicado em {new Date(video.snippet.publishedAt).toLocaleDateString('pt-BR')}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`https://youtube.com/watch?v=${video.id.videoId}`, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Ver no YouTube
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {videos.length >= 5 && (
          <div className="text-center mt-6">
            <Button variant="outline">
              Ver Mais Vídeos
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
