-- Final Demo Data Setup - Comprehensive and Complete
-- Using all correct enum values and table structures

-- Create clinic configuration for SwiftCare Demo
INSERT INTO public.clinic_config (
  clinic_name, 
  welcome_message, 
  primary_color, 
  secondary_color, 
  phone_number, 
  email, 
  address,
  subscription_package,
  created_at
) VALUES (
  'SwiftCare Dental Management Demo',
  'Welcome to SwiftCare - Your Complete Dental Management Solution',
  '#2563eb',
  '#10b981',
  '+1-555-SWIFT-CARE',
  'info@swiftcare-demo.com',
  '123 Dental Plaza, Medical District, Demo City, DC 12345',
  'professional',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  clinic_name = EXCLUDED.clinic_name,
  welcome_message = EXCLUDED.welcome_message,
  updated_at = NOW();

-- Ensure all patient users have patient records
INSERT INTO public.patients (user_id, full_name, email, contact_number, date_of_birth, medical_history, insurance_info, created_at)
SELECT 
  u.id as user_id,
  u.full_name,
  u.email,
  u.phone as contact_number,
  CASE 
    WHEN u.email LIKE '%patient1%' THEN (CURRENT_DATE - INTERVAL '12 years')::date
    WHEN u.email LIKE '%patient2%' THEN (CURRENT_DATE - INTERVAL '25 years')::date
    WHEN u.email LIKE '%patient3%' THEN (CURRENT_DATE - INTERVAL '35 years')::date
    WHEN u.email LIKE '%patient4%' THEN (CURRENT_DATE - INTERVAL '8 years')::date
    ELSE (CURRENT_DATE - INTERVAL '30 years')::date
  END as date_of_birth,
  CASE 
    WHEN u.email LIKE '%patient1%' THEN 'No known allergies. Previous dental work: 2 fillings. Regular patient.'
    WHEN u.email LIKE '%patient2%' THEN 'Allergic to penicillin. Takes blood pressure medication daily.'
    WHEN u.email LIKE '%patient3%' THEN 'Type 2 diabetes. Regular dental cleanings every 6 months.'
    WHEN u.email LIKE '%patient4%' THEN 'Pediatric patient. No major medical issues. Had braces.'
    ELSE 'Standard medical history. No known allergies.'
  END as medical_history,
  CASE 
    WHEN u.email LIKE '%patient1%' OR u.email LIKE '%patient2%' THEN 'BlueCross BlueShield - Policy: POL-123456, Group: DEMO-001'
    WHEN u.email LIKE '%patient3%' THEN 'Aetna Better Health - Policy: AET-789012, Group: DEMO-002'
    WHEN u.email LIKE '%patient4%' THEN 'United Healthcare - Policy: UHC-345678, Group: DEMO-003'
    ELSE 'Self-Pay Patient'
  END as insurance_info,
  u.created_at
FROM public.users u 
WHERE u.role = 'patient' 
AND NOT EXISTS (SELECT 1 FROM public.patients p WHERE p.user_id = u.id);

-- Create comprehensive appointments (using only valid booking_type values)
INSERT INTO public.appointments (patient_id, dentist_id, scheduled_time, duration_minutes, status, booking_type, notes, created_at)
SELECT 
  p.id as patient_id,
  d.id as dentist_id,
  -- Schedule appointments across different time periods
  CASE 
    WHEN ROW_NUMBER() OVER () = 1 THEN NOW() + INTERVAL '1 hour'  -- Today
    WHEN ROW_NUMBER() OVER () = 2 THEN NOW() + INTERVAL '3 hours' -- Today
    WHEN ROW_NUMBER() OVER () = 3 THEN NOW() + INTERVAL '1 day'   -- Tomorrow
    WHEN ROW_NUMBER() OVER () = 4 THEN NOW() + INTERVAL '2 days'  -- Day after
    WHEN ROW_NUMBER() OVER () = 5 THEN NOW() - INTERVAL '1 week'  -- Last week (completed)
    WHEN ROW_NUMBER() OVER () = 6 THEN NOW() - INTERVAL '2 weeks' -- Two weeks ago (completed)
    ELSE NOW() + INTERVAL '3 days' + ((ROW_NUMBER() OVER ()) * INTERVAL '2 hours')
  END as scheduled_time,
  CASE 
    WHEN ROW_NUMBER() OVER () % 4 = 0 THEN 30
    WHEN ROW_NUMBER() OVER () % 4 = 1 THEN 45
    WHEN ROW_NUMBER() OVER () % 4 = 2 THEN 60
    ELSE 90
  END as duration_minutes,
  CASE 
    WHEN ROW_NUMBER() OVER () <= 2 THEN 'booked'::appointment_status      -- Upcoming today
    WHEN ROW_NUMBER() OVER () <= 4 THEN 'booked'::appointment_status      -- Upcoming soon
    WHEN ROW_NUMBER() OVER () <= 6 THEN 'completed'::appointment_status   -- Completed
    WHEN ROW_NUMBER() OVER () = 7 THEN 'in_progress'::appointment_status  -- Currently happening
    WHEN ROW_NUMBER() OVER () = 8 THEN 'cancelled'::appointment_status    -- Cancelled
    ELSE 'booked'::appointment_status
  END as status,
  CASE 
    WHEN ROW_NUMBER() OVER () % 4 = 0 THEN 'online'::booking_type
    WHEN ROW_NUMBER() OVER () % 4 = 1 THEN 'walk_in'::booking_type
    WHEN ROW_NUMBER() OVER () % 4 = 2 THEN 'emergency'::booking_type
    ELSE 'online'::booking_type
  END as booking_type,
  CASE 
    WHEN ROW_NUMBER() OVER () % 6 = 0 THEN 'Regular checkup and professional cleaning'
    WHEN ROW_NUMBER() OVER () % 6 = 1 THEN 'Dental crown placement procedure'
    WHEN ROW_NUMBER() OVER () % 6 = 2 THEN 'Root canal therapy treatment'
    WHEN ROW_NUMBER() OVER () % 6 = 3 THEN 'Tooth extraction - wisdom tooth'
    WHEN ROW_NUMBER() OVER () % 6 = 4 THEN 'Composite filling replacement'
    ELSE 'Emergency dental consultation - severe pain'
  END as notes,
  NOW() - ((ROW_NUMBER() OVER ()) * INTERVAL '2 days') as created_at
FROM (
  SELECT id FROM public.patients ORDER BY created_at LIMIT 4
) p
CROSS JOIN (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn FROM public.users WHERE role = 'dentist' LIMIT 3
) d
WHERE d.rn <= 3
AND NOT EXISTS (
  SELECT 1 FROM public.appointments a 
  WHERE a.patient_id = p.id AND a.dentist_id = d.id
)
LIMIT 12;

-- Create treatment catalog
INSERT INTO public.treatments (name, description, price, duration_minutes, category, created_at) VALUES
('Dental Cleaning', 'Professional teeth cleaning and polishing', 120.00, 45, 'Preventive'),
('Dental Filling', 'Composite resin filling for cavities', 180.00, 30, 'Restorative'),
('Root Canal', 'Root canal therapy for infected tooth', 800.00, 90, 'Endodontic'),
('Crown Placement', 'Dental crown installation', 1200.00, 60, 'Restorative'),
('Tooth Extraction', 'Simple tooth extraction', 250.00, 30, 'Oral Surgery'),
('Teeth Whitening', 'Professional teeth whitening', 400.00, 60, 'Cosmetic'),
('Emergency Consultation', 'Emergency dental consultation', 200.00, 30, 'Emergency')
ON CONFLICT (name) DO UPDATE SET 
  price = EXCLUDED.price,
  duration_minutes = EXCLUDED.duration_minutes,
  created_at = NOW();

-- Create digital forms for paperless system demo
INSERT INTO public.digital_forms (name, description, form_type, category, form_fields, requires_signature, is_active, created_at) VALUES
('Patient Intake Form', 'Comprehensive new patient registration', 'registration', 'intake', 
 '[
   {"id": "personal_info", "type": "section", "label": "Personal Information"},
   {"id": "full_name", "type": "text", "label": "Full Name", "required": true},
   {"id": "email", "type": "email", "label": "Email", "required": true},
   {"id": "phone", "type": "tel", "label": "Phone", "required": true},
   {"id": "date_of_birth", "type": "date", "label": "Date of Birth", "required": true},
   {"id": "emergency_contact", "type": "text", "label": "Emergency Contact", "required": true}
 ]'::jsonb, 
 true, true, NOW()),
 
