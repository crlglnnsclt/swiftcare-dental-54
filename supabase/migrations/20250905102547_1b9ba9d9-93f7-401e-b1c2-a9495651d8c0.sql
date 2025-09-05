-- ✅ SIMPLIFIED WORKING Demo Data Setup for SwiftCare
-- Basic demo data that works with all enum constraints

-- Update clinic branding for the demo
UPDATE public.clinic_config SET 
    clinic_name = 'SwiftCare Dental Management System - Demo',
    welcome_message = 'Welcome to SwiftCare - Complete Dental Management Solution',
    primary_color = '#2563eb',
    secondary_color = '#10b981',
    phone_number = '+1-555-SWIFT-CARE',
    email = 'demo@swiftcare.com',
    address = '123 Dental Plaza, Demo City, DC 12345',
    subscription_package = 'professional',
    updated_at = NOW()
WHERE EXISTS (SELECT 1 FROM public.clinic_config);

-- Create simple demo appointment if none exist for today
DO $$
DECLARE
    demo_patient_id UUID;
    demo_dentist_id UUID;
    demo_appointment_id UUID;
BEGIN
    -- Get a patient and dentist for demo
    SELECT id INTO demo_patient_id FROM public.patients LIMIT 1;
    SELECT id INTO demo_dentist_id FROM public.users WHERE role = 'dentist' LIMIT 1;
    
    -- Create demo appointment for today if none exists
    IF demo_patient_id IS NOT NULL AND demo_dentist_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.appointments 
            WHERE scheduled_time::date = CURRENT_DATE 
            AND status = 'booked'
        ) THEN
            INSERT INTO public.appointments (
                patient_id, 
                dentist_id, 
                scheduled_time, 
                duration_minutes, 
                status, 
                booking_type, 
                notes
            ) VALUES (
                demo_patient_id,
                demo_dentist_id,
                NOW() + INTERVAL '30 minutes',
                45,
                'booked'::appointment_status,
                'online'::booking_type,
                'Demo appointment for client presentation'
            ) RETURNING id INTO demo_appointment_id;
            
            -- Add to queue
            IF demo_appointment_id IS NOT NULL THEN
                INSERT INTO public.queue (
                    appointment_id, 
                    position, 
                    priority, 
                    status, 
                    estimated_wait_minutes
                ) VALUES (
                    demo_appointment_id,
                    1,
                    'scheduled'::queue_priority,
                    'waiting',
                    15
                );
            END IF;
        END IF;
    END IF;
END $$;

-- Create basic digital form for demo if none exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.digital_forms WHERE name LIKE '%Demo%') THEN
        INSERT INTO public.digital_forms (
            name, 
            description, 
            form_type, 
            category, 
            form_fields, 
            requires_signature, 
            is_active
        ) VALUES (
            'Demo Patient Form',
            'Sample patient registration form for demonstration',
            'registration',
            'intake',
            '[
                {"id": "name", "type": "text", "label": "Full Name", "required": true},
                {"id": "email", "type": "email", "label": "Email", "required": true},
                {"id": "phone", "type": "tel", "label": "Phone", "required": true}
            ]'::jsonb,
            true,
            true
        );
    END IF;
END $$;