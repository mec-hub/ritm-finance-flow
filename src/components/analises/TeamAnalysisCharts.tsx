
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ComposedChart } from 'recharts';
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
  status: 'paid' | 'not_paid' | 'canceled';
  teamPercentages?: Array<{
    teamMemberId: string;
    teamMemberName?: string;
    percentageValue: number;
  }>;
}

interface TeamAnalysisChartsProps {
  teamMembers: TeamMember[];
  transactions: Transaction[];
  timeRange: string;
}

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];

export function TeamAnalysisCharts({ teamMembers, transactions, timeRange }: TeamAnalysisChartsProps) {
  const [selectedMetric, setSelectedMetric] = useState<'profit' | 'income' | 'expenses'>('profit');
  const [chartType, setChartType] = useState<'comparison' | 'categories' | 'timeline'>('comparison');

  // Prepare data for team member comparison chart
  const teamComparisonData = teamMembers.map(member => ({
    name: member.name,
    income: member.income,
    expenses: member.expenses,
    profit: member.profit,
    role: member.role
  })).sort((a, b) => b[selectedMetric] - a[selectedMetric]);

  // Prepare data for team member pie chart
  const teamPieData = teamMembers
    .filter(member => member[selectedMetric] > 0)
    .map(member => ({
      name: member.name,
      value: member[selectedMetric],
      percentage: 0
    }));

  const totalValue = teamPieData.reduce((sum, item) => sum + item.value, 0);
  teamPieData.forEach(item => {
    item.percentage = Math.round((item.value / totalValue) * 100);
  });

  // Prepare category analysis by team member
  const getCategoryAnalysisByTeam = () => {
    const categoryData: Record<string, Record<string, number>> = {};
    
    transactions
      .filter(t => t.status === 'paid' && t.teamPercentages && t.teamPercentages.length > 0)
      .forEach(transaction => {
        transaction.teamPercentages?.forEach(assignment => {
          const memberName = assignment.teamMemberName || 'Unknown';
          const category = transaction.category;
          const amount = transaction.amount * (assignment.percentageValue / 100);
          
          if (!categoryData[category]) {
            categoryData[category] = {};
          }
          if (!categoryData[category][memberName]) {
            categoryData[category][memberName] = 0;
          }
          
          if (transaction.type === 'income') {
            categoryData[category][memberName] += amount;
          }
        });
      });

    // Convert to chart format
    return Object.entries(categoryData).map(([category, members]) => ({
      category,
      ...members,
      total: Object.values(members).reduce((sum: number, value: number) => sum + value, 0)
    })).sort((a, b) => b.total - a.total).slice(0, 6); // Top 6 categories
  };

  const categoryAnalysisData = getCategoryAnalysisByTeam();

  // Timeline analysis
  const getTimelineData = () => {
    const timelineData: Record<string, Record<string, number>> = {};
    
    transactions
      .filter(t => t.status === 'paid' && t.teamPercentages && t.teamPercentages.length > 0)
      .forEach(transaction => {
        const monthKey = `${transaction.date.getFullYear()}-${String(transaction.date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!timelineData[monthKey]) {
          timelineData[monthKey] = {};
        }
        
        transaction.teamPercentages?.forEach(assignment => {
          const memberName = assignment.teamMemberName || 'Unknown';
          if (!timelineData[monthKey][memberName]) {
            timelineData[monthKey][memberName] = 0;
          }
          
          const amount = transaction.amount * (assignment.percentageValue / 100);
          if (transaction.type === 'income') {
            timelineData[monthKey][memberName] += amount;
          } else if (transaction.type === 'expense') {
            timelineData[monthKey][memberName] -= amount;
          }
        });
      });

    return Object.entries(timelineData)
      .map(([month, members]) => ({
        month,
        ...members
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months
  };

  const timelineData = getTimelineData();

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="flex flex-wrap gap-4">
        <Select value={chartType} onValueChange={setChartType as any}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tipo de Análise" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="comparison">Comparação da Equipe</SelectItem>
            <SelectItem value="categories">Análise por Categoria</SelectItem>
            <SelectItem value="timeline">Evolução Temporal</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedMetric} onValueChange={setSelectedMetric as any}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Métrica" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="profit">Lucro</SelectItem>
            <SelectItem value="income">Receita</SelectItem>
            <SelectItem value="expenses">Despesas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Team Comparison Chart */}
      {chartType === 'comparison' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Comparação da Equipe - {selectedMetric === 'profit' ? 'Lucro' : selectedMetric === 'income' ? 'Receita' : 'Despesas'}</CardTitle>
              <CardDescription>Performance individual dos membros da equipe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamComparisonData}>
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
                      formatter={(value: number) => [formatCurrency(value), selectedMetric === 'profit' ? 'Lucro' : selectedMetric === 'income' ? 'Receita' : 'Despesas']}
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

          <Card>
            <CardHeader>
              <CardTitle>Distribuição - {selectedMetric === 'profit' ? 'Lucro' : selectedMetric === 'income' ? 'Receita' : 'Despesas'}</CardTitle>
              <CardDescription>Participação percentual de cada membro</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={teamPieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={(entry) => `${entry.name}: ${entry.percentage}%`}
                    >
                      {teamPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Analysis */}
      {chartType === 'categories' && (
        <Card>
          <CardHeader>
            <CardTitle>Receitas por Categoria e Membro da Equipe</CardTitle>
            <CardDescription>Distribuição de receitas por categoria para cada membro da equipe</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryAnalysisData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="category" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                  />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    labelStyle={{ color: '#000' }}
                  />
                  {teamMembers.map((member, index) => (
                    <Bar 
                      key={member.id}
                      dataKey={member.name}
                      stackId="a"
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline Analysis */}
      {chartType === 'timeline' && (
        <Card>
          <CardHeader>
            <CardTitle>Evolução dos Ganhos da Equipe</CardTitle>
            <CardDescription>Performance temporal de cada membro da equipe</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    labelStyle={{ color: '#000' }}
                  />
                  {teamMembers.map((member, index) => (
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
    </div>
  );
}
