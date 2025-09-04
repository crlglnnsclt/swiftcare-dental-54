-- First, drop the problematic policy
DROP POLICY IF EXISTS "Patients can view dentists in their clinic for appointments" ON public.users;

-- Create a security definer function to get the user's clinic safely
CREATE OR REPLACE FUNCTION public.get_user_clinic_id()
RETURNS UUID AS $$
  SELECT clinic_id FROM public.users WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create a new policy using the security definer function
CREATE POLICY "Patients can view dentists in their clinic for appointments" 
ON public.users 
FOR SELECT 
TO authenticated
USING (
  role = 'dentist' 
  AND clinic_id = public.get_user_clinic_id()
);