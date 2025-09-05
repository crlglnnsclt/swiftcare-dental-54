-- Create appointments, demo data, and complete E2E scenarios
-- First, let's get the actual user IDs and create appointments
WITH dentist_users AS (
  SELECT id AS user_id, full_name, email 
  FROM users 
  WHERE role = 'dentist'
  LIMIT 5
),
patient_users AS (
  SELECT id AS user_id, full_name, email 
  FROM users 
  WHERE role = 'patient'
  LIMIT 10
)
INSERT INTO public.appointments (
  patient_id, dentist_id, scheduled_time, duration_minutes, status, 
  booking_type, notes, created_at
)
SELECT 
  (SELECT id FROM patients WHERE user_id = pu.user_id LIMIT 1) as patient_id,
  du.user_id as dentist_id,
  CASE 
    WHEN random() < 0.3 THEN NOW() + INTERVAL '1 day' + (random() * INTERVAL '7 days')
    WHEN random() < 0.6 THEN NOW() - INTERVAL '1 day' - (random() * INTERVAL '30 days')
    ELSE NOW() + INTERVAL '2 hours' + (random() * INTERVAL '8 hours')
  END as scheduled_time,
  CASE 
    WHEN random() < 0.3 THEN 30
    WHEN random() < 0.6 THEN 45
    ELSE 60
  END as duration_minutes,
  CASE 
    WHEN random() < 0.1 THEN 'cancelled'
    WHEN random() < 0.2 THEN 'completed'
    WHEN random() < 0.3 THEN 'no_show'
    ELSE 'booked'
  END as status,
  CASE 
    WHEN random() < 0.7 THEN 'online'
    ELSE 'walk_in'
  END as booking_type,
  CASE 
    WHEN random() < 0.5 THEN 'Regular checkup and cleaning'
    WHEN random() < 0.7 THEN 'Tooth pain examination'
    ELSE 'Follow-up appointment'
  END as notes,
  NOW() - (random() * INTERVAL '30 days') as created_at
FROM dentist_users du
CROSS JOIN patient_users pu
WHERE random() < 0.4  -- Create appointments for about 40% of combinations
LIMIT 25;

-- Create some treatments
INSERT INTO public.treatments (name, description, base_price, duration_minutes, created_at) VALUES
('Regular Cleaning', 'Routine dental cleaning and examination', 120.00, 30, NOW()),
('Deep Cleaning', 'Deep scaling and root planing', 250.00, 60, NOW()),
('Filling - Composite', 'Tooth-colored composite filling', 180.00, 45, NOW()),
('Filling - Amalgam', 'Silver amalgam filling', 150.00, 45, NOW()),
('Root Canal', 'Root canal treatment', 800.00, 90, NOW()),
('Crown - Porcelain', 'Porcelain dental crown', 1200.00, 90, NOW()),
('Tooth Extraction', 'Simple tooth extraction', 200.00, 30, NOW()),
('Orthodontic Consultation', 'Initial orthodontic evaluation', 150.00, 45, NOW()),
('Teeth Whitening', 'Professional teeth whitening', 300.00, 60, NOW()),
('Dental Implant', 'Single tooth implant placement', 2500.00, 120, NOW())
ON CONFLICT (name) DO NOTHING;