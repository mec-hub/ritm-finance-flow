import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, FileText, FileSpreadsheet, FileImage, File, Download, Loader2 } from 'lucide-react';
import { BudgetAttachment } from '@/types/budget';
import { BudgetService } from '@/services/budgetService';
import { toast } from '@/hooks/use-toast';

interface BudgetFileUploadProps {
  budgetId?: string;
  existingAttachments?: BudgetAttachment[];
  onAttachmentsChange?: (attachments: BudgetAttachment[]) => void;
  disabled?: boolean;
}

const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
  'text/csv': ['.csv'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif']
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function BudgetFileUpload({ budgetId, existingAttachments = [], onAttachmentsChange, disabled }: BudgetFileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'xlsx':
      case 'xls':
      case 'csv':
        return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileImage className="h-4 w-4 text-blue-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return 'Arquivo muito grande. O tamanho máximo é 10MB.';
    }

    const isValidType = Object.keys(ACCEPTED_FILE_TYPES).includes(file.type);
    if (!isValidType) {
      return 'Tipo de arquivo não suportado. Use PDF, Excel, Word, CSV ou imagens.';
    }

    return null;
  };

  const handleFileSelect = useCallback((files: File[]) => {
    const validFiles: File[] = [];
    
    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        toast({
          title: "Erro no arquivo",
          description: `${file.name}: ${error}`,
          variant: "destructive"
        });
        continue;
      }
      validFiles.push(file);
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files);
  }, [disabled, handleFileSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFileSelect(files);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (!budgetId || selectedFiles.length === 0) return;

    setUploading(true);
    const uploadedAttachments: BudgetAttachment[] = [];

    try {
      for (const file of selectedFiles) {
        const attachment = await BudgetService.uploadAttachment(budgetId, file);
        uploadedAttachments.push(attachment);
      }

      toast({
        title: "Sucesso",
        description: `${uploadedAttachments.length} arquivo(s) enviado(s) com sucesso.`,
      });

      setSelectedFiles([]);
      onAttachmentsChange?.([...existingAttachments, ...uploadedAttachments]);
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar os arquivos.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteAttachment = async (attachmentId: string) => {
    try {
      await BudgetService.deleteAttachment(attachmentId);
      toast({
        title: "Sucesso",
        description: "Arquivo excluído com sucesso.",
      });
      onAttachmentsChange?.(existingAttachments.filter(a => a.id !== attachmentId));
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o arquivo.",
        variant: "destructive"
      });
    }
  };

  const downloadAttachment = (attachment: BudgetAttachment) => {
    const url = BudgetService.getAttachmentUrl(attachment.file_path);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4">
      <Label>Documentos</Label>
      
      {/* File Drop Zone */}
      <Card className={`border-2 border-dashed transition-colors ${
        dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
      }`}>
        <CardContent className="p-6">
          <div
            className="text-center cursor-pointer"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !disabled && document.getElementById('file-input')?.click()}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              Arraste arquivos aqui ou clique para selecionar
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, Excel, Word, CSV, Imagens (máx. 10MB)
            </p>
          </div>
          
          <input
            id="file-input"
            type="file"
            multiple
            accept={Object.keys(ACCEPTED_FILE_TYPES).join(',')}
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled}
          />
        </CardContent>
      </Card>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">Arquivos selecionados</h4>
              <Button
                onClick={uploadFiles}
                disabled={uploading || !budgetId}
                size="sm"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Enviar
                  </>
                )}
              </Button>
            </div>
            
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    {getFileIcon(file.name)}
                    <span className="text-sm truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(file.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSelectedFile(index)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Attachments */}
      {existingAttachments.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-3">Documentos anexados</h4>
            <div className="space-y-2">
              {existingAttachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    {getFileIcon(attachment.file_name)}
                    <span className="text-sm truncate">{attachment.file_name}</span>
                    {attachment.file_size && (
                      <span className="text-xs text-muted-foreground">
                        ({(attachment.file_size / 1024 / 1024).toFixed(1)} MB)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadAttachment(attachment)}
                      className="h-6 w-6 p-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAttachment(attachment.id)}
                      className="h-6 w-6 p-0"
                      disabled={disabled}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
