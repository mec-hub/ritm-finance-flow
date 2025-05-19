
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Legend,
} from 'recharts';
import { Transaction } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProjectionChartProps {
  transactions: Transaction[];
  timeRange: string;
}

export function ProjectionChart({
  transactions,
  timeRange,
}: ProjectionChartProps) {
  const [viewMode, setViewMode] = useState<'income' | 'expense' | 'profit'>('profit');

  // Process historical data and create projections
  const getHistoricalAndProjectionData = () => {
    // Group transactions by month
    const transactionsByMonth = new Map<string, { income: number; expense: number; profit: number }>();
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!transactionsByMonth.has(monthKey)) {
        transactionsByMonth.set(monthKey, { income: 0, expense: 0, profit: 0 });
      }
      
      const monthData = transactionsByMonth.get(monthKey)!;
      
      if (transaction.type === 'income') {
        monthData.income += transaction.amount;
      } else {
        monthData.expense += transaction.amount;
      }
      
      monthData.profit = monthData.income - monthData.expense;
    });
    
    // Convert to array and sort chronologically
    const monthlyData = Array.from(transactionsByMonth.entries())
      .map(([key, value]) => {
        const [year, month] = key.split('-').map(Number);
        const date = new Date(year, month - 1);
        return {
          month: date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }),
          income: value.income,
          expense: value.expense,
          profit: value.profit,
          isProjection: false,
          monthNum: month,
          yearNum: year
        };
      })
      .sort((a, b) => {
        if (a.yearNum !== b.yearNum) return a.yearNum - b.yearNum;
        return a.monthNum - b.monthNum;
      });
    
    // Calculate trends for projections based on last 6 months (or available data)
    const dataPointsCount = Math.min(6, monthlyData.length);
    if (dataPointsCount === 0) return [];
    
    const recentData = monthlyData.slice(-dataPointsCount);
    
    const incomeAvgChange = calculateAverageChange(recentData.map(d => d.income));
    const expenseAvgChange = calculateAverageChange(recentData.map(d => d.expense));
    
    // Generate projection for next 6 months
    const projections = [];
    const lastMonth = monthlyData[monthlyData.length - 1];
    
    let lastIncome = lastMonth.income;
    let lastExpense = lastMonth.expense;
    
    for (let i = 1; i <= 6; i++) {
      const nextMonthDate = new Date(lastMonth.yearNum, lastMonth.monthNum - 1 + i);
      const monthStr = nextMonthDate.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
      
      lastIncome = lastIncome * (1 + incomeAvgChange);
      lastExpense = lastExpense * (1 + expenseAvgChange);
      
      projections.push({
        month: monthStr,
        income: lastIncome,
        expense: lastExpense,
        profit: lastIncome - lastExpense,
        isProjection: true,
        monthNum: nextMonthDate.getMonth() + 1,
        yearNum: nextMonthDate.getFullYear()
      });
    }
    
    // Determine how many months to show based on timeRange
    let monthsToShow;
    switch (timeRange) {
      case '30days':
      case '3months':
        monthsToShow = 6;
        break;
      case '6months':
        monthsToShow = 9;
        break;
      case '1year':
        monthsToShow = 12;
        break;
      default: // 'all'
        monthsToShow = 12;
        break;
    }
    
    // Use most recent data points
    const filteredData = [...monthlyData.slice(-monthsToShow), ...projections];
    return filteredData;
  };
  
  const calculateAverageChange = (values: number[]): number => {
    if (values.length <= 1) return 0.05; // Default 5% growth if not enough data
    
    const changes = [];
    for (let i = 1; i < values.length; i++) {
      if (values[i-1] === 0) continue;
      const change = (values[i] - values[i-1]) / values[i-1];
      changes.push(change);
    }
    
    if (changes.length === 0) return 0.05;
    
    // Average of changes
    const avgChange = changes.reduce((sum, val) => sum + val, 0) / changes.length;
    
    // Limit the change rate to a reasonable range
    return Math.max(-0.2, Math.min(0.2, avgChange));
  };
  
  const chartData = getHistoricalAndProjectionData();
  
  // Find the index where projections start
  const projectionIndex = chartData.findIndex(item => item.isProjection);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Projeções Financeiras</CardTitle>
          <CardDescription>
            Tendências e previsões para os próximos 6 meses
          </CardDescription>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select
            value={viewMode}
            onValueChange={(value) => setViewMode(value as any)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Lucro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="profit">Lucro</SelectItem>
              <SelectItem value="income">Receitas</SelectItem>
              <SelectItem value="expense">Despesas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `R$${value/1000}k`} />
              
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), '']}
                labelFormatter={(label) => {
                  const item = chartData.find(d => d.month === label);
                  return `${label}${item?.isProjection ? ' (Projeção)' : ''}`;
                }}
              />
              
              <Legend content={() => (
                <div className="flex items-center justify-center mt-4 space-x-6">
                  <div className="flex items-center">
                    <div className="w-3 h-3 mr-1 rounded-full" 
                      style={{background: viewMode === 'profit' ? '#3b82f6' : 
                              viewMode === 'income' ? '#22c55e' : '#ef4444'}} />
                    <span className="text-xs">Histórico</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 mr-1 rounded-full bg-gray-300" />
                    <span className="text-xs">Projeção</span>
                  </div>
                </div>
              )} />
              
              {/* Show only the selected data series */}
              {viewMode === 'profit' && (
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                  strokeWidth={2}
                />
              )}
              
              {viewMode === 'income' && (
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#22c55e"
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                  strokeWidth={2}
                />
              )}
              
              {viewMode === 'expense' && (
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                  strokeWidth={2}
                />
              )}
              
              {projectionIndex > 0 && (
                <ReferenceLine x={chartData[projectionIndex].month} 
                  stroke="#888" strokeDasharray="3 3"
                  label={{ value: 'Projeção', position: 'top', fill: '#888' }} />
              )}
              
              {projectionIndex > 0 && (
                <ReferenceArea x1={chartData[projectionIndex].month} x2={chartData[chartData.length - 1].month} 
                  fillOpacity={0.1} fill="#ccc" />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Key insight cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          {(() => {
            // Calculate insights
            if (chartData.length === 0) return null;
            
            const lastHistorical = chartData.filter(d => !d.isProjection).pop();
            const lastProjection = chartData.filter(d => d.isProjection).pop();
            
            if (!lastHistorical || !lastProjection) return null;
            
            const profitChange = ((lastProjection.profit - lastHistorical.profit) / Math.abs(lastHistorical.profit)) * 100;
            const incomeChange = ((lastProjection.income - lastHistorical.income) / lastHistorical.income) * 100;
            const expenseChange = ((lastProjection.expense - lastHistorical.expense) / lastHistorical.expense) * 100;
            
            return (
              <>
                <Card className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Lucro Projetado</div>
                      <div className="text-xl font-bold">{formatCurrency(lastProjection.profit)}</div>
                    </div>
                    <div className={`flex items-center ${profitChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {profitChange >= 0 ? (
                        <ArrowUp className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDown className="h-4 w-4 mr-1" />
                      )}
                      <span>{Math.abs(profitChange).toFixed(1)}%</span>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Receita Projetada</div>
                      <div className="text-xl font-bold">{formatCurrency(lastProjection.income)}</div>
                    </div>
                    <div className={`flex items-center ${incomeChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {incomeChange >= 0 ? (
                        <ArrowUp className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDown className="h-4 w-4 mr-1" />
                      )}
                      <span>{Math.abs(incomeChange).toFixed(1)}%</span>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Despesa Projetada</div>
                      <div className="text-xl font-bold">{formatCurrency(lastProjection.expense)}</div>
                    </div>
                    <div className={`flex items-center ${expenseChange <= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {expenseChange >= 0 ? (
                        <ArrowUp className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDown className="h-4 w-4 mr-1" />
                      )}
                      <span>{Math.abs(expenseChange).toFixed(1)}%</span>
                    </div>
                  </div>
                </Card>
              </>
            );
          })()}
        </div>
      </CardContent>
    </Card>
  );
}
