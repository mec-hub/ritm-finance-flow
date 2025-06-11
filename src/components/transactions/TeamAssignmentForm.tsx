
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { TeamPercentageAssignment } from '@/types';
import { TeamManagementService, TeamMember } from '@/services/teamManagementService';
import { toast } from '@/hooks/use-toast';

interface TeamAssignmentFormProps {
  assignments: TeamPercentageAssignment[];
  onChange: (assignments: TeamPercentageAssignment[]) => void;
}

export const TeamAssignmentForm: React.FC<TeamAssignmentFormProps> = ({
  assignments,
  onChange
}) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        // For now, we'll use a dummy user ID since we need to implement proper auth context
        const members = await TeamManagementService.getTeamMembers('dummy-user-id');
        setTeamMembers(members);
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

    fetchTeamMembers();
  }, []);

  const addAssignment = () => {
    const newAssignment: TeamPercentageAssignment = {
      teamMemberId: '',
      percentageValue: 0
    };
    onChange([...assignments, newAssignment]);
  };

  const removeAssignment = (index: number) => {
    const newAssignments = assignments.filter((_, i) => i !== index);
    onChange(newAssignments);
  };

  const updateAssignment = (index: number, field: keyof TeamPercentageAssignment, value: string | number) => {
    const newAssignments = [...assignments];
    if (field === 'teamMemberId') {
      newAssignments[index].teamMemberId = value as string;
      const member = teamMembers.find(m => m.id === value);
      newAssignments[index].teamMemberName = member?.name;
    } else if (field === 'percentageValue') {
      newAssignments[index].percentageValue = Number(value);
    }
    onChange(newAssignments);
  };

  const getTotalPercentage = () => {
    return assignments.reduce((total, assignment) => total + (assignment.percentageValue || 0), 0);
  };

  const totalPercentage = getTotalPercentage();
  const isValidTotal = totalPercentage === 100;

  if (loading) {
    return <div>Carregando membros da equipe...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Distribuição da Equipe
          <Button type="button" variant="outline" size="sm" onClick={addAssignment}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Membro
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {assignments.map((assignment, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
            <div className="flex-1">
              <Label>Membro da Equipe</Label>
              <Select
                value={assignment.teamMemberId}
                onValueChange={(value) => updateAssignment(index, 'teamMemberId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um membro" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers
                    .filter(member => !assignments.some((a, i) => i !== index && a.teamMemberId === member.id))
                    .map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-24">
              <Label>Percentual (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={assignment.percentageValue || ''}
                onChange={(e) => updateAssignment(index, 'percentageValue', e.target.value)}
                placeholder="0"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeAssignment(index)}
              className="mt-6"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {assignments.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            Nenhum membro adicionado. Clique em "Adicionar Membro" para começar.
          </div>
        )}

        {assignments.length > 0 && (
          <div className={`text-sm font-medium ${isValidTotal ? 'text-green-600' : 'text-red-600'}`}>
            Total: {totalPercentage.toFixed(2)}%
            {!isValidTotal && ' (deve somar 100%)'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
