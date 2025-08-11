export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      budget_attachments: {
        Row: {
          budget_id: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          uploaded_at: string
        }
        Insert: {
          budget_id: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          uploaded_at?: string
        }
        Update: {
          budget_id?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_attachments_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          amount: number | null
          budget_type: string | null
          created_at: string
          description: string | null
          external_url: string | null
          id: string
          metadata: Json | null
          name: string
          period_end: string | null
          period_start: string | null
          status: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          budget_type?: string | null
          created_at?: string
          description?: string | null
          external_url?: string | null
          id?: string
          metadata?: Json | null
          name: string
          period_end?: string | null
          period_start?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          budget_type?: string | null
          created_at?: string
          description?: string | null
          external_url?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          period_end?: string | null
          period_start?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          display_order: number | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          contact: string | null
          created_at: string | null
          email: string | null
          id: string
          instagram_url: string | null
          last_event: string | null
          name: string
          notes: string | null
          phone: string | null
          total_revenue: number | null
          updated_at: string | null
          user_id: string
          website_url: string | null
          whatsapp_url: string | null
        }
        Insert: {
          contact?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          instagram_url?: string | null
          last_event?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          total_revenue?: number | null
          updated_at?: string | null
          user_id: string
          website_url?: string | null
          whatsapp_url?: string | null
        }
        Update: {
          contact?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          instagram_url?: string | null
          last_event?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          total_revenue?: number | null
          updated_at?: string | null
          user_id?: string
          website_url?: string | null
          whatsapp_url?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          actual_expenses: number | null
          actual_revenue: number | null
          client_id: string | null
          created_at: string | null
          date: string
          end_time: string | null
          estimated_expenses: number | null
          estimated_revenue: number | null
          formatted_address: string | null
          id: string
          latitude: number | null
          location: string | null
          longitude: number | null
          notes: string | null
          place_id: string | null
          place_name: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["event_status"] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_expenses?: number | null
          actual_revenue?: number | null
          client_id?: string | null
          created_at?: string | null
          date: string
          end_time?: string | null
          estimated_expenses?: number | null
          estimated_revenue?: number | null
          formatted_address?: string | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          notes?: string | null
          place_id?: string | null
          place_name?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["event_status"] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual_expenses?: number | null
          actual_revenue?: number | null
          client_id?: string | null
          created_at?: string | null
          date?: string
          end_time?: string | null
          estimated_expenses?: number | null
          estimated_revenue?: number | null
          formatted_address?: string | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          notes?: string | null
          place_id?: string | null
          place_name?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["event_status"] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          id: string
          preferences: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          preferences?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          preferences?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          location: string | null
          phone: string | null
          position: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          location?: string | null
          phone?: string | null
          position?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          position?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      recurring_transactions: {
        Row: {
          created_at: string | null
          generated_transaction_id: string | null
          id: string
          is_generated: boolean | null
          parent_transaction_id: string
          scheduled_date: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          generated_transaction_id?: string | null
          id?: string
          is_generated?: boolean | null
          parent_transaction_id: string
          scheduled_date: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          generated_transaction_id?: string | null
          id?: string
          is_generated?: boolean | null
          parent_transaction_id?: string
          scheduled_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_transactions_generated_transaction_id_fkey"
            columns: ["generated_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_transactions_parent_transaction_id_fkey"
            columns: ["parent_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          calculated_expenses: number | null
          calculated_income: number | null
          created_at: string | null
          id: string
          last_calculation_date: string | null
          name: string
          pending_amount: number | null
          percentage_share: number | null
          profile_id: string | null
          role: string | null
          total_paid: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          calculated_expenses?: number | null
          calculated_income?: number | null
          created_at?: string | null
          id?: string
          last_calculation_date?: string | null
          name: string
          pending_amount?: number | null
          percentage_share?: number | null
          profile_id?: string | null
          role?: string | null
          total_paid?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          calculated_expenses?: number | null
          calculated_income?: number | null
          created_at?: string | null
          id?: string
          last_calculation_date?: string | null
          name?: string
          pending_amount?: number | null
          percentage_share?: number | null
          profile_id?: string | null
          role?: string | null
          total_paid?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_transaction_assignments: {
        Row: {
          created_at: string | null
          id: string
          percentage_value: number
          team_member_id: string
          transaction_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          percentage_value: number
          team_member_id: string
          transaction_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          percentage_value?: number
          team_member_id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_transaction_assignments_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_transaction_assignments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          attachments: string[] | null
          category: string
          client_id: string | null
          created_at: string | null
          date: string
          description: string
          event_id: string | null
          id: string
          is_recurring: boolean | null
          notes: string | null
          recurrence_interval:
            | Database["public"]["Enums"]["recurrence_interval"]
            | null
          recurrence_months: number | null
          status: Database["public"]["Enums"]["transaction_status"] | null
          subcategory: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          attachments?: string[] | null
          category: string
          client_id?: string | null
          created_at?: string | null
          date: string
          description: string
          event_id?: string | null
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          recurrence_interval?:
            | Database["public"]["Enums"]["recurrence_interval"]
            | null
          recurrence_months?: number | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          subcategory?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          attachments?: string[] | null
          category?: string
          client_id?: string | null
          created_at?: string | null
          date?: string
          description?: string
          event_id?: string | null
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          recurrence_interval?:
            | Database["public"]["Enums"]["recurrence_interval"]
            | null
          recurrence_months?: number | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          subcategory?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      video_workflow_activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          user_id: string
          video_item_id: string
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          user_id: string
          video_item_id: string
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          user_id?: string
          video_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_video_workflow_activities_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_video_workflow_activities_video_item_id"
            columns: ["video_item_id"]
            isOneToOne: false
            referencedRelation: "video_workflow_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_workflow_activities_video_item_id_fkey"
            columns: ["video_item_id"]
            isOneToOne: false
            referencedRelation: "video_workflow_items"
            referencedColumns: ["id"]
          },
        ]
      }
      video_workflow_approvals: {
        Row: {
          approved: boolean
          comment: string | null
          created_at: string | null
          id: string
          user_id: string
          video_item_id: string
        }
        Insert: {
          approved: boolean
          comment?: string | null
          created_at?: string | null
          id?: string
          user_id: string
          video_item_id: string
        }
        Update: {
          approved?: boolean
          comment?: string | null
          created_at?: string | null
          id?: string
          user_id?: string
          video_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_video_workflow_approvals_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_video_workflow_approvals_video_item_id"
            columns: ["video_item_id"]
            isOneToOne: false
            referencedRelation: "video_workflow_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_workflow_approvals_video_item_id_fkey"
            columns: ["video_item_id"]
            isOneToOne: false
            referencedRelation: "video_workflow_items"
            referencedColumns: ["id"]
          },
        ]
      }
      video_workflow_archived: {
        Row: {
          approval_count: number | null
          completed_at: string | null
          content_type: Database["public"]["Enums"]["content_type"]
          final_publication_date: string | null
          id: string
          metadata: Json | null
          original_item_id: string
          title: string
          user_id: string
        }
        Insert: {
          approval_count?: number | null
          completed_at?: string | null
          content_type: Database["public"]["Enums"]["content_type"]
          final_publication_date?: string | null
          id?: string
          metadata?: Json | null
          original_item_id: string
          title: string
          user_id: string
        }
        Update: {
          approval_count?: number | null
          completed_at?: string | null
          content_type?: Database["public"]["Enums"]["content_type"]
          final_publication_date?: string | null
          id?: string
          metadata?: Json | null
          original_item_id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      video_workflow_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          user_id: string
          video_item_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          user_id: string
          video_item_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          user_id?: string
          video_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_video_workflow_comments_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_video_workflow_comments_video_item_id"
            columns: ["video_item_id"]
            isOneToOne: false
            referencedRelation: "video_workflow_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_workflow_comments_video_item_id_fkey"
            columns: ["video_item_id"]
            isOneToOne: false
            referencedRelation: "video_workflow_items"
            referencedColumns: ["id"]
          },
        ]
      }
      video_workflow_items: {
        Row: {
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string | null
          current_stage: Database["public"]["Enums"]["video_stage"]
          description: string | null
          drive_link: string | null
          estimated_publication_date: string | null
          id: string
          priority: number | null
          script_link: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string | null
          current_stage?: Database["public"]["Enums"]["video_stage"]
          description?: string | null
          drive_link?: string | null
          estimated_publication_date?: string | null
          id?: string
          priority?: number | null
          script_link?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string | null
          current_stage?: Database["public"]["Enums"]["video_stage"]
          description?: string | null
          drive_link?: string | null
          estimated_publication_date?: string | null
          id?: string
          priority?: number | null
          script_link?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      youtube_cache: {
        Row: {
          cache_data: Json
          cache_key: string
          created_at: string
          expires_at: string
          id: string
          user_id: string
        }
        Insert: {
          cache_data: Json
          cache_key: string
          created_at?: string
          expires_at: string
          id?: string
          user_id: string
        }
        Update: {
          cache_data?: Json
          cache_key?: string
          created_at?: string
          expires_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      youtube_tokens: {
        Row: {
          access_token: string
          channel_id: string
          channel_title: string | null
          created_at: string
          expires_at: string
          id: string
          refresh_token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          channel_id: string
          channel_title?: string | null
          created_at?: string
          expires_at: string
          id?: string
          refresh_token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          channel_id?: string
          channel_title?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          refresh_token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_team_member_earnings: {
        Args: { member_id: string; start_date?: string; end_date?: string }
        Returns: {
          total_earnings: number
          total_transactions: number
          avg_percentage: number
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_transactions_with_team_data: {
        Args: { user_id_param: string }
        Returns: {
          id: string
          amount: number
          description: string
          date: string
          category: string
          subcategory: string
          is_recurring: boolean
          recurrence_interval: string
          recurrence_months: number
          type: string
          event_id: string
          client_id: string
          notes: string
          status: string
          attachments: string[]
          team_assignments: Json
        }[]
      }
      update_all_team_member_earnings: {
        Args: { user_id_param: string }
        Returns: undefined
      }
      update_team_member_earnings: {
        Args: { member_id_param: string }
        Returns: undefined
      }
    }
    Enums: {
      activity_type: "created" | "moved" | "commented" | "approved" | "rejected"
      app_role: "admin" | "manager" | "user"
      content_type:
        | "tutorial"
        | "review"
        | "gameplay"
        | "vlog"
        | "short"
        | "livestream"
        | "other"
      event_status: "upcoming" | "completed" | "cancelled"
      recurrence_interval: "weekly" | "monthly" | "quarterly" | "yearly"
      transaction_status: "paid" | "not_paid" | "canceled"
      transaction_type: "income" | "expense"
      video_stage:
        | "scripted"
        | "recorded"
        | "editing"
        | "awaiting_review"
        | "approved"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_type: ["created", "moved", "commented", "approved", "rejected"],
      app_role: ["admin", "manager", "user"],
      content_type: [
        "tutorial",
        "review",
        "gameplay",
        "vlog",
        "short",
        "livestream",
        "other",
      ],
      event_status: ["upcoming", "completed", "cancelled"],
      recurrence_interval: ["weekly", "monthly", "quarterly", "yearly"],
      transaction_status: ["paid", "not_paid", "canceled"],
      transaction_type: ["income", "expense"],
      video_stage: [
        "scripted",
        "recorded",
        "editing",
        "awaiting_review",
        "approved",
      ],
    },
  },
} as const
