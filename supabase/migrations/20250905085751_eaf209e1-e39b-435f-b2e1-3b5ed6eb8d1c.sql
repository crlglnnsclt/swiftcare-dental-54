-- Fix RLS policies for all critical tables to ensure proper CRUD operations

-- 1. Create queue table if it doesn't exist (needed for queue management)
CREATE TABLE IF NOT EXISTS public.queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id),
  patient_id UUID NOT NULL,
  position INTEGER,
  priority TEXT DEFAULT 'scheduled',
  status TEXT DEFAULT 'waiting',
  estimated_wait_minutes INTEGER DEFAULT 0,
  treatment_duration_override INTEGER,
  manual_order INTEGER,
  predicted_completion_time TIMESTAMPTZ,
  checked_in_at TIMESTAMPTZ DEFAULT now(),
  called_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on queue table
ALTER TABLE public.queue ENABLE ROW LEVEL SECURITY;

-- 2. Create treatments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  default_price DECIMAL(10,2) DEFAULT 0,
  default_duration_minutes INTEGER DEFAULT 30,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on treatments table
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;

-- 3. Fix family_members RLS policies (currently has none)
DROP POLICY IF EXISTS "Patients can view their family members" ON public.family_members;
DROP POLICY IF EXISTS "Patients can manage their family members" ON public.family_members;
DROP POLICY IF EXISTS "Staff can view all family members" ON public.family_members;

CREATE POLICY "Patients can view their family members" ON public.family_members
  FOR SELECT USING (
    primary_patient_id IN (
      SELECT p.id FROM patients p 
      JOIN users u ON p.user_id = u.id 
      WHERE u.user_id = auth.uid()
    ) OR
    secondary_patient_id IN (
      SELECT p.id FROM patients p 
      JOIN users u ON p.user_id = u.id 
      WHERE u.user_id = auth.uid()
    )
  );

CREATE POLICY "Patients can manage their family members" ON public.family_members
  FOR ALL USING (
    primary_patient_id IN (
      SELECT p.id FROM patients p 
      JOIN users u ON p.user_id = u.id 
      WHERE u.user_id = auth.uid()
    ) OR
    secondary_patient_id IN (
      SELECT p.id FROM patients p 
      JOIN users u ON p.user_id = u.id 
      WHERE u.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage all family members" ON public.family_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

-- 4. Fix dentist_signatures RLS policies (currently has none)
DROP POLICY IF EXISTS "Dentists can manage their signatures" ON public.dentist_signatures;
DROP POLICY IF EXISTS "Staff can view all signatures" ON public.dentist_signatures;

CREATE POLICY "Dentists can manage their signatures" ON public.dentist_signatures
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND id = dentist_signatures.dentist_id
    )
  );

CREATE POLICY "Staff can view all signatures" ON public.dentist_signatures
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

-- 5. Fix inventory tables RLS policies
DROP POLICY IF EXISTS "Staff can manage inventory items" ON public.inventory_items;
DROP POLICY IF EXISTS "Staff can view inventory categories" ON public.inventory_categories;
DROP POLICY IF EXISTS "Staff can manage inventory categories" ON public.inventory_categories;
DROP POLICY IF EXISTS "Staff can view inventory transactions" ON public.inventory_transactions;
DROP POLICY IF EXISTS "Staff can manage inventory transactions" ON public.inventory_transactions;
DROP POLICY IF EXISTS "Staff can view inventory alerts" ON public.inventory_alerts;
DROP POLICY IF EXISTS "Staff can manage inventory alerts" ON public.inventory_alerts;

CREATE POLICY "Staff can manage inventory items" ON public.inventory_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

CREATE POLICY "Staff can view inventory categories" ON public.inventory_categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

CREATE POLICY "Staff can manage inventory categories" ON public.inventory_categories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'super_admin')
    )
  );

CREATE POLICY "Staff can view inventory transactions" ON public.inventory_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

CREATE POLICY "Staff can manage inventory transactions" ON public.inventory_transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

CREATE POLICY "Staff can view inventory alerts" ON public.inventory_alerts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

CREATE POLICY "Staff can manage inventory alerts" ON public.inventory_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

-- 6. Fix treatments table RLS policies
CREATE POLICY "All authenticated users can view treatments" ON public.treatments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Staff can manage treatments" ON public.treatments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

-- 7. Fix queue table RLS policies
CREATE POLICY "Staff can view all queue entries" ON public.queue
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

CREATE POLICY "Patients can view their own queue entry" ON public.queue
  FOR SELECT USING (
    patient_id IN (
      SELECT p.id FROM patients p 
      JOIN users u ON p.user_id = u.id 
      WHERE u.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage queue entries" ON public.queue
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

-- 8. Enhance digital_forms policies
DROP POLICY IF EXISTS "Staff can manage digital forms" ON public.digital_forms;

CREATE POLICY "Staff can manage digital forms" ON public.digital_forms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

-- 9. Enhance form_responses policies
DROP POLICY IF EXISTS "Staff can view all form responses" ON public.form_responses;
DROP POLICY IF EXISTS "Staff can manage form responses" ON public.form_responses;
DROP POLICY IF EXISTS "Patients can update own responses" ON public.form_responses;

CREATE POLICY "Staff can view all form responses" ON public.form_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

CREATE POLICY "Staff can manage form responses" ON public.form_responses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

CREATE POLICY "Patients can update own responses" ON public.form_responses
  FOR UPDATE USING (
    patient_id IN (
      SELECT p.id FROM patients p 
      JOIN users u ON p.user_id = u.id 
      WHERE u.user_id = auth.uid()
    )
  );

-- 10. Enhance patient_documents policies
DROP POLICY IF EXISTS "Staff can view all patient documents" ON public.patient_documents;
DROP POLICY IF EXISTS "Staff can manage patient documents" ON public.patient_documents;

CREATE POLICY "Staff can view all patient documents" ON public.patient_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

CREATE POLICY "Staff can manage patient documents" ON public.patient_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

-- 11. Enhance patients table policies
DROP POLICY IF EXISTS "Staff can view all patients" ON public.patients;
DROP POLICY IF EXISTS "Staff can manage patients" ON public.patients;
DROP POLICY IF EXISTS "Patients can update their own record" ON public.patients;

CREATE POLICY "Staff can view all patients" ON public.patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

CREATE POLICY "Staff can manage patients" ON public.patients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

CREATE POLICY "Patients can update their own record" ON public.patients
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = auth.uid() 
      AND u.id = patients.user_id
    )
  );

-- 12. Fix communication_templates policies (currently has none)
CREATE POLICY "Staff can view communication templates" ON public.communication_templates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

CREATE POLICY "Staff can manage communication templates" ON public.communication_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

-- 13. Add missing appointments policies for staff
DROP POLICY IF EXISTS "Staff can view all appointments" ON public.appointments;
DROP POLICY IF EXISTS "Staff can manage appointments" ON public.appointments;

CREATE POLICY "Staff can view all appointments" ON public.appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

CREATE POLICY "Staff can manage appointments" ON public.appointments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

-- Add triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to tables that need them
DROP TRIGGER IF EXISTS update_queue_updated_at ON public.queue;
CREATE TRIGGER update_queue_updated_at BEFORE UPDATE ON public.queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_treatments_updated_at ON public.treatments;
CREATE TRIGGER update_treatments_updated_at BEFORE UPDATE ON public.treatments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();