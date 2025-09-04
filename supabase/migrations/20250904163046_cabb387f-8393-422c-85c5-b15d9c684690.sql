-- Create security definer function to get current user's patient IDs
CREATE OR REPLACE FUNCTION public.get_current_user_patient_ids()
RETURNS UUID[] AS $$
  SELECT ARRAY_AGG(p.id) 
  FROM patients p 
  JOIN users u ON p.user_id = u.id 
  WHERE u.user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create RLS policy for appointments so patients can see their own appointments
DROP POLICY IF EXISTS "Patients can view their own appointments" ON public.appointments;
CREATE POLICY "Patients can view their own appointments" 
ON public.appointments 
FOR SELECT 
USING (
  patient_id = ANY(public.get_current_user_patient_ids())
);

-- Create RLS policy for appointments so patients can update their own appointments (for check-in)
DROP POLICY IF EXISTS "Patients can update their own appointments" ON public.appointments;
CREATE POLICY "Patients can update their own appointments" 
ON public.appointments 
FOR UPDATE 
USING (
  patient_id = ANY(public.get_current_user_patient_ids())
);

-- Ensure RLS is enabled on appointments table
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;