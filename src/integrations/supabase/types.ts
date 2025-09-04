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
      analytics_metrics: {
        Row: {
          clinic_id: string
          created_at: string
          id: string
          metadata: Json | null
          metric_date: string
          metric_type: string
          metric_value: number
        }
        Insert: {
          clinic_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_date: string
          metric_type: string
          metric_value: number
        }
        Update: {
          clinic_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_date?: string
          metric_type?: string
          metric_value?: number
        }
        Relationships: []
      }
      appointment_treatments: {
        Row: {
          appointment_id: string
          created_at: string
          id: string
          notes: string | null
          quantity: number | null
          treatment_id: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          id?: string
          notes?: string | null
          quantity?: number | null
          treatment_id: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          quantity?: number | null
          treatment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_treatments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_treatments_treatment_id_fkey"
            columns: ["treatment_id"]
            isOneToOne: false
            referencedRelation: "treatments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          booking_type: Database["public"]["Enums"]["booking_type"] | null
          clinic_id: string
          created_at: string
          dentist_id: string | null
          duration_minutes: number | null
          family_group_name: string | null
          group_id: string | null
          id: string
          is_group_booking: boolean | null
          notes: string | null
          patient_id: string
          qr_code: string | null
          scheduled_time: string
          status: Database["public"]["Enums"]["appointment_status"] | null
          updated_at: string
        }
        Insert: {
          booking_type?: Database["public"]["Enums"]["booking_type"] | null
          clinic_id: string
          created_at?: string
          dentist_id?: string | null
          duration_minutes?: number | null
          family_group_name?: string | null
          group_id?: string | null
          id?: string
          is_group_booking?: boolean | null
          notes?: string | null
          patient_id: string
          qr_code?: string | null
          scheduled_time: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          updated_at?: string
        }
        Update: {
          booking_type?: Database["public"]["Enums"]["booking_type"] | null
          clinic_id?: string
          created_at?: string
          dentist_id?: string | null
          duration_minutes?: number | null
          family_group_name?: string | null
          group_id?: string | null
          id?: string
          is_group_booking?: boolean | null
          notes?: string | null
          patient_id?: string
          qr_code?: string | null
          scheduled_time?: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_dentist_id_fkey"
            columns: ["dentist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action_description: string
          action_type: string
          created_at: string
          device_info: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          patient_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_description: string
          action_type: string
          created_at?: string
          device_info?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          patient_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_description?: string
          action_type?: string
          created_at?: string
          device_info?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          patient_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      branch_group_members: {
        Row: {
          branch_id: string
          group_id: string
          id: string
          joined_at: string
        }
        Insert: {
          branch_id: string
          group_id: string
          id?: string
          joined_at?: string
        }
        Update: {
          branch_id?: string
          group_id?: string
          id?: string
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branch_group_members_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branch_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "branch_sharing_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      branch_sharing_groups: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          group_name: string
          id: string
          is_active: boolean | null
          main_clinic_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          group_name: string
          id?: string
          is_active?: boolean | null
          main_clinic_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          group_name?: string
          id?: string
          is_active?: boolean | null
          main_clinic_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branch_sharing_groups_main_clinic_id_fkey"
            columns: ["main_clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_billing: {
        Row: {
          billing_period_end: string
          billing_period_start: string
          clinic_id: string
          created_at: string
          id: string
          status: string | null
          subscription_fees: number | null
          tax_amount: number | null
          total_expenses: number | null
          total_revenue: number | null
          updated_at: string
        }
        Insert: {
          billing_period_end: string
          billing_period_start: string
          clinic_id: string
          created_at?: string
          id?: string
          status?: string | null
          subscription_fees?: number | null
          tax_amount?: number | null
          total_expenses?: number | null
          total_revenue?: number | null
          updated_at?: string
        }
        Update: {
          billing_period_end?: string
          billing_period_start?: string
          clinic_id?: string
          created_at?: string
          id?: string
          status?: string | null
          subscription_fees?: number | null
          tax_amount?: number | null
          total_expenses?: number | null
          total_revenue?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_billing_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_branding: {
        Row: {
          created_at: string
          custom_button_labels: Json | null
          id: string
          logo_url: string | null
          modified_by: string | null
          patient_portal_theme: Json | null
          primary_color: string | null
          secondary_color: string | null
          updated_at: string
          welcome_message: string | null
        }
        Insert: {
          created_at?: string
          custom_button_labels?: Json | null
          id?: string
          logo_url?: string | null
          modified_by?: string | null
          patient_portal_theme?: Json | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
          welcome_message?: string | null
        }
        Update: {
          created_at?: string
          custom_button_labels?: Json | null
          id?: string
          logo_url?: string | null
          modified_by?: string | null
          patient_portal_theme?: Json | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
          welcome_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinic_branding_modified_by_fkey"
            columns: ["modified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_feature_toggles: {
        Row: {
          clinic_id: string
          created_at: string
          description: string | null
          feature_name: string
          id: string
          is_enabled: boolean
          modified_by: string | null
          updated_at: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          description?: string | null
          feature_name: string
          id?: string
          is_enabled?: boolean
          modified_by?: string | null
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          description?: string | null
          feature_name?: string
          id?: string
          is_enabled?: boolean
          modified_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_feature_toggles_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_feature_toggles_modified_by_fkey"
            columns: ["modified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_locations: {
        Row: {
          address: string
          clinic_id: string
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          location_name: string
          manager_id: string | null
          operating_hours: Json | null
          phone_number: string | null
          updated_at: string
        }
        Insert: {
          address: string
          clinic_id: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          location_name: string
          manager_id?: string | null
          operating_hours?: Json | null
          phone_number?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          clinic_id?: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          location_name?: string
          manager_id?: string | null
          operating_hours?: Json | null
          phone_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_locations_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          address: string | null
          branding_overridden: boolean | null
          clinic_name: string
          created_at: string
          custom_button_labels: Json | null
          custom_logo_url: string | null
          default_sharing_group_id: string | null
          email: string | null
          id: string
          location_type: string | null
          logo_url: string | null
          operating_hours: Json | null
          parent_clinic_id: string | null
          phone_number: string | null
          primary_color: string | null
          secondary_color: string | null
          sharing_enabled: boolean | null
          subscription_package:
            | Database["public"]["Enums"]["subscription_package"]
            | null
          updated_at: string
          welcome_message: string | null
        }
        Insert: {
          address?: string | null
          branding_overridden?: boolean | null
          clinic_name: string
          created_at?: string
          custom_button_labels?: Json | null
          custom_logo_url?: string | null
          default_sharing_group_id?: string | null
          email?: string | null
          id?: string
          location_type?: string | null
          logo_url?: string | null
          operating_hours?: Json | null
          parent_clinic_id?: string | null
          phone_number?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          sharing_enabled?: boolean | null
          subscription_package?:
            | Database["public"]["Enums"]["subscription_package"]
            | null
          updated_at?: string
          welcome_message?: string | null
        }
        Update: {
          address?: string | null
          branding_overridden?: boolean | null
          clinic_name?: string
          created_at?: string
          custom_button_labels?: Json | null
          custom_logo_url?: string | null
          default_sharing_group_id?: string | null
          email?: string | null
          id?: string
          location_type?: string | null
          logo_url?: string | null
          operating_hours?: Json | null
          parent_clinic_id?: string | null
          phone_number?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          sharing_enabled?: boolean | null
          subscription_package?:
            | Database["public"]["Enums"]["subscription_package"]
            | null
          updated_at?: string
          welcome_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinics_default_sharing_group_id_fkey"
            columns: ["default_sharing_group_id"]
            isOneToOne: false
            referencedRelation: "branch_sharing_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_logs: {
        Row: {
          appointment_id: string | null
          clinic_id: string
          content: string
          created_at: string
          error_message: string | null
          id: string
          patient_id: string
          recipient_email: string
          sent_at: string | null
          status: string
          subject: string
          template_id: string | null
        }
        Insert: {
          appointment_id?: string | null
          clinic_id: string
          content: string
          created_at?: string
          error_message?: string | null
          id?: string
          patient_id: string
          recipient_email: string
          sent_at?: string | null
          status: string
          subject: string
          template_id?: string | null
        }
        Update: {
          appointment_id?: string | null
          clinic_id?: string
          content?: string
          created_at?: string
          error_message?: string | null
          id?: string
          patient_id?: string
          recipient_email?: string
          sent_at?: string | null
          status?: string
          subject?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "communication_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_templates: {
        Row: {
          clinic_id: string
          content: string
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          subject: string
          template_type: string
          updated_at: string
        }
        Insert: {
          clinic_id: string
          content: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          template_type: string
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          template_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      cross_clinic_metrics: {
        Row: {
          clinic_id: string | null
          comparison_data: Json | null
          created_at: string
          forecast_data: Json | null
          id: string
          metric_date: string
          metric_type: string
          metric_value: number
        }
        Insert: {
          clinic_id?: string | null
          comparison_data?: Json | null
          created_at?: string
          forecast_data?: Json | null
          id?: string
          metric_date: string
          metric_type: string
          metric_value: number
        }
        Update: {
          clinic_id?: string | null
          comparison_data?: Json | null
          created_at?: string
          forecast_data?: Json | null
          id?: string
          metric_date?: string
          metric_type?: string
          metric_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "cross_clinic_metrics_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      data_sharing_audit: {
        Row: {
          action_type: string
          created_at: string
          data_id: string | null
          data_type: string
          id: string
          ip_address: unknown | null
          sharing_group_id: string | null
          source_branch_id: string
          target_branch_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          data_id?: string | null
          data_type: string
          id?: string
          ip_address?: unknown | null
          sharing_group_id?: string | null
          source_branch_id: string
          target_branch_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          data_id?: string | null
          data_type?: string
          id?: string
          ip_address?: unknown | null
          sharing_group_id?: string | null
          source_branch_id?: string
          target_branch_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_sharing_audit_sharing_group_id_fkey"
            columns: ["sharing_group_id"]
            isOneToOne: false
            referencedRelation: "branch_sharing_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_sharing_audit_source_branch_id_fkey"
            columns: ["source_branch_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_sharing_audit_target_branch_id_fkey"
            columns: ["target_branch_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      dentist_signatures: {
        Row: {
          clinic_id: string
          created_at: string
          dentist_id: string
          document_id: string | null
          id: string
          metadata: Json | null
          patient_id: string | null
          signature_data: string
          signature_type: string
          signed_at: string
          treatment_record_id: string | null
        }
        Insert: {
          clinic_id: string
          created_at?: string
          dentist_id: string
          document_id?: string | null
          id?: string
          metadata?: Json | null
          patient_id?: string | null
          signature_data: string
          signature_type: string
          signed_at?: string
          treatment_record_id?: string | null
        }
        Update: {
          clinic_id?: string
          created_at?: string
          dentist_id?: string
          document_id?: string | null
          id?: string
          metadata?: Json | null
          patient_id?: string | null
          signature_data?: string
          signature_type?: string
          signed_at?: string
          treatment_record_id?: string | null
        }
        Relationships: []
      }
      digital_forms: {
        Row: {
          category: string
          clinic_id: string | null
          created_at: string
          description: string | null
          form_fields: Json
          form_type: string
          id: string
          is_active: boolean | null
          name: string
          requires_signature: boolean | null
          template_data: Json | null
          updated_at: string
          version: number | null
        }
        Insert: {
          category: string
          clinic_id?: string | null
          created_at?: string
          description?: string | null
          form_fields?: Json
          form_type: string
          id?: string
          is_active?: boolean | null
          name: string
          requires_signature?: boolean | null
          template_data?: Json | null
          updated_at?: string
          version?: number | null
        }
        Update: {
          category?: string
          clinic_id?: string | null
          created_at?: string
          description?: string | null
          form_fields?: Json
          form_type?: string
          id?: string
          is_active?: boolean | null
          name?: string
          requires_signature?: boolean | null
          template_data?: Json | null
          updated_at?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "digital_forms_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      document_audit_trail: {
        Row: {
          action_description: string | null
          action_type: string
          clinic_id: string
          created_at: string
          document_id: string | null
          document_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          patient_id: string | null
          performed_at: string
          performed_by: string | null
          user_agent: string | null
        }
        Insert: {
          action_description?: string | null
          action_type: string
          clinic_id: string
          created_at?: string
          document_id?: string | null
          document_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          patient_id?: string | null
          performed_at?: string
          performed_by?: string | null
          user_agent?: string | null
        }
        Update: {
          action_description?: string | null
          action_type?: string
          clinic_id?: string
          created_at?: string
          document_id?: string | null
          document_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          patient_id?: string | null
          performed_at?: string
          performed_by?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          appointment_id: string | null
          created_at: string
          document_type: Database["public"]["Enums"]["document_type"] | null
          file_url: string | null
          id: string
          patient_id: string
          signed_at: string | null
          signed_by: string | null
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          document_type?: Database["public"]["Enums"]["document_type"] | null
          file_url?: string | null
          id?: string
          patient_id: string
          signed_at?: string | null
          signed_by?: string | null
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          document_type?: Database["public"]["Enums"]["document_type"] | null
          file_url?: string | null
          id?: string
          patient_id?: string
          signed_at?: string | null
          signed_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_signed_by_fkey"
            columns: ["signed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          created_at: string
          id: string
          primary_patient_id: string
          relationship: string
          secondary_patient_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          primary_patient_id: string
          relationship: string
          secondary_patient_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          primary_patient_id?: string
          relationship?: string
          secondary_patient_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_primary_patient_id_fkey"
            columns: ["primary_patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_members_secondary_patient_id_fkey"
            columns: ["secondary_patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_toggles: {
        Row: {
          created_at: string
          description: string | null
          feature_name: string
          id: string
          is_enabled: boolean | null
          modified_by: string | null
          reason: string | null
          tooltip_text: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          feature_name: string
          id?: string
          is_enabled?: boolean | null
          modified_by?: string | null
          reason?: string | null
          tooltip_text?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          feature_name?: string
          id?: string
          is_enabled?: boolean | null
          modified_by?: string | null
          reason?: string | null
          tooltip_text?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_toggles_modified_by_fkey"
            columns: ["modified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_settings: {
        Row: {
          created_at: string
          currency_code: string | null
          discount_rules: Json | null
          id: string
          invoice_settings: Json | null
          modified_by: string | null
          payment_methods: Json | null
          tax_rate: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency_code?: string | null
          discount_rules?: Json | null
          id?: string
          invoice_settings?: Json | null
          modified_by?: string | null
          payment_methods?: Json | null
          tax_rate?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency_code?: string | null
          discount_rules?: Json | null
          id?: string
          invoice_settings?: Json | null
          modified_by?: string | null
          payment_methods?: Json | null
          tax_rate?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_settings_modified_by_fkey"
            columns: ["modified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      form_responses: {
        Row: {
          clinic_id: string
          created_at: string
          dentist_signature_data: string | null
          dentist_signed_at: string | null
          dentist_signed_by: string | null
          device_info: string | null
          form_id: string | null
          id: string
          ip_address: unknown | null
          is_visible_to_patient: boolean | null
          patient_id: string | null
          rejection_reason: string | null
          requires_dentist_signature: boolean | null
          responses: Json
          signature_data: string | null
          signed_at: string | null
          signed_by: string | null
          status: string | null
          updated_at: string
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          clinic_id: string
          created_at?: string
          dentist_signature_data?: string | null
          dentist_signed_at?: string | null
          dentist_signed_by?: string | null
          device_info?: string | null
          form_id?: string | null
          id?: string
          ip_address?: unknown | null
          is_visible_to_patient?: boolean | null
          patient_id?: string | null
          rejection_reason?: string | null
          requires_dentist_signature?: boolean | null
          responses?: Json
          signature_data?: string | null
          signed_at?: string | null
          signed_by?: string | null
          status?: string | null
          updated_at?: string
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          clinic_id?: string
          created_at?: string
          dentist_signature_data?: string | null
          dentist_signed_at?: string | null
          dentist_signed_by?: string | null
          device_info?: string | null
          form_id?: string | null
          id?: string
          ip_address?: unknown | null
          is_visible_to_patient?: boolean | null
          patient_id?: string | null
          rejection_reason?: string | null
          requires_dentist_signature?: boolean | null
          responses?: Json
          signature_data?: string | null
          signed_at?: string | null
          signed_by?: string | null
          status?: string | null
          updated_at?: string
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_responses_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "digital_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_responses_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_responses_signed_by_fkey"
            columns: ["signed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      global_suppliers: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          is_preferred: boolean | null
          name: string
          payment_terms: string | null
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_preferred?: boolean | null
          name: string
          payment_terms?: string | null
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_preferred?: boolean | null
          name?: string
          payment_terms?: string | null
        }
        Relationships: []
      }
      inventory_alerts: {
        Row: {
          alert_type: string
          clinic_id: string
          created_at: string
          id: string
          is_resolved: boolean | null
          item_id: string
          message: string
          resolved_at: string | null
        }
        Insert: {
          alert_type: string
          clinic_id: string
          created_at?: string
          id?: string
          is_resolved?: boolean | null
          item_id: string
          message: string
          resolved_at?: string | null
        }
        Update: {
          alert_type?: string
          clinic_id?: string
          created_at?: string
          id?: string
          is_resolved?: boolean | null
          item_id?: string
          message?: string
          resolved_at?: string | null
        }
        Relationships: []
      }
      inventory_categories: {
        Row: {
          clinic_id: string
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          category_id: string | null
          clinic_id: string
          created_at: string
          current_stock: number | null
          description: string | null
          expiry_date: string | null
          global_min_threshold: number | null
          id: string
          is_active: boolean | null
          is_tracked_globally: boolean | null
          location_in_clinic: string | null
          minimum_stock: number | null
          name: string
          sku: string | null
          supplier_contact: string | null
          supplier_name: string | null
          unit_cost: number | null
          unit_type: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          clinic_id: string
          created_at?: string
          current_stock?: number | null
          description?: string | null
          expiry_date?: string | null
          global_min_threshold?: number | null
          id?: string
          is_active?: boolean | null
          is_tracked_globally?: boolean | null
          location_in_clinic?: string | null
          minimum_stock?: number | null
          name: string
          sku?: string | null
          supplier_contact?: string | null
          supplier_name?: string | null
          unit_cost?: number | null
          unit_type: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          clinic_id?: string
          created_at?: string
          current_stock?: number | null
          description?: string | null
          expiry_date?: string | null
          global_min_threshold?: number | null
          id?: string
          is_active?: boolean | null
          is_tracked_globally?: boolean | null
          location_in_clinic?: string | null
          minimum_stock?: number | null
          name?: string
          sku?: string | null
          supplier_contact?: string | null
          supplier_name?: string | null
          unit_cost?: number | null
          unit_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory_transactions: {
        Row: {
          clinic_id: string
          created_at: string
          created_by: string
          id: string
          item_id: string
          notes: string | null
          quantity: number
          reference_id: string | null
          total_cost: number | null
          transaction_type: string
          unit_cost: number | null
        }
        Insert: {
          clinic_id: string
          created_at?: string
          created_by: string
          id?: string
          item_id: string
          notes?: string | null
          quantity: number
          reference_id?: string | null
          total_cost?: number | null
          transaction_type: string
          unit_cost?: number | null
        }
        Update: {
          clinic_id?: string
          created_at?: string
          created_by?: string
          id?: string
          item_id?: string
          notes?: string | null
          quantity?: number
          reference_id?: string | null
          total_cost?: number | null
          transaction_type?: string
          unit_cost?: number | null
        }
        Relationships: []
      }
      inventory_usage: {
        Row: {
          created_at: string
          id: string
          inventory_item_id: string
          notes: string | null
          quantity_used: number
          treatment_record_id: string
          unit_cost_at_time: number
        }
        Insert: {
          created_at?: string
          id?: string
          inventory_item_id: string
          notes?: string | null
          quantity_used: number
          treatment_record_id: string
          unit_cost_at_time: number
        }
        Update: {
          created_at?: string
          id?: string
          inventory_item_id?: string
          notes?: string | null
          quantity_used?: number
          treatment_record_id?: string
          unit_cost_at_time?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_usage_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_usage_treatment_record_id_fkey"
            columns: ["treatment_record_id"]
            isOneToOne: false
            referencedRelation: "treatment_records"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number
          appointment_id: string | null
          balance_due: number
          clinic_id: string
          created_at: string
          discount_amount: number
          id: string
          insurance_claim_amount: number | null
          insurance_claim_status: string | null
          insurance_coverage: number
          invoice_number: string
          invoice_type: string | null
          issued_by: string | null
          patient_id: string | null
          payment_date: string | null
          payment_method: string | null
          payment_status: string | null
          pdf_url: string | null
          subtotal: number
          tax_amount: number
          total_amount: number
          treatments: Json | null
          updated_at: string
        }
        Insert: {
          amount_paid?: number
          appointment_id?: string | null
          balance_due?: number
          clinic_id: string
          created_at?: string
          discount_amount?: number
          id?: string
          insurance_claim_amount?: number | null
          insurance_claim_status?: string | null
          insurance_coverage?: number
          invoice_number: string
          invoice_type?: string | null
          issued_by?: string | null
          patient_id?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          pdf_url?: string | null
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          treatments?: Json | null
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          appointment_id?: string | null
          balance_due?: number
          clinic_id?: string
          created_at?: string
          discount_amount?: number
          id?: string
          insurance_claim_amount?: number | null
          insurance_claim_status?: string | null
          insurance_coverage?: number
          invoice_number?: string
          invoice_type?: string | null
          issued_by?: string | null
          patient_id?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          pdf_url?: string | null
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          treatments?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_histories: {
        Row: {
          allergies: string[] | null
          blood_type: string | null
          clinic_id: string
          created_at: string
          current_medications: string[] | null
          dental_concerns: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          family_medical_history: string[] | null
          guardian_name: string | null
          guardian_relationship: string | null
          height: string | null
          id: string
          is_breastfeeding: boolean | null
          is_minor: boolean | null
          is_pregnant: boolean | null
          last_dental_visit: string | null
          last_updated_at: string | null
          last_updated_by: string | null
          medical_conditions: string[] | null
          patient_id: string | null
          philhealth_category: string | null
          philhealth_number: string | null
          pregnancy_details: string | null
          previous_dental_work: string[] | null
          previous_surgeries: string[] | null
          weight: string | null
        }
        Insert: {
          allergies?: string[] | null
          blood_type?: string | null
          clinic_id: string
          created_at?: string
          current_medications?: string[] | null
          dental_concerns?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          family_medical_history?: string[] | null
          guardian_name?: string | null
          guardian_relationship?: string | null
          height?: string | null
          id?: string
          is_breastfeeding?: boolean | null
          is_minor?: boolean | null
          is_pregnant?: boolean | null
          last_dental_visit?: string | null
          last_updated_at?: string | null
          last_updated_by?: string | null
          medical_conditions?: string[] | null
          patient_id?: string | null
          philhealth_category?: string | null
          philhealth_number?: string | null
          pregnancy_details?: string | null
          previous_dental_work?: string[] | null
          previous_surgeries?: string[] | null
          weight?: string | null
        }
        Update: {
          allergies?: string[] | null
          blood_type?: string | null
          clinic_id?: string
          created_at?: string
          current_medications?: string[] | null
          dental_concerns?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          family_medical_history?: string[] | null
          guardian_name?: string | null
          guardian_relationship?: string | null
          height?: string | null
          id?: string
          is_breastfeeding?: boolean | null
          is_minor?: boolean | null
          is_pregnant?: boolean | null
          last_dental_visit?: string | null
          last_updated_at?: string | null
          last_updated_by?: string | null
          medical_conditions?: string[] | null
          patient_id?: string | null
          philhealth_category?: string | null
          philhealth_number?: string | null
          pregnancy_details?: string | null
          previous_dental_work?: string[] | null
          previous_surgeries?: string[] | null
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_histories_last_updated_by_fkey"
            columns: ["last_updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_histories_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_documents: {
        Row: {
          appointment_id: string | null
          clinic_id: string
          created_at: string
          dentist_signature_id: string | null
          document_category: string | null
          document_type: string
          file_name: string
          file_size: number | null
          file_storage_path: string | null
          file_url: string | null
          form_response_id: string | null
          id: string
          is_signed: boolean | null
          is_visible_to_patient: boolean | null
          metadata: Json | null
          mime_type: string | null
          patient_id: string | null
          rejection_reason: string | null
          signature_image: string | null
          updated_at: string
          uploaded_by: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          appointment_id?: string | null
          clinic_id: string
          created_at?: string
          dentist_signature_id?: string | null
          document_category?: string | null
          document_type: string
          file_name: string
          file_size?: number | null
          file_storage_path?: string | null
          file_url?: string | null
          form_response_id?: string | null
          id?: string
          is_signed?: boolean | null
          is_visible_to_patient?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          patient_id?: string | null
          rejection_reason?: string | null
          signature_image?: string | null
          updated_at?: string
          uploaded_by?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          appointment_id?: string | null
          clinic_id?: string
          created_at?: string
          dentist_signature_id?: string | null
          document_category?: string | null
          document_type?: string
          file_name?: string
          file_size?: number | null
          file_storage_path?: string | null
          file_url?: string | null
          form_response_id?: string | null
          id?: string
          is_signed?: boolean | null
          is_visible_to_patient?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          patient_id?: string | null
          rejection_reason?: string | null
          signature_image?: string | null
          updated_at?: string
          uploaded_by?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_documents_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_documents_dentist_signature_id_fkey"
            columns: ["dentist_signature_id"]
            isOneToOne: false
            referencedRelation: "dentist_signatures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_documents_form_response_id_fkey"
            columns: ["form_response_id"]
            isOneToOne: false
            referencedRelation: "form_responses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_documents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_feedback: {
        Row: {
          appointment_id: string | null
          category: string | null
          clinic_id: string
          created_at: string
          feedback_text: string | null
          id: string
          is_anonymous: boolean | null
          patient_id: string
          rating: number | null
        }
        Insert: {
          appointment_id?: string | null
          category?: string | null
          clinic_id: string
          created_at?: string
          feedback_text?: string | null
          id?: string
          is_anonymous?: boolean | null
          patient_id: string
          rating?: number | null
        }
        Update: {
          appointment_id?: string | null
          category?: string | null
          clinic_id?: string
          created_at?: string
          feedback_text?: string | null
          id?: string
          is_anonymous?: boolean | null
          patient_id?: string
          rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_feedback_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_feedback_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_insurance: {
        Row: {
          annual_limit: number | null
          card_expiry: string | null
          card_image_url: string | null
          clinic_id: string
          coverage_percentage: number | null
          coverage_type: string | null
          created_at: string
          id: string
          is_active: boolean | null
          member_id: string | null
          patient_id: string | null
          policy_number: string | null
          provider_name: string | null
          provider_type: string
          remaining_balance: number | null
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          annual_limit?: number | null
          card_expiry?: string | null
          card_image_url?: string | null
          clinic_id: string
          coverage_percentage?: number | null
          coverage_type?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          member_id?: string | null
          patient_id?: string | null
          policy_number?: string | null
          provider_name?: string | null
          provider_type: string
          remaining_balance?: number | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          annual_limit?: number | null
          card_expiry?: string | null
          card_image_url?: string | null
          clinic_id?: string
          coverage_percentage?: number | null
          coverage_type?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          member_id?: string | null
          patient_id?: string | null
          policy_number?: string | null
          provider_name?: string | null
          provider_type?: string
          remaining_balance?: number | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_insurance_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_insurance_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          clinic_id: string
          contact_number: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          emergency_contact: string | null
          full_name: string
          gender: string | null
          id: string
          insurance_info: string | null
          medical_history: string | null
          primary_guardian_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          clinic_id: string
          contact_number?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: string | null
          full_name: string
          gender?: string | null
          id?: string
          insurance_info?: string | null
          medical_history?: string | null
          primary_guardian_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          clinic_id?: string
          contact_number?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          insurance_info?: string | null
          medical_history?: string | null
          primary_guardian_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_primary_guardian_id_fkey"
            columns: ["primary_guardian_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          appointment_id: string | null
          clinic_id: string
          created_at: string
          currency: string
          id: string
          notes: string | null
          patient_id: string
          payment_method: string
          payment_status: string
          treatment_description: string | null
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          clinic_id: string
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          patient_id: string
          payment_method: string
          payment_status?: string
          treatment_description?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          clinic_id?: string
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          patient_id?: string
          payment_method?: string
          payment_status?: string
          treatment_description?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      queue: {
        Row: {
          appointment_id: string
          created_at: string
          estimated_wait_minutes: number | null
          id: string
          manual_order: number | null
          override_reason: string | null
          position: number
          predicted_completion_time: string | null
          priority: Database["public"]["Enums"]["queue_priority"] | null
          status: Database["public"]["Enums"]["queue_status"] | null
          treatment_duration_override: number | null
          updated_at: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          estimated_wait_minutes?: number | null
          id?: string
          manual_order?: number | null
          override_reason?: string | null
          position: number
          predicted_completion_time?: string | null
          priority?: Database["public"]["Enums"]["queue_priority"] | null
          status?: Database["public"]["Enums"]["queue_status"] | null
          treatment_duration_override?: number | null
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          estimated_wait_minutes?: number | null
          id?: string
          manual_order?: number | null
          override_reason?: string | null
          position?: number
          predicted_completion_time?: string | null
          priority?: Database["public"]["Enums"]["queue_priority"] | null
          status?: Database["public"]["Enums"]["queue_status"] | null
          treatment_duration_override?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "queue_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_schedules: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          notes: string | null
          staff_id: string
          updated_at: string
          working_hours: Json
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          staff_id: string
          updated_at?: string
          working_hours: Json
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          staff_id?: string
          updated_at?: string
          working_hours?: Json
        }
        Relationships: [
          {
            foreignKeyName: "staff_schedules_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_history: {
        Row: {
          changed_by: string | null
          clinic_id: string
          created_at: string
          effective_date: string
          id: string
          new_plan: string | null
          old_plan: string | null
          reason: string | null
        }
        Insert: {
          changed_by?: string | null
          clinic_id: string
          created_at?: string
          effective_date?: string
          id?: string
          new_plan?: string | null
          old_plan?: string | null
          reason?: string | null
        }
        Update: {
          changed_by?: string | null
          clinic_id?: string
          created_at?: string
          effective_date?: string
          id?: string
          new_plan?: string | null
          old_plan?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_history_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          features: Json
          id: string
          is_active: boolean | null
          max_branches: number | null
          max_users: number | null
          monthly_price: number | null
          name: string
          tier: number
          yearly_price: number | null
        }
        Insert: {
          created_at?: string
          features: Json
          id?: string
          is_active?: boolean | null
          max_branches?: number | null
          max_users?: number | null
          monthly_price?: number | null
          name: string
          tier: number
          yearly_price?: number | null
        }
        Update: {
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean | null
          max_branches?: number | null
          max_users?: number | null
          monthly_price?: number | null
          name?: string
          tier?: number
          yearly_price?: number | null
        }
        Relationships: []
      }
      super_admin_audit: {
        Row: {
          action: string
          admin_id: string
          clinic_affected: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id: string
          clinic_affected?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          clinic_affected?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "super_admin_audit_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "super_admin_audit_clinic_affected_fkey"
            columns: ["clinic_affected"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      treatment_records: {
        Row: {
          actual_duration_minutes: number | null
          appointment_id: string | null
          clinic_id: string
          complications: string | null
          created_at: string
          dentist_id: string
          end_time: string | null
          follow_up_notes: string | null
          follow_up_required: boolean | null
          id: string
          notes: string | null
          patient_id: string
          price_charged: number | null
          start_time: string
          status: string
          treatment_id: string
          updated_at: string
        }
        Insert: {
          actual_duration_minutes?: number | null
          appointment_id?: string | null
          clinic_id: string
          complications?: string | null
          created_at?: string
          dentist_id: string
          end_time?: string | null
          follow_up_notes?: string | null
          follow_up_required?: boolean | null
          id?: string
          notes?: string | null
          patient_id: string
          price_charged?: number | null
          start_time: string
          status?: string
          treatment_id: string
          updated_at?: string
        }
        Update: {
          actual_duration_minutes?: number | null
          appointment_id?: string | null
          clinic_id?: string
          complications?: string | null
          created_at?: string
          dentist_id?: string
          end_time?: string | null
          follow_up_notes?: string | null
          follow_up_required?: boolean | null
          id?: string
          notes?: string | null
          patient_id?: string
          price_charged?: number | null
          start_time?: string
          status?: string
          treatment_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "treatment_records_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_records_dentist_id_fkey"
            columns: ["dentist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_records_treatment_id_fkey"
            columns: ["treatment_id"]
            isOneToOne: false
            referencedRelation: "treatments"
            referencedColumns: ["id"]
          },
        ]
      }
      treatments: {
        Row: {
          clinic_id: string
          created_at: string
          created_by_super_admin: boolean | null
          default_duration_minutes: number | null
          default_price: number | null
          id: string
          is_global_template: boolean | null
          name: string
          service_code: string | null
          updated_at: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          created_by_super_admin?: boolean | null
          default_duration_minutes?: number | null
          default_price?: number | null
          id?: string
          is_global_template?: boolean | null
          name: string
          service_code?: string | null
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          created_by_super_admin?: boolean | null
          default_duration_minutes?: number | null
          default_price?: number | null
          id?: string
          is_global_template?: boolean | null
          name?: string
          service_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "treatments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          clinic_id: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_notifications: {
        Row: {
          action_url: string | null
          clinic_id: string
          created_at: string
          document_id: string | null
          document_type: string | null
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          recipient_user_id: string | null
          title: string
        }
        Insert: {
          action_url?: string | null
          clinic_id: string
          created_at?: string
          document_id?: string | null
          document_type?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: string
          recipient_user_id?: string | null
          title: string
        }
        Update: {
          action_url?: string | null
          clinic_id?: string
          created_at?: string
          document_id?: string | null
          document_type?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          recipient_user_id?: string | null
          title?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_branch_data: {
        Args: { target_branch_id: string }
        Returns: boolean
      }
      get_auth_clinic: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_auth_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_average_treatment_duration: {
        Args: { treatment_name: string }
        Returns: number
      }
      get_clinic_enabled_features: {
        Args: { clinic_uuid: string }
        Returns: {
          feature_name: string
          is_enabled: boolean
        }[]
      }
      get_current_user_details: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_clinic_id: string
          user_role: string
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_family_members: {
        Args: { patient_id: string }
        Returns: {
          contact_number: string
          date_of_birth: string
          full_name: string
          member_id: string
          relationship: string
        }[]
      }
      get_patient_document_url: {
        Args: { file_path: string }
        Returns: string
      }
      get_user_clinic_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_sharing_group_branches: {
        Args: Record<PropertyKey, never>
        Returns: {
          branch_id: string
        }[]
      }
    }
    Enums: {
      appointment_status:
        | "booked"
        | "checked_in"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
      booking_type: "online" | "walk_in" | "emergency" | "virtual"
      document_type:
        | "consent_form"
        | "insurance"
        | "lab_result"
        | "xray"
        | "other"
      notification_status: "pending" | "sent" | "failed"
      notification_type: "sms" | "push" | "email" | "system"
      payment_status: "paid" | "partial" | "unpaid"
      queue_priority: "emergency" | "scheduled" | "walk_in"
      queue_status: "waiting" | "skipped" | "called" | "completed"
      subscription_package: "core" | "growth" | "premium"
      user_role:
        | "super_admin"
        | "clinic_admin"
        | "dentist"
        | "staff"
        | "receptionist"
        | "patient"
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
      appointment_status: [
        "booked",
        "checked_in",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ],
      booking_type: ["online", "walk_in", "emergency", "virtual"],
      document_type: [
        "consent_form",
        "insurance",
        "lab_result",
        "xray",
        "other",
      ],
      notification_status: ["pending", "sent", "failed"],
      notification_type: ["sms", "push", "email", "system"],
      payment_status: ["paid", "partial", "unpaid"],
      queue_priority: ["emergency", "scheduled", "walk_in"],
      queue_status: ["waiting", "skipped", "called", "completed"],
      subscription_package: ["core", "growth", "premium"],
      user_role: [
        "super_admin",
        "clinic_admin",
        "dentist",
        "staff",
        "receptionist",
        "patient",
      ],
    },
  },
} as const
