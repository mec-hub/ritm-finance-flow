
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, Users, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/formatters';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  percentage_share: number;
}

interface TeamEarnings {
  team_member_id: string;
  team_member_name: string;
  total_earnings: number;
  total_transactions: number;
  avg_percentage: number;
}

export function TeamEarningsDashboard() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [earnings, setEarnings] = useState<TeamEarnings[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    if (teamMembers.length > 0) {
      fetchEarnings();
    }
  }, [teamMembers, selectedPeriod]);

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('name');

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os membros da equipe.",
        variant: "destructive"
      });
    }
  };

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const earningsData: TeamEarnings[] = [];
      
      // Calculate date range based on selected period
      let startDate: Date | null = null;
      let endDate: Date | null = null;
      
      const now = new Date();
      switch (selectedPeriod) {
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1);
          endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31);
          break;
      }

      for (const member of teamMembers) {
        const { data, error } = await supabase
          .rpc('calculate_team_member_earnings', {
            member_id: member.id,
            start_date: startDate?.toISOString().split('T')[0] || null,
            end_date: endDate?.toISOString().split('T')[0] || null
          });

        if (error) throw error;

        if (data && data.length > 0) {
          earningsData.push({
            team_member_id: member.id,
            team_member_name: member.name,
            total_earnings: Number(data[0].total_earnings),
            total_transactions: data[0].total_transactions,
            avg_percentage: Number(data[0].avg_percentage)
          });
        } else {
          earningsData.push({
            team_member_id: member.id,
            team_member_name: member.name,
            total_earnings: 0,
            total_transactions: 0,
            avg_percentage: 0
          });
        }
      }

      setEarnings(earningsData);
    } catch (error) {
      console.error('Error fetching earnings:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de ganhos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const totalEarnings = earnings.reduce((sum, e) => sum + e.total_earnings, 0);
  const totalTransactions = earnings.reduce((sum, e) => sum + e.total_transactions, 0);
  const activeMembers = earnings.filter(e => e.total_transactions > 0).length;

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'month': return 'Este Mês';
      case 'quarter': return 'Este Trimestre';
      case 'year': return 'Este Ano';
      default: return 'Todo o Período';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Period Selection */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Ganhos da Equipe</h2>
          <p className="text-muted-foreground">
            Acompanhe os ganhos e participação de cada membro da equipe
          </p>
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Selecionar período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo o período</SelectItem>
            <SelectItem value="month">Este mês</SelectItem>
            <SelectItem value="quarter">Este trimestre</SelectItem>
            <SelectItem value="year">Este ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Distribuído
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalEarnings)}
            </div>
            <p className="text-xs text-muted-foreground">{getPeriodLabel()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Transações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalTransactions}
            </div>
            <p className="text-xs text-muted-foreground">Com divisão de equipe</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Membros Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeMembers} / {teamMembers.length}
            </div>
            <p className="text-xs text-muted-foreground">Com ganhos no período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {getPeriodLabel()}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchEarnings}
              className="mt-2"
            >
              Atualizar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Membro</CardTitle>
          <CardDescription>
            Ganhos individuais e estatísticas de participação
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center p-6">Carregando dados de ganhos...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Membro</TableHead>
                    <TableHead>Total de Ganhos</TableHead>
                    <TableHead>Transações</TableHead>
                    <TableHead>% Média</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {earnings
                    .sort((a, b) => b.total_earnings - a.total_earnings)
                    .map((earning) => {
                      const member = teamMembers.find(m => m.id === earning.team_member_id);
                      return (
                        <TableRow key={earning.team_member_id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{earning.team_member_name}</div>
                              {member && (
                                <div className="text-sm text-muted-foreground">
                                  {member.role}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-green-600">
                            {formatCurrency(earning.total_earnings)}
                          </TableCell>
                          <TableCell>{earning.total_transactions}</TableCell>
                          <TableCell>{earning.avg_percentage.toFixed(1)}%</TableCell>
                          <TableCell>
                            <Badge 
                              variant={earning.total_transactions > 0 ? "default" : "secondary"}
                            >
                              {earning.total_transactions > 0 ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          )}

          {!loading && earnings.length === 0 && (
            <div className="text-center p-6 text-muted-foreground">
              <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Nenhum dado de ganhos encontrado</p>
              <p className="text-sm">
                Adicione membros da equipe e configure divisões nas transações
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
