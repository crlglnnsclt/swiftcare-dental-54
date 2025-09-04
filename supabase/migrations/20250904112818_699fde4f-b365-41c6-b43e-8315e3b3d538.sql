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