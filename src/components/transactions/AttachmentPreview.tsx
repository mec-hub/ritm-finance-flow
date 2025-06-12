
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Image, Download, Eye, File } from 'lucide-react';

interface AttachmentPreviewProps {
  attachment: string;
  index: number;
}

export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({ attachment, index }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Determine file type based on attachment string
  const getFileType = (attachment: string) => {
    if (attachment.startsWith('data:image/')) {
      return 'image';
    }
    if (attachment.startsWith('data:application/pdf')) {
      return 'pdf';
    }
    if (attachment.startsWith('data:text/')) {
      return 'text';
    }
    // If it's a URL, try to determine by extension
    if (attachment.startsWith('http')) {
      const extension = attachment.split('.').pop()?.toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
        return 'image';
      }
      if (extension === 'pdf') {
        return 'pdf';
      }
    }
    return 'unknown';
  };

  const fileType = getFileType(attachment);
  
  const getFileName = () => {
    if (attachment.startsWith('data:')) {
      const mimeType = attachment.split(';')[0].split(':')[1];
      const extension = mimeType.split('/')[1];
      return `Anexo ${index + 1}.${extension}`;
    }
    if (attachment.startsWith('http')) {
      return attachment.split('/').pop() || `Anexo ${index + 1}`;
    }
    return `Anexo ${index + 1}`;
  };

  const downloadAttachment = () => {
    try {
      if (attachment.startsWith('data:')) {
        // Handle base64 data
        const link = document.createElement('a');
        link.href = attachment;
        link.download = getFileName();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (attachment.startsWith('http')) {
        // Handle URL
        const link = document.createElement('a');
        link.href = attachment;
        link.download = getFileName();
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error downloading attachment:', error);
    }
  };

  const renderPreview = () => {
    switch (fileType) {
      case 'image':
        return (
          <div className="max-w-full max-h-full overflow-auto">
            <img 
              src={attachment} 
              alt={`Anexo ${index + 1}`}
              className="max-w-full h-auto rounded-lg"
            />
          </div>
        );
      case 'pdf':
        return (
          <div className="w-full h-full">
            <iframe
              src={attachment}
              className="w-full h-full border rounded-lg"
              title={`PDF Anexo ${index + 1}`}
            />
          </div>
        );
      case 'text':
        return (
          <div className="max-w-full max-h-96 overflow-auto p-4 bg-muted rounded-lg">
            <pre className="whitespace-pre-wrap text-sm">
              {attachment.startsWith('data:') ? 
                atob(attachment.split(',')[1]) : 
                'Conteúdo não disponível para preview'
              }
            </pre>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <File className="h-16 w-16 mb-4" />
            <p>Preview não disponível para este tipo de arquivo</p>
            <p className="text-sm">Use o botão de download para acessar o arquivo</p>
          </div>
        );
    }
  };

  const getIcon = () => {
    switch (fileType) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getIcon()}
            <span className="text-sm font-medium">{getFileName()}</span>
          </div>
          <div className="flex space-x-2">
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle>{getFileName()}</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  {renderPreview()}
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={downloadAttachment}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
