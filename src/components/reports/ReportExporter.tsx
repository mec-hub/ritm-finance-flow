
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileText, Download, FileSpreadsheet, Users, DollarSign, Loader2, BarChart3, PieChart } from 'lucide-react';
import { ReportExportService } from '@/services/reportExportService';
import { EnhancedExcelExportService } from '@/services/enhancedExcelExportService';
import { Transaction } from '@/types';
import { toast } from '@/hooks/use-toast';

interface ReportExporterProps {
  transactions: Transaction[];
  filters: any;
}

export const ReportExporter = ({ transactions, filters }: ReportExporterProps) => {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const handleExport = async (type: 'pdf' | 'excel' | 'advanced-excel', reportType: 'transactions' | 'clients') => {
    const key = `${type}-${reportType}`;
    setIsGenerating(key);
    
    try {
      if (reportType === 'transactions') {
        if (type === 'pdf') {
          await ReportExportService.generateTransactionsPDF(transactions, filters);
        } else if (type === 'excel') {
          await ReportExportService.generateTransactionsExcel(transactions, filters);
        } else if (type === 'advanced-excel') {
          await EnhancedExcelExportService.generateAdvancedTransactionsExcel(transactions, filters);
        }
      } else {
        if (type === 'pdf') {
          await ReportExportService.generateClientsReportPDF();
        } else if (type === 'excel') {
          await ReportExportService.generateClientsExcel();
        } else if (type === 'advanced-excel') {
          await EnhancedExcelExportService.generateAdvancedClientsExcel();
        }
      }
      
      const exportTypeName = type === 'advanced-excel' ? 'Excel Avançado' : type.toUpperCase();
      toast({
        title: "Relatório gerado com sucesso!",
        description: `O arquivo ${exportTypeName} foi baixado com gráficos e formatação profissional.`,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Erro ao gerar relatório",
        description: "Ocorreu um erro ao tentar gerar o relatório. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(null);
    }
  };

  const isLoading = (type: string, reportType: string) => {
    return isGenerating === `${type}-${reportType}`;
  };

  return (
    <div className="space-y-6">
      {/* Transactions Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Relatórios de Transações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Gere relatórios detalhados das suas transações com gráficos e análises avançadas.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Exportar em PDF
              </h4>
              <p className="text-sm text-muted-foreground">
                Relatório profissional com tabelas e resumo executivo.
              </p>
              <Button 
                onClick={() => handleExport('pdf', 'transactions')}
                disabled={isGenerating !== null}
                className="w-full"
              >
                {isLoading('pdf', 'transactions') ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                Gerar PDF
              </Button>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Excel Básico
              </h4>
              <p className="text-sm text-muted-foreground">
                Planilha simples com dados organizados em tabelas.
              </p>
              <Button 
                onClick={() => handleExport('excel', 'transactions')}
                disabled={isGenerating !== null}
                variant="outline"
                className="w-full"
              >
                {isLoading('excel', 'transactions') ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                )}
                Gerar Excel
              </Button>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Excel Avançado
              </h4>
              <p className="text-sm text-muted-foreground">
                Planilha profissional com gráficos, dashboards e análises.
              </p>
              <Button 
                onClick={() => handleExport('advanced-excel', 'transactions')}
                disabled={isGenerating !== null}
                variant="default"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {isLoading('advanced-excel', 'transactions') ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <BarChart3 className="mr-2 h-4 w-4" />
                )}
                Gerar Excel Pro
              </Button>
            </div>
          </div>
          
          {/* Advanced Excel Features Highlight */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
            <h5 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Recursos do Excel Avançado
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-blue-800">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Dashboard Executivo
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Gráficos Dinâmicos
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Formatação Condicional
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Dados para PivotTable
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Sparklines
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                Análise de Tendências
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                KPIs e Métricas
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                Projeções
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Clients Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Relatórios de Clientes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Exporte informações completas dos seus clientes com análises avançadas de performance.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Exportar em PDF
              </h4>
              <p className="text-sm text-muted-foreground">
                Lista completa de clientes com informações de contato.
              </p>
              <Button 
                onClick={() => handleExport('pdf', 'clients')}
                disabled={isGenerating !== null}
                className="w-full"
              >
                {isLoading('pdf', 'clients') ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                Gerar PDF
              </Button>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Excel Básico
              </h4>
              <p className="text-sm text-muted-foreground">
                Planilha com dados básicos dos clientes.
              </p>
              <Button 
                onClick={() => handleExport('excel', 'clients')}
                disabled={isGenerating !== null}
                variant="outline"
                className="w-full"
              >
                {isLoading('excel', 'clients') ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                )}
                Gerar Excel
              </Button>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Excel Avançado
              </h4>
              <p className="text-sm text-muted-foreground">
                Análise completa com dashboard, scores e segmentação.
              </p>
              <Button 
                onClick={() => handleExport('advanced-excel', 'clients')}
                disabled={isGenerating !== null}
                variant="default"
                className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
              >
                {isLoading('advanced-excel', 'clients') ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <BarChart3 className="mr-2 h-4 w-4" />
                )}
                Gerar Excel Pro
              </Button>
            </div>
          </div>
          
          {/* Advanced Client Excel Features */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border">
            <h5 className="font-medium text-green-900 mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Análises Avançadas de Clientes
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-green-800">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Dashboard de Clientes
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Segmentação por Receita
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Scores de Performance
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Análise Estatística
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Top 10 Clientes
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                Status de Atividade
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                Faixas de Receita
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                Métricas Avançadas
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Download className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-medium">Informações sobre os Relatórios</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Os relatórios PDF são otimizados para impressão e apresentações profissionais</p>
                <p>• Os arquivos Excel básicos incluem dados organizados em tabelas simples</p>
                <p>• Os arquivos Excel avançados incluem dashboards, gráficos interativos e análises estatísticas</p>
                <p>• Formatação condicional e sparklines para visualização rápida de tendências</p>
                <p>• Dados organizados para criação de PivotTables personalizadas</p>
                <p>• Os filtros aplicados serão considerados na geração dos relatórios</p>
                <p>• Todos os dados são processados localmente em seu dispositivo</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
