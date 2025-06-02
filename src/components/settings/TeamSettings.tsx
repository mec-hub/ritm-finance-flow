
import { useState } from 'react';
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
import { UserPlus, MoreVertical, Edit, Trash2, Mail } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'pending' | 'inactive';
  joinDate: string;
  avatar?: string;
}

export function TeamSettings() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'João Silva',
      email: 'joao@empresa.com',
      role: 'admin',
      status: 'active',
      joinDate: '2024-01-15',
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@empresa.com',
      role: 'manager',
      status: 'active',
      joinDate: '2024-02-20',
    },
    {
      id: '3',
      name: 'Pedro Costa',
      email: 'pedro@empresa.com',
      role: 'member',
      status: 'pending',
      joinDate: '2024-03-10',
    },
  ]);

  const [newMember, setNewMember] = useState({
    email: '',
    role: 'member'
  });

  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  const handleInviteMember = () => {
    if (!newMember.email) {
      toast({
        title: "Erro",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      });
      return;
    }

    const newId = (teamMembers.length + 1).toString();
    const member: TeamMember = {
      id: newId,
      name: newMember.email.split('@')[0],
      email: newMember.email,
      role: newMember.role,
      status: 'pending',
      joinDate: new Date().toISOString().split('T')[0],
    };

    setTeamMembers(prev => [...prev, member]);
    setNewMember({ email: '', role: 'member' });
    setIsInviteDialogOpen(false);

    toast({
      title: "Convite enviado",
      description: `Convite enviado para ${newMember.email}`,
    });
  };

  const handleRemoveMember = (id: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== id));
    toast({
      title: "Membro removido",
      description: "O membro foi removido da equipe.",
    });
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
              <CardTitle>Membros da Equipe</CardTitle>
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
                    Envie um convite para um novo membro se juntar à sua equipe.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
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
                      onValueChange={(value) => setNewMember(prev => ({ ...prev, role: value }))}
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
                  <TableHead>Data de Entrada</TableHead>
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
                    <TableCell>{new Date(member.joinDate).toLocaleDateString()}</TableCell>
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
          <CardTitle>Permissões e Funções</CardTitle>
          <CardDescription>
            Configure as permissões para cada função na sua equipe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Administrador</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Acesso completo ao sistema</li>
                  <li>• Gerenciar equipe e permissões</li>
                  <li>• Configurações avançadas</li>
                  <li>• Relatórios financeiros</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Gerente</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Gerenciar eventos e clientes</li>
                  <li>• Visualizar relatórios</li>
                  <li>• Criar transações</li>
                  <li>• Gerenciar equipe limitado</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Membro</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Visualizar eventos</li>
                  <li>• Criar transações básicas</li>
                  <li>• Acesso limitado a relatórios</li>
                  <li>• Editar próprio perfil</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
