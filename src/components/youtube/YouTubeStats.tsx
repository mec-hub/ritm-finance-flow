
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StatCard } from '@/components/ui/dashboard/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Users, PlayCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { TopVideosTable } from './TopVideosTable';

export function YouTubeStats() {
  const { data: overviewData, isLoading: overviewLoading, error: overviewError } = useQuery({
    queryKey: ['youtube-metrics', 'overview'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('youtube-metrics', {
        body: { type: 'overview' }
      });
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const { data: topVideosData, isLoading: topVideosLoading, error: topVideosError } = useQuery({
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

  if (overviewError || topVideosError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Erro ao carregar estatísticas</CardTitle>
          <CardDescription>
            {overviewError instanceof Error ? overviewError.message : topVideosError instanceof Error ? topVideosError.message : 'Erro desconhecido'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (overviewLoading || topVideosLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const channel = overviewData?.channel;
  const statistics = channel?.statistics;

  if (!statistics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dados não disponíveis</CardTitle>
          <CardDescription>
            Não foi possível carregar as estatísticas do canal
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const formatNumber = (num: string | number) => {
    const number = typeof num === 'string' ? parseInt(num) : num;
    if (number >= 1000000) {
      return `${(number / 1000000).toFixed(1)}M`;
    }
    if (number >= 1000) {
      return `${(number / 1000).toFixed(1)}K`;
    }
    return number.toLocaleString();
  };

  const videos = topVideosData?.topVideos || [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Visualizações Totais"
          value={formatNumber(statistics.viewCount || 0)}
          icon={Eye}
          description="Todas as visualizações do canal"
        />
        
        <StatCard
          title="Inscritos"
          value={formatNumber(statistics.subscriberCount || 0)}
          icon={Users}
          description="Total de inscritos"
        />
        
        <StatCard
          title="Vídeos Publicados"
          value={formatNumber(statistics.videoCount || 0)}
          icon={PlayCircle}
          description="Total de vídeos no canal"
        />
      </div>

      {overviewData?.recentVideos?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5" />
              Vídeos Recentes
            </CardTitle>
            <CardDescription>
              Seus últimos vídeos publicados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overviewData.recentVideos.slice(0, 5).map((video: any) => (
                <div key={video.id.videoId} className="flex items-start gap-4 p-4 border rounded-lg">
                  {video.snippet.thumbnails?.default && (
                    <img 
                      src={video.snippet.thumbnails.default.url}
                      alt={video.snippet.title}
                      className="w-16 h-12 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium line-clamp-2">
                      {video.snippet.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(video.snippet.publishedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {videos.length > 0 && <TopVideosTable videos={videos} />}
    </div>
  );
}
