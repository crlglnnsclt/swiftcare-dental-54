-- Add RLS policy to allow patients to view treatments in their clinic
CREATE POLICY "Patients can view treatments in their clinic" 
ON public.treatments 
FOR SELECT 
TO authenticated
USING (
  clinic_id IN (
    SELECT clinic_id 
    FROM public.users 
    WHERE user_id = auth.uid() 
    AND role = 'patient'
  )
);

-- Add RLS policy to allow patients to view all treatments (if they're global)
CREATE POLICY "Patients can view global treatments" 
ON public.treatments 
FOR SELECT 
TO authenticated
USING (
  is_global_template = true OR 
  created_by_super_admin = true
);

-- Update the existing policy for patients viewing dentists to be more explicit
DROP POLICY IF EXISTS "Patients can view dentists in their clinic for appointments" ON public.users;

CREATE POLICY "Patients can view dentists in their clinic for appointments" 
ON public.users 
FOR SELECT 
TO authenticated
USING (
  role = 'dentist' AND 
  clinic_id = (
    SELECT clinic_id 
    FROM public.users 
    WHERE user_id = auth.uid() 
    LIMIT 1
  )
);