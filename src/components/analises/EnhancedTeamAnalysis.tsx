
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ComposedChart } from 'recharts';
import { useState } from 'react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  income: number;
  expenses: number;
  profit: number;
  lastCalculated?: string;
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

interface EnhancedTeamAnalysisProps {
  teamMembers: TeamMember[];
  transactions: Transaction[];
  timeRange: string;
}

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];

export function EnhancedTeamAnalysis({ teamMembers, transactions, timeRange }: EnhancedTeamAnalysisProps) {
  const [selectedMembers, setSelectedMembers] = useState<string[]>(teamMembers.map(m => m.id));
  const [chartType, setChartType] = useState<'totals' | 'monthly'>('totals');

  // Filter by time range
  const getFilteredTransactions = () => {
    if (timeRange === 'all') return transactions;
    
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (timeRange) {
      case '30days':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '3months':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return transactions.filter(t => 
      new Date(t.date) >= cutoffDate && new Date(t.date) <= now
    );
  };

  const filteredTransactions = getFilteredTransactions();

  // Calculate member data based on selected members and filtered transactions
  const getSelectedMemberData = () => {
    return teamMembers
      .filter(member => selectedMembers.includes(member.id))
      .map(member => {
        let income = 0;
        let expenses = 0;

        filteredTransactions
          .filter(t => t.status === 'paid' && t.teamPercentages?.some(tp => tp.teamMemberId === member.id))
          .forEach(transaction => {
            const assignment = transaction.teamPercentages?.find(tp => tp.teamMemberId === member.id);
            if (assignment) {
              const amount = transaction.amount * (assignment.percentageValue / 100);
              if (transaction.type === 'income') {
                income += amount;
              } else if (transaction.type === 'expense') {
                expenses += amount;
              }
            }
          });

        return {
          ...member,
          income,
          expenses,
          profit: income - expenses
        };
      });
  };

  const selectedMemberData = getSelectedMemberData();

  // Monthly analysis data
  const getMonthlyData = () => {
    const monthlyData: Record<string, Record<string, { income: number; expenses: number }>> = {};
    
    filteredTransactions
      .filter(t => t.status === 'paid' && t.teamPercentages && t.teamPercentages.length > 0)
      .forEach(transaction => {
        const monthKey = `${transaction.date.getFullYear()}-${String(transaction.date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {};
        }
        
        transaction.teamPercentages?.forEach(assignment => {
          if (selectedMembers.includes(assignment.teamMemberId)) {
            const memberName = assignment.teamMemberName || 'Unknown';
            if (!monthlyData[monthKey][memberName]) {
              monthlyData[monthKey][memberName] = { income: 0, expenses: 0 };
            }
            
            const amount = transaction.amount * (assignment.percentageValue / 100);
            if (transaction.type === 'income') {
              monthlyData[monthKey][memberName].income += amount;
            } else if (transaction.type === 'expense') {
              monthlyData[monthKey][memberName].expenses += amount;
            }
          }
        });
      });

    return Object.entries(monthlyData)
      .map(([month, members]) => {
        const result: any = { month };
        Object.entries(members).forEach(([memberName, data]) => {
          result[`${memberName}_profit`] = data.income - data.expenses;
        });
        return result;
      })
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months
  };

  const monthlyData = getMonthlyData();

  const handleMemberToggle = (memberId: string, checked: boolean) => {
    if (checked) {
      setSelectedMembers([...selectedMembers, memberId]);
    } else {
      setSelectedMembers(selectedMembers.filter(id => id !== memberId));
    }
  };

  const selectAll = () => {
    setSelectedMembers(teamMembers.map(m => m.id));
  };

  const selectNone = () => {
    setSelectedMembers([]);
  };

  return (
    <div className="space-y-6">
      {/* Team Member Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Seleção de Membros da Equipe</CardTitle>
          <CardDescription>Escolha quais membros incluir na análise</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Selecionar Todos
              </Button>
              <Button variant="outline" size="sm" onClick={selectNone}>
                Desmarcar Todos
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {teamMembers.map(member => (
                <div key={member.id} className="flex items-center space-x-2 p-2 border rounded">
                  <Checkbox
                    id={member.id}
                    checked={selectedMembers.includes(member.id)}
                    onCheckedChange={(checked) => handleMemberToggle(member.id, checked as boolean)}
                  />
                  <label htmlFor={member.id} className="text-sm font-medium cursor-pointer">
                    {member.name}
                    <span className="text-xs text-muted-foreground block">{member.role}</span>
                  </label>
                </div>
              ))}
            </div>
            
            <div className="text-sm text-muted-foreground">
              {selectedMembers.length} de {teamMembers.length} membros selecionados
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart Type Selection */}
      <div className="flex gap-4">
        <Select value={chartType} onValueChange={setChartType as any}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tipo de Análise" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="totals">Totais do Período</SelectItem>
            <SelectItem value="monthly">Evolução Mensal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedMembers.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Selecione pelo menos um membro da equipe para ver a análise
            </div>
          </CardContent>
        </Card>
      )}

      {/* Total Comparison Charts */}
      {chartType === 'totals' && selectedMembers.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Comparação de Receitas vs Despesas</CardTitle>
              <CardDescription>Valores totais para o período selecionado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={selectedMemberData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      interval={0}
                    />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        formatCurrency(value), 
                        name === 'income' ? 'Receita' : name === 'expenses' ? 'Despesas' : 'Lucro'
                      ]}
                      labelStyle={{ color: '#000' }}
                    />
                    <Bar dataKey="income" fill="#10B981" name="income" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" fill="#EF4444" name="expenses" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lucro Líquido por Membro</CardTitle>
              <CardDescription>Diferença entre receitas e despesas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={selectedMemberData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      interval={0}
                    />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Lucro Líquido']}
                      labelStyle={{ color: '#000' }}
                    />
                    <Bar 
                      dataKey="profit" 
                      fill="#3B82F6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monthly Evolution Chart */}
      {chartType === 'monthly' && selectedMembers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Evolução Mensal do Lucro</CardTitle>
            <CardDescription>Comparação mensal entre membros selecionados</CardDescription>
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
                  {selectedMemberData.map((member, index) => (
                    <Line 
                      key={member.id}
                      type="monotone"
                      dataKey={`${member.name}_profit`}
                      stroke={COLORS[index % COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name={member.name}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
