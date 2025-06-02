
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw, 
  Shield, 
  Database, 
  Activity, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function SystemSettings() {
  const [systemInfo] = useState({
    version: '1.2.3',
    buildDate: '2024-03-15',
    lastBackup: '2024-03-10 14:30',
    storageUsed: 45, // percentage
    totalTransactions: 1247,
    totalEvents: 89,
    totalClients: 156,
    uptime: '15 dias, 6 horas',
    lastSync: '2024-03-15 16:45'
  });

  const handleExportData = () => {
    toast({
      title: "Exportação iniciada",
      description: "Seus dados estão sendo preparados para download.",
    });
    
    // Simulate export
    setTimeout(() => {
      toast({
        title: "Exportação concluída",
        description: "O arquivo foi baixado com sucesso.",
      });
    }, 2000);
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.csv';
    input.onchange = () => {
      toast({
        title: "Importação iniciada",
        description: "Seus dados estão sendo processados.",
      });
    };
    input.click();
  };

  const handleClearCache = () => {
    localStorage.clear();
    toast({
      title: "Cache limpo",
      description: "Cache do navegador foi limpo com sucesso.",
    });
  };

  const handleSyncData = () => {
    toast({
      title: "Sincronização iniciada",
      description: "Sincronizando dados com o servidor.",
    });
  };

  const handleFactoryReset = () => {
    if (confirm('ATENÇÃO: Esta ação irá apagar TODOS os dados. Esta ação não pode ser desfeita. Tem certeza?')) {
      if (confirm('Última confirmação: Todos os dados serão perdidos permanentemente. Continuar?')) {
        localStorage.clear();
        toast({
          title: "Sistema resetado",
          description: "O sistema foi restaurado para as configurações de fábrica.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
          <CardDescription>
            Informações sobre a versão e status do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-green-500" />
                <span className="font-medium">Versão</span>
              </div>
              <p className="text-2xl font-bold">{systemInfo.version}</p>
              <p className="text-sm text-muted-foreground">Build: {systemInfo.buildDate}</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Dados</span>
              </div>
              <p className="text-2xl font-bold">{systemInfo.totalTransactions}</p>
              <p className="text-sm text-muted-foreground">Transações</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium">Uptime</span>
              </div>
              <p className="text-lg font-bold">{systemInfo.uptime}</p>
              <p className="text-sm text-muted-foreground">Online</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Segurança</span>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Protegido
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">SSL Ativo</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Uso de Armazenamento</span>
                <span className="text-sm text-muted-foreground">{systemInfo.storageUsed}%</span>
              </div>
              <Progress value={systemInfo.storageUsed} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Último backup: {systemInfo.lastBackup}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{systemInfo.totalTransactions}</p>
                <p className="text-sm text-muted-foreground">Transações</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-green-600">{systemInfo.totalEvents}</p>
                <p className="text-sm text-muted-foreground">Eventos</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{systemInfo.totalClients}</p>
                <p className="text-sm text-muted-foreground">Clientes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup e Restauração</CardTitle>
          <CardDescription>
            Gerencie backups dos seus dados e configurações.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={handleExportData} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Todos os Dados
            </Button>
            <Button onClick={handleImportData} variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Importar Dados
            </Button>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium mb-2">Backup Automático</h4>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Status do Backup</p>
                <p className="text-sm text-muted-foreground">Último backup: {systemInfo.lastBackup}</p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Ativo
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manutenção do Sistema</CardTitle>
          <CardDescription>
            Ferramentas para manter o sistema funcionando perfeitamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={handleClearCache} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Limpar Cache
            </Button>
            <Button onClick={handleSyncData} variant="outline">
              <Database className="h-4 w-4 mr-2" />
              Sincronizar Dados
            </Button>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h4 className="font-medium">Zona de Perigo</h4>
            </div>
            
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="space-y-3">
                <div>
                  <h5 className="font-medium text-red-800">Reset Completo do Sistema</h5>
                  <p className="text-sm text-red-600">
                    Esta ação irá apagar TODOS os dados incluindo transações, eventos, clientes e configurações. 
                    Esta ação NÃO PODE ser desfeita.
                  </p>
                </div>
                <Button onClick={handleFactoryReset} variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Resetar Sistema Completamente
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Diagnóstico</CardTitle>
          <CardDescription>
            Informações de diagnóstico e status do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Conexão com Internet</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Conectado
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Armazenamento Local</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Funcionando
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Performance</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Ótima
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Navegador Suportado</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Sim
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">JavaScript Habilitado</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Sim
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Última Sincronização</span>
                <span className="text-sm text-muted-foreground">{systemInfo.lastSync}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
