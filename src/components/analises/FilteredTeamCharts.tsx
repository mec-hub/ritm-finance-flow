
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

export function FilteredTeamCharts({ selectedTeamMembers, transactions, timeRange }: FilteredTeamChartsProps) {
  // Prepare data for income vs expenses comparison - use calculated values from selectedTeamMembers
  const incomeExpensesData = selectedTeamMembers.map(member => ({
    name: member.name,
    income: member.income,
    expenses: member.expenses,
    role: member.role
  })).sort((a, b) => (b.income - b.expenses) - (a.income - a.expenses));

  console.log('FilteredTeamCharts - Selected members:', selectedTeamMembers.length);
  console.log('FilteredTeamCharts - Chart data:', incomeExpensesData);

  return (
    <div className="space-y-6">
      {selectedTeamMembers.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <p className="text-muted-foreground">Selecione pelo menos um membro da equipe para visualizar os gráficos</p>
          </CardContent>
        </Card>
      ) : (
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
      )}
    </div>
  );
}
