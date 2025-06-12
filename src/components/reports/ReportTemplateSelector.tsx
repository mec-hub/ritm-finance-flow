
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { ReportTemplate } from '@/services/reportService';

interface ReportTemplateSelectorProps {
  templates: ReportTemplate[];
  selectedTemplate?: string;
  onTemplateSelect: (templateId: string) => void;
  onGeneratePDF: (templateId: string) => void;
  onGenerateExcel: (templateId: string) => void;
  isGenerating?: boolean;
}

export const ReportTemplateSelector = ({
  templates,
  selectedTemplate,
  onTemplateSelect,
  onGeneratePDF,
  onGenerateExcel,
  isGenerating = false
}: ReportTemplateSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Relatórios (Em Desenvolvimento)
        </CardTitle>
        <CardDescription>
          Esta seção está em desenvolvimento. Funcionalidades completas serão implementadas em breve.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-8">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Funcionalidade em Desenvolvimento</h3>
          <p className="text-muted-foreground mb-4">
            Os relatórios avançados estão sendo desenvolvidos e estarão disponíveis em breve.
          </p>
          <Button disabled>
            <Download className="mr-2 h-4 w-4" />
            Em Breve
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
