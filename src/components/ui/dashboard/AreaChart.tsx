
import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatters';

interface ChartData {
  name: string;
  [key: string]: string | number;
}

interface FinancialChartProps {
  data: ChartData[];
  title: string;
  height?: number;
}

export function FinancialAreaChart({
  data,
  title,
  height = 300
}: FinancialChartProps) {
  // Safe check to prevent useMemo from running with empty data
  const lines = useMemo(() => {
    if (!data || !data.length) return [];
    
    const firstItem = data[0];
    return Object.keys(firstItem).filter(key => key !== 'name');
  }, [data]);

  const colors = ['#FFD700', '#3B82F6', '#10B981', '#EC4899'];

  // Add a safety check to prevent rendering if data is missing
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-0">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }} 
              tickLine={false}
              axisLine={false}
              stroke="#888"
            />
            <YAxis 
              tick={{ fontSize: 12 }} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `R$ ${value/1000}k`}
              stroke="#888"
            />
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ 
                backgroundColor: '#121212', 
                borderColor: '#333', 
                borderRadius: 6,
                fontSize: 12
              }}
            />
            <Legend />
            {lines.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stackId="1"
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.3}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
