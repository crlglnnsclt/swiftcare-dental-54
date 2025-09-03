// Simplified types to avoid deep instantiation issues
import type { Database } from '@/integrations/supabase/types';

export type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  patients?: { full_name: string; contact_number?: string };
  users?: { full_name: string };
  profiles?: { full_name: string };
};

export type Treatment = Database['public']['Tables']['treatments']['Row'];

export type Patient = Database['public']['Tables']['patients']['Row'];

export type User = Database['public']['Tables']['users']['Row'];

export type InventoryItem = Database['public']['Tables']['inventory_items']['Row'] & {
  inventory_categories?: { name: string };
  supplier_info?: string;
};

export type InventoryCategory = Database['public']['Tables']['inventory_categories']['Row'] & {
  is_active: boolean;
};

export type InventoryTransaction = Database['public']['Tables']['inventory_transactions']['Row'] & {
  inventory_items?: { name: string };
  profiles?: { full_name: string };
  transaction_type: 'in' | 'out' | 'adjustment';
  item_name?: string;
  performer_name?: string;
  performed_by: string;
};

export type TreatmentRecord = Database['public']['Tables']['treatment_records']['Row'] & {
  patients?: { full_name: string };
  profiles?: { full_name: string };
};

// Enum types
export type AppointmentStatus = Database['public']['Enums']['appointment_status'];
export type BookingType = Database['public']['Enums']['booking_type'];
export type UserRole = Database['public']['Enums']['user_role'];