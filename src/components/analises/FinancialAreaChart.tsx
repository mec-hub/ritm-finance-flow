
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/utils/formatters';
import { Transaction } from '@/types';
import { format, startOfMonth, eachMonthOfInterval, min, max } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FinancialAreaChartProps {
  transactions: Transaction[];
  timeRange: string;
}

export function FinancialAreaChart({ transactions, timeRange }: FinancialAreaChartProps) {
  // Process transactions to create monthly data
  const processMonthlyData = () => {
    if (transactions.length === 0) return [];

    // Get date range
    const dates = transactions.map(t => new Date(t.date));
    const minDate = min(dates);
    const maxDate = max(dates);

    // Generate all months in the range
    const months = eachMonthOfInterval({
      start: startOfMonth(minDate),
      end: startOfMonth(maxDate)
    });

    // Initialize monthly data - FIX: Sort chronologically (oldest to newest)
    const monthlyData = months
      .sort((a, b) => a.getTime() - b.getTime()) // Ensure chronological order
      .map(month => ({
        month: format(month, 'yyyy-MM'),
        monthName: format(month, 'MMM yyyy', { locale: ptBR }),
        income: 0,
        expenses: 0,
        profit: 0,
        date: month
      }));

    // Group transactions by month
    transactions.forEach(transaction => {
      const transactionMonth = format(startOfMonth(new Date(transaction.date)), 'yyyy-MM');
      const monthData = monthlyData.find(m => m.month === transactionMonth);
      
      if (monthData) {
        if (transaction.type === 'income') {
          monthData.income += transaction.amount;
        } else if (transaction.type === 'expense') {
          monthData.expenses += transaction.amount;
        }
        monthData.profit = monthData.income - monthData.expenses;
      }
    });

    return monthlyData;
  };

  const monthlyData = processMonthlyData();

  if (monthlyData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Receitas & Despesas ao Longo do Tempo</CardTitle>
          <CardDescription>Análise temporal das suas finanças</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma transação encontrada para o período selecionado.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receitas & Despesas ao Longo do Tempo</CardTitle>
        <CardDescription>
          Evolução mensal das suas finanças
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="monthName" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  formatCurrency(value), 
                  name === 'income' ? 'Receitas' : 'Despesas'
                ]}
                labelStyle={{ color: '#000' }}
              />
              <Area 
                type="monotone" 
                dataKey="income" 
                stackId="1" 
                stroke="#10B981" 
                fill="url(#colorIncome)"
                name="Receitas"
              />
              <Area 
                type="monotone" 
                dataKey="expenses" 
                stackId="2" 
                stroke="#EF4444" 
                fill="url(#colorExpenses)"
                name="Despesas"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Total Receitas</div>
            <div className="text-lg font-semibold text-green-500">
              {formatCurrency(monthlyData.reduce((sum, m) => sum + m.income, 0))}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Total Despesas</div>
            <div className="text-lg font-semibold text-red-500">
              {formatCurrency(monthlyData.reduce((sum, m) => sum + m.expenses, 0))}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Lucro Líquido</div>
            <div className={`text-lg font-semibold ${
              monthlyData.reduce((sum, m) => sum + m.profit, 0) >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {formatCurrency(monthlyData.reduce((sum, m) => sum + m.profit, 0))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
