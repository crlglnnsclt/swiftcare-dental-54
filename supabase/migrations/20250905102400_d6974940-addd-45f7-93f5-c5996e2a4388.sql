-- SwiftCare Demo Data - Final Complete Setup
-- Simple and working version with all core features

-- Update clinic branding for demo
UPDATE public.clinic_config SET 
  clinic_name = 'SwiftCare Dental Management Demo',
  welcome_message = 'Welcome to SwiftCare - Complete Dental Management Solution',
  primary_color = '#2563eb',
  secondary_color = '#10b981',
  phone_number = '+1-555-SWIFT-CARE',
  email = 'demo@swiftcare.com',
  address = '123 Dental Plaza, Medical District, Demo City, DC 12345',
  subscription_package = 'professional',
  updated_at = NOW()
WHERE id IS NOT NULL;

-- If no clinic_config exists, create one
INSERT INTO public.clinic_config (
  clinic_name, welcome_message, primary_color, secondary_color, 
  phone_number, email, address, subscription_package
) 
SELECT 
  'SwiftCare Dental Management Demo',
  'Welcome to SwiftCare - Complete Dental Management Solution',
  '#2563eb', '#10b981', '+1-555-SWIFT-CARE', 'demo@swiftcare.com',
  '123 Dental Plaza, Medical District, Demo City, DC 12345', 'professional'
WHERE NOT EXISTS (SELECT 1 FROM public.clinic_config);

-- Ensure all patient users have patient records
INSERT INTO public.patients (user_id, full_name, email, contact_number, date_of_birth, medical_history, insurance_info, created_at)
SELECT 
  u.id,
  u.full_name,
  u.email,
  COALESCE(u.phone, '+1-555-000-0000'),
  CASE 
    WHEN u.email LIKE '%patient1%' THEN '2012-03-15'::date
    WHEN u.email LIKE '%patient2%' THEN '1999-07-22'::date  
    WHEN u.email LIKE '%patient3%' THEN '1989-11-08'::date
    WHEN u.email LIKE '%patient4%' THEN '2016-12-05'::date
    ELSE '1990-01-01'::date
  END,
  CASE 
    WHEN u.email LIKE '%patient1%' THEN 'No allergies. Regular checkups.'
    WHEN u.email LIKE '%patient2%' THEN 'Allergic to penicillin. Blood pressure medication.'
    WHEN u.email LIKE '%patient3%' THEN 'Type 2 diabetes. Requires pre-medication.'
    WHEN u.email LIKE '%patient4%' THEN 'Pediatric patient. No known issues.'
    ELSE 'Standard medical history.'
  END,
  CASE 
    WHEN u.email LIKE '%patient1%' OR u.email LIKE '%patient2%' THEN 'BlueCross BlueShield'
    WHEN u.email LIKE '%patient3%' THEN 'Aetna Health'
    WHEN u.email LIKE '%patient4%' THEN 'United Healthcare'
    ELSE 'Self-Pay'
  END,
  u.created_at
FROM public.users u 
WHERE u.role = 'patient' 
AND NOT EXISTS (SELECT 1 FROM public.patients p WHERE p.user_id = u.id);

