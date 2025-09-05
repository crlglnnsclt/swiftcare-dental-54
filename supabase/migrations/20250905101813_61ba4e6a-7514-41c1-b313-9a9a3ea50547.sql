-- Comprehensive Demo Data Setup - Part 2: Create patient records and demo ecosystem
-- Using correct patient table schema

-- First, create patient records for all patient users (using correct column names)
INSERT INTO public.patients (user_id, full_name, email, contact_number, date_of_birth, insurance_provider, insurance_policy_number, created_at)
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
    WHEN u.email LIKE '%patient1%' OR u.email LIKE '%patient2%' THEN 'BlueCross BlueShield'
    WHEN u.email LIKE '%patient3%' THEN 'Aetna'
    WHEN u.email LIKE '%patient4%' THEN 'United Healthcare'
    ELSE NULL
  END as insurance_provider,
  CASE 
    WHEN u.email LIKE '%patient1%' OR u.email LIKE '%patient2%' THEN 'POL-' || LPAD((RANDOM() * 1000000)::text, 6, '0')
    WHEN u.email LIKE '%patient3%' THEN 'AET-' || LPAD((RANDOM() * 1000000)::text, 6, '0')
    WHEN u.email LIKE '%patient4%' THEN 'UHC-' || LPAD((RANDOM() * 1000000)::text, 6, '0')
    ELSE NULL
  END as insurance_policy_number,
  u.created_at
FROM public.users u 
WHERE u.role = 'patient' 
AND NOT EXISTS (SELECT 1 FROM public.patients p WHERE p.user_id = u.id);

-- Create comprehensive appointment data with realistic scenarios
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
    WHEN ROW_NUMBER() OVER () <= 5 THEN 'booked'
    WHEN ROW_NUMBER() OVER () <= 8 THEN 'completed'
    WHEN ROW_NUMBER() OVER () <= 10 THEN 'in_progress'
    WHEN ROW_NUMBER() OVER () = 11 THEN 'cancelled'
    WHEN ROW_NUMBER() OVER () = 12 THEN 'no_show'
    ELSE 'completed'
  END as status,
  CASE 
    WHEN ROW_NUMBER() OVER () % 3 = 0 THEN 'online'
    WHEN ROW_NUMBER() OVER () % 3 = 1 THEN 'phone'
    ELSE 'walk_in'
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

-- Create realistic treatment data if not exists
INSERT INTO public.treatments (name, description, price, duration_minutes, category, created_at) 
SELECT * FROM (VALUES
  ('Dental Cleaning', 'Professional teeth cleaning and polishing', 120.00, 45, 'Preventive'),
  ('Dental Filling', 'Composite resin filling for cavities', 180.00, 30, 'Restorative'),
  ('Root Canal', 'Root canal therapy for infected tooth', 800.00, 90, 'Endodontic'),
  ('Crown Placement', 'Dental crown installation', 1200.00, 60, 'Restorative'),
  ('Tooth Extraction', 'Simple tooth extraction', 250.00, 30, 'Oral Surgery'),
  ('Dental Bridge', 'Fixed bridge for missing teeth', 1800.00, 90, 'Restorative'),
  ('Dental Implant', 'Titanium implant placement', 2500.00, 120, 'Oral Surgery'),
  ('Orthodontic Consultation', 'Initial orthodontic assessment', 150.00, 45, 'Orthodontics'),
  ('Teeth Whitening', 'Professional teeth whitening', 400.00, 60, 'Cosmetic'),
  ('Emergency Visit', 'Emergency dental consultation', 200.00, 30, 'Emergency')
) AS new_treatments(name, description, price, duration_minutes, category)
WHERE NOT EXISTS (
  SELECT 1 FROM public.treatments t WHERE t.name = new_treatments.name
);

-- Add each treatment record individually to avoid conflicts
DO $$
BEGIN
  -- Add created_at timestamp to each treatment
  UPDATE public.treatments 
  SET created_at = NOW() 
  WHERE created_at IS NULL;
END $$;

-- Create current queue entries for today's appointments  
INSERT INTO public.queue (appointment_id, position, priority, status, estimated_wait_minutes, created_at)
SELECT 
  a.id as appointment_id,
  ROW_NUMBER() OVER (ORDER BY 
    CASE 
      WHEN a.notes LIKE '%emergency%' THEN 1
      WHEN a.booking_type = 'walk_in' THEN 3
      ELSE 2
    END,
    a.scheduled_time
  ) as position,
  CASE 
    WHEN a.notes LIKE '%emergency%' THEN 'emergency'
    WHEN a.booking_type = 'walk_in' THEN 'walk_in'
    ELSE 'scheduled'
  END as priority,
  CASE 
    WHEN ROW_NUMBER() OVER () <= 2 THEN 'waiting'
    WHEN ROW_NUMBER() OVER () <= 4 THEN 'in_progress'
    ELSE 'completed'
  END as status,
  CASE
    WHEN ROW_NUMBER() OVER () <= 2 THEN (15 + (ROW_NUMBER() OVER () * 10))
    ELSE 0
  END as estimated_wait_minutes,
  NOW() - (ROW_NUMBER() OVER () * INTERVAL '30 minutes') as created_at
FROM public.appointments a
WHERE a.scheduled_time::date = CURRENT_DATE
  AND a.status IN ('booked', 'in_progress')
  AND NOT EXISTS (SELECT 1 FROM public.queue q WHERE q.appointment_id = a.id)
LIMIT 6;

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