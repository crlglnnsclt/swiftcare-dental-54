-- SwiftCare Dental Demo Data Setup - Part 3: Simple Demo Data Creation
-- Create essential demo data without complex window functions

-- Create additional treatments for the clinic
WITH demo_clinic AS (
  SELECT id as clinic_id FROM clinics WHERE clinic_name = 'SwiftCare Demo Clinic' LIMIT 1
)
INSERT INTO public.treatments (name, default_duration_minutes, default_price, clinic_id, service_code, is_global_template, created_by_super_admin) 
SELECT 
  t.name, 
  t.duration, 
  t.price, 
  dc.clinic_id, 
  t.code,
  true,
  true
FROM demo_clinic dc,
(VALUES 
  ('Emergency Cleaning', 75, 150.00, 'D1110E'),
  ('Pediatric Exam', 30, 65.00, 'D0150P'),
  ('Senior Discount Cleaning', 60, 95.00, 'D1110S'),
  ('Cosmetic Consultation', 45, 125.00, 'D9999C'),
  ('Bite Adjustment', 30, 85.00, 'D9951')
) AS t(name, duration, price, code);

-- Create some basic appointments using existing patients and dentists
INSERT INTO public.appointments (patient_id, dentist_id, scheduled_time, duration_minutes, status, booking_type, notes)
SELECT 
  p.id,
  u.id,
  NOW() + INTERVAL '1 day' + (random() * INTERVAL '14 days'),
  60 + (random() * 60)::integer,
  CASE (random() * 4)::integer
    WHEN 0 THEN 'completed'::appointment_status
    WHEN 1 THEN 'booked'::appointment_status
    WHEN 2 THEN 'checked_in'::appointment_status
    ELSE 'cancelled'::appointment_status
  END,
  'online'::booking_type,
  CASE (random() * 3)::integer
    WHEN 0 THEN 'Regular checkup and cleaning requested'
    WHEN 1 THEN 'Patient reports tooth sensitivity'
    ELSE 'Follow-up appointment for previous treatment'
  END
FROM (SELECT id FROM patients LIMIT 5) p
CROSS JOIN (SELECT id FROM users WHERE role = 'dentist' LIMIT 2) u
LIMIT 10;

-- Create form responses for demo
INSERT INTO public.form_responses (form_id, patient_id, responses, status, verification_status, is_visible_to_patient)
SELECT 
  f.id,
  p.id,
  jsonb_build_object(
    'full_name', p.full_name,
    'email', p.email,
    'phone', '+1-555-0123',
    'emergency_contact', 'Emergency Contact',
    'emergency_phone', '+1-555-0124',
    'allergies', 'None known',
    'medications', 'None',
    'dental_concerns', 'Routine checkup'
  ),
  'completed',
  'approved',
  true
FROM (SELECT id, name FROM digital_forms WHERE is_active = true LIMIT 2) f
CROSS JOIN (SELECT id, full_name, email FROM patients LIMIT 3) p
LIMIT 6;

-- Create inventory alerts
INSERT INTO public.inventory_alerts (item_id, alert_type, message, is_resolved)
SELECT 
  i.id,
  'low_stock',
  i.name || ' is running low. Current stock: ' || i.current_stock,
  false
FROM inventory_items i
LIMIT 5;

-- Create audit logs for demo
INSERT INTO public.audit_logs (action_type, action_description, entity_type, new_values)
VALUES 
('user_login', 'Demo user logged into the system', 'authentication', '{"timestamp": "' || NOW()::text || '", "success": true}'),
('appointment_created', 'Demo appointment created', 'appointment', '{"treatment": "Routine Cleaning", "duration": 60}'),
('form_submitted', 'Demo form submitted', 'form_response', '{"form_type": "intake", "status": "completed"}'),
('payment_processed', 'Demo payment processed', 'invoice', '{"amount": 120.00, "method": "credit_card"}'),
('inventory_updated', 'Demo inventory updated', 'inventory', '{"item": "Gloves", "new_stock": 450}');

-- Update some patients with realistic demo data
UPDATE patients SET 
  date_of_birth = CASE 
    WHEN id = (SELECT id FROM patients LIMIT 1 OFFSET 0) THEN '1985-03-15'
    WHEN id = (SELECT id FROM patients LIMIT 1 OFFSET 1) THEN '1990-07-22'
    WHEN id = (SELECT id FROM patients LIMIT 1 OFFSET 2) THEN '1978-11-08'
    WHEN id = (SELECT id FROM patients LIMIT 1 OFFSET 3) THEN '1995-01-30'
    ELSE '1987-05-12'
  END,
  contact_number = '+1-555-' || LPAD(EXTRACT(DAY FROM created_at)::text, 4, '0'),
  emergency_contact = full_name || ' Emergency Contact',
  insurance_info = CASE (random() * 3)::integer
    WHEN 0 THEN 'BlueCross BlueShield - Policy BC123456'
    WHEN 1 THEN 'Aetna - Policy AET789456'
    ELSE 'UnitedHealthcare - Policy UHC456789'
  END
WHERE id IN (SELECT id FROM patients LIMIT 5);

-- Create some sample invoices
INSERT INTO public.invoices (
  patient_id, 
  clinic_id, 
  invoice_number, 
  subtotal, 
  tax_amount, 
  total_amount, 
  amount_paid, 
  balance_due, 
  payment_status
)
SELECT 
  p.id,
  (SELECT id FROM clinics WHERE clinic_name = 'SwiftCare Demo Clinic' LIMIT 1),
  'INV-' || TO_CHAR(NOW(), 'YYYYMM') || '-' || LPAD(generate_series(1, 3)::text, 4, '0'),
  120.00,
  10.50,
  130.50,
  CASE generate_series(1, 3) % 3
    WHEN 0 THEN 130.50  -- Fully paid
    WHEN 1 THEN 65.25   -- Partial payment
    ELSE 0              -- Unpaid
  END,
  CASE generate_series(1, 3) % 3
    WHEN 0 THEN 0       -- No balance
    WHEN 1 THEN 65.25   -- Remaining balance
    ELSE 130.50         -- Full balance
  END,
  CASE generate_series(1, 3) % 3
    WHEN 0 THEN 'paid'
    WHEN 1 THEN 'partial'
    ELSE 'pending'
  END
FROM (SELECT id FROM patients LIMIT 1) p
CROSS JOIN generate_series(1, 3);

-- Create queue entries for demo
INSERT INTO public.queue (appointment_id, position, priority, status, estimated_wait_minutes)
SELECT 
  a.id,
  generate_series(1, 3),
  CASE generate_series(1, 3) % 3
    WHEN 0 THEN 'emergency'::queue_priority
    WHEN 1 THEN 'scheduled'::queue_priority
    ELSE 'walk_in'::queue_priority
  END,
  CASE generate_series(1, 3) % 3
    WHEN 0 THEN 'waiting'::queue_status
    WHEN 1 THEN 'called'::queue_status
    ELSE 'completed'::queue_status
  END,
  (generate_series(1, 3) * 15)
FROM (SELECT id FROM appointments WHERE status = 'booked' LIMIT 1) a
CROSS JOIN generate_series(1, 3);