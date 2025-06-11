
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, MoreVertical, Edit, Trash2, Mail, Template, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { TeamManagementService, TeamMember, PercentageTemplate } from '@/services/teamManagementService';

export function EnhancedTeamSettings() {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [templates, setTemplates] = useState<PercentageTemplate[]>([]);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'member' as const,
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
    
    const members = await TeamManagementService.getTeamMembers(user.id);
    const templateList = await TeamManagementService.getPercentageTemplates(user.id);
    
    setTeamMembers(members);
    setTemplates(templateList);
  };

  const handleInviteMember = async () => {
    if (!user || !newMember.name || !newMember.email) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const success = await TeamManagementService.addTeamMember(user.id, newMember);
    
    if (success) {
      toast({
        title: "Membro adicionado",
        description: `${newMember.name} foi adicionado à equipe.`,
      });
      
      await TeamManagementService.sendTeamInvitation(newMember.email, newMember.role, user.id);
      setNewMember({ name: '', email: '', role: 'member', percentageShare: 0 });
      setIsInviteDialogOpen(false);
      loadTeamData();
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o membro à equipe.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const success = await TeamManagementService.removeTeamMember(memberId);
    
    if (success) {
      toast({
        title: "Membro removido",
        description: "O membro foi removido da equipe.",
      });
      loadTeamData();
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível remover o membro.",
        variant: "destructive",
      });
    }
  };

  const handleCreateTemplate = async () => {
    if (!user || !newTemplate.name) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o nome do template.",
        variant: "destructive",
      });
      return;
    }

    const success = await TeamManagementService.createPercentageTemplate(user.id, newTemplate);
    
    if (success) {
      toast({
        title: "Template criado",
        description: `O template "${newTemplate.name}" foi criado com sucesso.`,
      });
      setNewTemplate({
        name: '',
        description: '',
        assignments: [
          { role: 'admin', percentage: 50 },
          { role: 'manager', percentage: 30 },
          { role: 'member', percentage: 20 }
        ]
      });
      setIsTemplateDialogOpen(false);
      loadTeamData();
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível criar o template.",
        variant: "destructive",
      });
    }
  };

  const getRoleLabel = (role: string) => {
    const roles = {
      admin: 'Administrador',
      manager: 'Gerente',
      member: 'Membro'
    };
    return roles[role as keyof typeof roles] || role;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default' as const,
      pending: 'secondary' as const,
      inactive: 'outline' as const
    };
    const labels = {
      active: 'Ativo',
      pending: 'Pendente',
      inactive: 'Inativo'
    };
    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
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
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Convidar Membro
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Convidar Novo Membro</DialogTitle>
                  <DialogDescription>
                    Adicione um novo membro à sua equipe com função e percentual definidos.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      placeholder="Nome do membro"
                      value={newMember.name}
                      onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="exemplo@empresa.com"
                      value={newMember.email}
                      onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Função</Label>
                    <Select
                      value={newMember.role}
                      onValueChange={(value: 'admin' | 'manager' | 'member') => setNewMember(prev => ({ ...prev, role: value }))}
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
                    <Label htmlFor="percentage">Percentual Padrão (%)</Label>
                    <Input
                      id="percentage"
                      type="number"
                      min="0"
                      max="100"
                      value={newMember.percentageShare}
                      onChange={(e) => setNewMember(prev => ({ ...prev, percentageShare: Number(e.target.value) }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleInviteMember}>
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar Convite
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Membro</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Percentual</TableHead>
                  <TableHead>Ganhos Pendentes</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleLabel(member.role)}</TableCell>
                    <TableCell>{getStatusBadge(member.status)}</TableCell>
                    <TableCell>{member.percentageShare}%</TableCell>
                    <TableCell>R$ {member.pendingAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar Função
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Reenviar Convite
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-500"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Template className="h-5 w-5" />
                Templates de Percentual
              </CardTitle>
              <CardDescription>
                Crie e gerencie templates para distribuição automática de percentuais.
              </CardDescription>
            </div>
            <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Template className="h-4 w-4 mr-2" />
                  Novo Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Template de Percentual</DialogTitle>
                  <DialogDescription>
                    Defina como os percentuais serão distribuídos entre as funções da equipe.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="templateName">Nome do Template</Label>
                    <Input
                      id="templateName"
                      placeholder="Ex: Distribuição Padrão"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="templateDescription">Descrição</Label>
                    <Input
                      id="templateDescription"
                      placeholder="Descrição opcional"
                      value={newTemplate.description}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-4">
                    <Label>Distribuição por Função</Label>
                    {newTemplate.assignments.map((assignment, index) => (
                      <div key={assignment.role} className="flex items-center space-x-4">
                        <Label className="w-24">{getRoleLabel(assignment.role)}</Label>
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
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    ))}
                    <div className="text-sm text-muted-foreground">
                      Total: {newTemplate.assignments.reduce((sum, a) => sum + a.percentage, 0)}%
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateTemplate}>
                    Criar Template
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{template.name}</h4>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {template.description && (
                  <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                )}
                <div className="space-y-1">
                  {template.assignments.map((assignment) => (
                    <div key={assignment.role} className="flex justify-between text-sm">
                      <span>{getRoleLabel(assignment.role)}</span>
                      <span>{assignment.percentage}%</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
