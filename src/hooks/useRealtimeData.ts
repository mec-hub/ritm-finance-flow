
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RealtimeTableSubscription {
  table: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
}

export const useRealtimeData = (subscriptions: RealtimeTableSubscription[]) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const channels = subscriptions.map(({ table, onInsert, onUpdate, onDelete }) => {
      const channel = supabase
        .channel(`realtime-${table}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table
          },
          (payload) => {
            console.log(`Realtime update on ${table}:`, payload);
            
            switch (payload.eventType) {
              case 'INSERT':
                onInsert?.(payload);
                break;
              case 'UPDATE':
                onUpdate?.(payload);
                break;
              case 'DELETE':
                onDelete?.(payload);
                break;
            }
          }
        )
        .subscribe((status) => {
          console.log(`Realtime status for ${table}:`, status);
          setIsConnected(status === 'SUBSCRIBED');
        });

      return channel;
    });

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [subscriptions]);

  return { isConnected };
};
