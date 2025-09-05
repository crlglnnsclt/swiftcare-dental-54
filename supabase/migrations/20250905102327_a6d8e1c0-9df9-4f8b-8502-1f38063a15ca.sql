-- ✅ FINAL WORKING SwiftCare Demo Data Setup
-- Simple, clean demo data that works with existing schema

-- Create some demo appointments for testing
DO $$
DECLARE
    patient_rec RECORD;
    dentist_rec RECORD;
    counter INTEGER := 1;
BEGIN
    -- Create appointments between existing patients and dentists
    FOR patient_rec IN (SELECT id FROM public.patients LIMIT 3) LOOP
        FOR dentist_rec IN (SELECT id FROM public.users WHERE role = 'dentist' LIMIT 2) LOOP
            -- Only create if doesn't exist
            IF NOT EXISTS (
                SELECT 1 FROM public.appointments a 
                WHERE a.patient_id = patient_rec.id 
                AND a.dentist_id = dentist_rec.id
            ) THEN
                INSERT INTO public.appointments (
                    patient_id, 
                    dentist_id, 
                    scheduled_time, 
                    duration_minutes, 
                    status, 
                    booking_type, 
                    notes,
                    created_at
                ) VALUES (
                    patient_rec.id,
                    dentist_rec.id,
                    CASE 
                        WHEN counter <= 2 THEN NOW() + (counter * INTERVAL '2 hours')
                        WHEN counter <= 4 THEN NOW() + INTERVAL '1 day' + (counter * INTERVAL '1 hour')
                        ELSE NOW() - INTERVAL '1 week'
                    END,
                    CASE counter % 3 WHEN 0 THEN 30 WHEN 1 THEN 45 ELSE 60 END,
                    CASE 
                        WHEN counter <= 2 THEN 'booked'::appointment_status
                        WHEN counter <= 4 THEN 'booked'::appointment_status
                        WHEN counter = 5 THEN 'in_progress'::appointment_status
                        ELSE 'completed'::appointment_status
                    END,
                    CASE counter % 3 
                        WHEN 0 THEN 'online'::booking_type
                        WHEN 1 THEN 'walk_in'::booking_type
                        ELSE 'emergency'::booking_type
                    END,
                    CASE counter % 4
                        WHEN 0 THEN 'Regular dental cleaning and checkup'
                        WHEN 1 THEN 'Dental crown procedure'
                        WHEN 2 THEN 'Root canal treatment'
                        ELSE 'Emergency consultation'
                    END,
                    NOW() - (counter * INTERVAL '1 day')
                );
                counter := counter + 1;
            END IF;
        END LOOP;
    END LOOP;
END $$;

-- Create some digital forms for the paperless system demo
DO $$
BEGIN
    -- Patient Registration Form
    IF NOT EXISTS (SELECT 1 FROM public.digital_forms WHERE name = 'Patient Registration Demo') THEN
        INSERT INTO public.digital_forms (name, description, form_type, category, form_fields, requires_signature, is_active) 
        VALUES (
            'Patient Registration Demo',
            'Demo patient intake form for SwiftCare',
            'registration',
            'intake',
            '[
                {"id": "full_name", "type": "text", "label": "Full Name", "required": true},
                {"id": "email", "type": "email", "label": "Email Address", "required": true},
                {"id": "phone", "type": "tel", "label": "Phone Number", "required": true},
                {"id": "date_of_birth", "type": "date", "label": "Date of Birth", "required": true},
                {"id": "emergency_contact", "type": "text", "label": "Emergency Contact", "required": true}
            ]'::jsonb,
            true,
            true
        );
    END IF;

    -- Medical History Form
    IF NOT EXISTS (SELECT 1 FROM public.digital_forms WHERE name = 'Medical History Demo') THEN
        INSERT INTO public.digital_forms (name, description, form_type, category, form_fields, requires_signature, is_active) 
        VALUES (
            'Medical History Demo',
            'Demo medical history questionnaire',
            'medical_history',
            'medical',
            '[
                {"id": "allergies", "type": "textarea", "label": "Known Allergies", "required": false},
                {"id": "medications", "type": "textarea", "label": "Current Medications", "required": false},
                {"id": "medical_conditions", "type": "textarea", "label": "Medical Conditions", "required": false},
                {"id": "dental_history", "type": "textarea", "label": "Previous Dental Work", "required": false}
            ]'::jsonb,
            true,
            true
        );
    END IF;

    -- Treatment Consent Form
    IF NOT EXISTS (SELECT 1 FROM public.digital_forms WHERE name = 'Treatment Consent Demo') THEN
        INSERT INTO public.digital_forms (name, description, form_type, category, form_fields, requires_signature, is_active) 
        VALUES (
            'Treatment Consent Demo',
            'Demo treatment consent and authorization',
            'consent',
            'legal',
            '[
                {"id": "treatment_consent", "type": "checkbox", "label": "I consent to the proposed dental treatment", "required": true},
                {"id": "financial_responsibility", "type": "checkbox", "label": "I understand my financial responsibility", "required": true},
                {"id": "privacy_notice", "type": "checkbox", "label": "I have received the HIPAA privacy notice", "required": true}
            ]'::jsonb,
            true,
            true
        );
    END IF;
END $$;

-- Add queue entries for today's appointments
INSERT INTO public.queue (appointment_id, position, priority, status, estimated_wait_minutes, created_at)
SELECT 
    a.id,
    ROW_NUMBER() OVER (ORDER BY a.scheduled_time) as position,
    CASE 
        WHEN a.booking_type = 'emergency' THEN 'emergency'
        WHEN a.booking_type = 'walk_in' THEN 'walk_in'
        ELSE 'scheduled'
    END as priority,
    CASE ROW_NUMBER() OVER (ORDER BY a.scheduled_time)
        WHEN 1 THEN 'in_progress'
        WHEN 2 THEN 'waiting'
        WHEN 3 THEN 'waiting'
        ELSE 'waiting'
    END as status,
    CASE ROW_NUMBER() OVER (ORDER BY a.scheduled_time)
        WHEN 1 THEN 0
        ELSE ((ROW_NUMBER() OVER (ORDER BY a.scheduled_time) - 1) * 15) + 5
    END as estimated_wait_minutes,
    NOW() - INTERVAL '1 hour' as created_at
FROM public.appointments a
WHERE a.scheduled_time::date = CURRENT_DATE 
    AND a.status IN ('booked', 'in_progress')
    AND NOT EXISTS (SELECT 1 FROM public.queue q WHERE q.appointment_id = a.id)
ORDER BY a.scheduled_time
LIMIT 4;

-- Update clinic configuration for demo branding
UPDATE public.clinic_config SET 
    clinic_name = 'SwiftCare Dental Management System',
    welcome_message = 'Welcome to SwiftCare - Your Complete Dental Management Solution',
    primary_color = '#2563eb',
    secondary_color = '#10b981',
    phone_number = '+1-555-SWIFT-CARE',
    email = 'info@swiftcare-demo.com',
    address = '123 Dental Plaza, Medical District, Demo City, DC 12345',
    subscription_package = 'professional',
    updated_at = NOW()
WHERE EXISTS (SELECT 1 FROM public.clinic_config);