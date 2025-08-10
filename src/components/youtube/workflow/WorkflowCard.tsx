
import { useState, useEffect } from 'react';
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
  Clock,
  User
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WorkflowDetailsModal } from './WorkflowDetailsModal';
import { useVideoWorkflow } from '@/hooks/useVideoWorkflow';
import { useWorkflowComments } from '@/hooks/useWorkflowComments';
import { useWorkflowApprovals } from '@/hooks/useWorkflowApprovals';
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
  0: '',
  1: 'border-l-blue-400',
  2: 'border-l-yellow-400',
  3: 'border-l-red-400',
};

export const WorkflowCard = ({ item }: WorkflowCardProps) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { deleteItem } = useVideoWorkflow();
  const { comments } = useWorkflowComments(item.id);
  const { approvals } = useWorkflowApprovals(item.id);

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      deleteItem(item.id);
    }
  };

  const priorityBorder = PRIORITY_COLORS[item.priority as keyof typeof PRIORITY_COLORS] || '';
  const approvalCount = approvals.filter(a => a.approved).length;
  const rejectionCount = approvals.filter(a => !a.approved).length;

  return (
    <>
      <Card className={`cursor-pointer hover:shadow-md transition-shadow bg-card border-border hover:border-accent ${priorityBorder} ${priorityBorder ? 'border-l-2' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-sm line-clamp-2 text-foreground">{item.title}</h4>
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
          
          <div className="flex items-center gap-2 flex-wrap">
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
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <Calendar className="h-3 w-3" />
              {format(new Date(item.estimated_publication_date), 'dd/MM/yyyy', { locale: ptBR })}
            </div>
          )}

          {/* Activity indicators */}
          <div className="flex items-center gap-2 mb-2">
            {comments.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                <span>{comments.length}</span>
              </div>
            )}
            
            {approvalCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="h-3 w-3" />
                <span>{approvalCount}</span>
              </div>
            )}
            
            {rejectionCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-red-600">
                <XCircle className="h-3 w-3" />
                <span>{rejectionCount}</span>
              </div>
            )}
          </div>

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
