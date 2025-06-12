
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { TeamManagementService } from '@/services/teamManagementService';
import { TeamMember } from '@/types';
import { Plus, Edit, Trash2, Users, TrendingUp, DollarSign, UserCheck } from 'lucide-react';

export const EnhancedTeamSettings = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [newMember, setNewMember] = useState({
    name: '',
    role: '',
    percentage_share: 0
  });

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const members = await TeamManagementService.getTeamMembers();
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

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const handleAddMember = async () => {
    try {
      if (!newMember.name.trim()) {
        toast({
          title: "Erro",
          description: "Nome é obrigatório.",
          variant: "destructive"
        });
        return;
      }

      await TeamManagementService.createTeamMember({
        name: newMember.name,
        role: newMember.role,
        percentage_share: newMember.percentage_share
      });

      setNewMember({ name: '', role: '', percentage_share: 0 });
      setIsAddDialogOpen(false);
      fetchTeamMembers();
      
      toast({
        title: "Sucesso",
        description: "Membro adicionado à equipe com sucesso."
      });
    } catch (error) {
      console.error('Error adding team member:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o membro à equipe.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateMember = async () => {
    if (!editingMember) return;

    try {
      await TeamManagementService.updateTeamMember(editingMember.id, {
        name: editingMember.name,
        role: editingMember.role,
        percentage_share: editingMember.percentage_share
      });

      setEditingMember(null);
      fetchTeamMembers();
      
      toast({
        title: "Sucesso",
        description: "Membro atualizado com sucesso."
      });
    } catch (error) {
      console.error('Error updating team member:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o membro.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    try {
      await TeamManagementService.deleteTeamMember(memberId);
      fetchTeamMembers();
      
      toast({
        title: "Sucesso",
        description: "Membro removido da equipe."
      });
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o membro.",
        variant: "destructive"
      });
    }
  };

  const getTotalPercentage = () => {
    return teamMembers.reduce((total, member) => total + (member.percentage_share || 0), 0);
  };

  const totalPercentage = getTotalPercentage();
  const isValidPercentage = totalPercentage <= 100;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestão da Equipe
              </CardTitle>
              <CardDescription>
                Gerencie os membros da sua equipe e suas participações nos projetos.
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
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
                      value={newMember.percentage_share}
                      onChange={(e) => setNewMember({ ...newMember, percentage_share: Number(e.target.value) })}
                      placeholder="0"
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
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="members" className="space-y-4">
            <TabsList>
              <TabsTrigger value="members">Membros</TabsTrigger>
              <TabsTrigger value="analytics">Análises</TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="space-y-4">
              {/* Percentage Overview */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Distribuição Total</span>
                  <Badge variant={isValidPercentage ? "default" : "destructive"}>
                    {totalPercentage.toFixed(1)}%
                  </Badge>
                </div>
                <Progress value={totalPercentage} className="h-2" />
                {!isValidPercentage && (
                  <p className="text-sm text-destructive mt-1">
                    A distribuição total não pode exceder 100%
                  </p>
                )}
              </div>

              {/* Team Members List */}
              <div className="space-y-3">
                {teamMembers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum membro na equipe ainda.</p>
                    <p className="text-sm">Adicione membros para começar a gerenciar sua equipe.</p>
                  </div>
                ) : (
                  teamMembers.map((member) => (
                    <Card key={member.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <h4 className="font-medium">{member.name}</h4>
                              {member.role && (
                                <p className="text-sm text-muted-foreground">{member.role}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <Badge variant="outline">
                                {(member.percentage_share || 0).toFixed(1)}%
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Financial Summary */}
                          <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t">
                            <div>
                              <p className="text-xs text-muted-foreground">Total Pago</p>
                              <p className="font-medium">R$ {(member.total_paid || 0).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Pendente</p>
                              <p className="font-medium text-orange-600">R$ {(member.pending_amount || 0).toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setEditingMember(member)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Editar Membro</DialogTitle>
                              </DialogHeader>
                              {editingMember && (
                                <div className="space-y-4">
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
                                      value={editingMember.role || ''}
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
                                      value={editingMember.percentage_share || 0}
                                      onChange={(e) => setEditingMember({ ...editingMember, percentage_share: Number(e.target.value) })}
                                    />
                                  </div>
                                </div>
                              )}
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setEditingMember(null)}>
                                  Cancelar
                                </Button>
                                <Button onClick={handleUpdateMember}>
                                  Salvar
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteMember(member.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Membros</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{teamMembers.length}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      R$ {teamMembers.reduce((sum, member) => sum + (member.total_paid || 0), 0).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pendente</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      R$ {teamMembers.reduce((sum, member) => sum + (member.pending_amount || 0), 0).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
