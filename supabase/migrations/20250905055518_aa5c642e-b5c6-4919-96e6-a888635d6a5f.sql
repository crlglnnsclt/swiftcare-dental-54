-- Fix RLS policies for tables after removing clinic_id columns

-- Add RLS policies for patients table (removed clinic_id filtering)
CREATE POLICY "Clinic staff can view all patients" 
ON public.patients FOR SELECT 
TO authenticated 
USING (get_current_user_role() = ANY(ARRAY['super_admin', 'clinic_admin', 'dentist', 'staff', 'receptionist']));

CREATE POLICY "Clinic staff can manage all patients" 
ON public.patients FOR ALL 
TO authenticated 
USING (get_current_user_role() = ANY(ARRAY['super_admin', 'clinic_admin', 'dentist', 'staff', 'receptionist']));

CREATE POLICY "Patients can view own profile" 
ON public.patients FOR SELECT 
TO authenticated 
USING (user_id IN (SELECT id FROM users WHERE user_id = auth.uid()));

-- Add RLS policies for appointments table (simplified without clinic_id)
CREATE POLICY "Clinic staff can view all appointments" 
ON public.appointments FOR SELECT 
TO authenticated 
USING (get_current_user_role() = ANY(ARRAY['super_admin', 'clinic_admin', 'dentist', 'staff', 'receptionist']));

CREATE POLICY "Clinic staff can manage all appointments" 
ON public.appointments FOR ALL 
TO authenticated 
USING (get_current_user_role() = ANY(ARRAY['super_admin', 'clinic_admin', 'dentist', 'staff', 'receptionist']));

-- Add RLS policies for inventory_items table (simplified without clinic_id)
CREATE POLICY "Clinic staff can view all inventory" 
ON public.inventory_items FOR SELECT 
TO authenticated 
USING (get_current_user_role() = ANY(ARRAY['super_admin', 'clinic_admin', 'dentist', 'staff', 'receptionist']));

CREATE POLICY "Clinic staff can manage all inventory" 
ON public.inventory_items FOR ALL 
TO authenticated 
USING (get_current_user_role() = ANY(ARRAY['super_admin', 'clinic_admin', 'dentist', 'staff', 'receptionist']));

-- Add RLS policies for inventory_categories table (simplified without clinic_id)
CREATE POLICY "Clinic staff can view all inventory categories" 
ON public.inventory_categories FOR SELECT 
TO authenticated 
USING (get_current_user_role() = ANY(ARRAY['super_admin', 'clinic_admin', 'dentist', 'staff', 'receptionist']));

CREATE POLICY "Clinic staff can manage all inventory categories" 
ON public.inventory_categories FOR ALL 
TO authenticated 
USING (get_current_user_role() = ANY(ARRAY['super_admin', 'clinic_admin', 'dentist', 'staff', 'receptionist']));

-- Add RLS policies for inventory_alerts table (simplified without clinic_id)
CREATE POLICY "Clinic staff can view all inventory alerts" 
ON public.inventory_alerts FOR SELECT 
TO authenticated 
USING (get_current_user_role() = ANY(ARRAY['super_admin', 'clinic_admin', 'dentist', 'staff', 'receptionist']));

CREATE POLICY "Clinic staff can manage all inventory alerts" 
ON public.inventory_alerts FOR ALL 
TO authenticated 
USING (get_current_user_role() = ANY(ARRAY['super_admin', 'clinic_admin', 'dentist', 'staff', 'receptionist']));

-- Add RLS policies for inventory_transactions table (simplified without clinic_id)
CREATE POLICY "Clinic staff can view all inventory transactions" 
ON public.inventory_transactions FOR SELECT 
TO authenticated 
USING (get_current_user_role() = ANY(ARRAY['super_admin', 'clinic_admin', 'dentist', 'staff', 'receptionist']));

CREATE POLICY "Clinic staff can manage all inventory transactions" 
ON public.inventory_transactions FOR ALL 
TO authenticated 
USING (get_current_user_role() = ANY(ARRAY['super_admin', 'clinic_admin', 'dentist', 'staff', 'receptionist']));

-- Add RLS policies for digital_forms table (simplified without clinic_id)
CREATE POLICY "Clinic staff can view all digital forms" 
ON public.digital_forms FOR SELECT 
TO authenticated 
USING (get_current_user_role() = ANY(ARRAY['super_admin', 'clinic_admin', 'dentist', 'staff', 'receptionist']));

CREATE POLICY "Clinic staff can manage all digital forms" 
ON public.digital_forms FOR ALL 
TO authenticated 
USING (get_current_user_role() = ANY(ARRAY['super_admin', 'clinic_admin', 'dentist', 'staff', 'receptionist']));

CREATE POLICY "Patients can view active digital forms" 
ON public.digital_forms FOR SELECT 
TO authenticated 
USING (is_active = true AND get_current_user_role() = 'patient');

-- Add RLS policies for form_responses table (simplified without clinic_id)
CREATE POLICY "Clinic staff can view all form responses" 
ON public.form_responses FOR SELECT 
TO authenticated 
USING (get_current_user_role() = ANY(ARRAY['super_admin', 'clinic_admin', 'dentist', 'staff', 'receptionist']));

CREATE POLICY "Clinic staff can manage all form responses" 
ON public.form_responses FOR ALL 
TO authenticated 
USING (get_current_user_role() = ANY(ARRAY['super_admin', 'clinic_admin', 'dentist', 'staff', 'receptionist']));

CREATE POLICY "Patients can view own form responses" 
ON public.form_responses FOR SELECT 
TO authenticated 
USING (patient_id IN (SELECT p.id FROM patients p JOIN users u ON u.id = p.user_id WHERE u.user_id = auth.uid()));

-- Add RLS policies for communication_templates table (simplified without clinic_id)
CREATE POLICY "Clinic staff can view all communication templates" 
ON public.communication_templates FOR SELECT 
TO authenticated 
USING (get_current_user_role() = ANY(ARRAY['super_admin', 'clinic_admin', 'dentist', 'staff', 'receptionist']));

CREATE POLICY "Clinic staff can manage all communication templates" 
ON public.communication_templates FOR ALL 
TO authenticated 
USING (get_current_user_role() = ANY(ARRAY['super_admin', 'clinic_admin', 'dentist', 'staff', 'receptionist']));

-- Add RLS policies for communication_logs table (simplified without clinic_id)
CREATE POLICY "Clinic staff can view all communication logs" 
ON public.communication_logs FOR SELECT 
TO authenticated 
USING (get_current_user_role() = ANY(ARRAY['super_admin', 'clinic_admin', 'dentist', 'staff', 'receptionist']));

CREATE POLICY "System can insert communication logs" 
ON public.communication_logs FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Add RLS policies for analytics_metrics table (simplified without clinic_id)
CREATE POLICY "Clinic staff can view all analytics" 
ON public.analytics_metrics FOR SELECT 
TO authenticated 
USING (get_current_user_role() = ANY(ARRAY['super_admin', 'clinic_admin', 'dentist', 'staff', 'receptionist']));

CREATE POLICY "System can insert analytics" 
ON public.analytics_metrics FOR INSERT 
TO authenticated 
WITH CHECK (true);