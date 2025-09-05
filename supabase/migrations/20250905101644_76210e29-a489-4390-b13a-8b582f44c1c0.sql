-- Comprehensive Demo Data Setup for SwiftCare Dental Management System
-- Part 2: Create patient records, medical histories, and complete demo ecosystem

-- First, let's create patient records for all patient users
INSERT INTO public.patients (user_id, full_name, email, contact_number, date_of_birth, emergency_contact_name, emergency_contact_phone, insurance_provider, insurance_policy_number, created_at)
SELECT 
  u.id as user_id,
  u.full_name,
  u.email,
  u.phone as contact_number,
  CASE 
    WHEN u.email LIKE '%tommy%' OR u.email LIKE '%emma.doe%' THEN (CURRENT_DATE - INTERVAL '12 years')::date
    WHEN u.email LIKE '%young%' OR u.email LIKE '%adams%' THEN (CURRENT_DATE - INTERVAL '25 years')::date
    WHEN u.email LIKE '%garcia%' OR u.email LIKE '%rodriguez%' THEN (CURRENT_DATE - INTERVAL '35 years')::date
    WHEN u.email LIKE '%brown%' OR u.email LIKE '%davis%' THEN (CURRENT_DATE - INTERVAL '45 years')::date
    WHEN u.email LIKE '%miller%' OR u.email LIKE '%clark%' THEN (CURRENT_DATE - INTERVAL '55 years')::date
    ELSE (CURRENT_DATE - INTERVAL '30 years')::date
  END as date_of_birth,
  CASE 
    WHEN u.email LIKE '%doe%' THEN 'Emergency Contact for ' || u.first_name
    WHEN u.email LIKE '%johnson%' THEN 'Family Emergency Contact'
    ELSE 'Emergency Contact'
  END as emergency_contact_name,
  '+1-555-9999' as emergency_contact_phone,
  CASE 
    WHEN u.email LIKE '%doe%' OR u.email LIKE '%johnson%' OR u.email LIKE '%garcia%' THEN 'BlueCross BlueShield'
    WHEN u.email LIKE '%brown%' OR u.email LIKE '%davis%' THEN 'Aetna'
    WHEN u.email LIKE '%miller%' OR u.email LIKE '%wilson%' THEN 'Cigna'
    WHEN u.email LIKE '%taylor%' OR u.email LIKE '%lee%' THEN 'United Healthcare'
    ELSE NULL
  END as insurance_provider,
  CASE 
    WHEN u.email LIKE '%doe%' OR u.email LIKE '%johnson%' OR u.email LIKE '%garcia%' THEN 'POL-' || LPAD((RANDOM() * 1000000)::text, 6, '0')
    WHEN u.email LIKE '%brown%' OR u.email LIKE '%davis%' THEN 'AET-' || LPAD((RANDOM() * 1000000)::text, 6, '0')
    WHEN u.email LIKE '%miller%' OR u.email LIKE '%wilson%' THEN 'CIG-' || LPAD((RANDOM() * 1000000)::text, 6, '0')
    WHEN u.email LIKE '%taylor%' OR u.email LIKE '%lee%' THEN 'UHC-' || LPAD((RANDOM() * 1000000)::text, 6, '0')
    ELSE NULL
  END as insurance_policy_number,
  u.created_at
FROM public.users u 
WHERE u.role = 'patient' 
AND NOT EXISTS (SELECT 1 FROM public.patients p WHERE p.user_id = u.id);

-- Create family relationships
INSERT INTO public.family_members (primary_patient_id, secondary_patient_id, relationship, created_at)
SELECT 
  p1.id as primary_patient_id,
  p2.id as secondary_patient_id,
  CASE 
    WHEN p1.email LIKE 'john.doe%' AND p2.email LIKE 'jane.doe%' THEN 'spouse'
    WHEN p1.email LIKE 'jane.doe%' AND p2.email LIKE 'emma.doe%' THEN 'parent'
    WHEN p1.email LIKE 'mike.johnson%' AND p2.email LIKE 'susan.johnson%' THEN 'spouse'
    WHEN p1.email LIKE 'susan.johnson%' AND p2.email LIKE 'tommy.johnson%' THEN 'parent'
    WHEN p1.email LIKE 'maria.garcia%' AND p2.email LIKE 'carlos.garcia%' THEN 'spouse'
    WHEN p1.email LIKE 'robert.brown%' AND p2.email LIKE 'linda.brown%' THEN 'spouse'
    ELSE 'family'
  END as relationship,
  NOW() as created_at
