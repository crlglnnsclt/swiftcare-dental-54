-- Create dentist_signatures table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.dentist_signatures (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dentist_id uuid NOT NULL,
  clinic_id uuid NOT NULL,
  signature_data text NOT NULL,
  document_id uuid,
  treatment_record_id uuid,
  signature_type text NOT NULL,
  signed_at timestamp with time zone NOT NULL DEFAULT now(),
  patient_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS if not already enabled
ALTER TABLE public.dentist_signatures ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to ensure they exist correctly
DROP POLICY IF EXISTS "Dentists can create their own signatures" ON public.dentist_signatures;
DROP POLICY IF EXISTS "Clinic staff can view dentist signatures" ON public.dentist_signatures;

CREATE POLICY "Dentists can create their own signatures"
ON public.dentist_signatures
FOR INSERT
WITH CHECK (
  dentist_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.user_id = auth.uid()
    AND u.clinic_id = dentist_signatures.clinic_id
    AND u.role IN ('dentist', 'clinic_admin')
  )
);

CREATE POLICY "Clinic staff can view dentist signatures"
ON public.dentist_signatures
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM users u
  WHERE u.user_id = auth.uid()
  AND u.clinic_id = dentist_signatures.clinic_id
  AND u.role IN ('clinic_admin', 'dentist', 'staff', 'receptionist')
));