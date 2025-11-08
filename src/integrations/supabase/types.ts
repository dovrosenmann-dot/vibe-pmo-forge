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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      evidence: {
        Row: {
          created_at: string | null
          date: string
          file_name: string
          file_url: string | null
          id: string
          indicator_id: string | null
          notes: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          file_name: string
          file_url?: string | null
          id?: string
          indicator_id?: string | null
          notes?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          file_name?: string
          file_url?: string | null
          id?: string
          indicator_id?: string | null
          notes?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidence_indicator_id_fkey"
            columns: ["indicator_id"]
            isOneToOne: false
            referencedRelation: "indicators"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          cost_category: string
          created_at: string | null
          currency: string | null
          date: string
          description: string | null
          grant_code: string | null
          id: string
          invoice_no: string | null
          project_id: string | null
          vendor: string | null
          workstream: string | null
        }
        Insert: {
          amount: number
          cost_category: string
          created_at?: string | null
          currency?: string | null
          date: string
          description?: string | null
          grant_code?: string | null
          id?: string
          invoice_no?: string | null
          project_id?: string | null
          vendor?: string | null
          workstream?: string | null
        }
        Update: {
          amount?: number
          cost_category?: string
          created_at?: string | null
          currency?: string | null
          date?: string
          description?: string | null
          grant_code?: string | null
          id?: string
          invoice_no?: string | null
          project_id?: string | null
          vendor?: string | null
          workstream?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_allocations: {
        Row: {
          created_at: string | null
          end_date: string | null
          fte: number
          id: string
          person_name: string
          project_id: string | null
          role: string
          start_date: string
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          fte: number
          id?: string
          person_name: string
          project_id?: string | null
          role: string
          start_date: string
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          fte?: number
          id?: string
          person_name?: string
          project_id?: string | null
          role?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_allocations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      import_logs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_details: Json | null
          failed_rows: number | null
          file_name: string
          id: string
          import_type: string
          imported_by: string | null
          status: Database["public"]["Enums"]["import_status"] | null
          success_rows: number | null
          total_rows: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_details?: Json | null
          failed_rows?: number | null
          file_name: string
          id?: string
          import_type: string
          imported_by?: string | null
          status?: Database["public"]["Enums"]["import_status"] | null
          success_rows?: number | null
          total_rows?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_details?: Json | null
          failed_rows?: number | null
          file_name?: string
          id?: string
          import_type?: string
          imported_by?: string | null
          status?: Database["public"]["Enums"]["import_status"] | null
          success_rows?: number | null
          total_rows?: number | null
        }
        Relationships: []
      }
      indicators: {
        Row: {
          baseline: number | null
          code: string
          created_at: string | null
          current_value: number | null
          frequency: string | null
          id: string
          last_updated: string | null
          name: string
          project_id: string | null
          target: number | null
          unit: string | null
        }
        Insert: {
          baseline?: number | null
          code: string
          created_at?: string | null
          current_value?: number | null
          frequency?: string | null
          id?: string
          last_updated?: string | null
          name: string
          project_id?: string | null
          target?: number | null
          unit?: string | null
        }
        Update: {
          baseline?: number | null
          code?: string
          created_at?: string | null
          current_value?: number | null
          frequency?: string | null
          id?: string
          last_updated?: string | null
          name?: string
          project_id?: string | null
          target?: number | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "indicators_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          approved_at: string | null
          created_at: string | null
          currency: string | null
          id: string
          invoice_no: string
          notes: string | null
          paid_at: string | null
          project_id: string | null
          received_at: string | null
          status: Database["public"]["Enums"]["invoice_status"] | null
          vendor: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          invoice_no: string
          notes?: string | null
          paid_at?: string | null
          project_id?: string | null
          received_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          vendor: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          invoice_no?: string
          notes?: string | null
          paid_at?: string | null
          project_id?: string | null
          received_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          vendor?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          kpi_primary: string | null
          name: string
          owner: string | null
          status: Database["public"]["Enums"]["project_health"] | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          kpi_primary?: string | null
          name: string
          owner?: string | null
          status?: Database["public"]["Enums"]["project_health"] | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          kpi_primary?: string | null
          name?: string
          owner?: string | null
          status?: Database["public"]["Enums"]["project_health"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget_planned: number | null
          budget_spent: number | null
          code: string
          country: string | null
          created_at: string | null
          currency: string | null
          end_date: string | null
          health: Database["public"]["Enums"]["project_health"] | null
          id: string
          manager: string | null
          name: string
          program_id: string | null
          progress: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"] | null
          team_size: number | null
          updated_at: string | null
        }
        Insert: {
          budget_planned?: number | null
          budget_spent?: number | null
          code: string
          country?: string | null
          created_at?: string | null
          currency?: string | null
          end_date?: string | null
          health?: Database["public"]["Enums"]["project_health"] | null
          id?: string
          manager?: string | null
          name: string
          program_id?: string | null
          progress?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          team_size?: number | null
          updated_at?: string | null
        }
        Update: {
          budget_planned?: number | null
          budget_spent?: number | null
          code?: string
          country?: string | null
          created_at?: string | null
          currency?: string | null
          end_date?: string | null
          health?: Database["public"]["Enums"]["project_health"] | null
          id?: string
          manager?: string | null
          name?: string
          program_id?: string | null
          progress?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          team_size?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      workstreams: {
        Row: {
          category: Database["public"]["Enums"]["workstream_category"] | null
          created_at: string | null
          id: string
          name: string
          owner: string | null
          progress: number | null
          project_id: string | null
          status: Database["public"]["Enums"]["project_health"] | null
          updated_at: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["workstream_category"] | null
          created_at?: string | null
          id?: string
          name: string
          owner?: string | null
          progress?: number | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["project_health"] | null
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["workstream_category"] | null
          created_at?: string | null
          id?: string
          name?: string
          owner?: string | null
          progress?: number | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["project_health"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workstreams_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      import_status: "pending" | "processing" | "completed" | "failed"
      invoice_status: "received" | "approved" | "paid" | "archived"
      project_health: "green" | "yellow" | "red"
      project_status: "planning" | "execution" | "closing" | "closed"
      workstream_category:
        | "governance"
        | "meal"
        | "field_implementation"
        | "capacity_building"
        | "advocacy"
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
      import_status: ["pending", "processing", "completed", "failed"],
      invoice_status: ["received", "approved", "paid", "archived"],
      project_health: ["green", "yellow", "red"],
      project_status: ["planning", "execution", "closing", "closed"],
      workstream_category: [
        "governance",
        "meal",
        "field_implementation",
        "capacity_building",
        "advocacy",
      ],
    },
  },
} as const
