
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileText, Download, FileSpreadsheet, Users, DollarSign, Loader2 } from 'lucide-react';
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

  const handleExport = async (type: 'pdf' | 'excel', reportType: 'transactions' | 'clients') => {
    const key = `${type}-${reportType}`;
    setIsGenerating(key);
    
    try {
      if (reportType === 'transactions') {
        if (type === 'pdf') {
          await ReportExportService.generateTransactionsPDF(transactions, filters);
        } else if (type === 'excel') {
          await EnhancedExcelExportService.generateAdvancedTransactionsExcel(transactions, filters);
        }
      } else {
        if (type === 'pdf') {
          await ReportExportService.generateClientsReportPDF();
        } else if (type === 'excel') {
          await EnhancedExcelExportService.generateAdvancedClientsExcel();
        }
      }
      
      const exportTypeName = type.toUpperCase();
      toast({
        title: "Relatório gerado com sucesso!",
        description: `O arquivo ${exportTypeName} foi baixado.`,
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Exportar em PDF
              </h4>
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
                Exportar em Excel
              </h4>
              <Button 
                onClick={() => handleExport('excel', 'transactions')}
                disabled={isGenerating !== null}
                variant="default"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Exportar em PDF
              </h4>
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
                Exportar em Excel
              </h4>
              <Button 
                onClick={() => handleExport('excel', 'clients')}
                disabled={isGenerating !== null}
                variant="default"
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
