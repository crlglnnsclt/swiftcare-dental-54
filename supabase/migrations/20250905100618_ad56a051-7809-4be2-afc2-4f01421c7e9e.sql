-- SwiftCare Dental Demo Data Setup - Part 2: Realistic Demo Data
-- Using existing clinic structure and creating comprehensive demo data

-- First, let's get the clinic ID for our demo data
WITH demo_clinic AS (
  SELECT id as clinic_id FROM clinics WHERE clinic_name = 'SwiftCare Demo Clinic' LIMIT 1
)

-- Create treatments for the clinic
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
  ('Routine Cleaning', 60, 120.00, 'D1110'),
  ('Comprehensive Exam', 45, 85.00, 'D0150'),
  ('Tooth Filling (Composite)', 45, 180.00, 'D2391'),
  ('Root Canal Treatment', 90, 800.00, 'D3310'),
  ('Crown Placement', 75, 1200.00, 'D2740'),
  ('Tooth Extraction', 30, 200.00, 'D7140'),
  ('Teeth Whitening', 45, 300.00, 'D9972'),
  ('Dental Implant', 120, 2500.00, 'D6010'),
  ('Orthodontic Consultation', 30, 150.00, 'D8090'),
  ('Emergency Visit', 45, 250.00, 'D0140'),
  ('Periodontal Scaling', 90, 400.00, 'D4341'),
  ('Fluoride Treatment', 15, 45.00, 'D1206'),
  ('X-Ray (Bitewing)', 15, 65.00, 'D0272'),
  ('X-Ray (Panoramic)', 20, 125.00, 'D0330'),
  ('Oral Surgery Consultation', 30, 175.00, 'D0140')
) AS t(name, duration, price, code);

-- Create some sample appointments for demo (using existing patients if any)
WITH demo_clinic AS (
  SELECT id as clinic_id FROM clinics WHERE clinic_name = 'SwiftCare Demo Clinic' LIMIT 1
),
demo_patients AS (
  SELECT id, full_name FROM patients LIMIT 10
),
demo_treatments AS (
  SELECT id, name, default_duration_minutes FROM treatments WHERE is_global_template = true LIMIT 5
),
demo_dentists AS (
  SELECT id, full_name FROM users WHERE role = 'dentist' LIMIT 3
)
INSERT INTO public.appointments (patient_id, dentist_id, scheduled_time, duration_minutes, status, booking_type, notes)
SELECT 
  p.id,
  d.id,
  CASE 
    WHEN ROW_NUMBER() OVER() <= 3 THEN NOW() + INTERVAL '1 day' + (ROW_NUMBER() OVER() * INTERVAL '2 hours')
    WHEN ROW_NUMBER() OVER() <= 6 THEN NOW() + INTERVAL '2 days' + ((ROW_NUMBER() OVER() - 3) * INTERVAL '2 hours')
    ELSE NOW() + INTERVAL '7 days' + ((ROW_NUMBER() OVER() - 6) * INTERVAL '3 hours')
  END,
  t.default_duration_minutes,
  CASE 
    WHEN ROW_NUMBER() OVER() % 4 = 0 THEN 'completed'::appointment_status
    WHEN ROW_NUMBER() OVER() % 4 = 1 THEN 'booked'::appointment_status
    WHEN ROW_NUMBER() OVER() % 4 = 2 THEN 'checked_in'::appointment_status
    ELSE 'in_progress'::appointment_status
  END,
  'online'::booking_type,
  CASE 
    WHEN ROW_NUMBER() OVER() % 3 = 0 THEN 'Regular checkup and cleaning'
    WHEN ROW_NUMBER() OVER() % 3 = 1 THEN 'Patient reports sensitivity in upper molars'
    ELSE 'Follow-up appointment for previous treatment'
  END
FROM demo_patients p
CROSS JOIN demo_treatments t
CROSS JOIN demo_dentists d
WHERE ROW_NUMBER() OVER() <= 15;

-- Create some form responses for demo
WITH demo_forms AS (
  SELECT id, name FROM digital_forms WHERE is_active = true LIMIT 3
),
demo_patients AS (
  SELECT id, full_name, email FROM patients LIMIT 8
)
INSERT INTO public.form_responses (form_id, patient_id, responses, status, verification_status, is_visible_to_patient)
SELECT 
  f.id,
  p.id,
  CASE f.name
    WHEN 'Patient Intake Form' THEN jsonb_build_object(
      'full_name', p.full_name,
      'email', p.email,
      'phone', '+1-555-' || LPAD((ROW_NUMBER() OVER())::text, 4, '0'),
      'emergency_contact', 'Emergency Contact for ' || p.full_name,
      'emergency_phone', '+1-555-' || LPAD((ROW_NUMBER() OVER() + 1000)::text, 4, '0'),
      'insurance_provider', 
        CASE ROW_NUMBER() OVER() % 4
          WHEN 0 THEN 'BlueCross BlueShield'
          WHEN 1 THEN 'Aetna'
          WHEN 2 THEN 'UnitedHealthcare'
          ELSE 'None'
        END
    )
    WHEN 'Medical History Form' THEN jsonb_build_object(
      'allergies', 
        CASE ROW_NUMBER() OVER() % 3
          WHEN 0 THEN 'Penicillin, shellfish'
          WHEN 1 THEN 'None known'
          ELSE 'Latex, aspirin'
        END,
      'medications', 
        CASE ROW_NUMBER() OVER() % 3
          WHEN 0 THEN 'Lisinopril 10mg daily'
          WHEN 1 THEN 'None'
          ELSE 'Metformin 500mg twice daily'
        END,
      'dental_concerns', 'Routine checkup and cleaning',
      'smoking', 
        CASE ROW_NUMBER() OVER() % 3
          WHEN 0 THEN 'No'
          WHEN 1 THEN 'Occasionally'
          ELSE 'No'
        END
    )
    ELSE jsonb_build_object(
      'treatment_consent', true,
      'financial_consent', true,
      'emergency_consent', true,
      'signature_date', CURRENT_DATE::text
    )
  END,
  CASE ROW_NUMBER() OVER() % 3
    WHEN 0 THEN 'completed'
    WHEN 1 THEN 'draft'
    ELSE 'submitted'
  END,
  CASE ROW_NUMBER() OVER() % 3
    WHEN 0 THEN 'approved'
    WHEN 1 THEN 'pending_verification'
    ELSE 'approved'
  END,
  true
