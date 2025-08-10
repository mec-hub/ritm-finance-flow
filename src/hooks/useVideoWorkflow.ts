
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type VideoStage = 'scripted' | 'recorded' | 'editing' | 'awaiting_review' | 'approved';
export type ContentType = 'tutorial' | 'review' | 'gameplay' | 'vlog' | 'short' | 'livestream' | 'other';
export type ActivityType = 'created' | 'moved' | 'commented' | 'approved' | 'rejected';

export interface VideoWorkflowItem {
  id: string;
  user_id: string;
  title: string;
  content_type: ContentType;
  script_link?: string;
  drive_link?: string;
  estimated_publication_date?: string;
  current_stage: VideoStage;
  description?: string;
  thumbnail_url?: string;
  priority: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface WorkflowComment {
  id: string;
  video_item_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

export interface WorkflowApproval {
  id: string;
  video_item_id: string;
  user_id: string;
  approved: boolean;
  comment?: string;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

export interface WorkflowActivity {
  id: string;
  video_item_id: string;
  user_id: string;
  activity_type: ActivityType;
  description: string;
  metadata: any;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

export const useVideoWorkflow = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all workflow items
  const { data: workflowItems, isLoading } = useQuery({
    queryKey: ['video-workflow-items', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('video_workflow_items')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as VideoWorkflowItem[];
    },
    enabled: !!user,
  });

  // Create new workflow item
  const createItemMutation = useMutation({
    mutationFn: async (item: Omit<VideoWorkflowItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('video_workflow_items')
        .insert({
          ...item,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-workflow-items'] });
      toast.success('Item criado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating workflow item:', error);
      toast.error('Erro ao criar item');
    },
  });

  // Update workflow item
  const updateItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<VideoWorkflowItem> }) => {
      const { data, error } = await supabase
        .from('video_workflow_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-workflow-items'] });
    },
    onError: (error) => {
      console.error('Error updating workflow item:', error);
      toast.error('Erro ao atualizar item');
    },
  });

  // Delete workflow item
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('video_workflow_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-workflow-items'] });
      toast.success('Item removido com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting workflow item:', error);
      toast.error('Erro ao remover item');
    },
  });

  // Move item to different stage
  const moveItemMutation = useMutation({
    mutationFn: async ({ id, newStage }: { id: string; newStage: VideoStage }) => {
      const { data, error } = await supabase
        .from('video_workflow_items')
        .update({ current_stage: newStage })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-workflow-items'] });
      toast.success('Item movido com sucesso!');
    },
    onError: (error) => {
      console.error('Error moving workflow item:', error);
      toast.error('Erro ao mover item');
    },
  });

  return {
    workflowItems: workflowItems || [],
    isLoading,
    createItem: createItemMutation.mutate,
    updateItem: updateItemMutation.mutate,
    deleteItem: deleteItemMutation.mutate,
    moveItem: moveItemMutation.mutate,
    isCreating: createItemMutation.isPending,
    isUpdating: updateItemMutation.isPending,
    isDeleting: deleteItemMutation.isPending,
    isMoving: moveItemMutation.isPending,
  };
};

export const useWorkflowComments = (videoItemId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch comments for a video item
  const { data: comments, isLoading } = useQuery({
    queryKey: ['workflow-comments', videoItemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_workflow_comments')
        .select(`
          *,
          profiles:user_id (
            full_name
          )
        `)
        .eq('video_item_id', videoItemId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as WorkflowComment[];
    },
    enabled: !!videoItemId,
  });

  // Add comment
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('video_workflow_comments')
        .insert({
          video_item_id: videoItemId,
          user_id: user.id,
          content,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-comments', videoItemId] });
    },
    onError: (error) => {
      console.error('Error adding comment:', error);
      toast.error('Erro ao adicionar comentário');
    },
  });

  return {
    comments: comments || [],
    isLoading,
    addComment: addCommentMutation.mutate,
    isAdding: addCommentMutation.isPending,
  };
};

export const useWorkflowApprovals = (videoItemId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch approvals for a video item
  const { data: approvals, isLoading } = useQuery({
    queryKey: ['workflow-approvals', videoItemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_workflow_approvals')
        .select(`
          *,
          profiles:user_id (
            full_name
          )
        `)
        .eq('video_item_id', videoItemId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as WorkflowApproval[];
    },
    enabled: !!videoItemId,
  });

  // Add approval
  const addApprovalMutation = useMutation({
    mutationFn: async ({ approved, comment }: { approved: boolean; comment?: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('video_workflow_approvals')
        .upsert({
          video_item_id: videoItemId,
          user_id: user.id,
          approved,
          comment,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-approvals', videoItemId] });
      queryClient.invalidateQueries({ queryKey: ['video-workflow-items'] });
      toast.success('Aprovação registrada!');
    },
    onError: (error) => {
      console.error('Error adding approval:', error);
      toast.error('Erro ao registrar aprovação');
    },
  });

  return {
    approvals: approvals || [],
    isLoading,
    addApproval: addApprovalMutation.mutate,
    isAdding: addApprovalMutation.isPending,
  };
};
