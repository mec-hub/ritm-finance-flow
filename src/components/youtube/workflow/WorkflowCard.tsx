
import { useState } from 'react';
import { VideoWorkflowItem } from '@/hooks/useVideoWorkflow';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  ExternalLink, 
  MessageSquare, 
  FileText,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WorkflowDetailsModal } from './WorkflowDetailsModal';
import { useVideoWorkflow } from '@/hooks/useVideoWorkflow';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WorkflowCardProps {
  item: VideoWorkflowItem;
}

const CONTENT_TYPE_LABELS = {
  tutorial: 'Tutorial',
  review: 'Review',
  gameplay: 'Gameplay',
  vlog: 'Vlog',
  short: 'Short',
  livestream: 'Live',
  other: 'Outro',
};

const PRIORITY_COLORS = {
  0: 'bg-gray-100',
  1: 'bg-blue-100',
  2: 'bg-yellow-100',
  3: 'bg-red-100',
};

export const WorkflowCard = ({ item }: WorkflowCardProps) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { deleteItem } = useVideoWorkflow();

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      deleteItem(item.id);
    }
  };

  const priorityColor = PRIORITY_COLORS[item.priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS[0];

  return (
    <>
      <Card className={`cursor-pointer hover:shadow-md transition-shadow ${priorityColor}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-sm line-clamp-2">{item.title}</h4>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsDetailsOpen(true)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Ver Detalhes
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-red-600"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {CONTENT_TYPE_LABELS[item.content_type]}
            </Badge>
            {item.priority > 0 && (
              <Badge variant="destructive" className="text-xs">
                Prioridade {item.priority}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="py-2" onClick={() => setIsDetailsOpen(true)}>
          {item.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {item.description}
            </p>
          )}
          
          {item.estimated_publication_date && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {format(new Date(item.estimated_publication_date), 'dd/MM/yyyy', { locale: ptBR })}
            </div>
          )}

          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.slice(0, 2).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{item.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {format(new Date(item.created_at), 'dd/MM', { locale: ptBR })}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            {item.script_link && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(item.script_link, '_blank');
                }}
              >
                <FileText className="h-3 w-3" />
              </Button>
            )}
            {item.drive_link && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(item.drive_link, '_blank');
                }}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setIsDetailsOpen(true);
              }}
            >
              <MessageSquare className="h-3 w-3" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      <WorkflowDetailsModal
        item={item}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </>
  );
};
