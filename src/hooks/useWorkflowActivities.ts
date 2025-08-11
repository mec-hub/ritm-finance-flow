
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

export const useWorkflowActivities = (videoItemId: string) => {
  const { user } = useAuth();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['workflow-activities', videoItemId],
    queryFn: async () => {
      if (!videoItemId) return [];
      
      const { data, error } = await supabase
        .from('video_workflow_activities')
        .select(`
          id,
          video_item_id,
          user_id,
          activity_type,
          description,
          metadata,
          created_at,
          profiles (
            full_name
          )
        `)
        .eq('video_item_id', videoItemId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching activities:', error);
        return [];
      }

      return (data || []).map(activity => ({
        ...activity,
        profiles: activity.profiles || { full_name: null }
      })) as WorkflowActivity[];
    },
    enabled: !!videoItemId && !!user,
  });

  const latestActivity = activities[0] || null;

  return {
    activities,
    latestActivity,
    isLoading,
  };
};
