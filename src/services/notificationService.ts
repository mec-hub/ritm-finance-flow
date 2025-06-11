
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
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching notification preferences:', error);
      return null;
    }

    return data?.preferences || this.getDefaultPreferences();
  }

  static async updateUserPreferences(userId: string, preferences: NotificationPreferences): Promise<boolean> {
    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        preferences: preferences,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }

    return true;
  }

  static async createInAppNotification(notification: Omit<InAppNotification, 'id' | 'createdAt'>): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: false,
        data: notification.data || {}
      });

    if (error) {
      console.error('Error creating notification:', error);
      return false;
    }

    return true;
  }

  static async getUserNotifications(userId: string, limit: number = 50): Promise<InAppNotification[]> {
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

    return data || [];
  }

  static async markNotificationAsRead(notificationId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }

    return true;
  }

  static async markAllAsRead(userId: string): Promise<boolean> {
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

  static async checkUpcomingEvents(): Promise<void> {
    // This would be called by a scheduled function
    const { data: events } = await supabase
      .from('events')
      .select('*, profiles!events_user_id_fkey(email)')
      .gte('date', new Date().toISOString().split('T')[0])
      .lte('date', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    if (events) {
      for (const event of events) {
        await this.createInAppNotification({
          userId: event.user_id,
          type: 'event',
          title: 'Evento Próximo',
          message: `O evento "${event.title}" está agendado para amanhã.`,
          data: { eventId: event.id }
        });
      }
    }
  }

  static async checkOverduePayments(): Promise<void> {
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*, profiles!transactions_user_id_fkey(email)')
      .eq('status', 'not_paid')
      .lt('date', new Date().toISOString().split('T')[0]);

    if (transactions) {
      for (const transaction of transactions) {
        await this.createInAppNotification({
          userId: transaction.user_id,
          type: 'payment',
          title: 'Pagamento em Atraso',
          message: `O pagamento "${transaction.description}" está em atraso.`,
          data: { transactionId: transaction.id }
        });
      }
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
