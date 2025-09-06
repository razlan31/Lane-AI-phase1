export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ai_audit: {
        Row: {
          created_at: string | null
          id: string
          prompt: string | null
          response: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          prompt?: string | null
          response?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          prompt?: string | null
          response?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      alerts: {
        Row: {
          created_at: string
          id: string
          is_dismissed: boolean | null
          is_read: boolean | null
          message: string
          metadata: Json | null
          severity: string
          title: string
          type: string
          updated_at: string
          user_id: string
          venture_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          severity: string
          title: string
          type: string
          updated_at?: string
          user_id: string
          venture_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          severity?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
          venture_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_venture_id_fkey"
            columns: ["venture_id"]
            isOneToOne: false
            referencedRelation: "ventures"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: string
          price_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          price_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          price_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      block_dependencies: {
        Row: {
          created_at: string | null
          dependency_type: string
          dependent_block_id: string
          id: string
          parent_block_id: string
          strength: number | null
        }
        Insert: {
          created_at?: string | null
          dependency_type?: string
          dependent_block_id: string
          id?: string
          parent_block_id: string
          strength?: number | null
        }
        Update: {
          created_at?: string | null
          dependency_type?: string
          dependent_block_id?: string
          id?: string
          parent_block_id?: string
          strength?: number | null
        }
        Relationships: []
      }
      blocks: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
          status: string
          tags: string[] | null
          updated_at: string
          venture_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: string
          tags?: string[] | null
          updated_at?: string
          venture_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: string
          tags?: string[] | null
          updated_at?: string
          venture_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocks_venture_id_fkey"
            columns: ["venture_id"]
            isOneToOne: false
            referencedRelation: "ventures"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
          venture_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
          venture_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
          venture_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_sessions_venture_id_fkey"
            columns: ["venture_id"]
            isOneToOne: false
            referencedRelation: "ventures"
            referencedColumns: ["id"]
          },
        ]
      }
      kpis: {
        Row: {
          confidence: string | null
          confidence_level: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
          value: number | null
          venture_id: string
        }
        Insert: {
          confidence?: string | null
          confidence_level?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          value?: number | null
          venture_id: string
        }
        Update: {
          confidence?: string | null
          confidence_level?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          value?: number | null
          venture_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kpis_venture_id_fkey"
            columns: ["venture_id"]
            isOneToOne: false
            referencedRelation: "ventures"
            referencedColumns: ["id"]
          },
        ]
      }
      manual_logs: {
        Row: {
          content: string
          created_at: string | null
          id: string
          type: string | null
          user_id: string
          venture_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          type?: string | null
          user_id: string
          venture_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          type?: string | null
          user_id?: string
          venture_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "manual_logs_venture_id_fkey"
            columns: ["venture_id"]
            isOneToOne: false
            referencedRelation: "ventures"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          block_id: string | null
          content: string
          context_id: string | null
          context_type: string | null
          created_at: string
          id: string
          tags: string[] | null
          updated_at: string
          user_id: string
          venture_id: string | null
        }
        Insert: {
          block_id?: string | null
          content: string
          context_id?: string | null
          context_type?: string | null
          created_at?: string
          id?: string
          tags?: string[] | null
          updated_at?: string
          user_id: string
          venture_id?: string | null
        }
        Update: {
          block_id?: string | null
          content?: string
          context_id?: string | null
          context_type?: string | null
          created_at?: string
          id?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string
          venture_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notes_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_venture_id_fkey"
            columns: ["venture_id"]
            isOneToOne: false
            referencedRelation: "ventures"
            referencedColumns: ["id"]
          },
        ]
      }
      personal: {
        Row: {
          activities: string[] | null
          commitments: string[] | null
          created_at: string
          goals: string[] | null
          id: string
          monthly_burn: number | null
          savings: number | null
          updated_at: string
          user_id: string
          work_hours: number | null
        }
        Insert: {
          activities?: string[] | null
          commitments?: string[] | null
          created_at?: string
          goals?: string[] | null
          id?: string
          monthly_burn?: number | null
          savings?: number | null
          updated_at?: string
          user_id: string
          work_hours?: number | null
        }
        Update: {
          activities?: string[] | null
          commitments?: string[] | null
          created_at?: string
          goals?: string[] | null
          id?: string
          monthly_burn?: number | null
          savings?: number | null
          updated_at?: string
          user_id?: string
          work_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      playground_links: {
        Row: {
          block_id: string | null
          created_at: string
          id: string
          kpi_id: string | null
          position: Json | null
          session_id: string
          worksheet_id: string | null
        }
        Insert: {
          block_id?: string | null
          created_at?: string
          id?: string
          kpi_id?: string | null
          position?: Json | null
          session_id: string
          worksheet_id?: string | null
        }
        Update: {
          block_id?: string | null
          created_at?: string
          id?: string
          kpi_id?: string | null
          position?: Json | null
          session_id?: string
          worksheet_id?: string | null
        }
        Relationships: []
      }
      playground_sessions: {
        Row: {
          canvas: Json | null
          created_at: string
          description: string | null
          id: string
          name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          canvas?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          canvas?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolio_metrics: {
        Row: {
          calculated_at: string
          diversification_score: number | null
          id: string
          metadata: Json | null
          portfolio_roi: number | null
          risk_score: number | null
          total_burn_rate: number | null
          total_revenue: number | null
          total_runway: number | null
          user_id: string
        }
        Insert: {
          calculated_at?: string
          diversification_score?: number | null
          id?: string
          metadata?: Json | null
          portfolio_roi?: number | null
          risk_score?: number | null
          total_burn_rate?: number | null
          total_revenue?: number | null
          total_runway?: number | null
          user_id: string
        }
        Update: {
          calculated_at?: string
          diversification_score?: number | null
          id?: string
          metadata?: Json | null
          portfolio_roi?: number | null
          risk_score?: number | null
          total_burn_rate?: number | null
          total_revenue?: number | null
          total_runway?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ai_quota_remaining: number | null
          ai_quota_reset_date: string | null
          ai_requests_reset_date: string | null
          ai_requests_used: number | null
          created_at: string
          email: string
          experience_level: string | null
          full_name: string | null
          id: string
          is_founder: boolean | null
          onboarded: boolean | null
          plan: string | null
          role: string | null
          stripe_customer_id: string | null
          subscription_current_period_end: string | null
          subscription_plan: string | null
          subscription_status: string | null
          updated_at: string
          venture_type: string | null
        }
        Insert: {
          ai_quota_remaining?: number | null
          ai_quota_reset_date?: string | null
          ai_requests_reset_date?: string | null
          ai_requests_used?: number | null
          created_at?: string
          email: string
          experience_level?: string | null
          full_name?: string | null
          id?: string
          is_founder?: boolean | null
          onboarded?: boolean | null
          plan?: string | null
          role?: string | null
          stripe_customer_id?: string | null
          subscription_current_period_end?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          updated_at?: string
          venture_type?: string | null
        }
        Update: {
          ai_quota_remaining?: number | null
          ai_quota_reset_date?: string | null
          ai_requests_reset_date?: string | null
          ai_requests_used?: number | null
          created_at?: string
          email?: string
          experience_level?: string | null
          full_name?: string | null
          id?: string
          is_founder?: boolean | null
          onboarded?: boolean | null
          plan?: string | null
          role?: string | null
          stripe_customer_id?: string | null
          subscription_current_period_end?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          updated_at?: string
          venture_type?: string | null
        }
        Relationships: []
      }
      scratchpad_notes: {
        Row: {
          created_at: string
          id: string
          linked_context: Json | null
          tags: string[] | null
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          linked_context?: Json | null
          tags?: string[] | null
          text: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          linked_context?: Json | null
          tags?: string[] | null
          text?: string
          user_id?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          count: number
          created_at: string
          id: string
          name: string
        }
        Insert: {
          count?: number
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          count?: number
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      timeline_events: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          kind: string
          payload: Json | null
          title: string | null
          user_id: string | null
          venture_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          kind: string
          payload?: Json | null
          title?: string | null
          user_id?: string | null
          venture_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          kind?: string
          payload?: Json | null
          title?: string | null
          user_id?: string | null
          venture_id?: string | null
        }
        Relationships: []
      }
      tool_block_links: {
        Row: {
          block_id: string | null
          created_at: string
          id: string
          tool_id: string
        }
        Insert: {
          block_id?: string | null
          created_at?: string
          id?: string
          tool_id: string
        }
        Update: {
          block_id?: string | null
          created_at?: string
          id?: string
          tool_id?: string
        }
        Relationships: []
      }
      tool_runs: {
        Row: {
          created_at: string
          id: string
          inputs: Json | null
          linked_context: Json | null
          outputs: Json | null
          tool_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          inputs?: Json | null
          linked_context?: Json | null
          outputs?: Json | null
          tool_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          inputs?: Json | null
          linked_context?: Json | null
          outputs?: Json | null
          tool_id?: string
          user_id?: string
        }
        Relationships: []
      }
      tools: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          input_schema: Json | null
          name: string
          output_schema: Json | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id: string
          input_schema?: Json | null
          name: string
          output_schema?: Json | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          input_schema?: Json | null
          name?: string
          output_schema?: Json | null
        }
        Relationships: []
      }
      ventures: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          stage: string | null
          type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          stage?: string | null
          type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          stage?: string | null
          type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ventures_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      versions: {
        Row: {
          content: Json
          created_at: string
          id: string
          parent_id: string
          parent_type: string
          status: string
          updated_at: string
          user_id: string
          version_number: number
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          parent_id: string
          parent_type: string
          status?: string
          updated_at?: string
          user_id: string
          version_number?: number
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          parent_id?: string
          parent_type?: string
          status?: string
          updated_at?: string
          user_id?: string
          version_number?: number
        }
        Relationships: []
      }
      worksheets: {
        Row: {
          confidence_level: string | null
          created_at: string | null
          id: string
          inputs: Json | null
          is_template: boolean | null
          outputs: Json | null
          parent_id: string | null
          template_category: string | null
          type: string
          user_id: string | null
          venture_id: string | null
          version: number | null
        }
        Insert: {
          confidence_level?: string | null
          created_at?: string | null
          id?: string
          inputs?: Json | null
          is_template?: boolean | null
          outputs?: Json | null
          parent_id?: string | null
          template_category?: string | null
          type: string
          user_id?: string | null
          venture_id?: string | null
          version?: number | null
        }
        Update: {
          confidence_level?: string | null
          created_at?: string | null
          id?: string
          inputs?: Json | null
          is_template?: boolean | null
          outputs?: Json | null
          parent_id?: string | null
          template_category?: string | null
          type?: string
          user_id?: string | null
          venture_id?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "worksheets_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "worksheets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_sample_data_for_user: {
        Args: { user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
