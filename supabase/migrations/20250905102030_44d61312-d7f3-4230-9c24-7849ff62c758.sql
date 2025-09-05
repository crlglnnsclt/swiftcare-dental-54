-- Comprehensive Demo Data Setup - Part 2: Create patient records and demo ecosystem
-- Fixed with proper enum casting

-- First, create patient records for all patient users (using actual column names)
INSERT INTO public.patients (user_id, full_name, email, contact_number, date_of_birth, medical_history, insurance_info, created_at)
SELECT 
  u.id as user_id,
  u.full_name,
  u.email,
  u.phone as contact_number,
  CASE 
    WHEN u.email LIKE '%patient1%' OR u.email LIKE '%patient4%' THEN (CURRENT_DATE - INTERVAL '12 years')::date
    WHEN u.email LIKE '%patient2%' THEN (CURRENT_DATE - INTERVAL '25 years')::date
    WHEN u.email LIKE '%patient3%' THEN (CURRENT_DATE - INTERVAL '35 years')::date
    ELSE (CURRENT_DATE - INTERVAL '30 years')::date
  END as date_of_birth,
  CASE 
    WHEN u.email LIKE '%patient1%' THEN 'No known allergies. Previous dental work: 2 fillings.'
    WHEN u.email LIKE '%patient2%' THEN 'Allergic to penicillin. High blood pressure medication.'
    WHEN u.email LIKE '%patient3%' THEN 'Diabetes type 2. Regular dental cleanings.'
    WHEN u.email LIKE '%patient4%' THEN 'No major medical issues. Braces during teenage years.'
    ELSE 'Standard medical history.'
  END as medical_history,
  CASE 
    WHEN u.email LIKE '%patient1%' OR u.email LIKE '%patient2%' THEN 'BlueCross BlueShield - Policy: POL-123456'
    WHEN u.email LIKE '%patient3%' THEN 'Aetna - Policy: AET-789012'
    WHEN u.email LIKE '%patient4%' THEN 'United Healthcare - Policy: UHC-345678'
    ELSE 'No insurance'
  END as insurance_info,
  u.created_at
FROM public.users u 
WHERE u.role = 'patient' 
AND NOT EXISTS (SELECT 1 FROM public.patients p WHERE p.user_id = u.id);

-- Create comprehensive appointment data with realistic scenarios and proper enum casting
INSERT INTO public.appointments (patient_id, dentist_id, scheduled_time, duration_minutes, status, booking_type, notes, created_at)
SELECT 
  p.id as patient_id,
  d.id as dentist_id,
  CASE 
    WHEN ROW_NUMBER() OVER () <= 5 THEN NOW() + INTERVAL '1 day' + ((ROW_NUMBER() OVER ()) * INTERVAL '1 hour')
    WHEN ROW_NUMBER() OVER () <= 10 THEN NOW() + INTERVAL '2 days' + ((ROW_NUMBER() OVER ()) * INTERVAL '2 hours')
    WHEN ROW_NUMBER() OVER () <= 15 THEN NOW() - INTERVAL '1 week' + ((ROW_NUMBER() OVER ()) * INTERVAL '1 day')
    ELSE NOW() - INTERVAL '1 month' + ((ROW_NUMBER() OVER ()) * INTERVAL '2 days')
  END as scheduled_time,
  CASE 
    WHEN ROW_NUMBER() OVER () % 4 = 0 THEN 30
    WHEN ROW_NUMBER() OVER () % 4 = 1 THEN 45
    WHEN ROW_NUMBER() OVER () % 4 = 2 THEN 60
    ELSE 90
  END as duration_minutes,
  CASE 
    WHEN ROW_NUMBER() OVER () <= 5 THEN 'booked'::appointment_status
    WHEN ROW_NUMBER() OVER () <= 8 THEN 'completed'::appointment_status
    WHEN ROW_NUMBER() OVER () <= 10 THEN 'in_progress'::appointment_status
    WHEN ROW_NUMBER() OVER () = 11 THEN 'cancelled'::appointment_status
    WHEN ROW_NUMBER() OVER () = 12 THEN 'no_show'::appointment_status
    ELSE 'completed'::appointment_status
  END as status,
  CASE 
    WHEN ROW_NUMBER() OVER () % 3 = 0 THEN 'online'::booking_type
    WHEN ROW_NUMBER() OVER () % 3 = 1 THEN 'phone'::booking_type
    ELSE 'walk_in'::booking_type
  END as booking_type,
  CASE 
    WHEN ROW_NUMBER() OVER () % 6 = 0 THEN 'Regular checkup and cleaning'
    WHEN ROW_NUMBER() OVER () % 6 = 1 THEN 'Dental crown placement'
    WHEN ROW_NUMBER() OVER () % 6 = 2 THEN 'Root canal treatment'
    WHEN ROW_NUMBER() OVER () % 6 = 3 THEN 'Tooth extraction'
    WHEN ROW_NUMBER() OVER () % 6 = 4 THEN 'Filling replacement'
    ELSE 'Emergency dental pain'
  END as notes,
  NOW() - ((ROW_NUMBER() OVER ()) * INTERVAL '3 days') as created_at