('Medical History', 'Complete medical and dental history', 'medical_history', 'medical', 
 '[
   {"id": "allergies", "type": "textarea", "label": "Known Allergies"},
   {"id": "medications", "type": "textarea", "label": "Current Medications"},
   {"id": "conditions", "type": "textarea", "label": "Medical Conditions"},
   {"id": "dental_history", "type": "textarea", "label": "Previous Dental Work"}
 ]'::jsonb, 
 true, true, NOW()),
 
('Treatment Consent', 'Consent for dental treatment', 'consent', 'legal', 
 '[
   {"id": "consent", "type": "checkbox", "label": "I consent to treatment", "required": true},
   {"id": "financial", "type": "checkbox", "label": "I understand financial responsibility", "required": true}
 ]'::jsonb, 
 true, true, NOW())
ON CONFLICT (name) DO NOTHING;

-- Create sample inventory categories and items
INSERT INTO public.inventory_categories (name, description, created_at) VALUES
('Dental Supplies', 'Basic dental supplies and consumables', NOW()),
('Equipment', 'Dental equipment and instruments', NOW()),
('Medications', 'Pharmaceutical supplies', NOW())
ON CONFLICT (name) DO NOTHING;

-- Add sample inventory items
WITH category_ids AS (
  SELECT id, name FROM public.inventory_categories LIMIT 3
)
INSERT INTO public.inventory_items (
  name, description, category_id, current_stock, minimum_stock, 
  unit_cost, unit_type, supplier_name, sku, is_active, created_at
)
SELECT 
  items.name,
  items.description,
  cat.id,
  items.current_stock,
  items.minimum_stock,
  items.unit_cost,
  items.unit_type,
  items.supplier_name,
  items.sku,
  true,
  NOW()
