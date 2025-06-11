
import { supabase } from '@/integrations/supabase/client';

export interface NotificationPreferences {
  email: {
    enabled: boolean;
    address: string;
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
    events: boolean;
    transactions: boolean;
    reports: boolean;
    reminders: boolean;
    team: boolean;
  };
  push: {
    enabled: boolean;
    events: boolean;
    transactions: boolean;
    reminders: boolean;
    team: boolean;
  };
  inApp: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
  };
  reminders: {
    eventsBefore: string;
    paymentsDue: string;
    recurringTransactions: boolean;
  };
}

export interface InAppNotification {
  id: string;
  userId: string;
  type: 'event' | 'transaction' | 'payment' | 'team' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: any;
}

export class NotificationService {
  static async getUserPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('preferences')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching notification preferences:', error);
        return this.getDefaultPreferences();
      }

      return (data?.preferences as NotificationPreferences) || this.getDefaultPreferences();
    } catch (error) {
      console.error('Error in getUserPreferences:', error);
      return this.getDefaultPreferences();
    }
  }

  static async updateUserPreferences(userId: string, preferences: NotificationPreferences): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          preferences: preferences as any
        });

      if (error) {
        console.error('Error updating notification preferences:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateUserPreferences:', error);
      return false;
    }
  }

  static async createInAppNotification(notification: Omit<InAppNotification, 'id' | 'createdAt'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: notification.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          read: notification.read,
          data: notification.data || {}
        });

      if (error) {
        console.error('Error creating notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in createInAppNotification:', error);
      return false;
    }
  }

  static async getUserNotifications(userId: string, limit: number = 50): Promise<InAppNotification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      return data?.map((item: any) => ({
        id: item.id,
        userId: item.user_id,
        type: item.type,
        title: item.title,
        message: item.message,
        read: item.read,
        createdAt: item.created_at,
        data: item.data
      })) || [];
    } catch (error) {
      console.error('Error in getUserNotifications:', error);
      return [];
    }
  }

  static async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markNotificationAsRead:', error);
      return false;
    }
  }

  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      return false;
    }
  }

  static async sendEmailNotification(email: string, type: string, data: any): Promise<boolean> {
    try {
      const { data: result, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: email,
          type: type,
          data: data
        }
      });

      if (error) {
        console.error('Error sending email notification:', error);
        return false;
      }

      console.log('Email sent successfully:', result);
      return true;
    } catch (error) {
      console.error('Error in sendEmailNotification:', error);
      return false;
    }
  }

  private static getDefaultPreferences(): NotificationPreferences {
    return {
      email: {
        enabled: true,
        address: '',
        frequency: 'immediate',
        events: true,
        transactions: true,
        reports: false,
        reminders: true,
        team: true
      },
      push: {
        enabled: true,
        events: true,
        transactions: false,
        reminders: true,
        team: false
      },
      inApp: {
        enabled: true,
        sound: true,
        desktop: true
      },
      reminders: {
        eventsBefore: '24',
        paymentsDue: '3',
        recurringTransactions: true
      }
    };
  }
}
