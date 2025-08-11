
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface WorkflowApproval {
  id: string;
  video_item_id: string;
  user_id: string;
  approved: boolean;
  comment?: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
  };
}

// Global channel management to prevent duplicate subscriptions
const activeChannels = new Map<string, any>();

export const useWorkflowApprovals = (videoItemId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  // Fetch approvals with real-time updates
  const { data: approvals = [], isLoading, error } = useQuery({
    queryKey: ['workflow-approvals', videoItemId],
    queryFn: async () => {
      if (!videoItemId) {
        console.log('No videoItemId provided for approvals');
        return [];
      }
      
      console.log('Fetching approvals for video:', videoItemId);
      
      const { data, error } = await supabase
        .from('video_workflow_approvals')
        .select(`
          id,
          video_item_id,
          user_id,
          approved,
          comment,
          created_at,
          profiles (
            full_name
          )
        `)
        .eq('video_item_id', videoItemId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching approvals:', error);
        return [];
      }

      console.log('Approvals fetched:', data?.length || 0, 'for video:', videoItemId);
      
      return (data || []).map(approval => ({
        ...approval,
        profiles: approval.profiles || { full_name: null }
      })) as WorkflowApproval[];
    },
    enabled: !!videoItemId && !!user,
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false,
  });

  // Log any query errors
  useEffect(() => {
    if (error) {
      console.error('Approvals query error:', error);
    }
  }, [error]);

  // Add approval mutation
  const addApprovalMutation = useMutation({
    mutationFn: async ({ 
      approved, 
      comment 
    }: { 
      approved: boolean; 
      comment?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Adding approval:', { approved, comment }, 'for video:', videoItemId);
      
      const { data, error } = await supabase
        .from('video_workflow_approvals')
        .upsert([{
          video_item_id: videoItemId,
          user_id: user.id,
          approved,
          comment,
        }], {
          onConflict: 'video_item_id,user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding approval:', error);
        throw error;
      }
      
      console.log('Approval added successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-approvals', videoItemId] });
      queryClient.invalidateQueries({ queryKey: ['video-workflow-items'] });
      toast({
        title: "Aprovação registrada",
        description: "Aprovação registrada com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error adding approval:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar aprovação.",
        variant: "destructive",
      });
    },
  });

  // Set up real-time subscription with proper cleanup
  useEffect(() => {
    if (!videoItemId || !user || isSubscribedRef.current) return;

    const channelKey = `approvals-${videoItemId}`;
    
    // Check if channel already exists
    if (activeChannels.has(channelKey)) {
      console.log('Approvals channel already exists for:', videoItemId);
      return;
    }

    console.log('Setting up approvals subscription for:', videoItemId);
    
    const channel = supabase.channel(channelKey);
    
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'video_workflow_approvals',
          filter: `video_item_id=eq.${videoItemId}`,
        },
        (payload) => {
          console.log('Approvals realtime update:', payload);
          queryClient.invalidateQueries({ queryKey: ['workflow-approvals', videoItemId] });
          queryClient.invalidateQueries({ queryKey: ['video-workflow-items'] });
        }
      )
      .subscribe((status) => {
        console.log('Approvals subscription status:', status);
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
        }
      });

    channelRef.current = channel;
    activeChannels.set(channelKey, channel);

    return () => {
      console.log('Cleaning up approvals subscription for:', videoItemId);
      isSubscribedRef.current = false;
      
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        activeChannels.delete(channelKey);
        channelRef.current = null;
      }
    };
  }, [videoItemId, queryClient, user]);

  return {
    approvals,
    isLoading,
    error,
    addApproval: addApprovalMutation.mutate,
    isAdding: addApprovalMutation.isPending,
  };
};
