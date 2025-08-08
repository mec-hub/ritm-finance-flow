
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Smartphone, Monitor, Tv } from 'lucide-react';

interface DeviceData {
  device: string;
  views: number;
  watchTimeHours: number;
  percentage: number;
}

interface DeviceAnalyticsProps {
  data: DeviceData[];
}

const deviceIcons: Record<string, any> = {
  'MOBILE': Smartphone,
  'DESKTOP': Monitor,
  'TV': Tv,
};

const deviceLabels: Record<string, string> = {
  'MOBILE': 'Celular',
  'DESKTOP': 'Desktop',
  'TV': 'TV',
  'TABLET': 'Tablet',
  'UNKNOWN_PLATFORM': 'Outros',
};

export function DeviceAnalytics({ data }: DeviceAnalyticsProps) {
  const chartData = data.map(item => ({
    device: deviceLabels[item.device] || item.device,
    hours: item.watchTimeHours,
    percentage: item.percentage,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tipos de dispositivo</CardTitle>
        <CardDescription>
          Tempo de exibição por tipo de dispositivo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="device" type="category" width={80} />
            <Tooltip 
              formatter={(value: any) => [`${value}h`, 'Tempo de Exibição']}
            />
            <Bar dataKey="hours" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
        
        <div className="mt-6 space-y-3">
          {data.map((item, index) => {
            const Icon = deviceIcons[item.device] || Monitor;
            return (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{deviceLabels[item.device] || item.device}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.views.toLocaleString()} visualizações
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{item.watchTimeHours.toFixed(1)}h</div>
                  <div className="text-sm text-muted-foreground">{item.percentage.toFixed(1)}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
