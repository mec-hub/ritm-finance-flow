
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function PreferencesSettings() {
  const [preferences, setPreferences] = useState({
    currency: 'BRL',
    dateFormat: 'dd/MM/yyyy',
    timeZone: 'America/Sao_Paulo',
    language: 'pt-BR',
    theme: 'light',
    defaultView: 'dashboard',
    autoSave: true,
    compactMode: false,
    showTutorials: true,
    defaultPaymentMethod: 'money',
    taxRate: 0,
    businessHours: {
      start: '09:00',
      end: '18:00',
      workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    }
  });

  const handleSave = () => {
    toast({
      title: "Preferências salvas",
      description: "Suas preferências foram atualizadas com sucesso.",
    });
  };

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleBusinessHoursChange = (key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Preferências Gerais</CardTitle>
          <CardDescription>
            Configure suas preferências de exibição e comportamento do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Tema</Label>
              <Select
                value={preferences.theme}
                onValueChange={(value) => handlePreferenceChange('theme', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                  <SelectItem value="system">Automático</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Idioma</Label>
              <Select
                value={preferences.language}
                onValueChange={(value) => handlePreferenceChange('language', value)}
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
                value={preferences.dateFormat}
                onValueChange={(value) => handlePreferenceChange('dateFormat', value)}
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
                value={preferences.timeZone}
                onValueChange={(value) => handlePreferenceChange('timeZone', value)}
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

            <div className="space-y-2">
              <Label htmlFor="defaultView">Página Inicial</Label>
              <Select
                value={preferences.defaultView}
                onValueChange={(value) => handlePreferenceChange('defaultView', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dashboard">Dashboard</SelectItem>
                  <SelectItem value="financas">Finanças</SelectItem>
                  <SelectItem value="eventos">Eventos</SelectItem>
                  <SelectItem value="clientes">Clientes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-lg font-medium">Comportamento da Interface</h4>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoSave">Salvamento Automático</Label>
                <p className="text-sm text-muted-foreground">Salvar automaticamente as alterações</p>
              </div>
              <Switch
                id="autoSave"
                checked={preferences.autoSave}
                onCheckedChange={(checked) => handlePreferenceChange('autoSave', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="compactMode">Modo Compacto</Label>
                <p className="text-sm text-muted-foreground">Interface mais densa com menos espaçamento</p>
              </div>
              <Switch
                id="compactMode"
                checked={preferences.compactMode}
                onCheckedChange={(checked) => handlePreferenceChange('compactMode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="showTutorials">Mostrar Tutoriais</Label>
                <p className="text-sm text-muted-foreground">Exibir dicas e tutoriais para novos recursos</p>
              </div>
              <Switch
                id="showTutorials"
                checked={preferences.showTutorials}
                onCheckedChange={(checked) => handlePreferenceChange('showTutorials', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferências Financeiras</CardTitle>
          <CardDescription>
            Configure as preferências padrão para transações e relatórios financeiros.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Moeda Padrão</Label>
              <Select
                value={preferences.currency}
                onValueChange={(value) => handlePreferenceChange('currency', value)}
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
                value={preferences.defaultPaymentMethod}
                onValueChange={(value) => handlePreferenceChange('defaultPaymentMethod', value)}
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
              <Label htmlFor="taxRate">Taxa de Imposto Padrão (%)</Label>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={preferences.taxRate}
                onChange={(e) => handlePreferenceChange('taxRate', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Horário Comercial</CardTitle>
          <CardDescription>
            Configure seu horário de funcionamento para melhor organização.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Horário de Início</Label>
              <Input
                id="startTime"
                type="time"
                value={preferences.businessHours.start}
                onChange={(e) => handleBusinessHoursChange('start', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Horário de Término</Label>
              <Input
                id="endTime"
                type="time"
                value={preferences.businessHours.end}
                onChange={(e) => handleBusinessHoursChange('end', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Todas as Preferências
        </Button>
      </div>
    </div>
  );
}