FROM category_ids cat
CROSS JOIN (VALUES
  ('Dental Gloves', 'Nitrile examination gloves', 500, 100, 0.15, 'boxes', 'MedSupply Co', 'GLV-001'),
  ('Fluoride Treatment', 'Professional fluoride gel', 25, 10, 45.00, 'tubes', 'DentalPro', 'FLU-001'),
  ('Local Anesthetic', 'Lidocaine 2% cartridges', 15, 5, 12.50, 'units', 'PharmaDent', 'LID-001')
) AS items(name, description, current_stock, minimum_stock, unit_cost, unit_type, supplier_name, sku)
WHERE cat.name = 'Dental Supplies'
AND NOT EXISTS (
  SELECT 1 FROM public.inventory_items ii WHERE ii.name = items.name
)
LIMIT 3;

-- Create sample queue entries for today (for queue management demo)
INSERT INTO public.queue (appointment_id, position, priority, status, estimated_wait_minutes, created_at)
SELECT 
  a.id as appointment_id,
  ROW_NUMBER() OVER (ORDER BY a.scheduled_time) as position,
  CASE 
    WHEN a.booking_type = 'emergency' THEN 'emergency'
    WHEN a.booking_type = 'walk_in' THEN 'walk_in'
    ELSE 'scheduled'
  END as priority,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY a.scheduled_time) = 1 THEN 'in_progress'
    WHEN ROW_NUMBER() OVER (ORDER BY a.scheduled_time) <= 3 THEN 'waiting'
    ELSE 'waiting'
  END as status,
  CASE
    WHEN ROW_NUMBER() OVER (ORDER BY a.scheduled_time) = 1 THEN 0
    ELSE ((ROW_NUMBER() OVER (ORDER BY a.scheduled_time) - 1) * 15) + 10
  END as estimated_wait_minutes,
  NOW() - ((ROW_NUMBER() OVER (ORDER BY a.scheduled_time)) * INTERVAL '15 minutes') as created_at
FROM public.appointments a
WHERE a.scheduled_time::date = CURRENT_DATE
  AND a.status IN ('booked', 'in_progress')
  AND NOT EXISTS (SELECT 1 FROM public.queue q WHERE q.appointment_id = a.id)
ORDER BY a.scheduled_time
LIMIT 5;