
// SwiftCare Dental Clinic - Core Type Definitions

export type AppointmentStatus = 
  | 'scheduled' 
  | 'booked' 
  | 'checked_in' 
  | 'waiting' 
  | 'in_procedure' 
  | 'billing' 
  | 'completed' 
  | 'cancelled' 
  | 'no_show';

export interface Appointment {
  id: string;
  patient_id: string;
  dentist_id: string;
  scheduled_time: string;
  status: AppointmentStatus;
  appointment_type: string;
  reason_for_visit: string;
  created_at: string;
  updated_at: string;
  checked_in_at?: string;
  procedure_started_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  no_show_grace_period?: boolean;
  patient?: Patient;
  dentist?: User;
}

export interface Patient {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact?: string;
  medical_history?: any;
  dental_chart?: DentalChart;
  treatment_history?: TreatmentHistory[];
  pending_treatments?: TreatmentPlan[];
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'clinic_admin' | 'dentist' | 'staff' | 'patient';
  clinic_id?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

export interface DentalChart {
  id: string;
  patient_id: string;
  chart_data: any; // Interactive dental chart data
  last_updated: string;
  updated_by: string;
}

export interface TreatmentPlan {
  id: string;
  patient_id: string;
  dentist_id: string;
  procedures: TreatmentProcedure[];
  total_cost: number;
  description: string;
  patient_friendly_description: string;
  risk_level: 'low' | 'medium' | 'high';
  risk_notes?: string;
  consent_signed: boolean;
  patient_signature?: string;
  dentist_signature?: string;
  signed_at?: string;
  created_at: string;
}

export interface TreatmentProcedure {
  id: string;
  name: string;
  description: string;
  patient_friendly_description: string;
  cost: number;
  duration: number; // in minutes
  tooth_number?: string;
  category: string;
}

export interface TreatmentHistory {
  id: string;
  appointment_id: string;
  patient_id: string;
  dentist_id: string;
  procedures: TreatmentProcedure[];
  items_used: InventoryUsage[];
  total_cost: number;
  amount_paid: number;
  balance_due: number;
  payment_mode: string;
  treatment_date: string;
  notes: string;
  wire_type?: string;
  next_visit_date?: string;
  next_visit_notes?: string;
  patient_signature: boolean;
  dentist_signature: boolean;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  item_name: string;
  category: string;
  current_stock: number;
  minimum_stock: number;
  unit_cost: number;
  supplier?: string;
  last_reorder_date?: string;
  created_at: string;
}

export interface InventoryUsage {
  id: string;
  item_id: string;
  item_name: string;
  quantity_used: number;
  unit_cost: number;
  total_cost: number;
  used_at: string;
  used_by: string;
  appointment_id?: string;
}

export interface DigitalForm {
  id: string;
  form_type: 'consent' | 'intake' | 'post_procedure' | 'care_instructions' | 'terms_conditions';
  template_name: string;
  fields: FormField[];
  is_patient_visible: boolean;
  auto_attach_procedures?: string[];
  created_by: string;
  created_at: string;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'signature' | 'date';
  required: boolean;
  options?: string[];
  auto_fill_source?: string;
}

export interface SignedDocument {
  id: string;
  patient_id: string;
  appointment_id?: string;
  form_id: string;
  form_data: any;
  patient_signature?: string;
  dentist_signature?: string;
  staff_signature?: string;
  signed_at: string;
  is_patient_visible: boolean;
  document_version: number;
  audit_log: DocumentAuditLog[];
}

export interface DocumentAuditLog {
  id: string;
  document_id: string;
  action: 'created' | 'modified' | 'signed' | 'viewed' | 'archived';
  user_id: string;
  user_name: string;
  timestamp: string;
  device_info?: string;
  ip_address?: string;
  changes?: any;
}

export interface QueueEntry {
  id: string;
  patient_id: string;
  appointment_id?: string;
  queue_type: 'appointment' | 'walk_in' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'waiting' | 'in_progress' | 'completed';
  checked_in_at: string;
  estimated_wait_time?: number;
  assigned_dentist_id?: string;
  notes?: string;
}

export interface WalkIn {
  id: string;
  patient_name: string;
  patient_phone?: string;
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  arrived_at: string;
  assigned_dentist_id?: string;
  queue_position?: number;
  status: 'waiting' | 'in_progress' | 'completed';
}

export interface SystemModule {
  id: string;
  name: string;
  description: string;
  is_ui_visible: boolean;
  is_background_running: boolean; // Always true for core modules
  permissions: string[];
  created_at: string;
}

export interface Analytics {
  revenue: RevenueAnalytics;
  inventory: InventoryAnalytics;
  performance: PerformanceAnalytics;
}

export interface RevenueAnalytics {
  total_revenue: number;
  revenue_by_dentist: { [dentist_id: string]: number };
  revenue_by_procedure: { [procedure_name: string]: number };
  revenue_by_payment_mode: { [payment_mode: string]: number };
  outstanding_balances: { [patient_id: string]: number };
  discounts_applied: number;
  period: string;
}

export interface InventoryAnalytics {
  items_used: { [item_name: string]: number };
  usage_by_dentist: { [dentist_id: string]: { [item_name: string]: number } };
  low_stock_alerts: string[];
  usage_forecast: { [item_name: string]: number };
  cost_per_procedure: { [procedure_name: string]: number };
}

export interface PerformanceAnalytics {
  profitability: { [procedure_name: string]: { revenue: number; cost: number; profit: number } };
  dentist_performance: { 
    [dentist_id: string]: { 
      revenue: number; 
      items_cost: number; 
      net_profit: number;
      patient_count: number;
    } 
  };
  clinic_utilization: {
    patients_per_day: number;
    average_spend: number;
    appointment_completion_rate: number;
    no_show_rate: number;
  };
}

export interface PatientNotification {
  id: string;
  patient_id: string;
  type: 'queue_update' | 'appointment_change' | 'treatment_update' | 'follow_up';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}
