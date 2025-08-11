
import { useState } from 'react';
import { WorkflowComment } from '@/hooks/useWorkflowComments';
import { useCommentAcknowledgments } from '@/hooks/useCommentAcknowledgments';
import { useWorkflowComments } from '@/hooks/useWorkflowComments';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Check,
  Users 
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CommentItemProps {
  comment: WorkflowComment;
  onEdit?: (commentId: string, newContent: string) => void;
  onDelete?: (commentId: string) => void;
}

export const CommentItem = ({ comment, onEdit, onDelete }: CommentItemProps) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showAcknowledgments, setShowAcknowledgments] = useState(false);

  const { 
    acknowledgments, 
    hasAcknowledged, 
    acknowledgmentCount,
    toggleAcknowledgment,
    isToggling 
  } = useCommentAcknowledgments(comment.id);

  const isOwnComment = user?.id === comment.user_id;

  const handleSaveEdit = () => {
    if (editContent.trim() && onEdit) {
      onEdit(comment.id, editContent.trim());
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este comentário?') && onDelete) {
      onDelete(comment.id);
    }
  };

  const handleToggleAcknowledgment = () => {
    toggleAcknowledgment();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.profiles?.avatar_url || ''} />
            <AvatarFallback>
              {comment.profiles?.full_name ? getInitials(comment.profiles.full_name) : 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-foreground">
                {comment.profiles?.full_name || 'Usuário'}
              </span>
              <span className="text-xs text-muted-foreground">
                {format(new Date(comment.created_at), 'dd/MM HH:mm', { locale: ptBR })}
              </span>
              {isOwnComment && (
                <div className="flex items-center gap-1 ml-auto">
                  {!isEditing && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        onClick={handleDelete}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                  {isEditing && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                        onClick={handleSaveEdit}
                      >
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {isEditing ? (
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="text-sm min-h-[60px] mb-2"
                autoFocus
              />
            ) : (
              <p className="text-sm text-foreground mb-2">{comment.content}</p>
            )}

            {/* Acknowledgment section */}
            <div className="flex items-center gap-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 px-2 text-xs ${hasAcknowledged ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}`}
                onClick={handleToggleAcknowledgment}
                disabled={isToggling}
              >
                <Check className="h-3 w-3 mr-1" />
                {hasAcknowledged ? 'Confirmado' : 'Confirmar'}
              </Button>
              
              {acknowledgmentCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setShowAcknowledgments(!showAcknowledgments)}
                >
                  <Users className="h-3 w-3 mr-1" />
                  {acknowledgmentCount}
                </Button>
              )}
            </div>

            {/* Acknowledgments list */}
            {showAcknowledgments && acknowledgmentCount > 0 && (
              <div className="mt-2 p-2 bg-muted/30 rounded text-xs">
                <p className="font-medium mb-1">Confirmado por:</p>
                <div className="flex flex-wrap gap-1">
                  {acknowledgments.map(ack => (
                    <Badge key={ack.id} variant="secondary" className="text-xs">
                      {ack.profiles?.full_name || 'Usuário'}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
