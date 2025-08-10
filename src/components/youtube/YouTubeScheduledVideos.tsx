
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, PlayCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function YouTubeScheduledVideos() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['youtube-metrics', 'scheduled-videos'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('youtube-metrics', {
        body: { type: 'scheduled-videos' }
      });
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
  });

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Erro ao carregar vídeos agendados</CardTitle>
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
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Vídeos Agendados
          </CardTitle>
          <CardDescription>Carregando seus vídeos programados...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
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

  const scheduledVideos = data?.scheduledVideos || [];

  if (scheduledVideos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Vídeos Agendados
          </CardTitle>
          <CardDescription>
            Seus vídeos programados para publicação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum vídeo agendado</h3>
            <p className="text-muted-foreground">
              Você não tem vídeos programados para publicação no momento.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Vídeos Agendados
        </CardTitle>
        <CardDescription>
          {scheduledVideos.length} vídeo{scheduledVideos.length !== 1 ? 's' : ''} programado{scheduledVideos.length !== 1 ? 's' : ''} para publicação
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {scheduledVideos.map((video: any) => {
            const { date, time } = formatDateTime(video.snippet.publishAt);
            
            return (
              <div key={video.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                {video.snippet.thumbnails?.medium && (
                  <img 
                    src={video.snippet.thumbnails.medium.url}
                    alt={video.snippet.title}
                    className="w-32 h-20 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium line-clamp-2 mb-2">
                    {video.snippet.title}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <PlayCircle className="h-4 w-4" />
                      <span>{time}</span>
                    </div>
                  </div>
                  {video.snippet.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {video.snippet.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
