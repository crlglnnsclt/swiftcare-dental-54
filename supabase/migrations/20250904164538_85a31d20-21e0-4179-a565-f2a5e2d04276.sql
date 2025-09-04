-- Drop all existing policies on appointments table
DROP POLICY IF EXISTS "enable_read_for_patients" ON public.appointments;
DROP POLICY IF EXISTS "enable_update_for_patients" ON public.appointments;
DROP POLICY IF EXISTS "enable_read_for_dentists" ON public.appointments;
DROP POLICY IF EXISTS "enable_update_for_dentists" ON public.appointments;
DROP POLICY IF EXISTS "enable_read_for_clinic_admins" ON public.appointments;
DROP POLICY IF EXISTS "enable_all_for_clinic_admins" ON public.appointments;

-- Create proper RLS policies for appointments
CREATE POLICY "patients_can_view_own_appointments" ON public.appointments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM patients p 
    JOIN users u ON p.user_id = u.id 
    WHERE u.user_id = auth.uid() AND p.id = appointments.patient_id
  )
);

CREATE POLICY "patients_can_update_own_appointments" ON public.appointments
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM patients p 
    JOIN users u ON p.user_id = u.id 
    WHERE u.user_id = auth.uid() AND p.id = appointments.patient_id
  )
);

CREATE POLICY "dentists_can_view_their_appointments" ON public.appointments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.user_id = auth.uid() AND u.id = appointments.dentist_id
  )
);

CREATE POLICY "dentists_can_update_their_appointments" ON public.appointments
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.user_id = auth.uid() AND u.id = appointments.dentist_id
  )
);

CREATE POLICY "admins_can_view_clinic_appointments" ON public.appointments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.user_id = auth.uid() 
    AND u.role IN ('clinic_admin', 'super_admin')
    AND (u.role = 'super_admin' OR u.clinic_id = appointments.clinic_id)
  )
);

CREATE POLICY "admins_can_manage_clinic_appointments" ON public.appointments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.user_id = auth.uid() 
    AND u.role IN ('clinic_admin', 'super_admin')
    AND (u.role = 'super_admin' OR u.clinic_id = appointments.clinic_id)
  )
);