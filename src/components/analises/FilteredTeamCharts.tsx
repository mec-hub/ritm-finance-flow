
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useState } from 'react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  income: number;
  expenses: number;
  profit: number;
}

interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: Date;
  category: string;
  type: 'income' | 'expense';
  status?: 'paid' | 'not_paid' | 'canceled';
  teamPercentages?: Array<{
    teamMemberId: string;
    teamMemberName?: string;
    percentageValue: number;
  }>;
}

interface FilteredTeamChartsProps {
  selectedTeamMembers: TeamMember[];
  transactions: Transaction[];
  timeRange: string;
}

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];

export function FilteredTeamCharts({ selectedTeamMembers, transactions, timeRange }: FilteredTeamChartsProps) {
  const [selectedMetric, setSelectedMetric] = useState<'profit' | 'income' | 'expenses'>('profit');

  // Prepare data for total comparison chart
  const totalComparisonData = selectedTeamMembers.map(member => ({
    name: member.name,
    income: member.income,
    expenses: member.expenses,
    profit: member.profit,
    role: member.role
  })).sort((a, b) => b[selectedMetric] - a[selectedMetric]);

  // Prepare monthly data for selected team members
  const getMonthlyData = () => {
    const monthlyData: Record<string, Record<string, number>> = {};
    
    transactions
      .filter(t => (t.status === 'paid' || !t.status) && t.teamPercentages && t.teamPercentages.length > 0)
      .forEach(transaction => {
        const monthKey = `${transaction.date.getFullYear()}-${String(transaction.date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {};
        }
        
        transaction.teamPercentages?.forEach(assignment => {
          const member = selectedTeamMembers.find(m => m.id === assignment.teamMemberId);
          if (!member) return;
          
          const memberName = member.name;
          if (!monthlyData[monthKey][memberName]) {
            monthlyData[monthKey][memberName] = 0;
          }
          
          const amount = transaction.amount * (assignment.percentageValue / 100);
          if (transaction.type === 'income') {
            monthlyData[monthKey][memberName] += amount;
          } else if (transaction.type === 'expense') {
            monthlyData[monthKey][memberName] -= amount;
          }
        });
      });

    return Object.entries(monthlyData)
      .map(([month, members]) => ({
        month,
        ...members
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months
  };

  const monthlyData = getMonthlyData();

  return (
    <div className="space-y-6">
      {selectedTeamMembers.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <p className="text-muted-foreground">Selecione pelo menos um membro da equipe para visualizar os gráficos</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Metric Selector */}
          <div className="flex gap-4">
            <Select value={selectedMetric} onValueChange={setSelectedMetric as any}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Métrica para análise" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="profit">Lucro Líquido</SelectItem>
                <SelectItem value="income">Receitas</SelectItem>
                <SelectItem value="expenses">Despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Total Comparison Chart */}
          <Card>
            <CardHeader>
              <CardTitle>
                Comparação Total - {selectedMetric === 'profit' ? 'Lucro Líquido' : selectedMetric === 'income' ? 'Receitas' : 'Despesas'}
              </CardTitle>
              <CardDescription>
                Comparação dos totais no período selecionado para os membros escolhidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={totalComparisonData} margin={{ bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                    />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip 
                      formatter={(value: number) => [
                        formatCurrency(value), 
                        selectedMetric === 'profit' ? 'Lucro' : selectedMetric === 'income' ? 'Receita' : 'Despesas'
                      ]}
                      labelStyle={{ color: '#000' }}
                    />
                    <Bar 
                      dataKey={selectedMetric} 
                      fill={selectedMetric === 'profit' ? '#10B981' : selectedMetric === 'income' ? '#3B82F6' : '#EF4444'}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Evolution Chart */}
          {monthlyData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Evolução Mensal - Lucro por Membro</CardTitle>
                <CardDescription>
                  Comparação da evolução mensal dos lucros dos membros selecionados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        labelStyle={{ color: '#000' }}
                      />
                      {selectedTeamMembers.map((member, index) => (
                        <Line 
                          key={member.id}
                          type="monotone"
                          dataKey={member.name}
                          stroke={COLORS[index % COLORS.length]}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Income vs Expenses Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Receitas vs Despesas - Membros Selecionados</CardTitle>
              <CardDescription>
                Comparação detalhada de receitas e despesas dos membros escolhidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={totalComparisonData} margin={{ bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                    />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        formatCurrency(value), 
                        name === 'income' ? 'Receita' : 'Despesas'
                      ]}
                      labelStyle={{ color: '#000' }}
                    />
                    <Bar dataKey="income" fill="#10B981" name="income" />
                    <Bar dataKey="expenses" fill="#EF4444" name="expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
