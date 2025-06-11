
import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { EnhancedTeamSettings } from '@/components/settings/EnhancedTeamSettings';
import { PreferencesSettings } from '@/components/settings/PreferencesSettings';
import { EnhancedNotificationSettings } from '@/components/settings/EnhancedNotificationSettings';
import { SystemSettings } from '@/components/settings/SystemSettings';
import { usePermissions } from '@/hooks/usePermissions';
import { 
  User, 
  Users, 
  Settings, 
  Bell, 
  Shield
} from 'lucide-react';

const Configuracoes = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { permissions } = usePermissions();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
            <p className="text-muted-foreground">
              Gerencie as configurações da sua conta, equipe e preferências do sistema.
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            {permissions.canManageTeam && (
              <TabsTrigger value="team" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Equipe
              </TabsTrigger>
            )}
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Preferências
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificações
            </TabsTrigger>
            {permissions.canManageSettings && (
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Sistema
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="profile">
            <ProfileSettings />
          </TabsContent>

          {permissions.canManageTeam && (
            <TabsContent value="team">
              <EnhancedTeamSettings />
            </TabsContent>
          )}

          <TabsContent value="preferences">
            <PreferencesSettings />
          </TabsContent>

          <TabsContent value="notifications">
            <EnhancedNotificationSettings />
          </TabsContent>

          {permissions.canManageSettings && (
            <TabsContent value="system">
              <SystemSettings />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

export default Configuracoes;
