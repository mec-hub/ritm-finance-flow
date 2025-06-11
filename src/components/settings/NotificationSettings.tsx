import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Save, Bell, Mail, TestTube } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { NotificationService, NotificationPreferences } from '@/services/notificationService';
import { supabase } from '@/integrations/supabase/client';

export function NotificationSettings() {
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email: {
      enabled: true,
      address: '',
      frequency: 'immediate',
      events: true,
      transactions: true,
      reports: false,
      reminders: true,
      team: true
    },
    push: {
      enabled: true,
      events: true,
      transactions: false,
      reminders: true,
      team: false
    },
    inApp: {
      enabled: true,
      sound: true,
      desktop: true
    },
    reminders: {
      eventsBefore: '24',
      paymentsDue: '3',
      recurringTransactions: true
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const preferences = await NotificationService.getUserPreferences(user.id);
        if (preferences) {
          setNotifications(preferences);
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const success = await NotificationService.updateUserPreferences(user.id, notifications);
        if (success) {
          toast({
            title: "Configurações salvas",
            description: "Suas preferências de notificação foram atualizadas.",
          });
        } else {
          throw new Error('Failed to save preferences');
        }
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && notifications.email.enabled && notifications.email.address) {
        const success = await NotificationService.sendEmailNotification(
          notifications.email.address,
          'test',
          {
            message: 'Esta é uma notificação de teste do sistema.',
            timestamp: new Date().toISOString()
          }
        );

        if (success) {
          toast({
            title: "Email enviado",
            description: "Notificação de teste enviada para " + notifications.email.address,
          });
        } else {
          throw new Error('Failed to send test email');
        }
      } else {
        toast({
          title: "Notificação de teste",
          description: "Esta é uma notificação de teste do sistema.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o email de teste.",
        variant: "destructive"
      });
    }
  };

  const handleEmailChange = (key: string, value: any) => {
    setNotifications(prev => ({
      ...prev,
      email: { ...prev.email, [key]: value }
    }));
  };

  const handlePushChange = (key: string, value: any) => {
    setNotifications(prev => ({
      ...prev,
      push: { ...prev.push, [key]: value }
    }));
  };

  const handleInAppChange = (key: string, value: any) => {
    setNotifications(prev => ({
      ...prev,
      inApp: { ...prev.inApp, [key]: value }
    }));
  };

  const handleRemindersChange = (key: string, value: any) => {
    setNotifications(prev => ({
      ...prev,
      reminders: { ...prev.reminders, [key]: value }
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Notificações por Email</CardTitle>
              <CardDescription>
                Configure quando e como receber notificações por email.
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <Switch
                checked={notifications.email.enabled}
                onCheckedChange={(checked) => handleEmailChange('enabled', checked)}
              />
            </div>
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
            
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Eventos</Label>
                <p className="text-sm text-muted-foreground">Novos eventos e atualizações</p>
              </div>
              <Switch
                checked={notifications.email.events}
                onCheckedChange={(checked) => handleEmailChange('events', checked)}
                disabled={!notifications.email.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Transações</Label>
                <p className="text-sm text-muted-foreground">Novas transações e pagamentos</p>
              </div>
              <Switch
                checked={notifications.email.transactions}
                onCheckedChange={(checked) => handleEmailChange('transactions', checked)}
                disabled={!notifications.email.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Relatórios</Label>
                <p className="text-sm text-muted-foreground">Relatórios periódicos automáticos</p>
              </div>
              <Switch
                checked={notifications.email.reports}
                onCheckedChange={(checked) => handleEmailChange('reports', checked)}
                disabled={!notifications.email.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Lembretes</Label>
                <p className="text-sm text-muted-foreground">Lembretes de eventos e pagamentos</p>
              </div>
              <Switch
                checked={notifications.email.reminders}
                onCheckedChange={(checked) => handleEmailChange('reminders', checked)}
                disabled={!notifications.email.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Equipe</Label>
                <p className="text-sm text-muted-foreground">Atividades da equipe e convites</p>
              </div>
              <Switch
                checked={notifications.email.team}
                onCheckedChange={(checked) => handleEmailChange('team', checked)}
                disabled={!notifications.email.enabled}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Notificações Push</CardTitle>
              <CardDescription>
                Notificações instantâneas no navegador.
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <Switch
                checked={notifications.push.enabled}
                onCheckedChange={(checked) => handlePushChange('enabled', checked)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Eventos</Label>
              <p className="text-sm text-muted-foreground">Notificações sobre eventos</p>
            </div>
            <Switch
              checked={notifications.push.events}
              onCheckedChange={(checked) => handlePushChange('events', checked)}
              disabled={!notifications.push.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Transações</Label>
              <p className="text-sm text-muted-foreground">Notificações sobre transações</p>
            </div>
            <Switch
              checked={notifications.push.transactions}
              onCheckedChange={(checked) => handlePushChange('transactions', checked)}
              disabled={!notifications.push.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Lembretes</Label>
              <p className="text-sm text-muted-foreground">Lembretes importantes</p>
            </div>
            <Switch
              checked={notifications.push.reminders}
              onCheckedChange={(checked) => handlePushChange('reminders', checked)}
              disabled={!notifications.push.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Equipe</Label>
              <p className="text-sm text-muted-foreground">Atividades da equipe</p>
            </div>
            <Switch
              checked={notifications.push.team}
              onCheckedChange={(checked) => handlePushChange('team', checked)}
              disabled={!notifications.push.enabled}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configurações de Lembrete</CardTitle>
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
          <CardTitle>Teste de Notificações</CardTitle>
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
        <Button onClick={handleSave} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
}
