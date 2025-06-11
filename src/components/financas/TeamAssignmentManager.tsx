
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus, Calculator } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  percentage_share: number;
}

interface TeamAssignment {
  team_member_id: string;
  team_member_name: string;
  percentage_value: number;
}

interface TeamAssignmentManagerProps {
  transactionId?: string;
  initialAssignments?: TeamAssignment[];
  onAssignmentsChange: (assignments: TeamAssignment[]) => void;
  transactionAmount?: number;
}

export function TeamAssignmentManager({ 
  transactionId, 
  initialAssignments = [], 
  onAssignmentsChange,
  transactionAmount = 0
}: TeamAssignmentManagerProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [assignments, setAssignments] = useState<TeamAssignment[]>(initialAssignments);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [percentage, setPercentage] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    setAssignments(initialAssignments);
  }, [initialAssignments]);

  useEffect(() => {
    onAssignmentsChange(assignments);
  }, [assignments, onAssignmentsChange]);

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
    } finally {
      setLoading(false);
    }
  };

  const addAssignment = () => {
    if (!selectedMember || percentage <= 0) {
      toast({
        title: "Erro",
        description: "Selecione um membro da equipe e defina uma porcentagem válida.",
        variant: "destructive"
      });
      return;
    }

    const member = teamMembers.find(m => m.id === selectedMember);
    if (!member) return;

    // Check if member is already assigned
    if (assignments.find(a => a.team_member_id === selectedMember)) {
      toast({
        title: "Erro",
        description: "Este membro já está atribuído a esta transação.",
        variant: "destructive"
      });
      return;
    }

    const newAssignment: TeamAssignment = {
      team_member_id: selectedMember,
      team_member_name: member.name,
      percentage_value: percentage
    };

    setAssignments([...assignments, newAssignment]);
    setSelectedMember('');
    setPercentage(0);
  };

  const removeAssignment = (memberId: string) => {
    setAssignments(assignments.filter(a => a.team_member_id !== memberId));
  };

  const updateAssignmentPercentage = (memberId: string, newPercentage: number) => {
    setAssignments(assignments.map(a => 
      a.team_member_id === memberId 
        ? { ...a, percentage_value: newPercentage }
        : a
    ));
  };

  const totalPercentage = assignments.reduce((sum, a) => sum + a.percentage_value, 0);
  const remainingPercentage = 100 - totalPercentage;

  const calculateEarning = (percentage: number) => {
    return (transactionAmount * percentage) / 100;
  };

  if (loading) {
    return <div className="text-center p-4">Carregando membros da equipe...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Divisão da Equipe
        </CardTitle>
        <CardDescription>
          Defina como esta transação será dividida entre os membros da equipe
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Assignment Form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
          <div className="space-y-2">
            <Label>Membro da Equipe</Label>
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar membro" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers
                  .filter(member => !assignments.find(a => a.team_member_id === member.id))
                  .map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} - {member.role}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Porcentagem (%)</Label>
            <Input
              type="number"
              min="0"
              max={remainingPercentage}
              value={percentage}
              onChange={(e) => setPercentage(Number(e.target.value))}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label>Valor Estimado</Label>
            <div className="text-lg font-semibold text-green-600">
              R$ {calculateEarning(percentage).toFixed(2)}
            </div>
          </div>

          <div className="flex items-end">
            <Button onClick={addAssignment} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </div>

        {/* Current Assignments */}
        {assignments.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Atribuições Atuais</h4>
              <div className="flex items-center gap-4">
                <Badge variant={totalPercentage === 100 ? "default" : "secondary"}>
                  Total: {totalPercentage}%
                </Badge>
                {remainingPercentage > 0 && (
                  <Badge variant="outline">
                    Restante: {remainingPercentage}%
                  </Badge>
                )}
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Membro</TableHead>
                    <TableHead>Porcentagem</TableHead>
                    <TableHead>Valor Estimado</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.team_member_id}>
                      <TableCell className="font-medium">
                        {assignment.team_member_name}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={assignment.percentage_value}
                          onChange={(e) => updateAssignmentPercentage(
                            assignment.team_member_id, 
                            Number(e.target.value)
                          )}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell className="text-green-600 font-semibold">
                        R$ {calculateEarning(assignment.percentage_value).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAssignment(assignment.team_member_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Validation Messages */}
        {totalPercentage > 100 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">
              ⚠️ A soma das porcentagens não pode exceder 100%
            </p>
          </div>
        )}

        {assignments.length === 0 && (
          <div className="text-center p-6 text-muted-foreground">
            <Calculator className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Nenhuma atribuição de equipe configurada</p>
            <p className="text-sm">Adicione membros da equipe para dividir esta transação</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
