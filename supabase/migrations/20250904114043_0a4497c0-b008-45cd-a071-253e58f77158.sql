-- Add enhanced columns to treatments table for service management
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS category text DEFAULT 'General';
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS requires_patient_signature boolean DEFAULT false;
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS requires_dentist_signature boolean DEFAULT false;
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS attached_forms text[] DEFAULT '{}';
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Update existing treatments with default categories
UPDATE public.treatments 
SET category = 'Preventive' 
WHERE name ILIKE '%cleaning%' OR name ILIKE '%checkup%' OR name ILIKE '%exam%';

UPDATE public.treatments 
SET category = 'Restorative' 
WHERE name ILIKE '%filling%' OR name ILIKE '%crown%' OR name ILIKE '%bridge%';

UPDATE public.treatments 
SET category = 'Endodontic' 
WHERE name ILIKE '%root canal%' OR name ILIKE '%endodontic%';

UPDATE public.treatments 
SET category = 'Surgical' 
WHERE name ILIKE '%extraction%' OR name ILIKE '%surgery%' OR name ILIKE '%implant%';

UPDATE public.treatments 
SET category = 'Cosmetic' 
WHERE name ILIKE '%whitening%' OR name ILIKE '%veneer%' OR name ILIKE '%cosmetic%';

UPDATE public.treatments 
SET category = 'Orthodontic' 
WHERE name ILIKE '%braces%' OR name ILIKE '%orthodontic%' OR name ILIKE '%alignment%';

UPDATE public.treatments 
SET category = 'Emergency' 
WHERE name ILIKE '%emergency%' OR name ILIKE '%urgent%';

-- Insert some default services if table is empty
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

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_treatments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_treatments_updated_at_trigger ON public.treatments;
CREATE TRIGGER update_treatments_updated_at_trigger
    BEFORE UPDATE ON public.treatments
    FOR EACH ROW
    EXECUTE FUNCTION update_treatments_updated_at();