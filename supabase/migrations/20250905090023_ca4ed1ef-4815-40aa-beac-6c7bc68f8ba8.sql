-- Add missing RLS policies for remaining tables

-- 1. Enhanced existing policies for appointments, forms, documents, and patients
-- Add missing appointments policies for staff
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

-- 2. Enhance digital_forms policies
DROP POLICY IF EXISTS "Staff can manage digital forms" ON public.digital_forms;

CREATE POLICY "Staff can manage digital forms" ON public.digital_forms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

-- 3. Enhance form_responses policies
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

-- 4. Enhance patient_documents policies
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

-- 5. Enhance patients table policies
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

-- 6. Add policies for the remaining tables that still show in linter
-- appointment_treatments
CREATE POLICY "Staff can view appointment treatments" ON public.appointment_treatments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

CREATE POLICY "Staff can manage appointment treatments" ON public.appointment_treatments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

-- inventory_usage
CREATE POLICY "Staff can view inventory usage" ON public.inventory_usage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

CREATE POLICY "Staff can manage inventory usage" ON public.inventory_usage
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

-- invoice_items
CREATE POLICY "Staff can view invoice items" ON public.invoice_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

CREATE POLICY "Staff can manage invoice items" ON public.invoice_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

-- patient_feedback
CREATE POLICY "Patients can submit feedback" ON public.patient_feedback
  FOR INSERT WITH CHECK (
    patient_id IN (
      SELECT p.id FROM patients p 
      JOIN users u ON p.user_id = u.id 
      WHERE u.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view all feedback" ON public.patient_feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

-- patient_insurance
CREATE POLICY "Patients can view their insurance" ON public.patient_insurance
  FOR SELECT USING (
    patient_id IN (
      SELECT p.id FROM patients p 
      JOIN users u ON p.user_id = u.id 
      WHERE u.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view all patient insurance" ON public.patient_insurance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

CREATE POLICY "Staff can manage patient insurance" ON public.patient_insurance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );