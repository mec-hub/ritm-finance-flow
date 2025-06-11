
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { FileText, Download, FileSpreadsheet, Settings } from 'lucide-react';
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
  const getTypeColor = (type: string) => {
    const colors = {
      financial: 'bg-green-100 text-green-800',
      client: 'bg-blue-100 text-blue-800',
      event: 'bg-purple-100 text-purple-800',
      tax: 'bg-orange-100 text-orange-800',
      team: 'bg-pink-100 text-pink-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      financial: 'Financeiro',
      client: 'Clientes',
      event: 'Eventos',
      tax: 'Fiscal',
      team: 'Equipe'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Modelos de Relatório
        </CardTitle>
        <CardDescription>
          Selecione um modelo e formato para gerar seu relatório personalizado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={selectedTemplate} onValueChange={onTemplateSelect}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <div key={template.id} className="relative">
                <Label
                  htmlFor={template.id}
                  className="cursor-pointer"
                >
                  <Card className={`transition-all hover:shadow-md ${
                    selectedTemplate === template.id 
                      ? 'ring-2 ring-primary border-primary' 
                      : 'border-border'
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={template.id} id={template.id} />
                          <div>
                            <CardTitle className="text-base">{template.name}</CardTitle>
                            <Badge className={`mt-1 ${getTypeColor(template.type)}`}>
                              {getTypeLabel(template.type)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <CardDescription className="text-sm">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">
                          Inclui:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {template.fields.map((field) => (
                            <Badge key={field} variant="outline" className="text-xs">
                              {field}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>

        {selectedTemplate && (
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              onClick={() => onGeneratePDF(selectedTemplate)}
              disabled={isGenerating}
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              {isGenerating ? 'Gerando...' : 'Gerar PDF'}
            </Button>
            <Button
              onClick={() => onGenerateExcel(selectedTemplate)}
              disabled={isGenerating}
              variant="outline"
              className="flex-1"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              {isGenerating ? 'Gerando...' : 'Gerar Excel'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
