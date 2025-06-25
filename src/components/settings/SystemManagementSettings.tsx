
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Trash2, 
  Settings, 
  Bell, 
  Mail, 
  Smartphone,
  GripVertical,
  Tag
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  isDefault?: boolean;
}

export function SystemManagementSettings() {
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Receita de Eventos', type: 'income', isDefault: true },
    { id: '2', name: 'Serviços Fotográficos', type: 'income', isDefault: true },
    { id: '3', name: 'Equipamentos', type: 'expense', isDefault: true },
    { id: '4', name: 'Transporte', type: 'expense', isDefault: true },
    { id: '5', name: 'Marketing', type: 'expense', isDefault: true },
  ]);
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'income' | 'expense'>('income');
  
  const [notifications, setNotifications] = useState({
    email: {
      enabled: true,
      transactions: true,
      events: true,
      reminders: true,
    },
    push: {
      enabled: true,
      transactions: false,
      events: true,
      reminders: true,
    },
    inApp: {
      enabled: true,
      sound: true,
    }
  });

  const addCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um nome para a categoria.",
        variant: "destructive"
      });
      return;
    }

    const newCategory: Category = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      type: newCategoryType,
      isDefault: false
    };

    setCategories([...categories, newCategory]);
    setNewCategoryName('');
    
    toast({
      title: "Categoria adicionada",
      description: `A categoria "${newCategory.name}" foi adicionada com sucesso.`
    });
  };

  const removeCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    
    if (category?.isDefault) {
      toast({
        title: "Erro",
        description: "Não é possível remover categorias padrão do sistema.",
        variant: "destructive"
      });
      return;
    }

    setCategories(categories.filter(c => c.id !== categoryId));
    
    toast({
      title: "Categoria removida",
      description: `A categoria "${category?.name}" foi removida.`
    });
  };

  const updateNotificationSetting = (section: string, setting: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [setting]: value
      }
    }));
    
    toast({
      title: "Configuração atualizada",
      description: "Suas preferências de notificação foram salvas."
    });
  };

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Gerenciamento de Categorias
          </CardTitle>
          <CardDescription>
            Adicione, remova e organize as categorias de transações do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="categoryName">Nome da Categoria</Label>
              <Input
                id="categoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Digite o nome da nova categoria"
              />
            </div>
            <div className="w-32">
              <Label htmlFor="categoryType">Tipo</Label>
              <select
                id="categoryType"
                value={newCategoryType}
                onChange={(e) => setNewCategoryType(e.target.value as 'income' | 'expense')}
                className="w-full h-10 px-3 border border-input rounded-md"
              >
                <option value="income">Receita</option>
                <option value="expense">Despesa</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={addCategory}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-green-700">Categorias de Receita</h3>
              <div className="space-y-2">
                {incomeCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-green-50"
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                      <span className="font-medium">{category.name}</span>
                      {category.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Padrão
                        </Badge>
                      )}
                    </div>
                    {!category.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCategory(category.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3 text-red-700">Categorias de Despesa</h3>
              <div className="space-y-2">
                {expenseCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-red-50"
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                      <span className="font-medium">{category.name}</span>
                      {category.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Padrão
                        </Badge>
                      )}
                    </div>
                    {!category.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCategory(category.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Gerenciamento de Notificações
          </CardTitle>
          <CardDescription>
            Configure como e quando você deseja receber notificações do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="font-medium">Notificações por Email</span>
              </div>
              <Switch
                checked={notifications.email.enabled}
                onCheckedChange={(checked) => updateNotificationSetting('email', 'enabled', checked)}
              />
            </div>
            
            {notifications.email.enabled && (
              <div className="ml-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Transações</span>
                  <Switch
                    checked={notifications.email.transactions}
                    onCheckedChange={(checked) => updateNotificationSetting('email', 'transactions', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Eventos</span>
                  <Switch
                    checked={notifications.email.events}
                    onCheckedChange={(checked) => updateNotificationSetting('email', 'events', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Lembretes</span>
                  <Switch
                    checked={notifications.email.reminders}
                    onCheckedChange={(checked) => updateNotificationSetting('email', 'reminders', checked)}
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <span className="font-medium">Notificações Push</span>
              </div>
              <Switch
                checked={notifications.push.enabled}
                onCheckedChange={(checked) => updateNotificationSetting('push', 'enabled', checked)}
              />
            </div>
            
            {notifications.push.enabled && (
              <div className="ml-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Transações</span>
                  <Switch
                    checked={notifications.push.transactions}
                    onCheckedChange={(checked) => updateNotificationSetting('push', 'transactions', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Eventos</span>
                  <Switch
                    checked={notifications.push.events}
                    onCheckedChange={(checked) => updateNotificationSetting('push', 'events', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Lembretes</span>
                  <Switch
                    checked={notifications.push.reminders}
                    onCheckedChange={(checked) => updateNotificationSetting('push', 'reminders', checked)}
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="font-medium">Notificações no App</span>
              </div>
              <Switch
                checked={notifications.inApp.enabled}
                onCheckedChange={(checked) => updateNotificationSetting('inApp', 'enabled', checked)}
              />
            </div>
            
            {notifications.inApp.enabled && (
              <div className="ml-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Som das notificações</span>
                  <Switch
                    checked={notifications.inApp.sound}
                    onCheckedChange={(checked) => updateNotificationSetting('inApp', 'sound', checked)}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
