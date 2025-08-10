
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export type VideoStage = 'scripted' | 'recorded' | 'editing' | 'awaiting_review' | 'approved';
export type ContentType = 'tutorial' | 'review' | 'gameplay' | 'vlog' | 'short' | 'livestream' | 'other';

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
    full_name: string | null;
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
    full_name: string | null;
  };
}

export interface WorkflowActivity {
  id: string;
  video_item_id: string;
  user_id: string;
  activity_type: string;
  description: string;
  metadata: any;
  created_at: string;
  profiles?: {
    full_name: string | null;
  };
}

export const useVideoWorkflow = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all workflow items
  const { data: workflowItems = [], isLoading, error } = useQuery({
    queryKey: ['video-workflow-items', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('video_workflow_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching workflow items:', error);
        throw error;
      }

      return data as VideoWorkflowItem[];
    },
    enabled: !!user,
  });

  // Create new workflow item
  const createItemMutation = useMutation({
    mutationFn: async (newItem: Omit<VideoWorkflowItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('video_workflow_items')
        .insert([{
          ...newItem,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-workflow-items'] });
      toast({
        title: "Item criado",
        description: "Novo item adicionado ao workflow com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error creating workflow item:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar item no workflow.",
        variant: "destructive",
      });
    },
  });

  // Update workflow item stage
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
    },
    onError: (error) => {
      console.error('Error moving workflow item:', error);
      toast({
        title: "Erro",
        description: "Erro ao mover item no workflow.",
        variant: "destructive",
      });
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
      toast({
        title: "Item atualizado",
        description: "Item do workflow atualizado com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error updating workflow item:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar item do workflow.",
        variant: "destructive",
      });
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
      toast({
        title: "Item removido",
        description: "Item removido do workflow com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error deleting workflow item:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover item do workflow.",
        variant: "destructive",
      });
    },
  });

  // Fetch comments for a specific item
  const fetchComments = async (videoItemId: string): Promise<WorkflowComment[]> => {
    try {
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
    } catch (error) {
      console.error('Error in fetchComments:', error);
      return [];
    }
  };

  // Add comment to workflow item
  const addCommentMutation = useMutation({
    mutationFn: async ({ videoItemId, content }: { videoItemId: string; content: string }) => {
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

  // Fetch approvals for a specific item
  const fetchApprovals = async (videoItemId: string): Promise<WorkflowApproval[]> => {
    try {
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
    } catch (error) {
      console.error('Error in fetchApprovals:', error);
      return [];
    }
  };

  // Add approval to workflow item
  const addApprovalMutation = useMutation({
    mutationFn: async ({ 
      videoItemId, 
      approved, 
      comment 
    }: { 
      videoItemId: string; 
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
    workflowItems,
    isLoading,
    error,
    createItem: createItemMutation.mutate,
    moveItem: moveItemMutation.mutate,
    updateItem: updateItemMutation.mutate,
    deleteItem: deleteItemMutation.mutate,
    fetchComments,
    addComment: addCommentMutation.mutate,
    fetchApprovals,
    addApproval: addApprovalMutation.mutate,
    isCreating: createItemMutation.isPending,
    isMoving: moveItemMutation.isPending,
    isUpdating: updateItemMutation.isPending,
    isDeleting: deleteItemMutation.isPending,
  };
};
