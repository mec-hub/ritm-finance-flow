
import { useState, useEffect, useRef } from 'react';
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
  profiles?: {
    full_name: string | null;
  };
}

// Global channel management to prevent duplicate subscriptions
const activeChannels = new Map<string, any>();

export const useWorkflowComments = (videoItemId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  // Fetch comments with real-time updates
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['workflow-comments', videoItemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_workflow_comments')
        .select(`
          id,
          video_item_id,
          user_id,
          content,
          created_at,
          profiles (
            full_name
          )
        `)
        .eq('video_item_id', videoItemId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        return [];
      }

      return (data || []).map(comment => ({
        ...comment,
        profiles: comment.profiles || { full_name: null }
      })) as WorkflowComment[];
    },
    enabled: !!videoItemId,
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('video_workflow_comments')
        .insert([{
          video_item_id: videoItemId,
          user_id: user.id,
          content,
        }])
        .select()
        .single();

      if (error) throw error;
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

  // Set up real-time subscription with proper cleanup
  useEffect(() => {
    if (!videoItemId || isSubscribedRef.current) return;

    const channelKey = `comments-${videoItemId}`;
    
    // Check if channel already exists
    if (activeChannels.has(channelKey)) {
      console.log('Channel already exists for:', videoItemId);
      return;
    }

    console.log('Setting up comments subscription for:', videoItemId);
    
    const channel = supabase.channel(channelKey);
    
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'video_workflow_comments',
          filter: `video_item_id=eq.${videoItemId}`,
        },
        (payload) => {
          console.log('Comments realtime update:', payload);
          queryClient.invalidateQueries({ queryKey: ['workflow-comments', videoItemId] });
          queryClient.invalidateQueries({ queryKey: ['video-workflow-items'] });
        }
      )
      .subscribe((status) => {
        console.log('Comments subscription status:', status);
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
        }
      });

    channelRef.current = channel;
    activeChannels.set(channelKey, channel);

    return () => {
      console.log('Cleaning up comments subscription for:', videoItemId);
      isSubscribedRef.current = false;
      
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        activeChannels.delete(channelKey);
        channelRef.current = null;
      }
    };
  }, [videoItemId, queryClient]);

  return {
    comments,
    isLoading,
    addComment: addCommentMutation.mutate,
    isAdding: addCommentMutation.isPending,
  };
};
