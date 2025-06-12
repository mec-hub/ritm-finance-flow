
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, UserPlus, Settings, Shield, Trash2, Edit, Mail, Phone, Calendar, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
  phone?: string;
  joinDate: Date;
  lastActive?: Date;
  permissions: string[];
}

interface NewMemberForm {
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  phone: string;
}

const EnhancedTeamSettings = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'João Silva',
      email: 'joao@example.com',
      role: 'admin',
      status: 'active',
      phone: '+55 11 99999-9999',
      joinDate: new Date('2023-01-15'),
      lastActive: new Date(),
      permissions: ['all']
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@example.com',
      role: 'manager',
      status: 'active',
      phone: '+55 11 88888-8888',
      joinDate: new Date('2023-03-20'),
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
      permissions: ['transactions', 'clients', 'reports']
    }
  ]);

  const [newMember, setNewMember] = useState<NewMemberForm>({
    name: '',
    email: '',
    role: 'member',
    phone: ''
  });

  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const handleAddMember = () => {
    if (newMember.name && newMember.email) {
      const member: TeamMember = {
        id: Date.now().toString(),
        ...newMember,
        status: 'pending',
        joinDate: new Date(),
        permissions: newMember.role === 'admin' ? ['all'] : ['transactions']
      };
      
      setTeamMembers([...teamMembers, member]);
      setNewMember({
        name: '',
        email: '',
        role: 'member',
        phone: ''
      });
      setIsAddingMember(false);
    }
  };

  const handleEditMember = (member: TeamMember) => {
    if (editingMember) {
      const updatedMembers = teamMembers.map(m => 
        m.id === editingMember.id ? editingMember : m
      );
      setTeamMembers(updatedMembers);
      setEditingMember(null);
    }
  };

  const handleDeleteMember = (id: string) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Gerenciamento de Equipe
          </h2>
          <p className="text-muted-foreground">
            Gerencie membros da equipe, funções e permissões
          </p>
        </div>
        
        <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Adicionar Membro
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Membro</DialogTitle>
              <DialogDescription>
                Adicione um novo membro à sua equipe
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  placeholder="Nome completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                  placeholder="+55 11 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Função</Label>
                <Select value={newMember.role} onValueChange={(value: 'admin' | 'manager' | 'member') => setNewMember({...newMember, role: value})}>
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
              <Button type="submit" onClick={handleAddMember}>
                Adicionar Membro
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Membros</TabsTrigger>
          <TabsTrigger value="roles">Funções & Permissões</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Membros da Equipe ({teamMembers.length})</CardTitle>
              <CardDescription>
                Gerencie todos os membros da sua equipe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Membro</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Último Acesso</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {member.email}
                            </div>
                            {member.phone && (
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {member.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(member.role)}>
                          {member.role === 'admin' ? 'Administrador' : 
                           member.role === 'manager' ? 'Gerente' : 'Membro'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(member.status)}>
                          {member.status === 'active' ? 'Ativo' : 
                           member.status === 'inactive' ? 'Inativo' : 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {member.lastActive ? (
                            <>
                              <div>{member.lastActive.toLocaleDateString('pt-BR')}</div>
                              <div className="text-muted-foreground">
                                {member.lastActive.toLocaleTimeString('pt-BR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            </>
                          ) : (
                            'Nunca'
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingMember(member)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMember(member.id)}
                            className="text-red-600 hover:text-red-700"
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
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Funções e Permissões</CardTitle>
              <CardDescription>
                Configure permissões para cada função
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Role definitions */}
                <div className="grid gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Administrador
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Acesso total ao sistema, incluindo configurações e gerenciamento de equipe
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge variant="secondary">Todas as permissões</Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Gerente
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Gerencia transações, clientes e relatórios
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge variant="secondary">Transações</Badge>
                      <Badge variant="secondary">Clientes</Badge>
                      <Badge variant="secondary">Relatórios</Badge>
                      <Badge variant="secondary">Eventos</Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Membro</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Acesso básico para visualizar e criar transações
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge variant="secondary">Transações</Badge>
                      <Badge variant="secondary">Visualizar Relatórios</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Equipe</CardTitle>
              <CardDescription>
                Configure as configurações gerais da equipe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <Settings className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Em Desenvolvimento</h3>
                <p className="text-muted-foreground">
                  Configurações avançadas de equipe estarão disponíveis em breve.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Member Dialog */}
      {editingMember && (
        <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Membro</DialogTitle>
              <DialogDescription>
                Edite as informações do membro da equipe
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingMember.email}
                  onChange={(e) => setEditingMember({...editingMember, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Telefone</Label>
                <Input
                  id="edit-phone"
                  value={editingMember.phone || ''}
                  onChange={(e) => setEditingMember({...editingMember, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Função</Label>
                <Select value={editingMember.role} onValueChange={(value: 'admin' | 'manager' | 'member') => setEditingMember({...editingMember, role: value})}>
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
                <Label htmlFor="edit-status">Status</Label>
                <Select value={editingMember.status} onValueChange={(value: 'active' | 'inactive' | 'pending') => setEditingMember({...editingMember, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={() => handleEditMember(editingMember)}>
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EnhancedTeamSettings;
