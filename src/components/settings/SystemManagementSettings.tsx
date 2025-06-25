
import { CategoryManagement } from './CategoryManagement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export function SystemManagementSettings() {
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

  return (
    <div className="space-y-6">
      <CategoryManagement />

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
