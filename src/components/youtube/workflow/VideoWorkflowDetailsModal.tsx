
import { useState } from 'react';
import { VideoWorkflowItem } from '@/hooks/useVideoWorkflow';
import { EditWorkflowItemModal } from './EditWorkflowItemModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar, 
  ExternalLink, 
  FileText,
  Play,
  Edit,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VideoWorkflowDetailsModalProps {
  workflowItems: VideoWorkflowItem[];
  selectedDate: Date;
  isOpen: boolean;
  onClose: () => void;
}

const CONTENT_TYPE_LABELS = {
  davizão_news: 'Davizão News',
  vlog_de_show: 'Vlog de Show',
  resenha: 'Resenha',
  tutorial: 'Tutorial',
  review: 'Review',
  livestream: 'Live',
  other: 'Outro',
};

const STAGE_LABELS = {
  scripted: 'Roteirizado',
  recorded: 'Gravado',
  editing: 'Editando',
  awaiting_review: 'Aguardando Revisão',
  approved: 'Aprovado',
};

const STAGE_COLORS = {
  scripted: 'bg-yellow-500',
  recorded: 'bg-blue-500',
  editing: 'bg-orange-500',
  awaiting_review: 'bg-purple-500',
  approved: 'bg-green-500',
};

export const VideoWorkflowDetailsModal = ({ 
  workflowItems, 
  selectedDate, 
  isOpen, 
  onClose 
}: VideoWorkflowDetailsModalProps) => {
  const [selectedItem, setSelectedItem] = useState<VideoWorkflowItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleEdit = (item: VideoWorkflowItem) => {
    setSelectedItem(item);
    setIsEditOpen(true);
  };

  const handleEditClose = () => {
    setIsEditOpen(false);
    setSelectedItem(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Vídeos para {format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {workflowItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Play className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum vídeo agendado para esta data</p>
              </div>
            ) : (
              workflowItems.map((item) => (
                <Card key={item.id} className="transition-all hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {item.title}
                        <Badge 
                          variant="secondary" 
                          className={`${STAGE_COLORS[item.current_stage]} text-white`}
                        >
                          {STAGE_LABELS[item.current_stage]}
                        </Badge>
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Tipo de Conteúdo</span>
                        <p className="font-medium">{CONTENT_TYPE_LABELS[item.content_type]}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Prioridade</span>
                        <p className="font-medium">
                          {item.priority === 0 ? 'Normal' : 
                           item.priority === 1 ? 'Baixa' :
                           item.priority === 2 ? 'Média' : 'Alta'}
                        </p>
                      </div>
                    </div>

                    {item.description && (
                      <div>
                        <span className="text-muted-foreground text-sm">Descrição</span>
                        <p className="mt-1 text-sm">{item.description}</p>
                      </div>
                    )}

                    {item.tags.length > 0 && (
                      <div>
                        <span className="text-muted-foreground text-sm">Tags</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {item.script_link && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(item.script_link, '_blank')}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Roteiro
                        </Button>
                      )}
                      {item.drive_link && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(item.drive_link, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Drive
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                      <Clock className="h-3 w-3" />
                      Criado em {format(new Date(item.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {selectedItem && (
        <EditWorkflowItemModal
          item={selectedItem}
          open={isEditOpen}
          onOpenChange={handleEditClose}
        />
      )}
    </>
  );
}
