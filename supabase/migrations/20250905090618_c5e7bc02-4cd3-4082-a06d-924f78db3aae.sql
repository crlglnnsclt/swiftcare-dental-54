-- Fix CRUD operations by adding sample data with clinic_id

-- Get a default clinic_id (use the first one available)
DO $$
DECLARE
    default_clinic_id UUID;
BEGIN
    -- Get the first clinic ID available, or create a default one
    SELECT id INTO default_clinic_id FROM public.clinics LIMIT 1;
    
    IF default_clinic_id IS NULL THEN
        -- Create a default clinic if none exists
        INSERT INTO public.clinics (clinic_name, email, phone_number) 
        VALUES ('SwiftCare Dental Clinic', 'admin@swiftcare.dental', '+63-2-123-4567')
        RETURNING id INTO default_clinic_id;
    END IF;

    -- Insert sample treatments
    INSERT INTO public.treatments (name, default_price, default_duration_minutes, clinic_id) VALUES
      ('Dental Cleaning', 100.00, 30, default_clinic_id),
      ('Tooth Filling', 150.00, 45, default_clinic_id),
      ('Root Canal', 500.00, 90, default_clinic_id),
      ('Tooth Extraction', 200.00, 30, default_clinic_id),
      ('Dental Crown', 800.00, 60, default_clinic_id)
    ON CONFLICT (id) DO NOTHING;

    -- Insert sample appointments for the logged-in patient
    INSERT INTO public.appointments (patient_id, scheduled_time, duration_minutes, status, booking_type, notes, clinic_id) VALUES
      ('42a6a14b-070d-4ec3-b17d-f12027ccabe5', '2025-09-06 10:00:00+00', 30, 'booked', 'online', 'Regular dental cleaning', default_clinic_id),
      ('42a6a14b-070d-4ec3-b17d-f12027ccabe5', '2025-09-07 14:00:00+00', 45, 'booked', 'online', 'Tooth filling follow-up', default_clinic_id),
      ('ea881146-c165-42f2-9275-b13d75d02d46', '2025-09-08 09:00:00+00', 90, 'booked', 'online', 'Root canal treatment', default_clinic_id)
    ON CONFLICT (id) DO NOTHING;
END $$;