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
      beneficiaries: {
        Row: {
          age_or_range: string | null
          beneficiary_code: string
          consent_status: Database["public"]["Enums"]["beneficiary_consent_status"]
          created_at: string | null
          id: string
          location: string | null
          name_or_label: string
          notes: string | null
          project_id: string
          sex: Database["public"]["Enums"]["beneficiary_sex"] | null
          type: Database["public"]["Enums"]["beneficiary_type"]
          updated_at: string | null
          vulnerability_tags: string[] | null
        }
        Insert: {
          age_or_range?: string | null
          beneficiary_code: string
          consent_status: Database["public"]["Enums"]["beneficiary_consent_status"]
          created_at?: string | null
          id?: string
          location?: string | null
          name_or_label: string
          notes?: string | null
          project_id: string
          sex?: Database["public"]["Enums"]["beneficiary_sex"] | null
          type: Database["public"]["Enums"]["beneficiary_type"]
          updated_at?: string | null
          vulnerability_tags?: string[] | null
        }
        Update: {
          age_or_range?: string | null
          beneficiary_code?: string
          consent_status?: Database["public"]["Enums"]["beneficiary_consent_status"]
          created_at?: string | null
          id?: string
          location?: string | null
          name_or_label?: string
          notes?: string | null
          project_id?: string
          sex?: Database["public"]["Enums"]["beneficiary_sex"] | null
          type?: Database["public"]["Enums"]["beneficiary_type"]
          updated_at?: string | null
          vulnerability_tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "beneficiaries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_allocations: {
        Row: {
          allocated_amount: number
          category: Database["public"]["Enums"]["expense_category"]
          committed_amount: number
          created_at: string | null
          currency: string
          fiscal_year: number
          id: string
          notes: string | null
          project_id: string
          quarter: number | null
          spent_amount: number
          updated_at: string | null
          workstream_id: string | null
        }
        Insert: {
          allocated_amount?: number
          category: Database["public"]["Enums"]["expense_category"]
          committed_amount?: number
          created_at?: string | null
          currency?: string
          fiscal_year: number
          id?: string
          notes?: string | null
          project_id: string
          quarter?: number | null
          spent_amount?: number
          updated_at?: string | null
          workstream_id?: string | null
        }
        Update: {
          allocated_amount?: number
          category?: Database["public"]["Enums"]["expense_category"]
          committed_amount?: number
          created_at?: string | null
          currency?: string
          fiscal_year?: number
          id?: string
          notes?: string | null
          project_id?: string
          quarter?: number | null
          spent_amount?: number
          updated_at?: string | null
          workstream_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_allocations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_allocations_workstream_id_fkey"
            columns: ["workstream_id"]
            isOneToOne: false
            referencedRelation: "workstreams"
            referencedColumns: ["id"]
          },
        ]
      }
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
          approval_status: string | null
          budget_allocation_id: string | null
          category: Database["public"]["Enums"]["expense_category"] | null
          cost_category: string
          created_at: string | null
          currency: string | null
          date: string
          description: string | null
          grant_code: string | null
          grant_id: string | null
          id: string
          invoice_no: string | null
          project_id: string | null
          vendor: string | null
          workstream: string | null
        }
        Insert: {
          amount: number
          approval_status?: string | null
          budget_allocation_id?: string | null
          category?: Database["public"]["Enums"]["expense_category"] | null
          cost_category: string
          created_at?: string | null
          currency?: string | null
          date: string
          description?: string | null
          grant_code?: string | null
          grant_id?: string | null
          id?: string
          invoice_no?: string | null
          project_id?: string | null
          vendor?: string | null
          workstream?: string | null
        }
        Update: {
          amount?: number
          approval_status?: string | null
          budget_allocation_id?: string | null
          category?: Database["public"]["Enums"]["expense_category"] | null
          cost_category?: string
          created_at?: string | null
          currency?: string | null
          date?: string
          description?: string | null
          grant_code?: string | null
          grant_id?: string | null
          id?: string
          invoice_no?: string | null
          project_id?: string | null
          vendor?: string | null
          workstream?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_budget_allocation_id_fkey"
            columns: ["budget_allocation_id"]
            isOneToOne: false
            referencedRelation: "budget_allocations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_grant_id_fkey"
            columns: ["grant_id"]
            isOneToOne: false
            referencedRelation: "grants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transactions: {
        Row: {
          amount: number
          approval_status: Database["public"]["Enums"]["transaction_approval_status"]
          approved_at: string | null
          approved_by: string | null
          category: Database["public"]["Enums"]["expense_category"] | null
          created_at: string | null
          created_by: string | null
          currency: string
          description: string
          expense_id: string | null
          grant_id: string | null
          id: string
          invoice_id: string | null
          notes: string | null
          project_id: string
          reference_number: string | null
          rejection_reason: string | null
          transaction_date: string
          transaction_type: string
          updated_at: string | null
          workstream_id: string | null
        }
        Insert: {
          amount: number
          approval_status?: Database["public"]["Enums"]["transaction_approval_status"]
          approved_at?: string | null
          approved_by?: string | null
          category?: Database["public"]["Enums"]["expense_category"] | null
          created_at?: string | null
          created_by?: string | null
          currency?: string
          description: string
          expense_id?: string | null
          grant_id?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          project_id: string
          reference_number?: string | null
          rejection_reason?: string | null
          transaction_date: string
          transaction_type: string
          updated_at?: string | null
          workstream_id?: string | null
        }
        Update: {
          amount?: number
          approval_status?: Database["public"]["Enums"]["transaction_approval_status"]
          approved_at?: string | null
          approved_by?: string | null
          category?: Database["public"]["Enums"]["expense_category"] | null
          created_at?: string | null
          created_by?: string | null
          currency?: string
          description?: string
          expense_id?: string | null
          grant_id?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          project_id?: string
          reference_number?: string | null
          rejection_reason?: string | null
          transaction_date?: string
          transaction_type?: string
          updated_at?: string | null
          workstream_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_grant_id_fkey"
            columns: ["grant_id"]
            isOneToOne: false
            referencedRelation: "grants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_workstream_id_fkey"
            columns: ["workstream_id"]
            isOneToOne: false
            referencedRelation: "workstreams"
            referencedColumns: ["id"]
          },
        ]
      }
      grants: {
        Row: {
          created_at: string | null
          currency: string
          disbursed_amount: number
          donor_name: string
          end_date: string
          grant_code: string
          id: string
          project_id: string
          reporting_requirements: string | null
          restrictions: string | null
          start_date: string
          status: Database["public"]["Enums"]["grant_status"]
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string
          disbursed_amount?: number
          donor_name: string
          end_date: string
          grant_code: string
          id?: string
          project_id: string
          reporting_requirements?: string | null
          restrictions?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["grant_status"]
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string
          disbursed_amount?: number
          donor_name?: string
          end_date?: string
          grant_code?: string
          id?: string
          project_id?: string
          reporting_requirements?: string | null
          restrictions?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["grant_status"]
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grants_project_id_fkey"
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
      lessons_learned: {
        Row: {
          applicability_scope: Database["public"]["Enums"]["lesson_learned_applicability"]
          category: Database["public"]["Enums"]["lesson_learned_category"]
          created_at: string | null
          date: string
          description: string
          evidence_link: string | null
          id: string
          project_id: string
          recommendation: string | null
          status: Database["public"]["Enums"]["lesson_learned_status"]
          title: string
          updated_at: string | null
        }
        Insert: {
          applicability_scope: Database["public"]["Enums"]["lesson_learned_applicability"]
          category: Database["public"]["Enums"]["lesson_learned_category"]
          created_at?: string | null
          date: string
          description: string
          evidence_link?: string | null
          id?: string
          project_id: string
          recommendation?: string | null
          status?: Database["public"]["Enums"]["lesson_learned_status"]
          title: string
          updated_at?: string | null
        }
        Update: {
          applicability_scope?: Database["public"]["Enums"]["lesson_learned_applicability"]
          category?: Database["public"]["Enums"]["lesson_learned_category"]
          created_at?: string | null
          date?: string
          description?: string
          evidence_link?: string | null
          id?: string
          project_id?: string
          recommendation?: string | null
          status?: Database["public"]["Enums"]["lesson_learned_status"]
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_learned_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_deliveries: {
        Row: {
          beneficiary_group: string | null
          created_at: string | null
          delivered_qty: number
          delivery_date_actual: string | null
          delivery_date_planned: string | null
          evidence_files: Json | null
          id: string
          item_name: string
          location: string | null
          notes: string | null
          planned_qty: number
          project_id: string
          salesforce_id: string | null
          status: Database["public"]["Enums"]["meal_delivery_status"]
          unit: Database["public"]["Enums"]["meal_delivery_unit"]
          updated_at: string | null
          workstream_id: string | null
        }
        Insert: {
          beneficiary_group?: string | null
          created_at?: string | null
          delivered_qty?: number
          delivery_date_actual?: string | null
          delivery_date_planned?: string | null
          evidence_files?: Json | null
          id?: string
          item_name: string
          location?: string | null
          notes?: string | null
          planned_qty: number
          project_id: string
          salesforce_id?: string | null
          status?: Database["public"]["Enums"]["meal_delivery_status"]
          unit?: Database["public"]["Enums"]["meal_delivery_unit"]
          updated_at?: string | null
          workstream_id?: string | null
        }
        Update: {
          beneficiary_group?: string | null
          created_at?: string | null
          delivered_qty?: number
          delivery_date_actual?: string | null
          delivery_date_planned?: string | null
          evidence_files?: Json | null
          id?: string
          item_name?: string
          location?: string | null
          notes?: string | null
          planned_qty?: number
          project_id?: string
          salesforce_id?: string | null
          status?: Database["public"]["Enums"]["meal_delivery_status"]
          unit?: Database["public"]["Enums"]["meal_delivery_unit"]
          updated_at?: string | null
          workstream_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_deliveries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_deliveries_workstream_id_fkey"
            columns: ["workstream_id"]
            isOneToOne: false
            referencedRelation: "workstreams"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          approval_status: Database["public"]["Enums"]["meal_plan_approval_status"]
          collection_calendar: string | null
          created_at: string | null
          data_quality_procedures: string | null
          id: string
          indicators_json: Json | null
          last_review_at: string | null
          project_id: string
          responsibilities_raci: string | null
          theory_of_change_link: string | null
          updated_at: string | null
        }
        Insert: {
          approval_status?: Database["public"]["Enums"]["meal_plan_approval_status"]
          collection_calendar?: string | null
          created_at?: string | null
          data_quality_procedures?: string | null
          id?: string
          indicators_json?: Json | null
          last_review_at?: string | null
          project_id: string
          responsibilities_raci?: string | null
          theory_of_change_link?: string | null
          updated_at?: string | null
        }
        Update: {
          approval_status?: Database["public"]["Enums"]["meal_plan_approval_status"]
          collection_calendar?: string | null
          created_at?: string | null
          data_quality_procedures?: string | null
          id?: string
          indicators_json?: Json | null
          last_review_at?: string | null
          project_id?: string
          responsibilities_raci?: string | null
          theory_of_change_link?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read_at: string | null
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          job_title: string | null
          organization: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          job_title?: string | null
          organization?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          job_title?: string | null
          organization?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      quarterly_reports: {
        Row: {
          approval_status: Database["public"]["Enums"]["quarterly_report_approval_status"]
          attachments: Json | null
          created_at: string | null
          deliveries_summary: string | null
          finance_linkage_notes: string | null
          fiscal_year: number
          id: string
          indicators_progress_json: Json | null
          period: Database["public"]["Enums"]["quarterly_report_period"]
          project_id: string
          risk_flags:
            | Database["public"]["Enums"]["quarterly_report_risk_flag"][]
            | null
          updated_at: string | null
        }
        Insert: {
          approval_status?: Database["public"]["Enums"]["quarterly_report_approval_status"]
          attachments?: Json | null
          created_at?: string | null
          deliveries_summary?: string | null
          finance_linkage_notes?: string | null
          fiscal_year: number
          id?: string
          indicators_progress_json?: Json | null
          period: Database["public"]["Enums"]["quarterly_report_period"]
          project_id: string
          risk_flags?:
            | Database["public"]["Enums"]["quarterly_report_risk_flag"][]
            | null
          updated_at?: string | null
        }
        Update: {
          approval_status?: Database["public"]["Enums"]["quarterly_report_approval_status"]
          attachments?: Json | null
          created_at?: string | null
          deliveries_summary?: string | null
          finance_linkage_notes?: string | null
          fiscal_year?: number
          id?: string
          indicators_progress_json?: Json | null
          period?: Database["public"]["Enums"]["quarterly_report_period"]
          project_id?: string
          risk_flags?:
            | Database["public"]["Enums"]["quarterly_report_risk_flag"][]
            | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quarterly_reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_audit_log: {
        Row: {
          change_reason: string | null
          changed_by: string | null
          created_at: string
          id: string
          metadata: Json | null
          new_status: Database["public"]["Enums"]["transaction_approval_status"]
          previous_status:
            | Database["public"]["Enums"]["transaction_approval_status"]
            | null
          transaction_id: string
        }
        Insert: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          new_status: Database["public"]["Enums"]["transaction_approval_status"]
          previous_status?:
            | Database["public"]["Enums"]["transaction_approval_status"]
            | null
          transaction_id: string
        }
        Update: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          new_status?: Database["public"]["Enums"]["transaction_approval_status"]
          previous_status?:
            | Database["public"]["Enums"]["transaction_approval_status"]
            | null
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_audit_log_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "financial_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_project_access: {
        Row: {
          created_at: string
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_project_access_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
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
      can_access_project: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "pmo"
        | "project_manager"
        | "finance"
        | "meal_coordinator"
        | "viewer"
        | "donor"
      beneficiary_consent_status: "Obtained" | "Pending" | "Not Required"
      beneficiary_sex: "F" | "M" | "Outro" | "ND"
      beneficiary_type:
        | "Pessoa"
        | "Família"
        | "Escola"
        | "Comunidade"
        | "Associação"
      expense_category:
        | "personnel"
        | "travel"
        | "equipment"
        | "supplies"
        | "services"
        | "infrastructure"
        | "overhead"
        | "other"
      grant_status:
        | "pending"
        | "approved"
        | "disbursed"
        | "completed"
        | "cancelled"
      import_status: "pending" | "processing" | "completed" | "failed"
      invoice_status: "received" | "approved" | "paid" | "archived"
      lesson_learned_applicability: "Projeto" | "Programa" | "Portfólio"
      lesson_learned_category:
        | "Operação"
        | "MEAL"
        | "Financeiro"
        | "Parcerias"
        | "Risco"
        | "Compliance"
      lesson_learned_status:
        | "Captured"
        | "Validated"
        | "Disseminated"
        | "Actioned"
      meal_delivery_status: "Planned" | "In-Progress" | "Delivered" | "Blocked"
      meal_delivery_unit: "un" | "kg" | "kit" | "caixa" | "outro"
      meal_plan_approval_status: "Draft" | "Under Review" | "Approved"
      project_health: "green" | "yellow" | "red"
      project_status: "planning" | "execution" | "closing" | "closed"
      quarterly_report_approval_status: "Draft" | "Under Review" | "Approved"
      quarterly_report_period: "Q1" | "Q2" | "Q3" | "Q4"
      quarterly_report_risk_flag:
        | "schedule"
        | "cost"
        | "scope"
        | "compliance"
        | "quality"
      transaction_approval_status: "pending" | "approved" | "rejected"
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
      app_role: [
        "admin",
        "pmo",
        "project_manager",
        "finance",
        "meal_coordinator",
        "viewer",
        "donor",
      ],
      beneficiary_consent_status: ["Obtained", "Pending", "Not Required"],
      beneficiary_sex: ["F", "M", "Outro", "ND"],
      beneficiary_type: [
        "Pessoa",
        "Família",
        "Escola",
        "Comunidade",
        "Associação",
      ],
      expense_category: [
        "personnel",
        "travel",
        "equipment",
        "supplies",
        "services",
        "infrastructure",
        "overhead",
        "other",
      ],
      grant_status: [
        "pending",
        "approved",
        "disbursed",
        "completed",
        "cancelled",
      ],
      import_status: ["pending", "processing", "completed", "failed"],
      invoice_status: ["received", "approved", "paid", "archived"],
      lesson_learned_applicability: ["Projeto", "Programa", "Portfólio"],
      lesson_learned_category: [
        "Operação",
        "MEAL",
        "Financeiro",
        "Parcerias",
        "Risco",
        "Compliance",
      ],
      lesson_learned_status: [
        "Captured",
        "Validated",
        "Disseminated",
        "Actioned",
      ],
      meal_delivery_status: ["Planned", "In-Progress", "Delivered", "Blocked"],
      meal_delivery_unit: ["un", "kg", "kit", "caixa", "outro"],
      meal_plan_approval_status: ["Draft", "Under Review", "Approved"],
      project_health: ["green", "yellow", "red"],
      project_status: ["planning", "execution", "closing", "closed"],
      quarterly_report_approval_status: ["Draft", "Under Review", "Approved"],
      quarterly_report_period: ["Q1", "Q2", "Q3", "Q4"],
      quarterly_report_risk_flag: [
        "schedule",
        "cost",
        "scope",
        "compliance",
        "quality",
      ],
      transaction_approval_status: ["pending", "approved", "rejected"],
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
