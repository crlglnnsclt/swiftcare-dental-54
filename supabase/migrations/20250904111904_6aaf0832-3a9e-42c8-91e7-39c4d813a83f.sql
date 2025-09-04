-- Create treatment_records table for dental charts
CREATE TABLE IF NOT EXISTS public.treatment_records (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id uuid NOT NULL,
  clinic_id uuid NOT NULL,
  dentist_id uuid,
  tooth_number integer,
  tooth_surface text,
  treatment_type text NOT NULL,
  treatment_notes text,
  procedure_date timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  status text DEFAULT 'planned',
  cost numeric(10,2),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.treatment_records ENABLE ROW LEVEL SECURITY;

-- Create policies for treatment_records
CREATE POLICY "Clinic staff can manage treatment records"
ON public.treatment_records
FOR ALL
USING (EXISTS (
  SELECT 1 FROM users u
  WHERE u.user_id = auth.uid()
  AND u.clinic_id = treatment_records.clinic_id
  AND u.role IN ('clinic_admin', 'dentist', 'staff', 'receptionist')
));

CREATE POLICY "Patients can view their own treatment records"
ON public.treatment_records
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM patients p
  JOIN users u ON u.id = p.user_id
  WHERE u.user_id = auth.uid()
  AND p.id = treatment_records.patient_id
));

-- Create dentist_signatures table
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

-- Enable RLS
ALTER TABLE public.dentist_signatures ENABLE ROW LEVEL SECURITY;

-- Create policies for dentist_signatures
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

-- Update updated_at trigger for treatment_records
CREATE TRIGGER update_treatment_records_updated_at
BEFORE UPDATE ON public.treatment_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add missing columns to patient_documents if not exists
DO $$ 
BEGIN
  -- Check if signature_image column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patient_documents' 
    AND column_name = 'signature_image'
  ) THEN
    ALTER TABLE public.patient_documents 
    ADD COLUMN signature_image text;
  END IF;
  
  -- Check if dentist_signature_id column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patient_documents' 
    AND column_name = 'dentist_signature_id'
  ) THEN
    ALTER TABLE public.patient_documents 
    ADD COLUMN dentist_signature_id uuid REFERENCES public.dentist_signatures(id);
  END IF;
END $$;