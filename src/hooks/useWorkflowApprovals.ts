
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
  profiles: {
    full_name: string | null;
  };
}

export const useWorkflowApprovals = (videoItemId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch approvals with automatic foreign key joins
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
          profiles!fk_video_workflow_approvals_user_id (
            full_name
          )
        `)
        .eq('video_item_id', videoItemId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching approvals:', error);
        throw error;
      }

      console.log('Approvals fetched:', data?.length || 0, 'for video:', videoItemId);
      
      return (data || []).map(approval => ({
        ...approval,
        profiles: approval.profiles || { full_name: null }
      })) as WorkflowApproval[];
    },
    enabled: !!videoItemId && !!user,
    staleTime: 30000,
    refetchOnWindowFocus: false,
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
        .select(`
          id,
          video_item_id,
          user_id,
          approved,
          comment,
          created_at,
          profiles!fk_video_workflow_approvals_user_id (
            full_name
          )
        `)
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

  return {
    approvals,
    isLoading,
    error,
    addApproval: addApprovalMutation.mutate,
    isAdding: addApprovalMutation.isPending,
  };
};
