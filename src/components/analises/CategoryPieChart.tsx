
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Transaction } from '@/types';
import { formatCurrency } from '@/utils/formatters';

interface CategoryPieChartProps {
  transactions: Transaction[];
  title: string;
  type: 'income' | 'expense';
}

export function CategoryPieChart({ transactions, title, type }: CategoryPieChartProps) {
  const COLORS = type === 'income' 
    ? ['#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'] 
    : ['#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'];
  
  const data = useMemo(() => {
    // Group transactions by category
    const categories: Record<string, number> = {};
    
    transactions.forEach(transaction => {
      const category = transaction.category || 'Outros';
      categories[category] = (categories[category] || 0) + transaction.amount;
    });
    
    // Convert to array and sort by value
    const result = Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    
    // If there are too many categories, group smaller ones
    if (result.length > 5) {
      const topCategories = result.slice(0, 4);
      const otherValue = result.slice(4).reduce((sum, item) => sum + item.value, 0);
      
      return [
        ...topCategories,
        { name: 'Outros', value: otherValue }
      ];
    }
    
    return result;
  }, [transactions]);
  
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {type === 'income' ? 'De onde vem o dinheiro' : 'Para onde vai o dinheiro'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {total > 0 ? (
          <>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend formatter={(value) => <span style={{ color: '#888', fontSize: '0.875rem' }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 space-y-2">
              {data.map((category, index) => (
                <div key={category.name} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                    />
                    <span>{category.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">
                      {formatCurrency(category.value)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round((category.value / total) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-[250px]">
            <p className="text-muted-foreground">Sem dados para exibir</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
