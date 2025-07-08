
import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { TeamManagementSettings } from '@/components/settings/TeamManagementSettings';
import { SystemManagementSettings } from '@/components/settings/SystemManagementSettings';
import { Settings, User, Users, Cog } from 'lucide-react';

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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Conta & Perfil
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Gerenciamento de Equipe
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Cog className="h-4 w-4" />
              Gerenciamento do Sistema
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="profile">
              <ProfileSettings />
            </TabsContent>

            <TabsContent value="team">
              <TeamManagementSettings />
            </TabsContent>

            <TabsContent value="system">
              <SystemManagementSettings />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Configuracoes;
