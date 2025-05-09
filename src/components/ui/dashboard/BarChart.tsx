
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatters';

interface ChartData {
  name: string;
  [key: string]: string | number;
}

interface FinancialBarChartProps {
  data: ChartData[];
  title: string;
  height?: number;
}

export function FinancialBarChart({
  data,
  title,
  height = 300
}: FinancialBarChartProps) {
  // Dynamically determine the bars to show based on the first data item
  const bars = Object.keys(data[0] || {}).filter(key => key !== 'name');
  
  // Define colors for each type of data
  const colors = ['#FFD700', '#ff7b00', '#10B981', '#EC4899'];
  
  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
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
            {bars.map((key, index) => (
              <Bar 
                key={key}
                dataKey={key} 
                fill={colors[index % colors.length]} 
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
