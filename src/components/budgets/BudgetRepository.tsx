
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Search, Plus, Filter, Grid, List } from 'lucide-react';
import { Budget, CreateBudgetData, UpdateBudgetData } from '@/types/budget';
import { BudgetService } from '@/services/budgetService';
import { BudgetCard } from './BudgetCard';
import { BudgetForm } from './BudgetForm';
import { BudgetDetails } from './BudgetDetails';
import { toast } from '@/hooks/use-toast';

export function BudgetRepository() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [filteredBudgets, setFilteredBudgets] = useState<Budget[]>([]);
  const [attachmentCounts, setAttachmentCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Dialogs
  const [formDialog, setFormDialog] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  
  // States for operations
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchBudgets = async () => {
    try {
      console.log('BudgetRepository - Fetching budgets...');
      const budgetsData = await BudgetService.getAll();
      setBudgets(budgetsData);
      setFilteredBudgets(budgetsData);
      
      // Fetch attachment counts for each budget
      const counts: Record<string, number> = {};
      for (const budget of budgetsData) {
        try {
          const attachments = await BudgetService.getAttachments(budget.id);
          counts[budget.id] = attachments.length;
        } catch (error) {
          console.error('Error fetching attachments for budget:', budget.id, error);
          counts[budget.id] = 0;
        }
      }
      setAttachmentCounts(counts);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os orçamentos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...budgets];

    if (searchQuery) {
      filtered = filtered.filter(budget =>
        budget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        budget.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        budget.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(budget => budget.budget_type === typeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(budget => budget.status === statusFilter);
    }

    setFilteredBudgets(filtered);
  }, [budgets, searchQuery, typeFilter, statusFilter]);

  const handleCreateBudget = async (data: CreateBudgetData) => {
    setFormLoading(true);
    try {
      await BudgetService.create(data);
      toast({
        title: "Sucesso",
        description: "Orçamento criado com sucesso.",
      });
      setFormDialog(false);
      fetchBudgets();
    } catch (error) {
      console.error('Error creating budget:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o orçamento.",
        variant: "destructive"
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateBudget = async (data: UpdateBudgetData) => {
    if (!selectedBudget) return;
    
    setFormLoading(true);
    try {
      await BudgetService.update(selectedBudget.id, data);
      toast({
        title: "Sucesso",
        description: "Orçamento atualizado com sucesso.",
      });
      setFormDialog(false);
      setSelectedBudget(null);
      fetchBudgets();
    } catch (error) {
      console.error('Error updating budget:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o orçamento.",
        variant: "destructive"
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteBudget = async () => {
    if (!selectedBudget) return;
    
    try {
      await BudgetService.delete(selectedBudget.id);
      toast({
        title: "Sucesso",
        description: "Orçamento excluído com sucesso.",
      });
      setDeleteDialog(false);
      setSelectedBudget(null);
      fetchBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o orçamento.",
        variant: "destructive"
      });
    }
  };

  const handleArchiveBudget = async (budget: Budget) => {
    try {
      await BudgetService.update(budget.id, { status: 'archived' });
      toast({
        title: "Sucesso",
        description: "Orçamento arquivado com sucesso.",
      });
      fetchBudgets();
    } catch (error) {
      console.error('Error archiving budget:', error);
      toast({
        title: "Erro",
        description: "Não foi possível arquivar o orçamento.",
        variant: "destructive"
      });
    }
  };

  const openFormDialog = (budget?: Budget) => {
    setSelectedBudget(budget || null);
    setFormDialog(true);
  };

  const openDetailsDialog = (budget: Budget) => {
    setSelectedBudget(budget);
    setDetailsDialog(true);
  };

  const openDeleteDialog = (budget: Budget) => {
    setSelectedBudget(budget);
    setDeleteDialog(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Carregando orçamentos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Repositório de Orçamentos</h1>
          <p className="text-muted-foreground">
            Gerencie e organize seus orçamentos e documentos
          </p>
        </div>
        <Button onClick={() => openFormDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Orçamento
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar orçamentos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="general">Geral</SelectItem>
                  <SelectItem value="project">Projeto</SelectItem>
                  <SelectItem value="event">Evento</SelectItem>
                  <SelectItem value="annual">Anual</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="equipment">Equipamentos</SelectItem>
                  <SelectItem value="personal">Pessoal</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="archived">Arquivado</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filteredBudgets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium text-muted-foreground">
              {budgets.length === 0 ? 'Nenhum orçamento encontrado' : 'Nenhum resultado para os filtros aplicados'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {budgets.length === 0 ? 'Crie seu primeiro orçamento para começar' : 'Tente ajustar os filtros de busca'}
            </p>
            {budgets.length === 0 && (
              <Button onClick={() => openFormDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Orçamento
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
        }>
          {filteredBudgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              attachmentCount={attachmentCounts[budget.id] || 0}
              onView={openDetailsDialog}
              onEdit={openFormDialog}
              onDelete={openDeleteDialog}
              onArchive={handleArchiveBudget}
            />
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={formDialog} onOpenChange={setFormDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <BudgetForm
            budget={selectedBudget || undefined}
            onSubmit={selectedBudget ? handleUpdateBudget : handleCreateBudget}
            onCancel={() => {
              setFormDialog(false);
              setSelectedBudget(null);
            }}
            loading={formLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Orçamento</DialogTitle>
          </DialogHeader>
          {selectedBudget && (
            <BudgetDetails
              budget={selectedBudget}
              onEdit={() => {
                setDetailsDialog(false);
                openFormDialog(selectedBudget);
              }}
              onClose={() => {
                setDetailsDialog(false);
                setSelectedBudget(null);
              }}
              onRefresh={fetchBudgets}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o orçamento "{selectedBudget?.name}"? 
              Esta ação não pode ser desfeita e todos os arquivos anexos também serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedBudget(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBudget}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
