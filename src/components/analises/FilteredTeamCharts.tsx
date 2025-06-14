
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

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
  // Filter transactions by time range
  const getFilteredTransactions = () => {
    let filtered = transactions.filter(transaction => transaction.status === 'paid');

    if (timeRange !== 'all') {
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
      
      filtered = filtered.filter(transaction => 
        new Date(transaction.date) >= cutoffDate && new Date(transaction.date) <= now
      );
    }

    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();

  // Calculate team member earnings based on filtered transactions
  const calculateTeamMemberEarnings = () => {
    const earnings: Record<string, { income: number; expenses: number }> = {};
    
    // Initialize earnings for selected members
    selectedTeamMembers.forEach(member => {
      earnings[member.id] = { income: 0, expenses: 0 };
    });

    // Calculate earnings from filtered transactions
    filteredTransactions
      .filter(t => t.teamPercentages && t.teamPercentages.length > 0)
      .forEach(transaction => {
        transaction.teamPercentages?.forEach(assignment => {
          if (earnings[assignment.teamMemberId]) {
            const amount = transaction.amount * (assignment.percentageValue / 100);
            if (transaction.type === 'income') {
              earnings[assignment.teamMemberId].income += amount;
            } else if (transaction.type === 'expense') {
              earnings[assignment.teamMemberId].expenses += amount;
            }
          }
        });
      });

    return earnings;
  };

  const timeRangeEarnings = calculateTeamMemberEarnings();

  // Prepare data for income vs expenses comparison
  const incomeExpensesData = selectedTeamMembers.map(member => {
    const earnings = timeRangeEarnings[member.id] || { income: 0, expenses: 0 };
    return {
      name: member.name,
      income: earnings.income,
      expenses: earnings.expenses,
      role: member.role
    };
  }).sort((a, b) => (b.income - b.expenses) - (a.income - a.expenses));

  // Prepare monthly data for selected team members
  const getMonthlyData = () => {
    const monthlyData: Record<string, Record<string, { income: number; expenses: number }>> = {};
    
    filteredTransactions
      .filter(t => t.teamPercentages && t.teamPercentages.length > 0)
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
            monthlyData[monthKey][memberName] = { income: 0, expenses: 0 };
          }
          
          const amount = transaction.amount * (assignment.percentageValue / 100);
          if (transaction.type === 'income') {
            monthlyData[monthKey][memberName].income += amount;
          } else if (transaction.type === 'expense') {
            monthlyData[monthKey][memberName].expenses += amount;
          }
        });
      });

    // Convert to chart format with profit calculation
    return Object.entries(monthlyData)
      .map(([month, members]) => {
        const monthData: any = { month };
        Object.entries(members).forEach(([memberName, data]) => {
          monthData[memberName] = data.income - data.expenses; // Net profit
        });
        return monthData;
      })
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
          {/* Income vs Expenses Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Receitas vs Despesas - Membros Selecionados</CardTitle>
              <CardDescription>
                Comparação detalhada de receitas e despesas dos membros escolhidos no período selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incomeExpensesData} margin={{ bottom: 50 }}>
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

          {/* Monthly Evolution Chart */}
          {monthlyData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Evolução Mensal - Lucro Líquido por Membro</CardTitle>
                <CardDescription>
                  Evolução mensal do lucro líquido (receitas - despesas) dos membros selecionados no período
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month" 
                        tickFormatter={(value) => {
                          const [year, month] = value.split('-');
                          return `${month}/${year.slice(-2)}`;
                        }}
                      />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(label) => {
                          const [year, month] = label.split('-');
                          return `${month}/${year}`;
                        }}
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
                          connectNulls={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
