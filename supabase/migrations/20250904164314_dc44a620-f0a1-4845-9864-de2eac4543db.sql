-- Re-enable RLS on appointments table
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Patients can view their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Patients can update their own appointments" ON public.appointments;

-- Create simpler, working RLS policies
-- Policy for patients to view their appointments
CREATE POLICY "enable_read_for_patients" ON public.appointments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM patients p 
    JOIN users u ON p.user_id = u.id 
    WHERE u.user_id = auth.uid() AND p.id = appointments.patient_id
  )
);

-- Policy for patients to update their appointments (for check-in)
CREATE POLICY "enable_update_for_patients" ON public.appointments
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM patients p 
    JOIN users u ON p.user_id = u.id 
    WHERE u.user_id = auth.uid() AND p.id = appointments.patient_id
  )
);

-- Policy for dentists to view appointments
CREATE POLICY "enable_read_for_dentists" ON public.appointments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.user_id = auth.uid() AND u.id = appointments.dentist_id
  )
);

-- Policy for dentists to update appointments
CREATE POLICY "enable_update_for_dentists" ON public.appointments
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.user_id = auth.uid() AND u.id = appointments.dentist_id
  )
);

-- Policy for clinic admins to view all appointments in their clinic
CREATE POLICY "enable_read_for_clinic_admins" ON public.appointments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.user_id = auth.uid() 
    AND u.role IN ('clinic_admin', 'super_admin')
    AND (u.role = 'super_admin' OR u.clinic_id = appointments.clinic_id)
  )
);

-- Policy for clinic admins to manage all appointments in their clinic
CREATE POLICY "enable_all_for_clinic_admins" ON public.appointments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.user_id = auth.uid() 
    AND u.role IN ('clinic_admin', 'super_admin')
    AND (u.role = 'super_admin' OR u.clinic_id = appointments.clinic_id)
  )
);