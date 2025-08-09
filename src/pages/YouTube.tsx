
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { YouTubeConnection } from '@/components/youtube/YouTubeConnection';
import { YouTubeStats } from '@/components/youtube/YouTubeStats';
import { YouTubeCharts } from '@/components/youtube/YouTubeCharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Youtube, TrendingUp, BarChart3, LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function YouTube() {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Check if YouTube is connected and get channel data
  const { data: channelData, isLoading } = useQuery({
    queryKey: ['youtube-connection', user?.id, refreshTrigger],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('youtube_tokens')
        .select('channel_id, channel_title, channel_thumbnail')
        .eq('user_id', user.id)
        .single();
      
      if (error || !data) return null;
      
      // If we don't have channel_thumbnail, try to fetch it
      if (!data.channel_thumbnail && data.channel_id) {
        try {
          const { data: channelInfo } = await supabase.functions.invoke('youtube-metrics', {
            body: { type: 'channel-info' }
          });
          
          if (channelInfo?.channel?.snippet?.thumbnails?.default?.url) {
            // Update the database with the thumbnail
            await supabase
              .from('youtube_tokens')
              .update({ channel_thumbnail: channelInfo.channel.snippet.thumbnails.default.url })
              .eq('user_id', user.id);
              
            return {
              ...data,
              channel_thumbnail: channelInfo.channel.snippet.thumbnails.default.url
            };
          }
        } catch (error) {
          console.error('Error fetching channel thumbnail:', error);
        }
      }
      
      return data;
    },
    enabled: !!user,
  });

  const handleConnectionSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDisconnect = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('youtube_tokens')
        .delete()
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "YouTube desconectado",
        description: "Sua conta do YouTube foi desconectada com sucesso!",
      });
      
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error('Disconnect error:', error);
      toast({
        title: "Erro ao desconectar",
        description: error.message || "Não foi possível desconectar do YouTube",
        variant: "destructive",
      });
    }
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

  if (!channelData) {
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

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-red-100">
              {channelData.channel_thumbnail ? (
                <img 
                  src={channelData.channel_thumbnail}
                  alt={`${channelData.channel_title} thumbnail`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <Youtube className="h-6 w-6 text-red-600" style={{ display: channelData.channel_thumbnail ? 'none' : 'block' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">YouTube Analytics</h1>
              <p className="text-muted-foreground">
                Canal: {channelData.channel_title}
              </p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleDisconnect}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Desconectar
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Análises
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <YouTubeStats />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <YouTubeCharts />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
