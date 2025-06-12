
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Image, Download, Eye, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface AttachmentPreviewProps {
  attachments: string[];
  title?: string;
}

export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachments,
  title = "Anexos"
}) => {
  const [previewFile, setPreviewFile] = useState<string | null>(null);

  const getFileType = (base64String: string) => {
    if (base64String.startsWith('data:image/')) {
      return 'image';
    } else if (base64String.includes('application/pdf')) {
      return 'pdf';
    }
    return 'file';
  };

  const getFileName = (base64String: string, index: number) => {
    const type = getFileType(base64String);
    switch (type) {
      case 'image':
        return `Imagem ${index + 1}`;
      case 'pdf':
        return `Documento ${index + 1}.pdf`;
      default:
        return `Arquivo ${index + 1}`;
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handlePreview = (attachment: string) => {
    setPreviewFile(attachment);
  };

  const handleDownload = (attachment: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = attachment;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderPreviewContent = (file: string) => {
    const type = getFileType(file);
    
    if (type === 'image') {
      return (
        <div className="flex justify-center">
          <img 
            src={file} 
            alt="Preview" 
            className="max-w-full max-h-96 object-contain rounded-lg"
          />
        </div>
      );
    } else if (type === 'pdf') {
      return (
        <div className="flex flex-col items-center space-y-4">
          <FileText className="h-20 w-20 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Visualização de PDF não disponível. Clique em download para abrir o arquivo.
          </p>
          <Button onClick={() => handleDownload(file, 'documento.pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center space-y-4">
          <FileText className="h-20 w-20 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Visualização não disponível para este tipo de arquivo.
          </p>
          <Button onClick={() => handleDownload(file, 'arquivo')}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      );
    }
  };

  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {title}
            <Badge variant="outline">{attachments.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {attachments.map((attachment, index) => {
              const fileType = getFileType(attachment);
              const fileName = getFileName(attachment, index);
              
              return (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    {getFileIcon(fileType)}
                    <span className="text-sm font-medium truncate">{fileName}</span>
                  </div>
                  
                  {fileType === 'image' && (
                    <div className="aspect-video bg-muted rounded-md overflow-hidden">
                      <img 
                        src={attachment} 
                        alt={fileName}
                        className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handlePreview(attachment)}
                      />
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(attachment)}
                      className="flex-1"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(attachment, fileName)}
                      className="flex-1"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Baixar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Visualizar Anexo
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {previewFile && renderPreviewContent(previewFile)}
        </DialogContent>
      </Dialog>
    </>
  );
};