FROM demo_forms f
CROSS JOIN demo_patients p
WHERE ROW_NUMBER() OVER() <= 20;

-- Create inventory alerts for demo
INSERT INTO public.inventory_alerts (item_id, alert_type, message, is_resolved)
SELECT 
  i.id,
  CASE 
    WHEN i.current_stock < i.minimum_stock THEN 'low_stock'
    WHEN i.current_stock < (i.minimum_stock * 0.5) THEN 'critical_stock'
    ELSE 'reorder_reminder'
  END,
  CASE 
    WHEN i.current_stock < i.minimum_stock THEN i.name || ' is running low. Current stock: ' || i.current_stock || ', Minimum: ' || i.minimum_stock
    WHEN i.current_stock < (i.minimum_stock * 0.5) THEN i.name || ' is critically low! Immediate reorder required.'
    ELSE i.name || ' scheduled for reorder next week.'
  END,
  CASE ROW_NUMBER() OVER() % 4 WHEN 0 THEN true ELSE false END
FROM inventory_items i
WHERE ROW_NUMBER() OVER() <= 8;

-- Create some audit logs for demo
INSERT INTO public.audit_logs (action_type, action_description, entity_type, new_values)
VALUES 
('user_login', 'User successfully logged into the system', 'authentication', '{"timestamp": "' || NOW()::text || '", "ip_address": "192.168.1.100"}'),
('appointment_created', 'New appointment scheduled via online booking', 'appointment', '{"appointment_time": "' || (NOW() + INTERVAL '1 day')::text || '", "treatment": "Routine Cleaning"}'),
('form_submitted', 'Patient submitted medical history form', 'form_response', '{"form_type": "medical_history", "patient_name": "Demo Patient"}'),
('payment_processed', 'Payment successfully processed for treatment', 'invoice', '{"amount": 120.00, "payment_method": "credit_card"}'),
('inventory_updated', 'Inventory item stock level updated', 'inventory', '{"item": "Disposable Gloves", "new_stock": 450}'),
('system_backup', 'Daily system backup completed successfully', 'system', '{"backup_size": "2.3GB", "duration": "45 minutes"}'),
('queue_updated', 'Patient position updated in queue', 'queue', '{"patient_name": "Demo Patient", "new_position": 3}'),
('report_generated', 'Monthly revenue report generated', 'report', '{"report_type": "revenue", "period": "monthly"}');

-- Create sample invoices for demo
WITH demo_appointments AS (
  SELECT a.id, a.patient_id, a.scheduled_time, t.name as treatment_name, t.default_price
  FROM appointments a
  JOIN appointment_treatments at ON a.id = at.appointment_id
  JOIN treatments t ON at.treatment_id = t.id
  WHERE a.status = 'completed'
  LIMIT 10
),
demo_clinic AS (
  SELECT id as clinic_id FROM clinics WHERE clinic_name = 'SwiftCare Demo Clinic' LIMIT 1
)
INSERT INTO public.invoices (
  patient_id, 
  clinic_id, 
  appointment_id, 
  invoice_number, 
  subtotal, 
  tax_amount, 
  total_amount, 
  amount_paid, 
  balance_due, 
  payment_status,
  payment_method,
  payment_date
)
SELECT 
  da.patient_id,
  dc.clinic_id,
  da.id,
  'INV-' || TO_CHAR(da.scheduled_time, 'YYYYMM') || '-' || LPAD(ROW_NUMBER() OVER()::text, 4, '0'),
  da.default_price,
  da.default_price * 0.0875, -- 8.75% tax
  da.default_price * 1.0875,
  CASE ROW_NUMBER() OVER() % 3
    WHEN 0 THEN da.default_price * 1.0875  -- Fully paid
    WHEN 1 THEN da.default_price * 0.5    -- Partial payment
    ELSE 0                                  -- Unpaid
  END,
  CASE ROW_NUMBER() OVER() % 3
    WHEN 0 THEN 0                          -- Fully paid
    WHEN 1 THEN da.default_price * 0.5875 -- Remaining balance
    ELSE da.default_price * 1.0875        -- Full balance
  END,
  CASE ROW_NUMBER() OVER() % 3
    WHEN 0 THEN 'paid'
    WHEN 1 THEN 'partial'
    ELSE 'pending'
  END,
  CASE ROW_NUMBER() OVER() % 4
    WHEN 0 THEN 'credit_card'
    WHEN 1 THEN 'cash'
    WHEN 2 THEN 'insurance'
    ELSE 'check'
  END,
  CASE ROW_NUMBER() OVER() % 3
    WHEN 0 THEN da.scheduled_time + INTERVAL '1 hour'  -- Paid same day
    WHEN 1 THEN da.scheduled_time + INTERVAL '2 days'  -- Paid later
    ELSE NULL                                           -- Not paid yet
  END
FROM demo_appointments da
CROSS JOIN demo_clinic dc;