
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Edit, 
  ExternalLink, 
  Calendar, 
  DollarSign, 
  Tag,
  Upload,
  Download,
  Trash2,
  FileText,
  Image as ImageIcon,
  File
} from 'lucide-react';
import { Budget, BudgetAttachment } from '@/types/budget';
import { BudgetService } from '@/services/budgetService';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface BudgetDetailsProps {
  budget: Budget;
  onEdit: () => void;
  onClose: () => void;
  onRefresh: () => void;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  archived: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800'
};

const statusLabels = {
  draft: 'Rascunho',
  active: 'Ativo',
  archived: 'Arquivado',
  completed: 'Concluído'
};

export function BudgetDetails({ budget, onEdit, onClose, onRefresh }: BudgetDetailsProps) {
  const [attachments, setAttachments] = useState<BudgetAttachment[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchAttachments = async () => {
    try {
      const attachmentsData = await BudgetService.getAttachments(budget.id);
      setAttachments(attachmentsData);
    } catch (error) {
      console.error('Error fetching attachments:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os anexos.",
        variant: "destructive"
      });
    } finally {
      setLoadingAttachments(false);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, [budget.id]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await BudgetService.uploadAttachment(budget.id, file);
      }
      toast({
        title: "Sucesso",
        description: `${files.length} arquivo(s) enviado(s) com sucesso.`,
      });
      fetchAttachments();
      onRefresh();
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar os arquivos.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDeleteAttachment = async (attachment: BudgetAttachment) => {
    try {
      await BudgetService.deleteAttachment(attachment.id);
      toast({
        title: "Sucesso",
        description: "Anexo removido com sucesso.",
      });
      fetchAttachments();
      onRefresh();
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o anexo.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadAttachment = (attachment: BudgetAttachment) => {
    const url = BudgetService.getAttachmentUrl(attachment.file_path);
    window.open(url, '_blank');
  };

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <File className="h-4 w-4" />;
    
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />;
    }
    
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold">{budget.name}</h2>
            <Badge className={statusColors[budget.status]}>
              {statusLabels[budget.status]}
            </Badge>
          </div>
          
          {budget.budget_type !== 'general' && (
            <Badge variant="outline" className="mb-2">
              {budget.budget_type}
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button onClick={onEdit} variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          {budget.external_url && (
            <Button
              onClick={() => window.open(budget.external_url, '_blank')}
              variant="outline"
              size="sm"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Link Externo
            </Button>
          )}
        </div>
      </div>

      {/* Description */}
      {budget.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {budget.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {budget.amount && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Valor:</span>
              <span>{formatCurrency(budget.amount)}</span>
            </div>
          )}
          
          {(budget.period_start || budget.period_end) && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Período:</span>
              <span>
                {budget.period_start && format(new Date(budget.period_start), 'dd/MM/yyyy')}
                {budget.period_start && budget.period_end && ' - '}
                {budget.period_end && format(new Date(budget.period_end), 'dd/MM/yyyy')}
              </span>
            </div>
          )}
          
          {budget.tags.length > 0 && (
            <div className="flex items-start gap-2">
              <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span className="font-medium">Tags:</span>
              <div className="flex flex-wrap gap-1">
                {budget.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <span className="font-medium">Criado em:</span><br />
              {format(new Date(budget.created_at), 'dd/MM/yyyy HH:mm')}
            </div>
            <div>
              <span className="font-medium">Atualizado em:</span><br />
              {format(new Date(budget.updated_at), 'dd/MM/yyyy HH:mm')}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attachments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Anexos ({attachments.length})</CardTitle>
            <div className="flex gap-2">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                accept="*/*"
              />
              <Button
                asChild
                variant="outline"
                size="sm"
                disabled={uploading}
              >
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? 'Enviando...' : 'Adicionar Arquivos'}
                </label>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingAttachments ? (
            <p className="text-center text-muted-foreground py-4">
              Carregando anexos...
            </p>
          ) : attachments.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Nenhum anexo encontrado. Clique em "Adicionar Arquivos" para enviar documentos.
            </p>
          ) : (
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    {getFileIcon(attachment.file_type)}
                    <div>
                      <p className="font-medium text-sm">{attachment.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.file_size)} • {format(new Date(attachment.uploaded_at), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadAttachment(attachment)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAttachment(attachment)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
