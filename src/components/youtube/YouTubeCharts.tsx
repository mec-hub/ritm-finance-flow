
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { BarChart3, TrendingUp, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function YouTubeCharts() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['youtube-metrics', 'analytics'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('youtube-metrics', {
        body: { type: 'analytics' }
      });
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Erro ao carregar análises</CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : 'Erro desconhecido'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-1">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // If analytics API is not available, show fallback message
  if (!data?.analytics && data?.error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Análises Detalhadas
            </CardTitle>
            <CardDescription>
              Para ter acesso às análises detalhadas, é necessário configurar permissões adicionais da API do YouTube
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Análises Limitadas</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {data.error}
              </p>
              {data?.fallback && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 max-w-md mx-auto">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {parseInt(data.fallback.viewCount || '0').toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Visualizações</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {parseInt(data.fallback.subscriberCount || '0').toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Inscritos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {parseInt(data.fallback.videoCount || '0').toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Vídeos</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Process analytics data if available
  const analytics = data?.analytics;
  if (!analytics?.rows) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dados de análise não disponíveis</CardTitle>
          <CardDescription>
            Não há dados suficientes para exibir os gráficos
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Transform data for charts
  const chartData = analytics.rows.map((row: any[], index: number) => {
    const date = row[0]; // day dimension
    const views = row[1]; // views metric
    const watchTime = row[2]; // estimatedMinutesWatched metric
    const subscribers = row[3]; // subscribersGained metric

    return {
      date: new Date(date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
      views: views || 0,
      watchTime: Math.round((watchTime || 0) / 60), // Convert to hours
      subscribers: subscribers || 0,
    };
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Visualizações (Últimos 30 dias)
          </CardTitle>
          <CardDescription>
            Evolução diária das visualizações do seu canal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: any) => [value.toLocaleString(), 'Visualizações']}
              />
              <Area 
                type="monotone" 
                dataKey="views" 
                stroke="#ef4444" 
                fill="#fca5a5" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Tempo de Exibição (Horas)
            </CardTitle>
            <CardDescription>
              Total de horas assistidas por dia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => [`${value}h`, 'Tempo de Exibição']}
                />
                <Line 
                  type="monotone" 
                  dataKey="watchTime" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Novos Inscritos
            </CardTitle>
            <CardDescription>
              Inscritos ganhos por dia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => [value, 'Novos Inscritos']}
                />
                <Area 
                  type="monotone" 
                  dataKey="subscribers" 
                  stroke="#10b981" 
                  fill="#86efac" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
