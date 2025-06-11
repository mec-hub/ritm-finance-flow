
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Save, Bell, Mail, Smartphone, TestTube, Clock, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationService, NotificationPreferences, InAppNotification } from '@/services/notificationService';

export function EnhancedNotificationSettings() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationPreferences | null>(null);
  const [inAppNotifications, setInAppNotifications] = useState<InAppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadNotificationSettings();
      loadInAppNotifications();
    }
  }, [user]);

  const loadNotificationSettings = async () => {
    if (!user) return;
    
    const preferences = await NotificationService.getUserPreferences(user.id);
    if (preferences) {
      setNotifications(preferences);
    }
    setLoading(false);
  };

  const loadInAppNotifications = async () => {
    if (!user) return;
    
    const notifications = await NotificationService.getUserNotifications(user.id, 10);
    setInAppNotifications(notifications);
  };

  const handleSave = async () => {
    if (!user || !notifications) return;

    const success = await NotificationService.updateUserPreferences(user.id, notifications);
    
    if (success) {
      toast({
        title: "Configurações salvas",
        description: "Suas preferências de notificação foram atualizadas.",
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    }
  };

  const handleTestNotification = async () => {
    if (!user) return;

    const success = await NotificationService.createInAppNotification({
      userId: user.id,
      type: 'system',
      title: "Notificação de teste",
      message: "Esta é uma notificação de teste do sistema.",
      read: false
    });

    if (success) {
      toast({
        title: "Notificação de teste enviada",
        description: "Verifique suas notificações no aplicativo.",
      });
      loadInAppNotifications();
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;

    const success = await NotificationService.markAllAsRead(user.id);
    
    if (success) {
      toast({
        title: "Notificações marcadas como lidas",
        description: "Todas as notificações foram marcadas como lidas.",
      });
      loadInAppNotifications();
    }
  };

  const handleEmailChange = (key: string, value: any) => {
    if (!notifications) return;
    setNotifications(prev => prev ? ({
      ...prev,
      email: { ...prev.email, [key]: value }
    }) : null);
  };

  const handlePushChange = (key: string, value: any) => {
    if (!notifications) return;
    setNotifications(prev => prev ? ({
      ...prev,
      push: { ...prev.push, [key]: value }
    }) : null);
  };

  const handleInAppChange = (key: string, value: any) => {
    if (!notifications) return;
    setNotifications(prev => prev ? ({
      ...prev,
      inApp: { ...prev.inApp, [key]: value }
    }) : null);
  };

  const handleRemindersChange = (key: string, value: any) => {
    if (!notifications) return;
    setNotifications(prev => prev ? ({
      ...prev,
      reminders: { ...prev.reminders, [key]: value }
    }) : null);
  };

  if (loading || !notifications) {
    return <div>Carregando configurações...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações no Aplicativo
          </CardTitle>
          <CardDescription>
            Visualize e gerencie suas notificações recentes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span className="font-medium">Notificações Recentes</span>
              <Badge variant="secondary">{inAppNotifications.filter(n => !n.read).length} não lidas</Badge>
            </div>
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              Marcar Todas como Lidas
            </Button>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {inAppNotifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma notificação encontrada.
              </p>
            ) : (
              inAppNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-3 rounded-lg border ${!notification.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <Badge variant="default" size="sm">Nova</Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Notificações por Email
              </CardTitle>
              <CardDescription>
                Configure quando e como receber notificações por email.
              </CardDescription>
            </div>
            <Switch
              checked={notifications.email.enabled}
              onCheckedChange={(checked) => handleEmailChange('enabled', checked)}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emailAddress">Endereço de Email</Label>
            <Input
              id="emailAddress"
              type="email"
              value={notifications.email.address}
              onChange={(e) => handleEmailChange('address', e.target.value)}
              disabled={!notifications.email.enabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emailFrequency">Frequência</Label>
            <Select
              value={notifications.email.frequency}
              onValueChange={(value) => handleEmailChange('frequency', value)}
              disabled={!notifications.email.enabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Imediato</SelectItem>
                <SelectItem value="hourly">A cada hora</SelectItem>
                <SelectItem value="daily">Diário</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Tipos de Notificação</h4>
            
            {[
              { key: 'events', label: 'Eventos', description: 'Novos eventos e atualizações' },
              { key: 'transactions', label: 'Transações', description: 'Novas transações e pagamentos' },
              { key: 'reports', label: 'Relatórios', description: 'Relatórios periódicos automáticos' },
              { key: 'reminders', label: 'Lembretes', description: 'Lembretes de eventos e pagamentos' },
              { key: 'team', label: 'Equipe', description: 'Atividades da equipe e convites' }
            ].map(({ key, label, description }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <Label>{label}</Label>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <Switch
                  checked={notifications.email[key as keyof typeof notifications.email] as boolean}
                  onCheckedChange={(checked) => handleEmailChange(key, checked)}
                  disabled={!notifications.email.enabled}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Notificações Push
              </CardTitle>
              <CardDescription>
                Notificações instantâneas no navegador.
              </CardDescription>
            </div>
            <Switch
              checked={notifications.push.enabled}
              onCheckedChange={(checked) => handlePushChange('enabled', checked)}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'events', label: 'Eventos', description: 'Notificações sobre eventos' },
            { key: 'transactions', label: 'Transações', description: 'Notificações sobre transações' },
            { key: 'reminders', label: 'Lembretes', description: 'Lembretes importantes' },
            { key: 'team', label: 'Equipe', description: 'Atividades da equipe' }
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <Label>{label}</Label>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <Switch
                checked={notifications.push[key as keyof typeof notifications.push] as boolean}
                onCheckedChange={(checked) => handlePushChange(key, checked)}
                disabled={!notifications.push.enabled}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Configurações de Lembrete
          </CardTitle>
          <CardDescription>
            Configure quando receber lembretes importantes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventReminder">Lembrar eventos antes de (horas)</Label>
              <Select
                value={notifications.reminders.eventsBefore}
                onValueChange={(value) => handleRemindersChange('eventsBefore', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hora</SelectItem>
                  <SelectItem value="6">6 horas</SelectItem>
                  <SelectItem value="24">24 horas</SelectItem>
                  <SelectItem value="48">48 horas</SelectItem>
                  <SelectItem value="168">1 semana</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentReminder">Lembrar pagamentos antes de (dias)</Label>
              <Select
                value={notifications.reminders.paymentsDue}
                onValueChange={(value) => handleRemindersChange('paymentsDue', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 dia</SelectItem>
                  <SelectItem value="3">3 dias</SelectItem>
                  <SelectItem value="7">1 semana</SelectItem>
                  <SelectItem value="14">2 semanas</SelectItem>
                  <SelectItem value="30">1 mês</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Transações Recorrentes</Label>
              <p className="text-sm text-muted-foreground">Lembrar de criar novas instâncias</p>
            </div>
            <Switch
              checked={notifications.reminders.recurringTransactions}
              onCheckedChange={(checked) => handleRemindersChange('recurringTransactions', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Teste de Notificações
          </CardTitle>
          <CardDescription>
            Teste suas configurações de notificação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleTestNotification}>
              <TestTube className="h-4 w-4 mr-2" />
              Enviar Notificação de Teste
            </Button>
            <Badge variant="secondary">
              Status: {notifications.email.enabled || notifications.push.enabled ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}
