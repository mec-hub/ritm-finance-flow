
import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { SystemSettings } from '@/components/settings/SystemSettings';
import { TeamSettings } from '@/components/settings/TeamSettings';
import EnhancedTeamSettings from '@/components/settings/EnhancedTeamSettings';
import { PreferencesSettings } from '@/components/settings/PreferencesSettings';
import { Settings, User, Bell, System, Users, Palette } from 'lucide-react';

const Configuracoes = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Settings className="h-8 w-8 text-blue-500" />
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <System className="h-4 w-4" />
              Sistema
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Equipe
            </TabsTrigger>
            <TabsTrigger value="enhanced-team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Equipe+
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Preferências
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="profile">
              <ProfileSettings />
            </TabsContent>

            <TabsContent value="notifications">
              <NotificationSettings />
            </TabsContent>

            <TabsContent value="system">
              <SystemSettings />
            </TabsContent>

            <TabsContent value="team">
              <TeamSettings />
            </TabsContent>

            <TabsContent value="enhanced-team">
              <EnhancedTeamSettings />
            </TabsContent>

            <TabsContent value="preferences">
              <PreferencesSettings />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Configuracoes;
