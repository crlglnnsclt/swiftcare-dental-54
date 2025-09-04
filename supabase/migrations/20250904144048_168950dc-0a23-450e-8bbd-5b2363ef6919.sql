-- Create payment proofs table for patient payment submissions
CREATE TABLE public.payment_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  clinic_id UUID NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('HMO', 'Cash', 'Bank Transfer')),
  amount NUMERIC(10,2) NOT NULL,
  proof_file_url TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  verification_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_proofs ENABLE ROW LEVEL SECURITY;

-- Patients can insert their own payment proofs
CREATE POLICY "Patients can submit payment proofs"
ON public.payment_proofs
FOR INSERT
WITH CHECK (
  patient_id IN (
    SELECT p.id FROM patients p
    JOIN users u ON u.id = p.user_id
    WHERE u.user_id = auth.uid()
  )
);

-- Patients can view their own payment proofs
CREATE POLICY "Patients can view their payment proofs"
ON public.payment_proofs
FOR SELECT
USING (
  patient_id IN (
    SELECT p.id FROM patients p
    JOIN users u ON u.id = p.user_id
    WHERE u.user_id = auth.uid()
  )
);

-- Clinic staff can view and manage payment proofs for their clinic
CREATE POLICY "Clinic staff can manage payment proofs"
ON public.payment_proofs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.user_id = auth.uid()
    AND u.clinic_id = payment_proofs.clinic_id
    AND u.role IN ('clinic_admin', 'dentist', 'staff', 'receptionist')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.user_id = auth.uid()
    AND u.clinic_id = payment_proofs.clinic_id
    AND u.role IN ('clinic_admin', 'dentist', 'staff', 'receptionist')
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_payment_proofs_updated_at
  BEFORE UPDATE ON public.payment_proofs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', false);

-- Storage policies for payment proofs
CREATE POLICY "Patients can upload payment proof files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'payment-proofs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Patients can view their payment proof files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'payment-proofs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Clinic staff can view payment proof files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'payment-proofs'
  AND EXISTS (
    SELECT 1 FROM users u
    WHERE u.user_id = auth.uid()
    AND u.role IN ('clinic_admin', 'dentist', 'staff', 'receptionist')
  )
);