-- Final Working Demo Data Setup
-- Create additional essential demo data safely

-- Add sample treatments with correct schema
INSERT INTO public.treatments (name, default_duration_minutes, default_price, service_code, created_at)
VALUES 
('Dental Cleaning', 45, 120.00, 'CLEAN-001', NOW()),
('Dental Filling', 30, 180.00, 'FILL-001', NOW()),
('Root Canal', 90, 800.00, 'ENDO-001', NOW()),
('Crown Placement', 60, 1200.00, 'CROWN-001', NOW()),
('Tooth Extraction', 30, 250.00, 'EXTR-001', NOW()),
('Emergency Consultation', 30, 200.00, 'EMERG-001', NOW())
WHERE NOT EXISTS (SELECT 1 FROM public.treatments WHERE name = 'Dental Cleaning');

-- Create sample form responses demonstrating paperless workflow
INSERT INTO public.form_responses (
  form_id, patient_id, responses, status, verification_status, 
  signed_by, signed_at, signature_data, is_visible_to_patient, created_at
)
SELECT 
  df.id,
  p.id,
  CASE 
    WHEN df.name LIKE '%Registration%' THEN 
      ('{"name": "' || p.full_name || '", "email": "' || p.email || '", "phone": "' || COALESCE(p.contact_number, '+1-555-0000') || '", "dob": "' || p.date_of_birth || '"}')::jsonb
    WHEN df.name LIKE '%Medical%' THEN 
      ('{"allergies": "' || SPLIT_PART(COALESCE(p.medical_history, 'None'), '.', 1) || '", "medications": "None", "conditions": "None"}')::jsonb
    ELSE 
      '{"consent": true, "financial": true}'::jsonb
  END,
  'submitted',
  'approved',
  p.user_id,
  NOW() - INTERVAL '1 day',
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAgNTBRNTAgMTAgMTAwIDUwVDE5MCA1MCIgc3Ryb2tlPSIjMDAwIiBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=',
  true,
  NOW() - INTERVAL '1 day'
FROM public.digital_forms df
CROSS JOIN (SELECT id, user_id, full_name, email, contact_number, date_of_birth, medical_history FROM public.patients LIMIT 2) p
WHERE NOT EXISTS (
  SELECT 1 FROM public.form_responses fr 
  WHERE fr.form_id = df.id AND fr.patient_id = p.id
)
LIMIT 6;

-- Create inventory alerts for demo
INSERT INTO public.inventory_alerts (item_id, alert_type, message, is_resolved, created_at)
SELECT 
  ii.id,
  CASE 
    WHEN ii.current_stock <= ii.minimum_stock THEN 'low_stock'
    WHEN ii.expiry_date IS NOT NULL AND ii.expiry_date < NOW() + INTERVAL '30 days' THEN 'expiring_soon'
    ELSE 'reorder_needed'
  END,
  CASE 
    WHEN ii.current_stock <= ii.minimum_stock THEN ii.name || ' is running low. Current stock: ' || ii.current_stock
    WHEN ii.expiry_date IS NOT NULL AND ii.expiry_date < NOW() + INTERVAL '30 days' THEN ii.name || ' expires soon'
    ELSE ii.name || ' needs reordering'
  END,
  false,
  NOW() - (RANDOM() * INTERVAL '7 days')
FROM public.inventory_items ii
WHERE NOT EXISTS (SELECT 1 FROM public.inventory_alerts ia WHERE ia.item_id = ii.id)
LIMIT 3;

-- Add audit trail entries for demonstration
INSERT INTO public.audit_logs (
  user_id, action_type, action_description, entity_type, entity_id, 
  ip_address, user_agent, created_at
)
SELECT 
  u.user_id,
  CASE u.role
    WHEN 'patient' THEN 'patient_registration'
    WHEN 'dentist' THEN 'treatment_completed'
    WHEN 'staff' THEN 'appointment_scheduled'
    ELSE 'user_login'
  END,
  CASE u.role
    WHEN 'patient' THEN 'Patient completed registration forms'
    WHEN 'dentist' THEN 'Completed patient treatment and updated records'
    WHEN 'staff' THEN 'Scheduled new patient appointment'
    ELSE 'User logged into system'
  END,
  'user',
  u.id,
  '192.168.1.' || (RANDOM() * 255)::int,
  'Mozilla/5.0 (Demo Browser)',
  NOW() - (ROW_NUMBER() OVER () * INTERVAL '2 hours')
FROM public.users u
WHERE NOT EXISTS (SELECT 1 FROM public.audit_logs al WHERE al.user_id = u.user_id)
LIMIT 10;