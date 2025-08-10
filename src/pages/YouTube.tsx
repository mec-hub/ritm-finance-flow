
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { YouTubeConnection } from '@/components/youtube/YouTubeConnection';
import { YouTubeStats } from '@/components/youtube/YouTubeStats';
import { YouTubeCharts } from '@/components/youtube/YouTubeCharts';
import { YouTubeScheduledVideos } from '@/components/youtube/YouTubeScheduledVideos';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Youtube, TrendingUp, BarChart3, Calendar } from 'lucide-react';

export default function YouTube() {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Check if YouTube is connected
  const { data: isConnected, isLoading } = useQuery({
    queryKey: ['youtube-connection', user?.id, refreshTrigger],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('youtube_tokens')
        .select('channel_id, channel_title')
        .eq('user_id', user.id)
        .single();
      
      return !error && data;
    },
    enabled: !!user,
  });

  // Get channel info including thumbnail
  const { data: channelInfo } = useQuery({
    queryKey: ['youtube-channel-info', user?.id, refreshTrigger],
    queryFn: async () => {
      if (!user || !isConnected) return null;
      
      const { data, error } = await supabase.functions.invoke('youtube-metrics', {
        body: { type: 'overview' }
      });
      
      if (error) throw error;
      return data?.channel;
    },
    enabled: !!user && !!isConnected,
  });

  const handleConnectionSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!isConnected) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Youtube className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-2xl">Conectar YouTube</CardTitle>
                <CardDescription>
                  Conecte sua conta do YouTube para ver suas análises e métricas em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent>
                <YouTubeConnection onSuccess={handleConnectionSuccess} />
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  const channelThumbnail = channelInfo?.snippet?.thumbnails?.default?.url;

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center overflow-hidden">
            {channelThumbnail ? (
              <img 
                src={channelThumbnail} 
                alt={isConnected.channel_title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Youtube className="h-6 w-6 text-red-600" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">YouTube Analytics</h1>
            <p className="text-muted-foreground">
              Canal: {isConnected.channel_title}
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Análises
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Vídeos Agendados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <YouTubeStats />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <YouTubeCharts />
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-6">
            <YouTubeScheduledVideos />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
