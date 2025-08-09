import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { BarChart3, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { DateRangePicker } from './DateRangePicker';
import { MetricsOverview } from './MetricsOverview';
import { TrafficSourcesChart } from './TrafficSourcesChart';
import { DeviceAnalytics } from './DeviceAnalytics';

export function YouTubeCharts() {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['youtube-metrics', 'analytics', dateRange.from, dateRange.to],
    queryFn: async () => {
      const startDate = dateRange.from.toISOString().split('T')[0];
      const endDate = dateRange.to.toISOString().split('T')[0];
      
      const { data, error } = await supabase.functions.invoke('youtube-metrics', {
        body: { 
          type: 'analytics',
          startDate,
          endDate
        }
      });
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 10 * 60 * 1000,
  });

  const processedData = useMemo(() => {
    if (!data?.analytics?.rows) return null;

    console.log('Raw analytics data:', data.analytics.rows);

    // Process main analytics data
    const chartData = data.analytics.rows.map((row: any[]) => {
      const date = row[0];
      const views = row[1] || 0;
      const avgDuration = row[2] || 0; // This is already in seconds from the API
      const watchTime = row[3] || 0;
      const subscribers = row[4] || 0;

      return {
        date: new Date(date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
        views,
        avgDuration: Math.round(avgDuration), // Keep in seconds
        watchTime: Math.round(watchTime / 60), // Convert to minutes
        subscribers,
      };
    });

    // Calculate totals for overview cards
    const totals = data.analytics.rows.reduce((acc: any, row: any[], index: number) => {
      const views = row[1] || 0;
      const avgDuration = row[2] || 0; // Already in seconds
      const watchTime = row[3] || 0;
      const subscribers = row[4] || 0;

      return {
        views: acc.views + views,
        avgDuration: acc.avgDuration + avgDuration, // Sum for averaging
        watchTime: acc.watchTime + watchTime,
        subscribers: acc.subscribers + subscribers,
        count: acc.count + 1,
      };
    }, {
      views: 0,
      avgDuration: 0,
      watchTime: 0,
      subscribers: 0,
      count: 0,
    });

    // Calculate proper averages
    const dayCount = totals.count;
    if (dayCount > 0) {
      totals.avgDuration = Math.round(totals.avgDuration / dayCount); // Average duration in seconds
    }
    totals.watchTime = Math.round(totals.watchTime / 60); // Convert to minutes

    console.log('Processed totals:', totals);

    return { chartData, totals };
  }, [data]);

  const trafficSourcesData = useMemo(() => {
    if (!data?.trafficSources?.rows) return [];

    return data.trafficSources.rows.map((row: any[]) => {
      const source = row[0];
      const views = row[1] || 0;
      const totalViews = data.trafficSources.rows.reduce((sum: number, r: any[]) => sum + (r[1] || 0), 0);
      
      return {
        source,
        views,
        percentage: totalViews > 0 ? (views / totalViews) * 100 : 0,
      };
    });
  }, [data]);

  const deviceData = useMemo(() => {
    if (!data?.deviceTypes?.rows) return [];

    console.log('Raw device data:', data.deviceTypes.rows);

    const processedDeviceData = data.deviceTypes.rows.map((row: any[]) => {
      const device = row[0];
      const views = row[1] || 0;
      const watchTimeMinutes = row[2] || 0;
      
      return {
        device,
        views,
        watchTimeHours: Math.round(watchTimeMinutes / 60),
        watchTimeMinutes,
      };
    });

    // Calculate total watch time for percentages
    const totalWatchTime = processedDeviceData.reduce((sum, item) => sum + item.watchTimeMinutes, 0);

    // Add percentage calculation
    const deviceDataWithPercentages = processedDeviceData.map(item => ({
      ...item,
      percentage: totalWatchTime > 0 ? (item.watchTimeMinutes / totalWatchTime) * 100 : 0,
    }));

    console.log('Processed device data:', deviceDataWithPercentages);

    return deviceDataWithPercentages;
  }, [data]);

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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-[280px]" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16 mb-1" />
              </CardContent>
            </Card>
          ))}
        </div>

        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // If analytics API is not available, show fallback message
  if (!data?.analytics && data?.error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Análises Detalhadas</h2>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Análises Detalhadas
            </CardTitle>
            <CardDescription>
              Para ter acesso às análises detalhadas, é necessário habilitar a YouTube Analytics API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Análises Limitadas</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
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
              <div className="mt-6 text-sm text-muted-foreground">
                <p>Para habilitar análises detalhadas:</p>
                <ol className="list-decimal list-inside mt-2 space-y-1 text-left max-w-md mx-auto">
                  <li>Acesse o Google Cloud Console</li>
                  <li>Habilite a YouTube Analytics API</li>
                  <li>Configure os escopos necessários</li>
                  <li>Reconecte sua conta do YouTube</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!processedData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dados de análise não disponíveis</CardTitle>
          <CardDescription>
            Não há dados suficientes para exibir os gráficos no período selecionado
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Análises Detalhadas</h2>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      <MetricsOverview data={processedData.totals} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Visualizações
            </CardTitle>
            <CardDescription>
              Evolução diária das visualizações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={processedData.chartData}>
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

        <Card>
          <CardHeader>
            <CardTitle>Tempo de Exibição</CardTitle>
            <CardDescription>
              Minutos assistidos ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={processedData.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => [value.toLocaleString(), 'Minutos']}
                />
                <Line 
                  type="monotone" 
                  dataKey="watchTime" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Tempo de Exibição (min)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {trafficSourcesData.length > 0 && (
          <TrafficSourcesChart data={trafficSourcesData} />
        )}
        
        {deviceData.length > 0 && (
          <DeviceAnalytics data={deviceData} />
        )}
      </div>
    </div>
  );
}