FROM public.patients p1
JOIN public.patients p2 ON p1.id != p2.id
WHERE (
  (p1.email LIKE 'john.doe%' AND p2.email LIKE 'jane.doe%') OR
  (p1.email LIKE 'jane.doe%' AND p2.email LIKE 'emma.doe%') OR
  (p1.email LIKE 'mike.johnson%' AND p2.email LIKE 'susan.johnson%') OR
  (p1.email LIKE 'susan.johnson%' AND p2.email LIKE 'tommy.johnson%') OR
  (p1.email LIKE 'maria.garcia%' AND p2.email LIKE 'carlos.garcia%') OR
  (p1.email LIKE 'robert.brown%' AND p2.email LIKE 'linda.brown%')
)
AND NOT EXISTS (
  SELECT 1 FROM public.family_members fm 
  WHERE (fm.primary_patient_id = p1.id AND fm.secondary_patient_id = p2.id)
     OR (fm.primary_patient_id = p2.id AND fm.secondary_patient_id = p1.id)
);

-- Create comprehensive appointment data
INSERT INTO public.appointments (patient_id, dentist_id, scheduled_time, duration_minutes, status, booking_type, notes, created_at)
SELECT 
  p.id as patient_id,
  d.id as dentist_id,
  CASE 
    WHEN RANDOM() < 0.3 THEN NOW() + INTERVAL '1 day' + (RANDOM() * INTERVAL '30 days')
    WHEN RANDOM() < 0.6 THEN NOW() - INTERVAL '1 day' - (RANDOM() * INTERVAL '60 days')
    ELSE NOW() - INTERVAL '1 day' - (RANDOM() * INTERVAL '180 days')
  END as scheduled_time,
  CASE 
    WHEN RANDOM() < 0.3 THEN 30
    WHEN RANDOM() < 0.6 THEN 45
    WHEN RANDOM() < 0.8 THEN 60
    ELSE 90
  END as duration_minutes,
  CASE 
    WHEN RANDOM() < 0.1 THEN 'cancelled'
    WHEN RANDOM() < 0.2 THEN 'no_show'
    WHEN RANDOM() < 0.4 THEN 'booked'
    ELSE 'completed'
  END as status,
  CASE 
    WHEN RANDOM() < 0.7 THEN 'online'
    WHEN RANDOM() < 0.9 THEN 'phone'
    ELSE 'walk_in'
  END as booking_type,
  CASE 
    WHEN RANDOM() < 0.3 THEN 'Regular checkup and cleaning'
    WHEN RANDOM() < 0.5 THEN 'Dental crown placement'
    WHEN RANDOM() < 0.7 THEN 'Root canal treatment'
    WHEN RANDOM() < 0.8 THEN 'Tooth extraction'
    WHEN RANDOM() < 0.9 THEN 'Filling replacement'
    ELSE 'Emergency dental pain'
  END as notes,
  NOW() - (RANDOM() * INTERVAL '180 days') as created_at
FROM (
  SELECT id FROM public.patients ORDER BY RANDOM() LIMIT 25
) p
CROSS JOIN (
  SELECT id FROM public.users WHERE role = 'dentist' ORDER BY RANDOM() LIMIT 1
) d
WHERE NOT EXISTS (
  SELECT 1 FROM public.appointments a 
  WHERE a.patient_id = p.id 
  AND a.scheduled_time::date = (
    CASE 
      WHEN RANDOM() < 0.3 THEN NOW() + INTERVAL '1 day' + (RANDOM() * INTERVAL '30 days')
      WHEN RANDOM() < 0.6 THEN NOW() - INTERVAL '1 day' - (RANDOM() * INTERVAL '60 days')
      ELSE NOW() - INTERVAL '1 day' - (RANDOM() * INTERVAL '180 days')
    END
  )::date
);

-- Create realistic treatment data
INSERT INTO public.treatments (name, description, price, duration_minutes, category, created_at) VALUES
('Dental Cleaning', 'Professional teeth cleaning and polishing', 120.00, 45, 'Preventive', NOW()),
('Dental Filling', 'Composite resin filling for cavities', 180.00, 30, 'Restorative', NOW()),
('Root Canal', 'Root canal therapy for infected tooth', 800.00, 90, 'Endodontic', NOW()),
('Crown Placement', 'Dental crown installation', 1200.00, 60, 'Restorative', NOW()),
('Tooth Extraction', 'Simple tooth extraction', 250.00, 30, 'Oral Surgery', NOW()),
('Dental Bridge', 'Fixed bridge for missing teeth', 1800.00, 90, 'Restorative', NOW()),
('Dental Implant', 'Titanium implant placement', 2500.00, 120, 'Oral Surgery', NOW()),
('Orthodontic Consultation', 'Initial orthodontic assessment', 150.00, 45, 'Orthodontics', NOW()),
('Teeth Whitening', 'Professional teeth whitening', 400.00, 60, 'Cosmetic', NOW()),
('Emergency Visit', 'Emergency dental consultation', 200.00, 30, 'Emergency', NOW())
ON CONFLICT (name) DO NOTHING;

