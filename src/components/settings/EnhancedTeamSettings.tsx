
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Users, Plus, Edit, Trash2, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { TeamMember } from '@/types';
import { TeamManagementService } from '@/services/teamManagementService';
import { formatCurrency } from '@/utils/formatters';
import { toast } from '@/hooks/use-toast';

export function EnhancedTeamSettings() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [newMember, setNewMember] = useState({
    name: '',
    role: '',
    percentageShare: 0
  });

  const fetchTeamMembers = async () => {
    try {
      const members = await TeamManagementService.getAllMembers();
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
      if (!newMember.name || !newMember.role) {
        toast({
          title: "Erro",
          description: "Nome e função são obrigatórios.",
          variant: "destructive"
        });
        return;
      }

      await TeamManagementService.createMember({
        name: newMember.name,
        role: newMember.role,
        percentageShare: newMember.percentageShare,
        totalPaid: 0,
        pendingAmount: 0
      });

      toast({
        title: "Sucesso",
        description: "Membro da equipe adicionado com sucesso."
      });

      setNewMember({ name: '', role: '', percentageShare: 0 });
      setIsAddDialogOpen(false);
      fetchTeamMembers();
    } catch (error) {
      console.error('Error adding team member:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o membro da equipe.",
        variant: "destructive"
      });
    }
  };

  const handleEditMember = async () => {
    try {
      if (!editingMember) return;

      await TeamManagementService.updateMember(editingMember.id, {
        name: editingMember.name,
        role: editingMember.role,
        percentageShare: editingMember.percentageShare,
        totalPaid: editingMember.totalPaid,
        pendingAmount: editingMember.pendingAmount
      });

      toast({
        title: "Sucesso",
        description: "Membro da equipe atualizado com sucesso."
      });

      setIsEditDialogOpen(false);
      setEditingMember(null);
      fetchTeamMembers();
    } catch (error) {
      console.error('Error updating team member:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o membro da equipe.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    try {
      await TeamManagementService.deleteMember(memberId);
      toast({
        title: "Sucesso",
        description: "Membro da equipe removido com sucesso."
      });
      fetchTeamMembers();
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o membro da equipe.",
        variant: "destructive"
      });
    }
  };

  const totalPercentage = teamMembers.reduce((sum, member) => sum + member.percentageShare, 0);
  const totalPaid = teamMembers.reduce((sum, member) => sum + member.totalPaid, 0);
  const totalPending = teamMembers.reduce((sum, member) => sum + member.pendingAmount, 0);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-32">
            <p>Carregando membros da equipe...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Total Membros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              % Distribuído
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalPercentage === 100 ? 'text-green-500' : 'text-red-500'}`}>
              {totalPercentage.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Total Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {formatCurrency(totalPaid)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Total Pendente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {formatCurrency(totalPending)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Membros da Equipe</CardTitle>
              <CardDescription>
                Gerencie os membros da sua equipe e suas participações
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
                    Preencha as informações do novo membro da equipe
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Função</Label>
                    <Input
                      id="role"
                      value={newMember.role}
                      onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                      placeholder="Ex: DJ, Técnico de Som, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="percentage">Participação (%)</Label>
                    <Input
                      id="percentage"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={newMember.percentageShare}
                      onChange={(e) => setNewMember({ ...newMember, percentageShare: parseFloat(e.target.value) || 0 })}
                      placeholder="0.0"
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
          {teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Nenhum membro cadastrado</h3>
              <p className="text-muted-foreground">
                Adicione membros à sua equipe para começar a gerenciar participações.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h4 className="font-semibold">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                      <Badge variant="outline">
                        {member.percentageShare.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="mt-2 flex space-x-4 text-sm">
                      <span className="text-green-600">
                        Pago: {formatCurrency(member.totalPaid)}
                      </span>
                      <span className="text-yellow-600">
                        Pendente: {formatCurrency(member.pendingAmount)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Dialog open={isEditDialogOpen && editingMember?.id === member.id} onOpenChange={(open) => {
                      setIsEditDialogOpen(open);
                      if (!open) setEditingMember(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingMember({ ...member })}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar Membro</DialogTitle>
                          <DialogDescription>
                            Atualize as informações do membro da equipe
                          </DialogDescription>
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
                                step="0.1"
                                value={editingMember.percentageShare}
                                onChange={(e) => setEditingMember({ ...editingMember, percentageShare: parseFloat(e.target.value) || 0 })}
                              />
                            </div>
                            <Separator />
                            <div>
                              <Label htmlFor="edit-paid">Total Pago</Label>
                              <Input
                                id="edit-paid"
                                type="number"
                                min="0"
                                step="0.01"
                                value={editingMember.totalPaid}
                                onChange={(e) => setEditingMember({ ...editingMember, totalPaid: parseFloat(e.target.value) || 0 })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-pending">Valor Pendente</Label>
                              <Input
                                id="edit-pending"
                                type="number"
                                min="0"
                                step="0.01"
                                value={editingMember.pendingAmount}
                                onChange={(e) => setEditingMember({ ...editingMember, pendingAmount: parseFloat(e.target.value) || 0 })}
                              />
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleEditMember}>
                            Salvar
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover "{member.name}" da equipe? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteMember(member.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
