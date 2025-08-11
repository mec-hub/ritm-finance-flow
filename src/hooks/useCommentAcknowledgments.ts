
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface CommentAcknowledgment {
  id: string;
  comment_id: string;
  user_id: string;
  acknowledged_at: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export const useCommentAcknowledgments = (commentId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch acknowledgments for a comment
  const { data: acknowledgments = [], isLoading } = useQuery({
    queryKey: ['comment-acknowledgments', commentId],
    queryFn: async () => {
      if (!commentId) return [];
      
      const { data, error } = await supabase
        .from('video_workflow_comment_acknowledgments')
        .select(`
          id,
          comment_id,
          user_id,
          acknowledged_at,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('comment_id', commentId)
        .order('acknowledged_at', { ascending: true });

      if (error) {
        console.error('Error fetching acknowledgments:', error);
        return [];
      }

      return (data || []).map(ack => ({
        ...ack,
        profiles: ack.profiles || { full_name: null, avatar_url: null }
      })) as CommentAcknowledgment[];
    },
    enabled: !!commentId && !!user,
  });

  // Check if current user has acknowledged this comment
  const hasAcknowledged = acknowledgments.some(ack => ack.user_id === user?.id);

  // Toggle acknowledgment mutation
  const toggleAcknowledgmentMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      if (hasAcknowledged) {
        // Remove acknowledgment
        const existingAck = acknowledgments.find(ack => ack.user_id === user.id);
        if (existingAck) {
          const { error } = await supabase
            .from('video_workflow_comment_acknowledgments')
            .delete()
            .eq('id', existingAck.id);
          
          if (error) throw error;
        }
      } else {
        // Add acknowledgment
        const { error } = await supabase
          .from('video_workflow_comment_acknowledgments')
          .insert([{
            comment_id: commentId,
            user_id: user.id,
          }]);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comment-acknowledgments', commentId] });
      queryClient.invalidateQueries({ queryKey: ['workflow-comments'] });
    },
    onError: (error) => {
      console.error('Error toggling acknowledgment:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar confirmação do comentário.",
        variant: "destructive",
      });
    },
  });

  return {
    acknowledgments,
    hasAcknowledged,
    acknowledgmentCount: acknowledgments.length,
    isLoading,
    toggleAcknowledgment: toggleAcknowledgmentMutation.mutate,
    isToggling: toggleAcknowledgmentMutation.isPending,
  };
};
