
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
    eventsBefore: string; // hours
    paymentsDue: string; // days
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
        .rpc('get_user_notification_preferences', { user_id_param: userId });

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching notification preferences:', error);
        return this.getDefaultPreferences();
      }

      return data?.[0]?.preferences || this.getDefaultPreferences();
    } catch (error) {
      console.error('Error in getUserPreferences:', error);
      return this.getDefaultPreferences();
    }
  }

  static async updateUserPreferences(userId: string, preferences: NotificationPreferences): Promise<boolean> {
    try {
      const { error } = await supabase
        .rpc('upsert_notification_preferences', {
          user_id_param: userId,
          preferences_param: JSON.stringify(preferences)
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
        .rpc('create_notification', {
          user_id_param: notification.userId,
          type_param: notification.type,
          title_param: notification.title,
          message_param: notification.message,
          data_param: JSON.stringify(notification.data || {})
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
        .rpc('get_user_notifications', {
          user_id_param: userId,
          limit_param: limit
        });

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
        .rpc('mark_notification_read', { notification_id_param: notificationId });

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
        .rpc('mark_all_notifications_read', { user_id_param: userId });

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

  static async sendEmailNotification(email: string, subject: string, content: string): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke('send-email-notification', {
        body: { email, subject, content }
      });

      if (error) {
        console.error('Error sending email notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error invoking email function:', error);
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
