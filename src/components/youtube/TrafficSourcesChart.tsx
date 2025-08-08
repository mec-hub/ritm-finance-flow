
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface TrafficSourceData {
  source: string;
  views: number;
  percentage: number;
}

interface TrafficSourcesChartProps {
  data: TrafficSourceData[];
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

const sourceLabels: Record<string, string> = {
  'SEARCH': 'Pesquisa do YouTube',
  'SUGGESTED_VIDEO': 'Vídeos sugeridos',
  'EXTERNAL': 'Fontes externas',
  'BROWSE_FEATURE': 'Recursos de navegação',
  'CHANNEL': 'Páginas do canal',
  'DIRECT_OR_UNKNOWN': 'Direto ou desconhecido',
  'NOTIFICATION': 'Notificações',
};

export function TrafficSourcesChart({ data }: TrafficSourcesChartProps) {
  const chartData = data.map((item, index) => ({
    name: sourceLabels[item.source] || item.source,
    value: item.views,
    percentage: item.percentage,
    color: COLORS[index % COLORS.length],
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border">
          <p className="font-medium">{data.name}</p>
          <p className="text-blue-600">
            {data.value.toLocaleString()} visualizações ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Como os espectadores encontram seus vídeos</CardTitle>
        <CardDescription>
          Fontes de tráfego dos seus vídeos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm">{item.name}</span>
              </div>
              <span className="text-sm font-medium">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
