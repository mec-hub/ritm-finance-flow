
import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { TeamSettings } from '@/components/settings/TeamSettings';
import { PreferencesSettings } from '@/components/settings/PreferencesSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { SystemSettings } from '@/components/settings/SystemSettings';
import { 
  User, 
  Users, 
  Settings, 
  Bell, 
  Shield
} from 'lucide-react';

const Configuracoes = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
            <p className="text-muted-foreground">
              Gerencie as configurações da sua conta e preferências do sistema.
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Equipe
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Preferências
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Sistema
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileSettings />
          </TabsContent>

          <TabsContent value="team">
            <TeamSettings />
          </TabsContent>

          <TabsContent value="preferences">
            <PreferencesSettings />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="system">
            <SystemSettings />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Configuracoes;
