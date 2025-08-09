
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, MousePointer, Clock, TrendingUp, Users, PlayCircle } from 'lucide-react';

interface MetricsData {
  views: number;
  avgDuration: number;
  watchTime: number;
  subscribers: number;
}

interface MetricsOverviewProps {
  data: MetricsData;
}

export function MetricsOverview({ data }: MetricsOverviewProps) {
  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null || isNaN(num)) {
      return '0';
    }
    
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const formatDuration = (seconds: number | undefined) => {
    if (seconds === undefined || seconds === null || isNaN(seconds)) {
      return '0:00';
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatWatchTime = (minutes: number | undefined) => {
    if (minutes === undefined || minutes === null || isNaN(minutes)) {
      return '0m';
    }
    
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${formatNumber(hours)}h`;
    }
    return `${formatNumber(minutes)}m`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(data.views)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Duração Média</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatDuration(data.avgDuration)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo de Exibição</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatWatchTime(data.watchTime)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Novos Inscritos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.subscribers !== undefined && data.subscribers >= 0 ? '+' : ''}{formatNumber(data.subscribers)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
