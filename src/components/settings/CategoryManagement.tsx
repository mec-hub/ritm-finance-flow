
import { useState, useEffect } from 'react';
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
import { CategoryService, Category } from '@/services/categoryService';
import { toast } from '@/hooks/use-toast';

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editCategoryName, setEditCategoryName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await CategoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as categorias.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um nome para a categoria.",
        variant: "destructive"
      });
      return;
    }

    // Check if category already exists
    if (categories.some(cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      toast({
        title: "Erro",
        description: "Esta categoria já existe.",
        variant: "destructive"
      });
      return;
    }

    try {
      await CategoryService.createTransaction(newCategoryName.trim());
      setNewCategoryName('');
      toast({
        title: "Categoria criada",
        description: `A categoria "${newCategoryName.trim()}" foi criada. Ela aparecerá na lista quando for usada em uma transação.`
      });
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a categoria.",
        variant: "destructive"
      });
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !editCategoryName.trim()) return;

    if (editCategoryName.trim() === editingCategory.name) {
      setEditingCategory(null);
      return;
    }

    // Check if new name already exists
    if (categories.some(cat => cat.name.toLowerCase() === editCategoryName.trim().toLowerCase() && cat.name !== editingCategory.name)) {
      toast({
        title: "Erro",
        description: "Já existe uma categoria com este nome.",
        variant: "destructive"
      });
      return;
    }

    try {
      await CategoryService.updateCategoryName(editingCategory.name, editCategoryName.trim());
      await fetchCategories();
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
      await CategoryService.deleteCategory(category.name);
      await fetchCategories();
      
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Gerenciamento de Categorias
        </CardTitle>
        <CardDescription>
          Gerencie as categorias das suas transações. Estas categorias são usadas nas análises.
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
            <Button onClick={handleCreateCategory}>
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
                    <h3 className="font-medium">{category.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{category.usageCount} transações</span>
                      {category.lastUsed && (
                        <>
                          <span>•</span>
                          <span>Última vez: {category.lastUsed.toLocaleDateString('pt-BR')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {category.usageCount}
                  </Badge>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingCategory(category);
                          setEditCategoryName(category.name);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
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
                        <Button variant="outline" onClick={() => setEditingCategory(null)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleEditCategory}>
                          Salvar Alterações
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

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
      </CardContent>
    </Card>
  );
}
