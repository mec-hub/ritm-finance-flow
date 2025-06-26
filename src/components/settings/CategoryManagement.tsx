
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Tag,
  AlertTriangle
} from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { toast } from '@/hooks/use-toast';
import { Category } from '@/services/categoryService';

export function CategoryManagement() {
  const { 
    categories, 
    loading, 
    error, 
    addCategory, 
    updateCategory, 
    deleteCategory 
  } = useCategories();
  
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editCategoryName, setEditCategoryName] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um nome para a categoria.",
        variant: "destructive"
      });
      return;
    }

    try {
      await addCategory(newCategoryName.trim());
      setNewCategoryName('');
      
      toast({
        title: "Categoria criada",
        description: `A categoria "${newCategoryName.trim()}" foi criada e estará disponível para uso em transações.`
      });
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível criar a categoria.",
        variant: "destructive"
      });
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !editCategoryName.trim()) return;

    if (editCategoryName.trim() === editingCategory.name) {
      setIsEditDialogOpen(false);
      setEditingCategory(null);
      return;
    }

    try {
      await updateCategory(editingCategory.name, editCategoryName.trim());
      setIsEditDialogOpen(false);
      setEditingCategory(null);
      setEditCategoryName('');
      
      toast({
        title: "Categoria atualizada",
        description: `A categoria foi renomeada para "${editCategoryName.trim()}".`
      });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a categoria.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    try {
      await deleteCategory(category.name);
      
      toast({
        title: "Categoria removida",
        description: `A categoria "${category.name}" foi removida de todas as transações.`
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a categoria.",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setEditCategoryName(category.name);
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <p>Carregando categorias...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-red-600">
            <p>Erro ao carregar categorias: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Gerenciamento de Categorias
        </CardTitle>
        <CardDescription>
          Gerencie as categorias das suas transações. Estas categorias são extraídas automaticamente dos seus dados e são usadas nas análises.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new category */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="newCategory">Nova Categoria</Label>
            <Input
              id="newCategory"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Digite o nome da nova categoria"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateCategory()}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleCreateCategory} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </div>

        {/* Categories list */}
        <div className="space-y-2">
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma categoria encontrada.</p>
              <p className="text-sm text-gray-400">
                As categorias aparecem aqui quando são usadas em transações.
              </p>
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category.name}
                className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{category.usageCount} transações</span>
                      {category.lastUsed && (
                        <span>• Último uso: {category.lastUsed.toLocaleDateString('pt-BR')}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {category.usageCount}
                  </Badge>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(category)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                          Remover Categoria
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja remover a categoria "{category.name}"? 
                          Esta ação irá remover a categoria de {category.usageCount} transações.
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteCategory(category)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Remover Categoria
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Categoria</DialogTitle>
              <DialogDescription>
                Altere o nome da categoria. Isso atualizará todas as transações que usam esta categoria.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editName">Nome da Categoria</Label>
                <Input
                  id="editName"
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  placeholder="Digite o novo nome"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditCategory} className="bg-blue-600 hover:bg-blue-700">
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
