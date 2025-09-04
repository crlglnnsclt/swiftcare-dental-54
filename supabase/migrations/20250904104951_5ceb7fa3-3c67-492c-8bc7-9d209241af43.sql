-- Add policy to allow patients to insert their own appointments
CREATE POLICY "Patients can insert their own appointments" 
ON public.appointments 
FOR INSERT 
TO authenticated
WITH CHECK (
  patient_id IN (
    SELECT p.id 
    FROM public.patients p 
    JOIN public.users u ON u.id = p.user_id 
    WHERE u.user_id = auth.uid()
  )
);