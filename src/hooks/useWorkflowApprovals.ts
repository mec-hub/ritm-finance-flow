
import { useState, useEffect } from 'react';
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

export const useWorkflowApprovals = (videoItemId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch approvals with real-time updates
  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ['workflow-approvals', videoItemId],
    queryFn: async () => {
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

      return (data || []).map(approval => ({
        ...approval,
        profiles: approval.profiles || { full_name: null }
      })) as WorkflowApproval[];
    },
    enabled: !!videoItemId,
  });

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

      if (error) throw error;
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

  // Set up real-time subscription
  useEffect(() => {
    if (!videoItemId) return;

    const channel = supabase
      .channel(`approvals-${videoItemId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'video_workflow_approvals',
          filter: `video_item_id=eq.${videoItemId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['workflow-approvals', videoItemId] });
          queryClient.invalidateQueries({ queryKey: ['video-workflow-items'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [videoItemId, queryClient]);

  return {
    approvals,
    isLoading,
    addApproval: addApprovalMutation.mutate,
    isAdding: addApprovalMutation.isPending,
  };
};
