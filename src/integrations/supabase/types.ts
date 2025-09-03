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
      analytics_reports: {
        Row: {
          branch_id: string | null
          date_range_end: string | null
          date_range_start: string | null
          generated_at: string | null
          generated_by: string
          id: string
          report_data: Json
          report_type: string
        }
        Insert: {
          branch_id?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          generated_at?: string | null
          generated_by: string
          id?: string
          report_data: Json
          report_type: string
        }
        Update: {
          branch_id?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          generated_at?: string | null
          generated_by?: string
          id?: string
          report_data?: Json
          report_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_reports_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          actual_end_time: string | null
          actual_start_time: string | null
          appointment_date: string
          appointment_type: string | null
          branch_id: string | null
          can_start_treatment: boolean | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          check_in_time: string | null
          created_at: string
          dentist_id: string | null
          early_completion_prompt: string | null
          estimated_duration: number | null
          fee: number
          forms_completed: boolean | null
          grace_period_end: string | null
          id: string
          is_checked_in: boolean | null
          is_no_show: boolean | null
          notes: string | null
          patient_id: string
          priority: string | null
          procedure_id: string | null
          queue_join_time: string | null
          queue_position: number | null
          service_id: string | null
          service_type: string
          status: string
          updated_at: string
        }
        Insert: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          appointment_date: string
          appointment_type?: string | null
          branch_id?: string | null
          can_start_treatment?: boolean | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          check_in_time?: string | null
          created_at?: string
          dentist_id?: string | null
          early_completion_prompt?: string | null
          estimated_duration?: number | null
          fee?: number
          forms_completed?: boolean | null
          grace_period_end?: string | null
          id?: string
          is_checked_in?: boolean | null
          is_no_show?: boolean | null
          notes?: string | null
          patient_id: string
          priority?: string | null
          procedure_id?: string | null
          queue_join_time?: string | null
          queue_position?: number | null
          service_id?: string | null
          service_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          appointment_date?: string
          appointment_type?: string | null
          branch_id?: string | null
          can_start_treatment?: boolean | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          check_in_time?: string | null
          created_at?: string
          dentist_id?: string | null
          early_completion_prompt?: string | null
          estimated_duration?: number | null
          fee?: number
          forms_completed?: boolean | null
          grace_period_end?: string | null
          id?: string
          is_checked_in?: boolean | null
          is_no_show?: boolean | null
          notes?: string | null
          patient_id?: string
          priority?: string | null
          procedure_id?: string | null
          queue_join_time?: string | null
          queue_position?: number | null
          service_id?: string | null
          service_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "procedures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      attachments: {
        Row: {
          branch_id: string | null
          created_at: string | null
          description: string | null
          entity_id: string
          entity_type: string
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          is_visible_to_patient: boolean | null
          requires_payment_approval: boolean | null
          updated_at: string | null
          uploaded_by: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          description?: string | null
          entity_id: string
          entity_type: string
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          is_visible_to_patient?: boolean | null
          requires_payment_approval?: boolean | null
          updated_at?: string | null
          uploaded_by: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          description?: string | null
          entity_id?: string
          entity_type?: string
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          is_visible_to_patient?: boolean | null
          requires_payment_approval?: boolean | null
          updated_at?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          branch_id: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          performed_at: string | null
          performed_by: string
          record_id: string | null
          table_name: string
          user_agent: string | null
        }
        Insert: {
          action: string
          branch_id?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          performed_at?: string | null
          performed_by: string
          record_id?: string | null
          table_name: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          branch_id?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          performed_at?: string | null
          performed_by?: string
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      branch_features: {
        Row: {
          branch_id: string
          config: Json | null
          created_at: string
          feature_name: string
          id: string
          is_enabled: boolean
          updated_at: string
        }
        Insert: {
          branch_id: string
          config?: Json | null
          created_at?: string
          feature_name: string
          id?: string
          is_enabled?: boolean
          updated_at?: string
        }
        Update: {
          branch_id?: string
          config?: Json | null
          created_at?: string
          feature_name?: string
          id?: string
          is_enabled?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branch_features_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          phone: string | null
          primary_color: string | null
          secondary_color: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          patient_id: string
          recipient_id: string | null
          sender_id: string
          sender_name: string
          sender_role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          patient_id: string
          recipient_id?: string | null
          sender_id: string
          sender_name: string
          sender_role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          patient_id?: string
          recipient_id?: string | null
          sender_id?: string
          sender_name?: string
          sender_role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dental_chart_audit: {
        Row: {
          action: string
          branch_id: string | null
          chart_id: string
          id: string
          new_values: Json | null
          old_values: Json | null
          performed_at: string
          performed_by: string
        }
        Insert: {
          action: string
          branch_id?: string | null
          chart_id: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          performed_at?: string
          performed_by: string
        }
        Update: {
          action?: string
          branch_id?: string | null
          chart_id?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          performed_at?: string
          performed_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "dental_chart_audit_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dental_chart_audit_chart_id_fkey"
            columns: ["chart_id"]
            isOneToOne: false
            referencedRelation: "dental_charts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dental_chart_audit_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dental_charts: {
        Row: {
          branch_id: string | null
          created_at: string
          created_by: string | null
          dentist_id: string | null
          id: string
          is_deleted: boolean | null
          notes: string | null
          patient_id: string
          status: string
          surface: string | null
          tooth_number: number
          treatment_date: string | null
          treatment_type: string
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          dentist_id?: string | null
          id?: string
          is_deleted?: boolean | null
          notes?: string | null
          patient_id: string
          status?: string
          surface?: string | null
          tooth_number: number
          treatment_date?: string | null
          treatment_type: string
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          dentist_id?: string | null
          id?: string
          is_deleted?: boolean | null
          notes?: string | null
          patient_id?: string
          status?: string
          surface?: string | null
          tooth_number?: number
          treatment_date?: string | null
          treatment_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dental_charts_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dental_charts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dental_charts_dentist_id_fkey"
            columns: ["dentist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dental_charts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_forms: {
        Row: {
          attached_document_url: string | null
          branch_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          display_mode: string | null
          form_fields: Json
          id: string
          is_active: boolean | null
          name: string
          requires_signature: boolean | null
          terms_and_conditions: string | null
          updated_at: string
        }
        Insert: {
          attached_document_url?: string | null
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_mode?: string | null
          form_fields: Json
          id?: string
          is_active?: boolean | null
          name: string
          requires_signature?: boolean | null
          terms_and_conditions?: string | null
          updated_at?: string
        }
        Update: {
          attached_document_url?: string | null
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_mode?: string | null
          form_fields?: Json
          id?: string
          is_active?: boolean | null
          name?: string
          requires_signature?: boolean | null
          terms_and_conditions?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "digital_forms_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      form_procedures: {
        Row: {
          created_at: string | null
          form_id: string
          id: string
          is_required: boolean | null
          procedure_name: string
        }
        Insert: {
          created_at?: string | null
          form_id: string
          id?: string
          is_required?: boolean | null
          procedure_name: string
        }
        Update: {
          created_at?: string | null
          form_id?: string
          id?: string
          is_required?: boolean | null
          procedure_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_procedures_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "digital_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_categories: {
        Row: {
          branch_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          branch_id: string | null
          category_id: string | null
          created_at: string | null
          current_stock: number | null
          description: string | null
          expiry_date: string | null
          id: string
          is_active: boolean | null
          maximum_stock: number | null
          minimum_stock: number | null
          name: string
          sku: string | null
          supplier_info: Json | null
          unit_cost: number | null
          updated_at: string | null
        }
        Insert: {
          branch_id?: string | null
          category_id?: string | null
          created_at?: string | null
          current_stock?: number | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          maximum_stock?: number | null
          minimum_stock?: number | null
          name: string
          sku?: string | null
          supplier_info?: Json | null
          unit_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          branch_id?: string | null
          category_id?: string | null
          created_at?: string | null
          current_stock?: number | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          maximum_stock?: number | null
          minimum_stock?: number | null
          name?: string
          sku?: string | null
          supplier_info?: Json | null
          unit_cost?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "inventory_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          branch_id: string | null
          created_at: string | null
          id: string
          item_id: string
          notes: string | null
          performed_by: string
          quantity: number
          reference_id: string | null
          reference_type: string | null
          total_cost: number | null
          transaction_type: string
          unit_cost: number | null
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          id?: string
          item_id: string
          notes?: string | null
          performed_by: string
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
          total_cost?: number | null
          transaction_type: string
          unit_cost?: number | null
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          id?: string
          item_id?: string
          notes?: string | null
          performed_by?: string
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          total_cost?: number | null
          transaction_type?: string
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_documents: {
        Row: {
          created_at: string
          description: string | null
          document_type: string | null
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          is_visible_to_patient: boolean | null
          patient_id: string
          requires_payment_approval: boolean | null
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          document_type?: string | null
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          is_visible_to_patient?: boolean | null
          patient_id: string
          requires_payment_approval?: boolean | null
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          description?: string | null
          document_type?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          is_visible_to_patient?: boolean | null
          patient_id?: string
          requires_payment_approval?: boolean | null
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_documents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          recipient_role: string
          related_id: string | null
          title: string
          type: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          recipient_role: string
          related_id?: string | null
          title: string
          type?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          recipient_role?: string
          related_id?: string | null
          title?: string
          type?: string | null
        }
        Relationships: []
      }
      patient_details: {
        Row: {
          age: number | null
          allergies: string | null
          blood_type: string | null
          communication_preference: string | null
          created_at: string
          current_medications: string | null
          date_of_birth: string | null
          dental_concerns: string | null
          dental_history: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          existing_medical_conditions: string | null
          first_name: string | null
          gender: string | null
          home_address: string | null
          id: string
          insurance_provider: string | null
          last_dental_visit: string | null
          last_name: string | null
          middle_name: string | null
          occupation: string | null
          patient_id: string
          phone: string | null
          policy_number: string | null
          preferred_time: string | null
          previous_surgeries: string | null
          updated_at: string
        }
        Insert: {
          age?: number | null
          allergies?: string | null
          blood_type?: string | null
          communication_preference?: string | null
          created_at?: string
          current_medications?: string | null
          date_of_birth?: string | null
          dental_concerns?: string | null
          dental_history?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          existing_medical_conditions?: string | null
          first_name?: string | null
          gender?: string | null
          home_address?: string | null
          id?: string
          insurance_provider?: string | null
          last_dental_visit?: string | null
          last_name?: string | null
          middle_name?: string | null
          occupation?: string | null
          patient_id: string
          phone?: string | null
          policy_number?: string | null
          preferred_time?: string | null
          previous_surgeries?: string | null
          updated_at?: string
        }
        Update: {
          age?: number | null
          allergies?: string | null
          blood_type?: string | null
          communication_preference?: string | null
          created_at?: string
          current_medications?: string | null
          date_of_birth?: string | null
          dental_concerns?: string | null
          dental_history?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          existing_medical_conditions?: string | null
          first_name?: string | null
          gender?: string | null
          home_address?: string | null
          id?: string
          insurance_provider?: string | null
          last_dental_visit?: string | null
          last_name?: string | null
          middle_name?: string | null
          occupation?: string | null
          patient_id?: string
          phone?: string | null
          policy_number?: string | null
          preferred_time?: string | null
          previous_surgeries?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_details_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_form_responses: {
        Row: {
          branch_id: string | null
          form_id: string
          form_version: number | null
          id: string
          patient_id: string
          responses: Json
          signature_data: string | null
          signature_timestamp: string | null
          signer_ip: unknown | null
          submitted_at: string
          verification_notes: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          branch_id?: string | null
          form_id: string
          form_version?: number | null
          id?: string
          patient_id: string
          responses: Json
          signature_data?: string | null
          signature_timestamp?: string | null
          signer_ip?: unknown | null
          submitted_at?: string
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          branch_id?: string | null
          form_id?: string
          form_version?: number | null
          id?: string
          patient_id?: string
          responses?: Json
          signature_data?: string | null
          signature_timestamp?: string | null
          signer_ip?: unknown | null
          submitted_at?: string
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_form_responses_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_form_responses_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "digital_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_form_responses_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_notifications: {
        Row: {
          appointment_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          patient_id: string
          title: string
          type: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          patient_id: string
          title: string
          type?: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          patient_id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_notifications_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_notifications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_results: {
        Row: {
          appointment_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          file_type: string | null
          file_url: string | null
          id: string
          is_visible_to_patient: boolean | null
          patient_id: string
          requires_payment: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_visible_to_patient?: boolean | null
          patient_id: string
          requires_payment?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_visible_to_patient?: boolean | null
          patient_id?: string
          requires_payment?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_results_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_results_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_proofs: {
        Row: {
          appointment_id: string | null
          file_name: string
          file_url: string
          id: string
          notes: string | null
          patient_id: string
          payment_id: string | null
          upload_date: string
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          appointment_id?: string | null
          file_name: string
          file_url: string
          id?: string
          notes?: string | null
          patient_id: string
          payment_id?: string | null
          upload_date?: string
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          appointment_id?: string | null
          file_name?: string
          file_url?: string
          id?: string
          notes?: string | null
          patient_id?: string
          payment_id?: string | null
          upload_date?: string
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_proofs_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_proofs_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_proofs_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          appointment_id: string
          created_at: string
          id: string
          patient_id: string
          payment_date: string
          payment_method: string
          payment_status: string
          service_name: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          appointment_id: string
          created_at?: string
          id?: string
          patient_id?: string
          payment_date?: string
          payment_method: string
          payment_status?: string
          service_name?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          appointment_id?: string
          created_at?: string
          id?: string
          patient_id?: string
          payment_date?: string
          payment_method?: string
          payment_status?: string
          service_name?: string | null
          verification_status?: string | null
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
            foreignKeyName: "payments_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_records: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          base_salary: number | null
          bonus: number | null
          branch_id: string | null
          created_at: string | null
          deductions: number | null
          id: string
          overtime_hours: number | null
          overtime_rate: number | null
          pay_period_end: string
          pay_period_start: string
          staff_id: string
          status: string | null
          total_gross: number | null
          total_net: number | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          base_salary?: number | null
          bonus?: number | null
          branch_id?: string | null
          created_at?: string | null
          deductions?: number | null
          id?: string
          overtime_hours?: number | null
          overtime_rate?: number | null
          pay_period_end: string
          pay_period_start: string
          staff_id: string
          status?: string | null
          total_gross?: number | null
          total_net?: number | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          base_salary?: number | null
          bonus?: number | null
          branch_id?: string | null
          created_at?: string | null
          deductions?: number | null
          id?: string
          overtime_hours?: number | null
          overtime_rate?: number | null
          pay_period_end?: string
          pay_period_start?: string
          staff_id?: string
          status?: string | null
          total_gross?: number | null
          total_net?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_records_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_records_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      procedures: {
        Row: {
          branch_id: string | null
          category: string | null
          code: string | null
          created_at: string | null
          description: string | null
          estimated_duration: number | null
          id: string
          is_active: boolean | null
          name: string
          requires_forms: boolean | null
          updated_at: string | null
        }
        Insert: {
          branch_id?: string | null
          category?: string | null
          code?: string | null
          created_at?: string | null
          description?: string | null
          estimated_duration?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          requires_forms?: boolean | null
          updated_at?: string | null
        }
        Update: {
          branch_id?: string | null
          category?: string | null
          code?: string | null
          created_at?: string | null
          description?: string | null
          estimated_duration?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          requires_forms?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "procedures_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          branch_id: string | null
          created_at: string
          email: string
          enhanced_role:
            | Database["public"]["Enums"]["enhanced_user_role"]
            | null
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          email: string
          enhanced_role?:
            | Database["public"]["Enums"]["enhanced_user_role"]
            | null
          full_name: string
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          email?: string
          enhanced_role?:
            | Database["public"]["Enums"]["enhanced_user_role"]
            | null
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          duration: number | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      telemedicine_sessions: {
        Row: {
          appointment_id: string | null
          branch_id: string | null
          created_at: string | null
          dentist_id: string
          ended_at: string | null
          id: string
          meeting_link: string | null
          patient_id: string
          recording_url: string | null
          scheduled_at: string
          session_notes: string | null
          session_type: string | null
          started_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          branch_id?: string | null
          created_at?: string | null
          dentist_id: string
          ended_at?: string | null
          id?: string
          meeting_link?: string | null
          patient_id: string
          recording_url?: string | null
          scheduled_at: string
          session_notes?: string | null
          session_type?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          branch_id?: string | null
          created_at?: string | null
          dentist_id?: string
          ended_at?: string | null
          id?: string
          meeting_link?: string | null
          patient_id?: string
          recording_url?: string | null
          scheduled_at?: string
          session_notes?: string | null
          session_type?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "telemedicine_sessions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telemedicine_sessions_dentist_id_fkey"
            columns: ["dentist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telemedicine_sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      timesheets: {
        Row: {
          approved_by: string | null
          branch_id: string | null
          break_end: string | null
          break_start: string | null
          clock_in: string | null
          clock_out: string | null
          created_at: string | null
          date: string
          id: string
          notes: string | null
          overtime_hours: number | null
          staff_id: string
          status: string | null
          total_hours: number | null
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          branch_id?: string | null
          break_end?: string | null
          break_start?: string | null
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string | null
          date: string
          id?: string
          notes?: string | null
          overtime_hours?: number | null
          staff_id: string
          status?: string | null
          total_hours?: number | null
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          branch_id?: string | null
          break_end?: string | null
          break_start?: string | null
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          overtime_hours?: number | null
          staff_id?: string
          status?: string | null
          total_hours?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "timesheets_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheets_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          branch_id: string | null
          created_at: string | null
          email: string
          enhanced_role:
            | Database["public"]["Enums"]["enhanced_user_role"]
            | null
          expires_at: string | null
          full_name: string
          id: string
          invitation_token: string | null
          invited_by: string
          role: Database["public"]["Enums"]["user_role"]
          status: string | null
        }
        Insert: {
          accepted_at?: string | null
          branch_id?: string | null
          created_at?: string | null
          email: string
          enhanced_role?:
            | Database["public"]["Enums"]["enhanced_user_role"]
            | null
          expires_at?: string | null
          full_name: string
          id?: string
          invitation_token?: string | null
          invited_by: string
          role: Database["public"]["Enums"]["user_role"]
          status?: string | null
        }
        Update: {
          accepted_at?: string | null
          branch_id?: string | null
          created_at?: string | null
          email?: string
          enhanced_role?:
            | Database["public"]["Enums"]["enhanced_user_role"]
            | null
          expires_at?: string | null
          full_name?: string
          id?: string
          invitation_token?: string | null
          invited_by?: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_invitations_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      dentist_can_view_patient: {
        Args: { patient_profile_id: string }
        Returns: boolean
      }
      get_available_dentists: {
        Args: Record<PropertyKey, never>
        Returns: {
          full_name: string
          id: string
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_enhanced_role: {
        Args: {
          required_role: Database["public"]["Enums"]["enhanced_user_role"]
          user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          required_role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      enhanced_user_role:
        | "super_admin"
        | "admin"
        | "dentist"
        | "staff"
        | "patient"
      user_role: "patient" | "admin" | "staff" | "dentist"
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
      enhanced_user_role: [
        "super_admin",
        "admin",
        "dentist",
        "staff",
        "patient",
      ],
      user_role: ["patient", "admin", "staff", "dentist"],
    },
  },
} as const
