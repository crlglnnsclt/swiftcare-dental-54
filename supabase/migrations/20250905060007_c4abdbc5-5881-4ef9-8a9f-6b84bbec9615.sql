-- Remove clinic_id column from payment_proofs table
ALTER TABLE public.payment_proofs DROP COLUMN IF EXISTS clinic_id;