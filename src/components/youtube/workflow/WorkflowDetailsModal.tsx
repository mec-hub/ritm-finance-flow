
import { useState } from 'react';
import { VideoWorkflowItem } from '@/hooks/useVideoWorkflow';
import { useWorkflowComments } from '@/hooks/useWorkflowComments';
import { useWorkflowApprovals } from '@/hooks/useWorkflowApprovals';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  ExternalLink, 
  FileText,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Send
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WorkflowDetailsModalProps {
  item: VideoWorkflowItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export const WorkflowDetailsModal = ({ item, open, onOpenChange }: WorkflowDetailsModalProps) => {
  const { comments, addComment, isAdding, error: commentsError } = useWorkflowComments(item.id);
  const { approvals, addApproval, error: approvalsError } = useWorkflowApprovals(item.id);
  const [newComment, setNewComment] = useState('');
  const [approvalComment, setApprovalComment] = useState('');

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addComment(newComment.trim());
      setNewComment('');
    }
  };

  const handleApproval = (approved: boolean) => {
    addApproval({
      approved,
      comment: approvalComment.trim() || undefined,
    });
    setApprovalComment('');
  };

  const approvalCount = approvals.filter(a => a.approved).length;
  const rejectionCount = approvals.filter(a => !a.approved).length;

  // Log errors for debugging
  if (commentsError) {
    console.error('Comments error in modal:', commentsError);
  }
  if (approvalsError) {
    console.error('Approvals error in modal:', approvalsError);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            {item.title}
            <Badge variant="secondary">
              {STAGE_LABELS[item.current_stage]}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Informações do Vídeo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tipo de Conteúdo</span>
                    <p className="font-medium text-foreground">{CONTENT_TYPE_LABELS[item.content_type]}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Prioridade</span>
                    <p className="font-medium text-foreground">
                      {item.priority === 0 ? 'Normal' : 
                       item.priority === 1 ? 'Baixa' :
                       item.priority === 2 ? 'Média' : 'Alta'}
                    </p>
                  </div>
                  {item.estimated_publication_date && (
                    <div>
                      <span className="text-muted-foreground">Data Estimada</span>
                      <p className="font-medium flex items-center gap-1 text-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(item.estimated_publication_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Criado em</span>
                    <p className="font-medium flex items-center gap-1 text-foreground">
                      <Clock className="h-4 w-4" />
                      {format(new Date(item.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </p>
                  </div>
                </div>

                {item.description && (
                  <div>
                    <span className="text-muted-foreground">Descrição</span>
                    <p className="mt-1 text-foreground">{item.description}</p>
                  </div>
                )}

                {item.tags.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Tags</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.tags.map(tag => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {item.script_link && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(item.script_link, '_blank')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Ver Roteiro
                    </Button>
                  )}
                  {item.drive_link && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(item.drive_link, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Abrir Drive
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="comments" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="comments">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Comentários ({comments.length})
                </TabsTrigger>
                <TabsTrigger value="approvals">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aprovações ({approvalCount})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="comments" className="space-y-4">
                <form onSubmit={handleAddComment} className="space-y-2">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Adicionar comentário..."
                    rows={3}
                    className="bg-background border-border"
                  />
                  <Button type="submit" disabled={isAdding || !newComment.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    {isAdding ? 'Enviando...' : 'Comentar'}
                  </Button>
                </form>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {comments.map(comment => (
                    <Card key={comment.id} className="bg-card border-border">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <User className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-foreground">
                                {comment.profiles?.full_name || 'Usuário'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(comment.created_at), 'dd/MM HH:mm', { locale: ptBR })}
                              </span>
                            </div>
                            <p className="text-sm text-foreground">{comment.content}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-4">
                      Nenhum comentário ainda
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="approvals" className="space-y-4">
                {item.current_stage === 'awaiting_review' && (
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-base text-foreground">Dar Aprovação</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Textarea
                        value={approvalComment}
                        onChange={(e) => setApprovalComment(e.target.value)}
                        placeholder="Comentário sobre a aprovação (opcional)..."
                        rows={2}
                        className="bg-background border-border"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApproval(true)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Aprovar
                        </Button>
                        <Button
                          onClick={() => handleApproval(false)}
                          variant="destructive"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Rejeitar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {approvals.map(approval => (
                    <Card key={approval.id} className="bg-card border-border">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          {approval.approved ? (
                            <CheckCircle className="h-4 w-4 mt-1 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 mt-1 text-red-600" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-foreground">
                                {approval.profiles?.full_name || 'Usuário'}
                              </span>
                              <Badge 
                                variant={approval.approved ? "default" : "destructive"}
                                className="text-xs"
                              >
                                {approval.approved ? 'Aprovado' : 'Rejeitado'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(approval.created_at), 'dd/MM HH:mm', { locale: ptBR })}
                              </span>
                            </div>
                            {approval.comment && (
                              <p className="text-sm text-foreground">{approval.comment}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {approvals.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-4">
                      Nenhuma aprovação ainda
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base text-foreground">Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {STAGE_LABELS[item.current_stage]}
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Aprovações:</span>
                    <span className="flex items-center gap-1 text-foreground">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      {approvalCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rejeições:</span>
                    <span className="flex items-center gap-1 text-foreground">
                      <XCircle className="h-3 w-3 text-red-600" />
                      {rejectionCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Comentários:</span>
                    <span className="text-foreground">{comments.length}</span>
                  </div>
                </div>

                {approvalCount >= 2 && item.current_stage === 'awaiting_review' && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                    <p className="text-sm text-green-800 dark:text-green-200 text-center">
                      ✅ Pronto para ser arquivado!<br />
                      (2+ aprovações recebidas)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
