-- Add policy to allow patients to view dentists from their clinic for appointment booking
CREATE POLICY "Patients can view dentists in their clinic for appointments" 
ON public.users 
FOR SELECT 
TO authenticated
USING (
  role = 'dentist' 
  AND EXISTS (
    SELECT 1 
    FROM public.users patient_user 
    WHERE patient_user.user_id = auth.uid() 
    AND patient_user.clinic_id = users.clinic_id
  )
);