FROM (
  SELECT id FROM public.patients LIMIT 4
) p
CROSS JOIN (
  SELECT id, ROW_NUMBER() OVER () as rn FROM public.users WHERE role = 'dentist' LIMIT 5
) d
WHERE d.rn <= 3 -- Assign appointments to first 3 dentists
AND NOT EXISTS (
  SELECT 1 FROM public.appointments a 
  WHERE a.patient_id = p.id AND a.dentist_id = d.id
);

-- Create sample digital forms for the clinic
INSERT INTO public.digital_forms (name, description, form_type, category, form_fields, requires_signature, is_active, created_at) VALUES
('Patient Registration Form', 'New patient intake form', 'registration', 'intake', 
 '[
   {"id": "personal_info", "type": "section", "label": "Personal Information"},
   {"id": "full_name", "type": "text", "label": "Full Name", "required": true},
   {"id": "email", "type": "email", "label": "Email Address", "required": true},
   {"id": "phone", "type": "tel", "label": "Phone Number", "required": true},
   {"id": "date_of_birth", "type": "date", "label": "Date of Birth", "required": true},
   {"id": "emergency_contact", "type": "section", "label": "Emergency Contact"},
   {"id": "emergency_name", "type": "text", "label": "Emergency Contact Name", "required": true},
   {"id": "emergency_phone", "type": "tel", "label": "Emergency Contact Phone", "required": true}
 ]'::jsonb, 
 true, true, NOW()),
 
('Medical History Form', 'Comprehensive medical history questionnaire', 'medical_history', 'medical', 
 '[
   {"id": "allergies", "type": "textarea", "label": "Known Allergies", "required": false},
   {"id": "medications", "type": "textarea", "label": "Current Medications", "required": false},
   {"id": "medical_conditions", "type": "textarea", "label": "Medical Conditions", "required": false},
   {"id": "previous_surgeries", "type": "textarea", "label": "Previous Surgeries", "required": false}
 ]'::jsonb, 
 true, true, NOW()),
 
('Consent for Treatment', 'Treatment consent and authorization form', 'consent', 'legal', 
 '[
   {"id": "treatment_consent", "type": "checkbox", "label": "I consent to the proposed dental treatment", "required": true},
   {"id": "financial_responsibility", "type": "checkbox", "label": "I understand my financial responsibility", "required": true},
   {"id": "privacy_notice", "type": "checkbox", "label": "I have received the privacy notice", "required": true}
 ]'::jsonb, 
 true, true, NOW())
ON CONFLICT (name) DO NOTHING;

-- Add some inventory data for testing
INSERT INTO public.inventory_categories (name, description, created_at) VALUES
('Dental Supplies', 'Basic dental supplies and materials', NOW()),
('Medical Equipment', 'Dental equipment and instruments', NOW()),
('Office Supplies', 'Administrative and office materials', NOW())
ON CONFLICT (name) DO NOTHING;