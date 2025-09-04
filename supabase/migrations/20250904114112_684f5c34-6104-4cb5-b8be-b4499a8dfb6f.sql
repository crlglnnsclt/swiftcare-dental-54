-- First add missing columns to treatments table
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS category text DEFAULT 'General';
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS requires_patient_signature boolean DEFAULT false;
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS requires_dentist_signature boolean DEFAULT false;
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS attached_forms text[] DEFAULT '{}';

-- Now insert default services if table is empty
INSERT INTO public.treatments (name, description, category, default_price, default_duration_minutes, is_active)
SELECT 'Routine Checkup & Cleaning', 'Comprehensive dental examination with professional cleaning', 'Preventive', 180.00, 45, true
WHERE NOT EXISTS (SELECT 1 FROM public.treatments);

INSERT INTO public.treatments (name, description, category, default_price, default_duration_minutes, is_active, requires_patient_signature)
SELECT 'Composite Filling', 'Tooth-colored resin filling for cavity restoration', 'Restorative', 280.00, 60, true, true
WHERE NOT EXISTS (SELECT 1 FROM public.treatments WHERE name = 'Composite Filling');

INSERT INTO public.treatments (name, description, category, default_price, default_duration_minutes, is_active, requires_patient_signature, requires_dentist_signature)
SELECT 'Root Canal Treatment', 'Endodontic treatment to save infected tooth', 'Endodontic', 1200.00, 90, true, true, true
WHERE NOT EXISTS (SELECT 1 FROM public.treatments WHERE name = 'Root Canal Treatment');

INSERT INTO public.treatments (name, description, category, default_price, default_duration_minutes, is_active, requires_patient_signature)
SELECT 'Professional Whitening', 'In-office teeth whitening treatment', 'Cosmetic', 450.00, 75, true, true
WHERE NOT EXISTS (SELECT 1 FROM public.treatments WHERE name = 'Professional Whitening');

INSERT INTO public.treatments (name, description, category, default_price, default_duration_minutes, is_active, requires_patient_signature, requires_dentist_signature)
SELECT 'Tooth Extraction', 'Simple or surgical tooth removal', 'Surgical', 350.00, 30, true, true, true
WHERE NOT EXISTS (SELECT 1 FROM public.treatments WHERE name = 'Tooth Extraction');