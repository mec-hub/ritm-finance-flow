
import React, { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, FileText, Image } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AttachmentUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
}

export const AttachmentUpload: React.FC<AttachmentUploadProps> = ({
  files,
  onChange,
  maxFiles = 5,
  maxFileSize = 10,
  acceptedTypes = ['image/*', '.pdf', '.doc', '.docx', '.txt']
}) => {
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    if (files.length + selectedFiles.length > maxFiles) {
      toast({
        title: "Limite excedido",
        description: `Você pode anexar no máximo ${maxFiles} arquivos.`,
        variant: "destructive"
      });
      return;
    }

    const validFiles = selectedFiles.filter(file => {
      const sizeInMB = file.size / (1024 * 1024);
      if (sizeInMB > maxFileSize) {
        toast({
          title: "Arquivo muito grande",
          description: `${file.name} excede o limite de ${maxFileSize}MB.`,
          variant: "destructive"
        });
        return false;
      }
      return true;
    });

    onChange([...files, ...validFiles]);
    event.target.value = '';
  }, [files, maxFiles, maxFileSize, onChange]);

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onChange(newFiles);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Anexos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="file-upload">Adicionar Arquivos</Label>
          <div className="mt-1">
            <Input
              id="file-upload"
              type="file"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('file-upload')?.click()}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Selecionar Arquivos
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Máximo {maxFiles} arquivos, até {maxFileSize}MB cada
          </p>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <Label>Arquivos Selecionados</Label>
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                <div className="flex items-center space-x-2">
                  {getFileIcon(file)}
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
