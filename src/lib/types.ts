// Simplified types to avoid deep instantiation issues
export interface Appointment {
  id: string;
  patient_id: string;
  dentist_id: string | null;
  scheduled_time: string;
  duration_minutes: number | null;
  status: string;
  booking_type: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  patients?: { full_name: string; contact_number?: string };
  profiles?: { full_name: string };
}

export interface SimpleAppointment {
  id: string;
  patient_id: string;
  dentist_id: string | null;
  scheduled_time: string;
  duration_minutes: number | null;
  status: string;
  booking_type: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Treatment {
  id: string;
  name: string;
  description?: string;
  default_price: number | null;
  default_duration_minutes: number | null;
  is_active: boolean;
}

export interface Patient {
  id: string;
  full_name: string;
  email?: string;
  contact_number?: string;
  date_of_birth?: string;
  user_id?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  current_stock: number;
  minimum_stock: number;
  unit_cost: number;
  unit_type: string;
  category_id?: string;
  is_active: boolean;
  supplier_name?: string;
  supplier_contact?: string;
  expiry_date?: string;
  supplier_info?: string;
  category_name?: string;
}

export interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
}

export interface InventoryTransaction {
  id: string;
  item_id: string;
  transaction_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
  notes?: string;
  created_by: string;
  created_at: string;
  performed_by: string;
  item_name?: string;
  performer_name?: string;
}

export interface TodayAppointment {
  id: string;
  patient_id: string;
  dentist_id: string | null;
  scheduled_time: string;
  duration_minutes: number | null;
  status: string;
  booking_type: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  patients: {
    full_name: string;
  };
  users: {
    full_name: string;
  };
  dentist?: {
    full_name: string;
  };
}

export interface ClinicFeature {
  id: string;
  feature_name: string;
  description: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
  modified_by: string;
}