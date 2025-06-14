
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Transaction, Event, TeamMember } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ComparisonBarChartProps {
  transactions: Transaction[];
  events: Event[];
  timeRange: string;
  selectedContributor: string;
  teamMembers: TeamMember[];
}

export function ComparisonBarChart({
  transactions,
  events,
  timeRange,
  selectedContributor,
  teamMembers,
}: ComparisonBarChartProps) {
  // Compare team member contributions
  const getTeamComparison = () => {
    const memberContributions: Record<
      string,
      { name: string; income: number; expenses: number; profit: number }
    > = {};

    // Initialize with all team members from database
    teamMembers.forEach((member) => {
      memberContributions[member.id] = {
        name: member.name,
        income: 0,
        expenses: 0,
        profit: 0,
      };
    });

    // Calculate totals for each member based on actual transaction percentages
    transactions.forEach((transaction) => {
      // Check for percentage assignments (primary method)
      if (transaction.teamPercentages && transaction.teamPercentages.length > 0) {
        transaction.teamPercentages.forEach((tp) => {
          if (memberContributions[tp.teamMemberId]) {
            const amount = (transaction.amount * tp.percentageValue) / 100;
            if (transaction.type === 'income') {
              memberContributions[tp.teamMemberId].income += amount;
            } else {
              memberContributions[tp.teamMemberId].expenses += amount;
            }
          }
        });
      }
      // Check if transaction is directly assigned (legacy support)
      else if (transaction.teamMemberId) {
        const memberId = transaction.teamMemberId;
        if (memberContributions[memberId]) {
          if (transaction.type === 'income') {
            memberContributions[memberId].income += transaction.amount;
          } else {
            memberContributions[memberId].expenses += transaction.amount;
          }
        }
      }
    });

    // Calculate profit for each member
    Object.keys(memberContributions).forEach((key) => {
      memberContributions[key].profit =
        memberContributions[key].income - memberContributions[key].expenses;
    });

    return Object.values(memberContributions).filter(member => 
      member.income > 0 || member.expenses > 0 || member.profit !== 0
    );
  };

  // Compare categories
  const getCategoryComparison = () => {
    const incomeCategories: Record<string, number> = {};
    const expenseCategories: Record<string, number> = {};

    // Calculate totals for each category
    transactions.forEach((transaction) => {
      const category = transaction.category || 'Outros';
      
      if (transaction.type === 'income') {
        incomeCategories[category] = (incomeCategories[category] || 0) + transaction.amount;
      } else {
        expenseCategories[category] = (expenseCategories[category] || 0) + transaction.amount;
      }
    });

    // Convert to array format for the chart
    const incomeData = Object.entries(incomeCategories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const expenseData = Object.entries(expenseCategories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return { incomeData, expenseData };
  };

  // Compare time periods
  const getPeriodComparison = () => {
    // Determine periods based on timeRange
    let periods: string[];
    let periodFormat: (date: Date) => string;
    
    switch (timeRange) {
      case '30days':
        periods = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
        periodFormat = (date) => {
          const now = new Date();
          const daysAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
          const weekNumber = Math.floor(daysAgo / 7);
          if (weekNumber < 4) {
            return `Semana ${4 - weekNumber}`;
          }
          return '';
        };
        break;
        
      case '3months':
        periods = Array.from({ length: 3 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - 2 + i);
          return date.toLocaleString('pt-BR', { month: 'short' });
        });
        periodFormat = (date) => date.toLocaleString('pt-BR', { month: 'short' });
        break;
        
      case '6months':
        // Group by 2-month periods
        periods = ['Bimestre 1', 'Bimestre 2', 'Bimestre 3'];
        periodFormat = (date) => {
          const now = new Date();
          const monthsAgo = (now.getFullYear() - date.getFullYear()) * 12 + now.getMonth() - date.getMonth();
          if (monthsAgo <= 6) {
            return `Bimestre ${Math.ceil((6 - monthsAgo) / 2)}`;
          }
          return '';
        };
        break;
        
      case '1year':
        // Group by quarters
        periods = ['Q1', 'Q2', 'Q3', 'Q4'];
        periodFormat = (date) => {
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          return `Q${quarter}`;
        };
        break;
        
      default: // 'all'
        // Group by years
        const years = new Set<number>();
        transactions.forEach(t => {
          const year = new Date(t.date).getFullYear();
          years.add(year);
        });
        periods = Array.from(years).sort().map(y => y.toString());
        periodFormat = (date) => date.getFullYear().toString();
        break;
    }
    
    // Initialize period data
    const periodData = periods.map(period => ({
      name: period,
      income: 0,
      expenses: 0,
      profit: 0,
      events: 0
    }));
    
    // Map periods to their index in the array
    const periodMap = periods.reduce((acc, period, index) => {
      acc[period] = index;
      return acc;
    }, {} as Record<string, number>);
    
    // Aggregate transaction data
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const period = periodFormat(date);
      
      if (period && periodMap[period] !== undefined) {
        if (transaction.type === 'income') {
          periodData[periodMap[period]].income += transaction.amount;
        } else {
          periodData[periodMap[period]].expenses += transaction.amount;
        }
      }
    });
    
    // Calculate profit for each period
    periodData.forEach(period => {
      period.profit = period.income - period.expenses;
    });
    
    // Add event counts
    events.forEach(event => {
      const date = new Date(event.date);
      const period = periodFormat(date);
      
      if (period && periodMap[period] !== undefined) {
        periodData[periodMap[period]].events += 1;
      }
    });
    
    return periodData;
  };

  const teamData = getTeamComparison();
  const { incomeData, expenseData } = getCategoryComparison();
  const periodData = getPeriodComparison();

  return (
    <Tabs defaultValue="team">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="team">Equipe</TabsTrigger>
        <TabsTrigger value="category">Categorias</TabsTrigger>
        <TabsTrigger value="period">Períodos</TabsTrigger>
      </TabsList>
      
      <TabsContent value="team">
        <Card>
          <CardHeader>
            <CardTitle>Comparação de Desempenho da Equipe</CardTitle>
            <CardDescription>
              Análise de contribuição por membro da equipe baseada em percentuais reais
            </CardDescription>
          </CardHeader>
          <CardContent>
            {teamData.length > 0 ? (
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={teamData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `R$${value / 1000}k`} />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar dataKey="income" name="Receitas" fill="#22c55e" />
                    <Bar dataKey="expenses" name="Despesas" fill="#ef4444" />
                    <Bar dataKey="profit" name="Lucro" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum dado de equipe disponível no período selecionado
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="category">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Principais Categorias de Receita</CardTitle>
              <CardDescription>Top 5 categorias por valor total</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={incomeData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" tickFormatter={(value) => `R$${value / 1000}k`} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="value" fill="#22c55e" name="Receita" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Principais Categorias de Despesa</CardTitle>
              <CardDescription>Top 5 categorias por valor total</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={expenseData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" tickFormatter={(value) => `R$${value / 1000}k`} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="value" fill="#ef4444" name="Despesa" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="period">
        <Card>
          <CardHeader>
            <CardTitle>Evolução Financeira por Período</CardTitle>
            <CardDescription>
              Receitas, despesas e número de eventos por período
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={periodData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" tickFormatter={(value) => `R$${value / 1000}k`} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}`} />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'events') return [`${value} eventos`, 'Eventos'];
                      return [formatCurrency(value as number), name];
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="income" name="Receitas" fill="#22c55e" />
                  <Bar yAxisId="left" dataKey="expenses" name="Despesas" fill="#ef4444" />
                  <Bar yAxisId="right" dataKey="events" name="Eventos" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
