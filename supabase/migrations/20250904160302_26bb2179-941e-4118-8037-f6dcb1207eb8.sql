-- Insert sample data for testing (only if not exists)

-- Insert sample clinic
INSERT INTO public.clinics (id, clinic_name, address, phone_number, email, location_type)
VALUES (
  'c1234567-1234-1234-1234-123456789abc',
  'SwiftCare Dental Main Clinic',
  '123 Medical Center Dr, Healthcare City, HC 12345',
  '+1 (555) 123-4567',
  'contact@swiftcaredental.com',
  'main'
) ON CONFLICT (id) DO NOTHING;

-- Insert sample treatments/services
INSERT INTO public.treatments (id, name, description, default_duration_minutes, default_price, clinic_id, service_code)
VALUES 
  ('t1111111-1111-1111-1111-111111111111', 'General Consultation', 'Comprehensive dental examination and consultation', 30, 100.00, 'c1234567-1234-1234-1234-123456789abc', 'GEN_CONS'),
  ('t2222222-2222-2222-2222-222222222222', 'Dental Cleaning', 'Professional teeth cleaning and polishing', 45, 150.00, 'c1234567-1234-1234-1234-123456789abc', 'CLEANING'),
  ('t3333333-3333-3333-3333-333333333333', 'Tooth Extraction', 'Simple tooth extraction procedure', 60, 200.00, 'c1234567-1234-1234-1234-123456789abc', 'EXTRACTION'),
  ('t4444444-4444-4444-4444-444444444444', 'Dental Filling', 'Cavity filling with composite material', 45, 175.00, 'c1234567-1234-1234-1234-123456789abc', 'FILLING'),
  ('t5555555-5555-5555-5555-555555555555', 'Root Canal Treatment', 'Endodontic treatment for infected tooth', 90, 800.00, 'c1234567-1234-1234-1234-123456789abc', 'ROOT_CANAL')
ON CONFLICT (id) DO NOTHING;

-- Insert global treatments available to all clinics
INSERT INTO public.treatments (id, name, description, default_duration_minutes, default_price, is_global_template, created_by_super_admin, service_code)
VALUES 
  ('tg111111-1111-1111-1111-111111111111', 'Emergency Consultation', 'Urgent dental care and pain relief', 30, 120.00, true, true, 'EMERGENCY'),
  ('tg222222-2222-2222-2222-222222222222', 'Teeth Whitening', 'Professional teeth whitening treatment', 60, 300.00, true, true, 'WHITENING'),
  ('tg333333-3333-3333-3333-333333333333', 'Orthodontic Consultation', 'Initial consultation for braces/aligners', 45, 150.00, true, true, 'ORTHO_CONS')
ON CONFLICT (id) DO NOTHING;

-- Create a patient user for testing (only if super admin user exists)
DO $$
DECLARE
    super_admin_exists boolean;
    test_user_id uuid;
    test_user_internal_id uuid;
    test_patient_id uuid;
BEGIN
    -- Check if super admin exists
    SELECT EXISTS(SELECT 1 FROM public.users WHERE role = 'super_admin') INTO super_admin_exists;
    
    IF super_admin_exists THEN
        -- Generate UUIDs for test data
        test_user_id := gen_random_uuid();
        test_user_internal_id := gen_random_uuid();
        test_patient_id := gen_random_uuid();
        
        -- Insert test patient user (only if not exists)
        INSERT INTO public.users (
            id, user_id, email, first_name, last_name, full_name, role, clinic_id, 
            created_at, updated_at, phone, date_of_birth, emergency_contact_name, 
            emergency_contact_phone
        )
        VALUES (
            test_user_internal_id,
            test_user_id,
            'test.patient@swiftcaredental.com',
            'John',
            'Smith',
            'John Smith',
            'patient',
            'c1234567-1234-1234-1234-123456789abc',
            now(),
            now(),
            '+1 (555) 987-6543',
            '1985-03-15'::date,
            'Jane Smith',
            '+1 (555) 987-6544'
        ) ON CONFLICT (email) DO NOTHING;
        
        -- Get the actual user_id if it already exists
        SELECT id INTO test_user_internal_id FROM public.users WHERE email = 'test.patient@swiftcaredental.com';
        
        -- Insert corresponding patient record
        INSERT INTO public.patients (
            id, user_id, clinic_id, full_name, email, contact_number, 
            date_of_birth, emergency_contact_name, emergency_contact_phone, created_at
        )
        VALUES (
            test_patient_id,
            test_user_internal_id,
            'c1234567-1234-1234-1234-123456789abc',
            'John Smith',
            'test.patient@swiftcaredental.com',
            '+1 (555) 987-6543',
            '1985-03-15'::date,
            'Jane Smith',
            '+1 (555) 987-6544',
            now()
        ) ON CONFLICT (user_id) DO NOTHING;
        
        -- Get actual patient ID if it exists
        SELECT id INTO test_patient_id FROM public.patients WHERE user_id = test_user_internal_id;
        
        -- Create a dentist user for testing
        INSERT INTO public.users (
            id, user_id, email, first_name, last_name, full_name, role, clinic_id, 
            created_at, updated_at, phone
        )
        VALUES (
            gen_random_uuid(),
            gen_random_uuid(),
            'dr.johnson@swiftcaredental.com',
            'Michael',
            'Johnson',
            'Dr. Michael Johnson',
            'dentist',
            'c1234567-1234-1234-1234-123456789abc',
            now(),
            now(),
            '+1 (555) 234-5678'
        ) ON CONFLICT (email) DO NOTHING;
        
        -- Create sample appointments for the test patient
        INSERT INTO public.appointments (
            id, patient_id, clinic_id, scheduled_time, duration_minutes, status, notes, created_at
        )
        VALUES 
            (
                gen_random_uuid(),
                test_patient_id,
                'c1234567-1234-1234-1234-123456789abc',
                (CURRENT_DATE + INTERVAL '3 days' + INTERVAL '10 hours')::timestamp,
                30,
                'booked',
                'Regular checkup and cleaning',
                now()
            ),
            (
                gen_random_uuid(),
                test_patient_id,
                'c1234567-1234-1234-1234-123456789abc',
                (CURRENT_DATE + INTERVAL '7 days' + INTERVAL '14 hours')::timestamp,
                45,
                'booked',
                'Follow-up appointment',
                now()
            )
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Test data created successfully';
    ELSE
        RAISE NOTICE 'Super admin user not found - skipping test patient creation';
    END IF;
END $$;