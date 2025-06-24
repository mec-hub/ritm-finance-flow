
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CalendarIcon, TrendingUp } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
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

interface AnnualTeamChartProps {
  teamMembers: TeamMember[];
  transactions: Transaction[];
  availableYears: number[];
  selectedTeamMembers: string[];
}

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];

export function AnnualTeamChart({ teamMembers, transactions, availableYears, selectedTeamMembers }: AnnualTeamChartProps) {
  const [selectedYear, setSelectedYear] = useState<string>(availableYears[0]?.toString() || '');
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'expenses' | 'profit'>('revenue');

  // Filter transactions for selected year and only paid transactions - INDEPENDENT of global time filter
  const getYearlyTransactions = () => {
    if (!selectedYear) return [];
    
    return transactions.filter(t => 
      t.status === 'paid' && 
      new Date(t.date).getFullYear() === parseInt(selectedYear)
    );
  };

  // Calculate monthly data for selected team members
  const getMonthlyData = () => {
    const yearlyTransactions = getYearlyTransactions();
    const selectedMembers = teamMembers.filter(m => selectedTeamMembers.includes(m.id));
    
    // Initialize 12 months of data
    const monthlyData = [];
    for (let month = 1; month <= 12; month++) {
      const monthData: any = {
        month: `${selectedYear}-${String(month).padStart(2, '0')}`,
        monthName: new Date(parseInt(selectedYear), month - 1, 1).toLocaleDateString('pt-BR', { month: 'short' }),
        monthNumber: month
      };
      
      // Initialize each selected member's data for this month
      selectedMembers.forEach(member => {
        monthData[member.name] = 0;
      });
      
      monthlyData.push(monthData);
    }
    
    // Process transactions and accumulate data by month and member
    yearlyTransactions
      .filter(t => t.teamPercentages && t.teamPercentages.length > 0)
      .forEach(transaction => {
        // Fix: Use getMonth() which returns 0-11, then add 1 to get 1-12
        const transactionMonth = new Date(transaction.date).getMonth() + 1; // 1-12
        const monthDataIndex = transactionMonth - 1; // 0-11 for array index
        
        if (monthDataIndex >= 0 && monthDataIndex < 12) {
          transaction.teamPercentages?.forEach(assignment => {
            const member = selectedMembers.find(m => m.id === assignment.teamMemberId);
            if (member) {
              const amount = transaction.amount * (assignment.percentageValue / 100);
              
              switch (selectedMetric) {
                case 'revenue':
                  if (transaction.type === 'income') {
                    monthlyData[monthDataIndex][member.name] += amount;
                  }
                  break;
                case 'expenses':
                  if (transaction.type === 'expense') {
                    monthlyData[monthDataIndex][member.name] += amount;
                  }
                  break;
                case 'profit':
                  if (transaction.type === 'income') {
                    monthlyData[monthDataIndex][member.name] += amount;
                  } else if (transaction.type === 'expense') {
                    monthlyData[monthDataIndex][member.name] -= amount;
                  }
                  break;
              }
            }
          });
        }
      });

    return monthlyData;
  };

  // Calculate annual totals for selected team members - FIX: Use correct property names
  const getAnnualTotals = () => {
    const yearlyTransactions = getYearlyTransactions();
    const selectedMembers = teamMembers.filter(m => selectedTeamMembers.includes(m.id));
    
    const totals = selectedMembers.map(member => {
      let income = 0;
      let expenses = 0;

      yearlyTransactions.forEach(transaction => {
        if (transaction.teamPercentages && transaction.teamPercentages.length > 0) {
          const assignment = transaction.teamPercentages.find(tp => tp.teamMemberId === member.id);
          if (assignment) {
            const amount = transaction.amount * (assignment.percentageValue / 100);
            if (transaction.type === 'income') {
              income += amount;
            } else if (transaction.type === 'expense') {
              expenses += amount;
            }
          }
        }
      });

      const result = {
        name: member.name,
        role: member.role,
        income,
        expenses,
        profit: income - expenses
      };
      
      // Add the selected metric value for the chart
      switch (selectedMetric) {
        case 'revenue':
          (result as any).revenue = income;
          break;
        case 'expenses':
          (result as any).expenses = expenses;
          break;
        case 'profit':
          (result as any).profit = income - expenses;
          break;
      }
      
      return result;
    }).sort((a, b) => {
      switch (selectedMetric) {
        case 'revenue':
          return b.income - a.income;
        case 'expenses':
          return b.expenses - a.expenses;
        case 'profit':
          return b.profit - a.profit;
        default:
          return 0;
      }
    });

    return totals;
  };

  const monthlyData = getMonthlyData();
  const annualTotals = getAnnualTotals();
  const selectedMembersList = teamMembers.filter(m => selectedTeamMembers.includes(m.id));

  if (!selectedYear || availableYears.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise Anual da Equipe</CardTitle>
          <CardDescription>Nenhum ano disponível para análise</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Não há dados de transações disponíveis para análise anual.
          </div>
        </CardContent>
      </Card>
    );
  }

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'revenue': return 'Receitas';
      case 'expenses': return 'Despesas';
      case 'profit': return 'Lucro Líquido';
      default: return '';
    }
  };

  const getMetricColor = () => {
    switch (selectedMetric) {
      case 'revenue': return '#10B981';
      case 'expenses': return '#EF4444';
      case 'profit': return '#3B82F6';
      default: return '#10B981';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Análise Anual da Equipe
          </CardTitle>
          <CardDescription>
            Análise detalhada por ano com breakdown mensal (independente do filtro de período global)
          </CardDescription>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px]">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedMetric} onValueChange={(value: 'revenue' | 'expenses' | 'profit') => setSelectedMetric(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Métrica" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Receitas</SelectItem>
                <SelectItem value="expenses">Despesas</SelectItem>
                <SelectItem value="profit">Lucro Líquido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          {selectedMembersList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Selecione pelo menos um membro da equipe para visualizar a análise anual
            </div>
          ) : (
            <div className="space-y-6">
              {/* Monthly Breakdown with Bars for Each Team Member */}
              <div>
                <h4 className="text-lg font-medium mb-4">
                  {getMetricLabel()} por Mês - {selectedYear}
                </h4>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="monthName" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip 
                        formatter={(value: number, name: string) => [formatCurrency(value), name]}
                        labelStyle={{ color: '#000' }}
                      />
                      {selectedMembersList.map((member, index) => (
                        <Bar 
                          key={member.id}
                          dataKey={member.name}
                          fill={COLORS[index % COLORS.length]}
                          name={member.name}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Annual Totals - FIX: Use correct dataKey */}
              <div>
                <h4 className="text-lg font-medium mb-4">Totais Anuais - {getMetricLabel()} ({selectedYear})</h4>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={annualTotals} margin={{ bottom: 50 }}>
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
                        formatter={(value: number) => [formatCurrency(value), getMetricLabel()]}
                        labelStyle={{ color: '#000' }}
                      />
                      <Bar 
                        dataKey={selectedMetric} 
                        fill={getMetricColor()}
                        name={getMetricLabel()}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
