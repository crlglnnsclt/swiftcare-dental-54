-- Add missing RLS policies for tables without any policies

-- Fix inventory categories policies (missing all policies)
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

-- Fix inventory transactions policies (missing all policies) 
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

-- Fix inventory alerts policies (missing all policies)
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

-- Fix dentist_signatures policies (missing all policies)
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

-- Fix treatments table policies (missing all policies)
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

-- Fix queue table policies (missing all policies)
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
    appointment_id IN (
      SELECT a.id FROM appointments a
      JOIN patients p ON a.patient_id = p.id
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

-- Fix communication_templates policies (missing all policies)
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