-- Create invoices for completed appointments
INSERT INTO public.invoices (
  patient_id, 
  appointment_id, 
  invoice_number, 
  subtotal, 
  tax_amount, 
  total_amount, 
  amount_paid, 
  balance_due, 
  payment_status,
  payment_method,
  created_at
)
SELECT 
  a.patient_id,
  a.id as appointment_id,
  'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(ROW_NUMBER() OVER (ORDER BY a.id)::text, 4, '0') as invoice_number,
  CASE 
    WHEN a.notes LIKE '%cleaning%' THEN 120.00
    WHEN a.notes LIKE '%crown%' THEN 1200.00
    WHEN a.notes LIKE '%root canal%' THEN 800.00
    WHEN a.notes LIKE '%extraction%' THEN 250.00
    WHEN a.notes LIKE '%filling%' THEN 180.00
    ELSE 200.00
  END as subtotal,
  CASE 
    WHEN a.notes LIKE '%cleaning%' THEN 10.50
    WHEN a.notes LIKE '%crown%' THEN 105.00
    WHEN a.notes LIKE '%root canal%' THEN 70.00
    WHEN a.notes LIKE '%extraction%' THEN 21.88
    WHEN a.notes LIKE '%filling%' THEN 15.75
    ELSE 17.50
  END as tax_amount,
  CASE 
    WHEN a.notes LIKE '%cleaning%' THEN 130.50
    WHEN a.notes LIKE '%crown%' THEN 1305.00
    WHEN a.notes LIKE '%root canal%' THEN 870.00
    WHEN a.notes LIKE '%extraction%' THEN 271.88
    WHEN a.notes LIKE '%filling%' THEN 195.75
    ELSE 217.50
  END as total_amount,
  CASE 
    WHEN RANDOM() < 0.8 THEN 
      CASE 
        WHEN a.notes LIKE '%cleaning%' THEN 130.50
        WHEN a.notes LIKE '%crown%' THEN 1305.00
        WHEN a.notes LIKE '%root canal%' THEN 870.00
        WHEN a.notes LIKE '%extraction%' THEN 271.88
        WHEN a.notes LIKE '%filling%' THEN 195.75
        ELSE 217.50
      END
    ELSE 0.00
  END as amount_paid,
  CASE 
    WHEN RANDOM() < 0.8 THEN 0.00
    ELSE 
      CASE 
        WHEN a.notes LIKE '%cleaning%' THEN 130.50
        WHEN a.notes LIKE '%crown%' THEN 1305.00
        WHEN a.notes LIKE '%root canal%' THEN 870.00
        WHEN a.notes LIKE '%extraction%' THEN 271.88
        WHEN a.notes LIKE '%filling%' THEN 195.75
        ELSE 217.50
      END
  END as balance_due,
  CASE 
    WHEN RANDOM() < 0.8 THEN 'paid'
    ELSE 'pending'
  END as payment_status,
  CASE 
    WHEN RANDOM() < 0.4 THEN 'credit_card'
    WHEN RANDOM() < 0.7 THEN 'cash'
    WHEN RANDOM() < 0.9 THEN 'insurance'
    ELSE 'check'
  END as payment_method,
  a.created_at + INTERVAL '1 hour' as created_at
FROM public.appointments a
WHERE a.status = 'completed'
AND NOT EXISTS (SELECT 1 FROM public.invoices i WHERE i.appointment_id = a.id);

-- Create queue entries for today and upcoming appointments
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
    WHEN RANDOM() < 0.3 THEN 'waiting'
    WHEN RANDOM() < 0.7 THEN 'in_progress'
    ELSE 'completed'
  END as status,
  (RANDOM() * 45 + 5)::integer as estimated_wait_minutes,
  NOW() - (RANDOM() * INTERVAL '2 hours') as created_at
FROM public.appointments a
WHERE a.scheduled_time::date = CURRENT_DATE
  AND a.status IN ('booked', 'completed')
  AND NOT EXISTS (SELECT 1 FROM public.queue q WHERE q.appointment_id = a.id)
LIMIT 10;