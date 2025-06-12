
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit } from 'lucide-react';

interface NewMemberForm {
  name: string;
  role: string;
  percentageShare: number;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  percentageShare: number;
  totalPaid: number;
  pendingAmount: number;
}

export const EnhancedTeamSettings = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [newMember, setNewMember] = useState<NewMemberForm>({
    name: '',
    role: '',
    percentageShare: 0
  });
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const handleAddMember = () => {
    if (!newMember.name || !newMember.role) {
      toast({
        title: "Erro",
        description: "Nome e função são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const member: TeamMember = {
      id: Date.now().toString(),
      name: newMember.name,
      role: newMember.role,
      percentageShare: newMember.percentageShare,
      totalPaid: 0,
      pendingAmount: 0
    };

    setMembers([...members, member]);
    setNewMember({ name: '', role: '', percentageShare: 0 });
    
    toast({
      title: "Membro adicionado",
      description: `${member.name} foi adicionado à equipe.`
    });
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
  };

  const handleUpdateMember = () => {
    if (!editingMember) return;
    
    setMembers(members.map(m => m.id === editingMember.id ? editingMember : m));
    setEditingMember(null);
    
    toast({
      title: "Membro atualizado",
      description: `${editingMember.name} foi atualizado com sucesso.`
    });
  };

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
    toast({
      title: "Membro removido",
      description: "O membro foi removido da equipe."
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Novo Membro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                placeholder="Nome do membro"
              />
            </div>
            <div>
              <Label htmlFor="role">Função</Label>
              <Input
                id="role"
                value={newMember.role}
                onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                placeholder="Função na equipe"
              />
            </div>
            <div>
              <Label htmlFor="percentage">Participação (%)</Label>
              <Input
                id="percentage"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={newMember.percentageShare}
                onChange={(e) => setNewMember({ ...newMember, percentageShare: Number(e.target.value) })}
                placeholder="0"
              />
            </div>
          </div>
          <Button onClick={handleAddMember} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Membro
          </Button>
        </CardContent>
      </Card>

      {editingMember && (
        <Card>
          <CardHeader>
            <CardTitle>Editar Membro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Função</Label>
                <Input
                  id="edit-role"
                  value={editingMember.role}
                  onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-percentage">Participação (%)</Label>
                <Input
                  id="edit-percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={editingMember.percentageShare}
                  onChange={(e) => setEditingMember({ ...editingMember, percentageShare: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateMember}>Salvar Alterações</Button>
              <Button variant="outline" onClick={() => setEditingMember(null)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Membros da Equipe</CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum membro cadastrado ainda.
            </p>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{member.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {member.role} • {member.percentageShare}% de participação
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditMember(member)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
