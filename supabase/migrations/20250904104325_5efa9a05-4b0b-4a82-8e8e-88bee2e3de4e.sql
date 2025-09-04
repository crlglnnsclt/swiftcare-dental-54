-- First, let's see what clinic exists and then create dentist users properly
DO $$
DECLARE
    clinic_uuid UUID;
BEGIN
    -- Get the first clinic ID
    SELECT id INTO clinic_uuid FROM public.clinics LIMIT 1;
    
    -- If no clinic exists, create one
    IF clinic_uuid IS NULL THEN
        INSERT INTO public.clinics (clinic_name, address, email, phone_number) 
        VALUES ('SwiftCare Dental Clinic', '123 Main St, Downtown', 'info@swiftcare.com', '+1-555-123-4567')
        RETURNING id INTO clinic_uuid;
    END IF;
    
    -- Create dentist users without foreign key to auth.users
    INSERT INTO public.users (full_name, email, role, clinic_id, status) VALUES
        ('Dr. Sarah Johnson', 'sarah.johnson@clinic.com', 'dentist', clinic_uuid, 'active'),
        ('Dr. Michael Chen', 'michael.chen@clinic.com', 'dentist', clinic_uuid, 'active'),
        ('Dr. Emily Rodriguez', 'emily.rodriguez@clinic.com', 'dentist', clinic_uuid, 'active'),
        ('Dr. James Wilson', 'james.wilson@clinic.com', 'dentist', clinic_uuid, 'active')
    ON CONFLICT (email) DO NOTHING;
END $$;