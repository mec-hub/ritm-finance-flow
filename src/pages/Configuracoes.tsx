
import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  User, 
  Bell, 
  DollarSign, 
  Calendar, 
  FileText, 
  Shield, 
  Download,
  Upload,
  Trash2,
  Save
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Configuracoes = () => {
  // Profile settings
  const [profileSettings, setProfileSettings] = useState({
    companyName: 'Minha Empresa Musical',
    ownerName: 'João Silva',
    email: 'joao@minhaempresa.com',
    phone: '(11) 99999-9999',
    address: 'Rua das Flores, 123 - São Paulo, SP',
    description: 'Empresa especializada em shows e eventos musicais.',
  });

  // Financial settings
  const [financialSettings, setFinancialSettings] = useState({
    currency: 'BRL',
    defaultPaymentMethod: 'money',
    taxRate: 0,
    enableRecurring: true,
    defaultCategory: 'Shows',
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    upcomingEvents: true,
    unpaidTransactions: true,
    monthlyReports: false,
    systemUpdates: true,
  });

  // System settings
  const [systemSettings, setSystemSettings] = useState({
    theme: 'light',
    language: 'pt-BR',
    dateFormat: 'dd/MM/yyyy',
    timeZone: 'America/Sao_Paulo',
    autoBackup: true,
  });

  const handleSaveProfile = () => {
    // In a real app, this would save to a database
    toast({
      title: "Perfil atualizado",
      description: "As informações do perfil foram salvas com sucesso.",
    });
  };

  const handleSaveFinancial = () => {
    toast({
      title: "Configurações financeiras atualizadas",
      description: "As configurações financeiras foram salvas com sucesso.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notificações atualizadas",
      description: "As configurações de notificação foram salvas com sucesso.",
    });
  };

  const handleSaveSystem = () => {
    toast({
      title: "Configurações do sistema atualizadas",
      description: "As configurações do sistema foram salvas com sucesso.",
    });
  };

  const handleExportData = () => {
    // Generate a simple backup file
    const backupData = {
      profile: profileSettings,
      financial: financialSettings,
      notifications: notificationSettings,
      system: systemSettings,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-configuracoes-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Backup criado",
      description: "O arquivo de backup das configurações foi baixado com sucesso.",
    });
  };

  const handleImportData = () => {
    // Create file input for import
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            if (data.profile) setProfileSettings(data.profile);
            if (data.financial) setFinancialSettings(data.financial);
            if (data.notifications) setNotificationSettings(data.notifications);
            if (data.system) setSystemSettings(data.system);
            
            toast({
              title: "Configurações importadas",
              description: "As configurações foram importadas com sucesso.",
            });
          } catch (error) {
            toast({
              title: "Erro na importação",
              description: "Arquivo inválido. Por favor, selecione um arquivo de backup válido.",
              variant: "destructive",
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleResetSettings = () => {
    if (confirm('Tem certeza que deseja restaurar todas as configurações para os valores padrão? Esta ação não pode ser desfeita.')) {
      // Reset to default values
      setProfileSettings({
        companyName: '',
        ownerName: '',
        email: '',
        phone: '',
        address: '',
        description: '',
      });
      setFinancialSettings({
        currency: 'BRL',
        defaultPaymentMethod: 'money',
        taxRate: 0,
        enableRecurring: true,
        defaultCategory: 'Shows',
      });
      setNotificationSettings({
        emailNotifications: true,
        upcomingEvents: true,
        unpaidTransactions: true,
        monthlyReports: false,
        systemUpdates: true,
      });
      setSystemSettings({
        theme: 'light',
        language: 'pt-BR',
        dateFormat: 'dd/MM/yyyy',
        timeZone: 'America/Sao_Paulo',
        autoBackup: true,
      });

      toast({
        title: "Configurações restauradas",
        description: "Todas as configurações foram restauradas para os valores padrão.",
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
            <p className="text-muted-foreground">
              Configure as preferências do seu sistema e perfil da empresa.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleImportData}>
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Button>
            <Button variant="outline" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Backup
            </Button>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Financeiro
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Sistema
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Segurança
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Empresa</CardTitle>
                <CardDescription>
                  Configure as informações básicas da sua empresa musical.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nome da Empresa</Label>
                    <Input
                      id="companyName"
                      value={profileSettings.companyName}
                      onChange={(e) => setProfileSettings(prev => ({
                        ...prev,
                        companyName: e.target.value
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Nome do Proprietário</Label>
                    <Input
                      id="ownerName"
                      value={profileSettings.ownerName}
                      onChange={(e) => setProfileSettings(prev => ({
                        ...prev,
                        ownerName: e.target.value
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileSettings.email}
                      onChange={(e) => setProfileSettings(prev => ({
                        ...prev,
                        email: e.target.value
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={profileSettings.phone}
                      onChange={(e) => setProfileSettings(prev => ({
                        ...prev,
                        phone: e.target.value
                      }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={profileSettings.address}
                    onChange={(e) => setProfileSettings(prev => ({
                      ...prev,
                      address: e.target.value
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição da Empresa</Label>
                  <Textarea
                    id="description"
                    value={profileSettings.description}
                    onChange={(e) => setProfileSettings(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                    className="min-h-[100px]"
                  />
                </div>
                <Button onClick={handleSaveProfile}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Perfil
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Settings */}
          <TabsContent value="financial" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Financeiras</CardTitle>
                <CardDescription>
                  Configure as preferências financeiras e contábeis.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Moeda</Label>
                    <Select
                      value={financialSettings.currency}
                      onValueChange={(value) => setFinancialSettings(prev => ({
                        ...prev,
                        currency: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BRL">Real Brasileiro (R$)</SelectItem>
                        <SelectItem value="USD">Dólar Americano ($)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultPaymentMethod">Método de Pagamento Padrão</Label>
                    <Select
                      value={financialSettings.defaultPaymentMethod}
                      onValueChange={(value) => setFinancialSettings(prev => ({
                        ...prev,
                        defaultPaymentMethod: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="money">Dinheiro</SelectItem>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="card">Cartão</SelectItem>
                        <SelectItem value="transfer">Transferência</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Taxa de Imposto (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={financialSettings.taxRate}
                      onChange={(e) => setFinancialSettings(prev => ({
                        ...prev,
                        taxRate: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultCategory">Categoria Padrão</Label>
                    <Select
                      value={financialSettings.defaultCategory}
                      onValueChange={(value) => setFinancialSettings(prev => ({
                        ...prev,
                        defaultCategory: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Shows">Shows</SelectItem>
                        <SelectItem value="Eventos">Eventos</SelectItem>
                        <SelectItem value="Equipamento">Equipamento</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Outras Receitas">Outras Receitas</SelectItem>
                        <SelectItem value="Outras Despesas">Outras Despesas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableRecurring"
                    checked={financialSettings.enableRecurring}
                    onCheckedChange={(checked) => setFinancialSettings(prev => ({
                      ...prev,
                      enableRecurring: checked
                    }))}
                  />
                  <Label htmlFor="enableRecurring">Habilitar transações recorrentes</Label>
                </div>
                <Button onClick={handleSaveFinancial}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações Financeiras
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Notificação</CardTitle>
                <CardDescription>
                  Configure quando e como você deseja receber notificações.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications">Notificações por Email</Label>
                      <p className="text-sm text-muted-foreground">Receber notificações por email</p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({
                        ...prev,
                        emailNotifications: checked
                      }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="upcomingEvents">Eventos Próximos</Label>
                      <p className="text-sm text-muted-foreground">Lembrete de eventos próximos</p>
                    </div>
                    <Switch
                      id="upcomingEvents"
                      checked={notificationSettings.upcomingEvents}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({
                        ...prev,
                        upcomingEvents: checked
                      }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="unpaidTransactions">Transações Não Pagas</Label>
                      <p className="text-sm text-muted-foreground">Lembrete de pagamentos pendentes</p>
                    </div>
                    <Switch
                      id="unpaidTransactions"
                      checked={notificationSettings.unpaidTransactions}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({
                        ...prev,
                        unpaidTransactions: checked
                      }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="monthlyReports">Relatórios Mensais</Label>
                      <p className="text-sm text-muted-foreground">Receber relatório mensal automaticamente</p>
                    </div>
                    <Switch
                      id="monthlyReports"
                      checked={notificationSettings.monthlyReports}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({
                        ...prev,
                        monthlyReports: checked
                      }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="systemUpdates">Atualizações do Sistema</Label>
                      <p className="text-sm text-muted-foreground">Notificações sobre novas funcionalidades</p>
                    </div>
                    <Switch
                      id="systemUpdates"
                      checked={notificationSettings.systemUpdates}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({
                        ...prev,
                        systemUpdates: checked
                      }))}
                    />
                  </div>
                </div>
                <Button onClick={handleSaveNotifications}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações de Notificação
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
                <CardDescription>
                  Configure as preferências de exibição e sistema.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Tema</Label>
                    <Select
                      value={systemSettings.theme}
                      onValueChange={(value) => setSystemSettings(prev => ({
                        ...prev,
                        theme: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Claro</SelectItem>
                        <SelectItem value="dark">Escuro</SelectItem>
                        <SelectItem value="system">Sistema</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Idioma</Label>
                    <Select
                      value={systemSettings.language}
                      onValueChange={(value) => setSystemSettings(prev => ({
                        ...prev,
                        language: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="es-ES">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Formato de Data</Label>
                    <Select
                      value={systemSettings.dateFormat}
                      onValueChange={(value) => setSystemSettings(prev => ({
                        ...prev,
                        dateFormat: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dd/MM/yyyy">DD/MM/AAAA</SelectItem>
                        <SelectItem value="MM/dd/yyyy">MM/DD/AAAA</SelectItem>
                        <SelectItem value="yyyy-MM-dd">AAAA-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeZone">Fuso Horário</Label>
                    <Select
                      value={systemSettings.timeZone}
                      onValueChange={(value) => setSystemSettings(prev => ({
                        ...prev,
                        timeZone: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                        <SelectItem value="America/New_York">Nova York (GMT-5)</SelectItem>
                        <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoBackup"
                    checked={systemSettings.autoBackup}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({
                      ...prev,
                      autoBackup: checked
                    }))}
                  />
                  <Label htmlFor="autoBackup">Backup automático semanal</Label>
                </div>
                <Button onClick={handleSaveSystem}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações do Sistema
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Segurança e Backup</CardTitle>
                <CardDescription>
                  Gerencie a segurança dos dados e backups do sistema.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Backup de Dados</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Exporte ou importe suas configurações e dados do sistema.
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleExportData}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar Configurações
                      </Button>
                      <Button variant="outline" onClick={handleImportData}>
                        <Upload className="h-4 w-4 mr-2" />
                        Importar Configurações
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium">Informações do Sistema</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label>Versão do Sistema</Label>
                        <Badge variant="secondary">v1.0.0</Badge>
                      </div>
                      <div>
                        <Label>Último Backup</Label>
                        <p className="text-sm text-muted-foreground">Nunca realizado</p>
                      </div>
                      <div>
                        <Label>Dados Armazenados</Label>
                        <p className="text-sm text-muted-foreground">Local (Browser)</p>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Funcionando
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium text-red-600">Zona de Perigo</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Ações irreversíveis que afetam todo o sistema.
                    </p>
                    <Button variant="destructive" onClick={handleResetSettings}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Restaurar Configurações Padrão
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Configuracoes;
