import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Mail, 
  UserPlus, 
  Settings as SettingsIcon,
  Copy,
  Check,
  Users
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { TeamManagementService, PercentageTemplate } from '@/services/teamManagementService';
import { TeamMember } from '@/types';

interface NewMemberForm {
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  percentageShare: number;
}

export function EnhancedTeamSettings() {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [templates, setTemplates] = useState<PercentageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  
  const [newMember, setNewMember] = useState<NewMemberForm>({
    name: '',
    email: '',
    role: 'member',
    percentageShare: 0
  });

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    assignments: [
      { role: 'admin', percentage: 50 },
      { role: 'manager', percentage: 30 },
      { role: 'member', percentage: 20 }
    ]
  });

  useEffect(() => {
    if (user) {
      loadTeamData();
    }
  }, [user]);

  const loadTeamData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [members, templatesList] = await Promise.all([
        TeamManagementService.getAllMembers(),
        TeamManagementService.getPercentageTemplates()
      ]);
      
      setTeamMembers(members);
      setTemplates(templatesList);
    } catch (error) {
      console.error('Error loading team data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados da equipe.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleAddMember = async () => {
    if (!user || !newMember.name || !newMember.email) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      await TeamManagementService.createMember({
        name: newMember.name,
        role: newMember.role,
        percentageShare: newMember.percentageShare
      });
      
      toast({
        title: "Membro adicionado",
        description: "O membro foi adicionado à equipe com sucesso.",
      });
      setNewMember({ name: '', email: '', role: 'member', percentageShare: 0 });
      setShowInviteDialog(false);
      loadTeamData();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o membro.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateMember = async () => {
    if (!editingMember) return;

    try {
      await TeamManagementService.updateMember(editingMember.id, {
        name: editingMember.name,
        role: editingMember.role,
        percentageShare: editingMember.percentageShare
      });
      
      toast({
        title: "Membro atualizado",
        description: "As informações do membro foram atualizadas.",
      });
      setEditingMember(null);
      loadTeamData();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o membro.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await TeamManagementService.deleteMember(memberId);
      
      toast({
        title: "Membro removido",
        description: "O membro foi removido da equipe.",
      });
      loadTeamData();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o membro.",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div>Carregando configurações da equipe...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Team Members Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Membros da Equipe
              </CardTitle>
              <CardDescription>
                Gerencie os membros da sua equipe e suas permissões.
              </CardDescription>
            </div>
            <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar Membro
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Membro</DialogTitle>
                  <DialogDescription>
                    Adicione um novo membro à sua equipe.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="memberName">Nome</Label>
                    <Input
                      id="memberName"
                      value={newMember.name}
                      onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome do membro"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="memberEmail">Email</Label>
                    <Input
                      id="memberEmail"
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="memberRole">Função</Label>
                    <Select
                      value={newMember.role}
                      onValueChange={(value: 'admin' | 'manager' | 'member') => 
                        setNewMember(prev => ({ ...prev, role: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Membro</SelectItem>
                        <SelectItem value="manager">Gerente</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="memberPercentage">Percentual de Participação (%)</Label>
                    <Input
                      id="memberPercentage"
                      type="number"
                      min="0"
                      max="100"
                      value={newMember.percentageShare}
                      onChange={(e) => setNewMember(prev => ({ ...prev, percentageShare: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddMember}>
                      Adicionar Membro
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Participação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(member.role)}>
                      {member.role === 'admin' ? 'Admin' : member.role === 'manager' ? 'Gerente' : 'Membro'}
                    </Badge>
                  </TableCell>
                  <TableCell>{member.percentageShare}%</TableCell>
                  <TableCell>
                    {/* Assuming 'status' is a property of TeamMember */}
                    <Badge className={getStatusBadgeColor(member.status || 'inactive')}>
                      {member.status === 'active' ? 'Ativo' : member.status === 'pending' ? 'Pendente' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingMember(member)}
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Percentage Templates Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Templates de Percentual
              </CardTitle>
              <CardDescription>
                Crie templates para facilitar a atribuição de percentuais em transações.
              </CardDescription>
            </div>
            <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Template
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Template de Percentual</DialogTitle>
                  <DialogDescription>
                    Crie um template para facilitar a atribuição de percentuais.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="templateName">Nome do Template</Label>
                    <Input
                      id="templateName"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome do template"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="templateDescription">Descrição</Label>
                    <Input
                      id="templateDescription"
                      value={newTemplate.description}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição do template"
                    />
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <Label>Atribuições de Percentual</Label>
                    {newTemplate.assignments.map((assignment, index) => (
                      <div key={assignment.role} className="flex items-center space-x-4">
                        <Label className="w-20">{assignment.role === 'admin' ? 'Admin' : assignment.role === 'manager' ? 'Gerente' : 'Membro'}:</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={assignment.percentage}
                          onChange={(e) => {
                            const newAssignments = [...newTemplate.assignments];
                            newAssignments[index].percentage = Number(e.target.value);
                            setNewTemplate(prev => ({ ...prev, assignments: newAssignments }));
                          }}
                          className="w-20"
                        />
                        <span>%</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateTemplate}>
                      Criar Template
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {template.defaultAssignments.map((assignment, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{assignment.teamMemberName || assignment.teamMemberId}:</span>
                        <span>{assignment.percentageValue}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Member Dialog */}
      {editingMember && (
        <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Membro</DialogTitle>
              <DialogDescription>
                Edite as informações do membro da equipe.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Nome</Label>
                <Input
                  id="editName"
                  value={editingMember.name}
                  onChange={(e) => setEditingMember(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editRole">Função</Label>
                <Select
                  value={editingMember.role}
                  onValueChange={(value: 'admin' | 'manager' | 'member') => 
                    setEditingMember(prev => prev ? ({ ...prev, role: value }) : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Membro</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPercentage">Percentual de Participação (%)</Label>
                <Input
                  id="editPercentage"
                  type="number"
                  min="0"
                  max="100"
                  value={editingMember.percentageShare}
                  onChange={(e) => setEditingMember(prev => prev ? ({ ...prev, percentageShare: Number(e.target.value) }) : null)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingMember(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateMember}>
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
const handleCreateTemplate = async () => {
    // Placeholder function, implement the actual logic here
    console.log("Create template function called");
  };
