-- Fix patient_documents table to add missing file_path column
ALTER TABLE public.patient_documents 
ADD COLUMN IF NOT EXISTS file_path TEXT;

-- Fix treatment_records table to link properly
CREATE TABLE IF NOT EXISTS public.treatment_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  clinic_id UUID NOT NULL,
  dentist_id UUID,
  appointment_id UUID,
  treatment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  treatment_type TEXT NOT NULL,
  tooth_numbers TEXT[],
  diagnosis TEXT,
  treatment_notes TEXT,
  cost NUMERIC(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for treatment_records
ALTER TABLE public.treatment_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for treatment_records
CREATE POLICY "Clinic staff can manage treatment records" 
ON public.treatment_records 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.user_id = auth.uid() 
    AND u.clinic_id = treatment_records.clinic_id 
    AND u.role IN ('clinic_admin', 'dentist', 'staff', 'receptionist')
  )
);

-- Create treatments table for standardized treatments
CREATE TABLE IF NOT EXISTS public.treatments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  default_duration_minutes INTEGER DEFAULT 30,
  default_cost NUMERIC(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for treatments
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for treatments
CREATE POLICY "Clinic staff can manage treatments" 
ON public.treatments 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.user_id = auth.uid() 
    AND u.clinic_id = treatments.clinic_id 
    AND u.role IN ('clinic_admin', 'dentist', 'staff', 'receptionist')
  )
);

-- Add update trigger for treatment_records
CREATE TRIGGER update_treatment_records_updated_at
  BEFORE UPDATE ON public.treatment_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();