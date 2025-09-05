-- Comprehensive Demo Data Setup - Part 2: Create patient records and demo ecosystem
-- Using correct patient table schema based on actual structure

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

-- Add some inventory data for testing
INSERT INTO public.inventory_categories (name, description, created_at) VALUES
('Dental Supplies', 'Basic dental supplies and materials', NOW()),
('Medical Equipment', 'Dental equipment and instruments', NOW()),
('Office Supplies', 'Administrative and office materials', NOW())
ON CONFLICT (name) DO NOTHING;

-- Add inventory items
INSERT INTO public.inventory_items (
  name, description, category_id, current_stock, minimum_stock, 
  unit_cost, unit_type, supplier_name, sku, created_at
)
SELECT 
  item_data.name,
  item_data.description,
  ic.id as category_id,
  item_data.current_stock,
  item_data.minimum_stock,
  item_data.unit_cost,
  item_data.unit_type,
  item_data.supplier_name,
  item_data.sku,
  NOW() as created_at
FROM (VALUES
  ('Dental Gloves', 'Nitrile examination gloves', 500, 100, 0.15, 'boxes', 'MedSupply Inc', 'GLV-001'),
  ('Dental Masks', 'Surgical face masks', 200, 50, 0.25, 'boxes', 'MedSupply Inc', 'MSK-001'),
  ('Fluoride Gel', 'Professional fluoride treatment gel', 25, 10, 45.00, 'tubes', 'Dental Pro', 'FLU-001'),
  ('Local Anesthetic', 'Lidocaine 2% with epinephrine', 15, 5, 12.50, 'cartridges', 'PharmaDent', 'LID-001'),
  ('Dental Burs', 'High-speed carbide burs assorted', 50, 20, 3.25, 'pieces', 'ToolCorp', 'BUR-001')
) AS item_data(name, description, current_stock, minimum_stock, unit_cost, unit_type, supplier_name, sku)
CROSS JOIN (
  SELECT id FROM public.inventory_categories WHERE name = 'Dental Supplies' LIMIT 1
) ic
WHERE NOT EXISTS (
  SELECT 1 FROM public.inventory_items ii WHERE ii.name = item_data.name
);

-- Create some form responses to demonstrate the paperless system
INSERT INTO public.form_responses (
  form_id, patient_id, responses, status, verification_status, 
  signed_by, signed_at, signature_data, created_at
)
SELECT 
  df.id as form_id,
  p.id as patient_id,
  CASE 
    WHEN df.name = 'Patient Registration Form' THEN 
      '{"full_name": "' || p.full_name || '", "email": "' || p.email || '", "phone": "' || COALESCE(p.contact_number, '+1-555-0000') || '", "date_of_birth": "' || p.date_of_birth || '", "emergency_name": "Emergency Contact", "emergency_phone": "+1-555-9999"}'::jsonb
    WHEN df.name = 'Medical History Form' THEN 
      '{"allergies": "' || COALESCE(SPLIT_PART(p.medical_history, '.', 1), 'None') || '", "medications": "None", "medical_conditions": "None", "previous_surgeries": "None"}'::jsonb
    ELSE 
      '{"treatment_consent": true, "financial_responsibility": true, "privacy_notice": true}'::jsonb
  END as responses,
  'submitted' as status,
  'approved' as verification_status,
  p.user_id as signed_by,
  NOW() - INTERVAL '1 day' as signed_at,
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAgNTBRNTAgMTAgMTAwIDUwVDE5MCA1MCIgc3Ryb2tlPSIjMDAwIiBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=' as signature_data,
  NOW() - INTERVAL '1 day' as created_at
FROM public.digital_forms df
CROSS JOIN (
  SELECT id, user_id, full_name, email, contact_number, date_of_birth, medical_history
  FROM public.patients LIMIT 2
) p
WHERE NOT EXISTS (
  SELECT 1 FROM public.form_responses fr 
  WHERE fr.form_id = df.id AND fr.patient_id = p.id
);