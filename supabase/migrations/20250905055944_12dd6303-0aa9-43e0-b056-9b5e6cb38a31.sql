-- Check and fix payment_proofs table structure
ALTER TABLE public.payment_proofs DROP COLUMN IF EXISTS clinic_id CASCADE;

-- Also check and update other tables that might still have clinic_id
UPDATE public.payment_proofs SET clinic_id = null WHERE clinic_id IS NOT NULL;