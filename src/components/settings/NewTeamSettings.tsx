
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Edit, Trash2, Link as LinkIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  percentage_share: number;
  total_paid: number;
  pending_amount: number;
  profile_id?: string;
  profile?: {
    email: string;
    full_name: string;
  };
}

interface Profile {
  id: string;
  email: string;
  full_name: string;
}

export function NewTeamSettings() {
  const { permissions } = usePermissions();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    role: '',
    percentage_share: 0
  });

  useEffect(() => {
    fetchTeamMembers();
    fetchProfiles();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          profiles (email, full_name)
        `)
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

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('full_name');

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const handleAddMember = async () => {
    if (!permissions.canManageTeam) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para gerenciar a equipe.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('team_members')
        .insert({
          name: newMember.name,
          role: newMember.role,
          percentage_share: newMember.percentage_share,
          total_paid: 0,
          pending_amount: 0,
          user_id: userData.user.id
        });

      if (error) throw error;

      toast({
        title: "Membro adicionado",
        description: `${newMember.name} foi adicionado à equipe.`
      });

      setNewMember({ name: '', role: '', percentage_share: 0 });
      setIsAddDialogOpen(false);
      fetchTeamMembers();
    } catch (error) {
      console.error('Error adding team member:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o membro.",
        variant: "destructive"
      });
    }
  };

  const linkMemberToProfile = async (memberId: string, profileId: string) => {
    if (!permissions.canManageTeam) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para gerenciar a equipe.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('team_members')
        .update({ profile_id: profileId })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Vinculação realizada",
        description: "Membro vinculado ao perfil com sucesso."
      });

      fetchTeamMembers();
    } catch (error) {
      console.error('Error linking member to profile:', error);
      toast({
        title: "Erro",
        description: "Não foi possível vincular o membro ao perfil.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!permissions.canManageTeam) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para gerenciar a equipe.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Membro removido",
        description: "O membro foi removido da equipe."
      });

      fetchTeamMembers();
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o membro.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Membros da Equipe</CardTitle>
              <CardDescription>
                Gerencie os membros da sua equipe e vincule-os aos perfis de usuário.
              </CardDescription>
            </div>
            {permissions.canManageTeam && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                      Adicione um novo membro à equipe.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        placeholder="Nome do membro"
                        value={newMember.name}
                        onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Função</Label>
                      <Input
                        id="role"
                        placeholder="Ex: DJ, Técnico de Som"
                        value={newMember.role}
                        onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="percentage">Participação (%)</Label>
                      <Input
                        id="percentage"
                        type="number"
                        min="0"
                        max="100"
                        value={newMember.percentage_share}
                        onChange={(e) => setNewMember(prev => ({ ...prev, percentage_share: Number(e.target.value) }))}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddMember}>
                      Adicionar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Membro</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Participação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          {member.profile && (
                            <p className="text-sm text-muted-foreground">{member.profile.email}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell>{member.percentage_share}%</TableCell>
                    <TableCell>
                      {member.profile_id ? (
                        <Badge variant="default">Vinculado</Badge>
                      ) : (
                        <Badge variant="secondary">Não vinculado</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {!member.profile_id && permissions.canManageTeam && (
                          <Select onValueChange={(value) => linkMemberToProfile(member.id, value)}>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Vincular" />
                            </SelectTrigger>
                            <SelectContent>
                              {profiles.map((profile) => (
                                <SelectItem key={profile.id} value={profile.id}>
                                  {profile.full_name || profile.email}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        {permissions.canManageTeam && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMember(member.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