-- Create comprehensive appointments for demo
INSERT INTO public.appointments (patient_id, dentist_id, scheduled_time, duration_minutes, status, booking_type, notes, created_at)
WITH patient_dentist_pairs AS (
  SELECT 
    p.id as patient_id,
    d.id as dentist_id,
    ROW_NUMBER() OVER () as rn
  FROM (SELECT id FROM public.patients LIMIT 4) p
  CROSS JOIN (SELECT id FROM public.users WHERE role = 'dentist' LIMIT 3) d
)
SELECT 
  patient_id,
  dentist_id,
  CASE 
    WHEN rn <= 2 THEN NOW() + (rn * INTERVAL '2 hours')      -- Today
    WHEN rn <= 4 THEN NOW() + INTERVAL '1 day' + (rn * INTERVAL '1 hour')  -- Tomorrow  
    WHEN rn <= 6 THEN NOW() - INTERVAL '1 week'              -- Last week (completed)
    ELSE NOW() + INTERVAL '2 days' + (rn * INTERVAL '3 hours')
  END as scheduled_time,
  CASE rn % 4 
    WHEN 0 THEN 30 
    WHEN 1 THEN 45 
    WHEN 2 THEN 60 
    ELSE 90 
  END as duration_minutes,
  CASE 
    WHEN rn <= 2 THEN 'booked'::appointment_status
    WHEN rn <= 4 THEN 'booked'::appointment_status  
    WHEN rn <= 6 THEN 'completed'::appointment_status
    WHEN rn = 7 THEN 'in_progress'::appointment_status
    WHEN rn = 8 THEN 'cancelled'::appointment_status
    ELSE 'booked'::appointment_status
  END as status,
  CASE rn % 3
    WHEN 0 THEN 'online'::booking_type
    WHEN 1 THEN 'walk_in'::booking_type  
    ELSE 'emergency'::booking_type
  END as booking_type,
  CASE rn % 5
    WHEN 0 THEN 'Regular dental cleaning and examination'
    WHEN 1 THEN 'Dental crown placement procedure'
    WHEN 2 THEN 'Root canal therapy treatment'
    WHEN 3 THEN 'Tooth extraction - wisdom tooth'
    ELSE 'Emergency consultation - dental pain'
  END as notes,
  NOW() - (rn * INTERVAL '1 day') as created_at
FROM patient_dentist_pairs
WHERE NOT EXISTS (
  SELECT 1 FROM public.appointments a 
  WHERE a.patient_id = patient_dentist_pairs.patient_id 
  AND a.dentist_id = patient_dentist_pairs.dentist_id
)
LIMIT 10;

-- Create digital forms for the paperless system
INSERT INTO public.digital_forms (name, description, form_type, category, form_fields, requires_signature, is_active) VALUES
('New Patient Registration', 'Complete patient intake form', 'registration', 'intake', 
 '[
   {"id": "name", "type": "text", "label": "Full Name", "required": true},
   {"id": "email", "type": "email", "label": "Email", "required": true},
   {"id": "phone", "type": "tel", "label": "Phone", "required": true},
   {"id": "dob", "type": "date", "label": "Date of Birth", "required": true}
 ]'::jsonb, 
 true, true),
 
('Medical History', 'Patient medical background', 'medical_history', 'medical', 
 '[
   {"id": "allergies", "type": "textarea", "label": "Allergies"},
   {"id": "medications", "type": "textarea", "label": "Current Medications"},
   {"id": "conditions", "type": "textarea", "label": "Medical Conditions"}
 ]'::jsonb, 
 true, true),
 
('Treatment Consent', 'Consent for dental procedures', 'consent', 'legal', 
 '[
   {"id": "consent", "type": "checkbox", "label": "I consent to treatment", "required": true},
   {"id": "financial", "type": "checkbox", "label": "I understand costs", "required": true}
 ]'::jsonb, 
 true, true)
ON CONFLICT (name) DO NOTHING;

-- Add sample queue entries for today's appointments
INSERT INTO public.queue (appointment_id, position, priority, status, estimated_wait_minutes, created_at)
SELECT 
  a.id,
  ROW_NUMBER() OVER (ORDER BY a.scheduled_time),
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
  (ROW_NUMBER() OVER (ORDER BY a.scheduled_time) - 1) * 15 as estimated_wait_minutes,
  NOW() - INTERVAL '30 minutes'
FROM public.appointments a
WHERE a.scheduled_time::date = CURRENT_DATE 
  AND a.status IN ('booked', 'in_progress')
  AND NOT EXISTS (SELECT 1 FROM public.queue q WHERE q.appointment_id = a.id)
LIMIT 4;