export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          contact: string | null
          created_at: string | null
          email: string | null
          id: string
          last_event: string | null
          name: string
          notes: string | null
          phone: string | null
          total_revenue: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          contact?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_event?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          total_revenue?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          contact?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_event?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          total_revenue?: number | null
          updated_at?: string | null
          user_id?: string
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
          estimated_expenses: number | null
          estimated_revenue: number | null
          id: string
          location: string | null
          notes: string | null
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
          estimated_expenses?: number | null
          estimated_revenue?: number | null
          id?: string
          location?: string | null
          notes?: string | null
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
          estimated_expenses?: number | null
          estimated_revenue?: number | null
          id?: string
          location?: string | null
          notes?: string | null
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
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          location: string | null
          phone: string | null
          position: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          location?: string | null
          phone?: string | null
          position?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          position?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string | null
          website?: string | null
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
          created_at: string | null
          id: string
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
          created_at?: string | null
          id?: string
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
          created_at?: string | null
          id?: string
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
          team_assignments: Json
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "user"
      event_status: "upcoming" | "completed" | "cancelled"
      recurrence_interval: "weekly" | "monthly" | "quarterly" | "yearly"
      transaction_status: "paid" | "not_paid" | "canceled"
      transaction_type: "income" | "expense"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "manager", "user"],
      event_status: ["upcoming", "completed", "cancelled"],
      recurrence_interval: ["weekly", "monthly", "quarterly", "yearly"],
      transaction_status: ["paid", "not_paid", "canceled"],
      transaction_type: ["income", "expense"],
    },
  },
} as const
