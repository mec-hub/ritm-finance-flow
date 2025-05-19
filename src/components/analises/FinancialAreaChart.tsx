
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { Button } from '@/components/ui/button';

interface FinancialAreaChartProps {
  transactions: Transaction[];
  timeRange: string;
}

export function FinancialAreaChart({ transactions, timeRange }: FinancialAreaChartProps) {
  const [showNet, setShowNet] = useState(true);

  // Process data for chart
  const processChartData = () => {
    // Important: Only use actually existing transactions from the transactions array
    // Do not project or calculate additional months based on recurrence settings
    const monthlyData: Record<string, { month: string; income: number; expenses: number; net: number }> = {};
    
    // Determine date range based on timeRange
    let months;
    const now = new Date();
    
    switch (timeRange) {
      case '30days':
        // For 30 days, use last 30 days by week
        months = Array.from({ length: 4 }, (_, i) => {
          const date = new Date();
          date.setDate(now.getDate() - (3 - i) * 7);
          return `Sem ${i + 1}`;
        });
        break;
      case '3months':
        months = Array.from({ length: 3 }, (_, i) => {
          const date = new Date();
          date.setMonth(now.getMonth() - 2 + i);
          return date.toLocaleString('pt-BR', { month: 'short' });
        });
        break;
      case '6months':
        months = Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(now.getMonth() - 5 + i);
          return date.toLocaleString('pt-BR', { month: 'short' });
        });
        break;
      case '1year':
        months = Array.from({ length: 12 }, (_, i) => {
          const date = new Date();
          date.setMonth(now.getMonth() - 11 + i);
          return date.toLocaleString('pt-BR', { month: 'short' });
        });
        break;
      default: // 'all'
        // For all time, use the distinct months from transactions
        const uniqueMonths = new Set<string>();
        transactions.forEach(t => {
          const date = new Date(t.date);
          uniqueMonths.add(date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }));
        });
        months = Array.from(uniqueMonths).sort((a, b) => {
          // Sort months chronologically
          const dateA = new Date(a.replace(' ', '/') + '/2000');
          const dateB = new Date(b.replace(' ', '/') + '/2000');
          return dateA.getTime() - dateB.getTime();
        });
        break;
    }
    
    // Initialize monthly data
    months.forEach(month => {
      monthlyData[month] = {
        month,
        income: 0,
        expenses: 0,
        net: 0
      };
    });
    
    // Aggregate transaction data - ONLY using actual transactions in the array
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      let periodKey;
      
      if (timeRange === '30days') {
        // For 30 days, group by week
        const daysAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        const weekNumber = Math.floor(daysAgo / 7);
        if (weekNumber < 4) {
          periodKey = `Sem ${4 - weekNumber}`;
        } else {
          return; // Skip transactions older than 4 weeks
        }
      } else if (timeRange === 'all') {
        // For all time, use month and year
        periodKey = date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
        if (!monthlyData[periodKey]) return; // Skip if not in our months list
      } else {
        // For other ranges, use just month
        periodKey = date.toLocaleString('pt-BR', { month: 'short' });
        if (!monthlyData[periodKey]) return; // Skip if not in our months list
      }
      
      if (transaction.type === 'income') {
        monthlyData[periodKey].income += transaction.amount;
      } else {
        monthlyData[periodKey].expenses += transaction.amount;
      }
      
      // Calculate net
      monthlyData[periodKey].net = monthlyData[periodKey].income - monthlyData[periodKey].expenses;
    });
    
    return Object.values(monthlyData);
  };

  const chartData = processChartData();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Receita vs Despesas</CardTitle>
          <CardDescription>Visão financeira ao longo do tempo</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowNet(!showNet)}
        >
          {showNet ? 'Ocultar Líquido' : 'Mostrar Líquido'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" />
              <YAxis
                tickFormatter={(value) => `R$${value/1000}k`}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), '']}
              />
              <Area 
                type="monotone" 
                dataKey="income" 
                stackId="1"
                stroke="#22c55e" 
                fill="#22c55e"
                fillOpacity={0.2}
                strokeWidth={2}
                name="Receitas"
              />
              <Area 
                type="monotone" 
                dataKey="expenses" 
                stackId="2"
                stroke="#ef4444" 
                fill="#ef4444"
                fillOpacity={0.2}
                strokeWidth={2}
                name="Despesas"
              />
              {showNet && (
                <Area 
                  type="monotone" 
                  dataKey="net" 
                  stackId="3"
                  stroke="#3b82f6" 
                  fill="#3b82f6"
                  fillOpacity={0.1}
                  strokeWidth={2}
                  name="Líquido"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
