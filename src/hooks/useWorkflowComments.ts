
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface WorkflowComment {
  id: string;
  video_item_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export const useWorkflowComments = (videoItemId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch comments with automatic foreign key joins including avatar_url
  const { data: comments = [], isLoading, error } = useQuery({
    queryKey: ['workflow-comments', videoItemId],
    queryFn: async () => {
      if (!videoItemId) {
        console.log('No videoItemId provided for comments');
        return [];
      }
      
      console.log('Fetching comments for video:', videoItemId);
      
      const { data, error } = await supabase
        .from('video_workflow_comments')
        .select(`
          id,
          video_item_id,
          user_id,
          content,
          created_at,
          profiles!fk_video_workflow_comments_user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('video_item_id', videoItemId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        throw error;
      }

      console.log('Comments fetched:', data?.length || 0, 'for video:', videoItemId);
      
      return (data || []).map(comment => ({
        ...comment,
        profiles: comment.profiles || { full_name: null, avatar_url: null }
      })) as WorkflowComment[];
    },
    enabled: !!videoItemId && !!user,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Adding comment:', content, 'for video:', videoItemId);
      
      const { data, error } = await supabase
        .from('video_workflow_comments')
        .insert([{
          video_item_id: videoItemId,
          user_id: user.id,
          content,
        }])
        .select(`
          id,
          video_item_id,
          user_id,
          content,
          created_at,
          profiles!fk_video_workflow_comments_user_id (
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) {
        console.error('Error adding comment:', error);
        throw error;
      }
      
      console.log('Comment added successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-comments', videoItemId] });
      queryClient.invalidateQueries({ queryKey: ['video-workflow-items'] });
      toast({
        title: "Comentário adicionado",
        description: "Comentário adicionado com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error adding comment:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar comentário.",
        variant: "destructive",
      });
    },
  });

  // Edit comment mutation
  const editCommentMutation = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('video_workflow_comments')
        .update({ content })
        .eq('id', commentId)
        .eq('user_id', user.id) // Ensure only the author can edit
        .select()
        .single();

      if (error) {
        console.error('Error editing comment:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-comments', videoItemId] });
      toast({
        title: "Comentário atualizado",
        description: "Comentário atualizado com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error editing comment:', error);
      toast({
        title: "Erro",
        description: "Erro ao editar comentário.",
        variant: "destructive",
      });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('video_workflow_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id); // Ensure only the author can delete

      if (error) {
        console.error('Error deleting comment:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-comments', videoItemId] });
      queryClient.invalidateQueries({ queryKey: ['video-workflow-items'] });
      toast({
        title: "Comentário removido",
        description: "Comentário removido com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error deleting comment:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover comentário.",
        variant: "destructive",
      });
    },
  });

  return {
    comments,
    isLoading,
    error,
    addComment: addCommentMutation.mutate,
    editComment: editCommentMutation.mutate,
    deleteComment: deleteCommentMutation.mutate,
    isAdding: addCommentMutation.isPending,
    isEditing: editCommentMutation.isPending,
    isDeleting: deleteCommentMutation.isPending,
  };
};
