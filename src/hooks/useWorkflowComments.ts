
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
  };
}

export const useWorkflowComments = (videoItemId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch comments with automatic foreign key joins
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
            full_name
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
        profiles: comment.profiles || { full_name: null }
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
            full_name
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

  return {
    comments,
    isLoading,
    error,
    addComment: addCommentMutation.mutate,
    isAdding: addCommentMutation.isPending,
  };
};
