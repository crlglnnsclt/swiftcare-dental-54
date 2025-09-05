-- Add missing CRUD policies for existing tables that have limited policies

-- 1. Enhance digital_forms policies (add staff management)
CREATE POLICY "Staff can manage digital forms" ON public.digital_forms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

-- 2. Enhance form_responses policies (add staff access)
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

-- 3. Enhance patient_documents policies (add staff access)
CREATE POLICY "Staff can view all patient documents" ON public.patient_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

CREATE POLICY "Staff can manage patient documents" ON public.patient_documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

-- 4. Enhance patients table policies (add staff management)
CREATE POLICY "Staff can view all patients" ON public.patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

CREATE POLICY "Staff can manage patients" ON public.patients
  FOR UPDATE USING (
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

-- 5. Add missing appointments policies for staff
CREATE POLICY "Staff can view all appointments" ON public.appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

CREATE POLICY "Staff can manage appointments" ON public.appointments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

CREATE POLICY "Staff can update appointments" ON public.appointments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );