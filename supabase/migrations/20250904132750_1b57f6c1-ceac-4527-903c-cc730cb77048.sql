-- Create some sample patients for the clinic
INSERT INTO patients (id, full_name, email, contact_number, date_of_birth, clinic_id, user_id, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'John Smith', 'john.smith@email.com', '+1234567890', '1990-05-15', 'f71d51eb-5629-467c-b4a6-236aa20720bf', NULL, now(), now()),
  (gen_random_uuid(), 'Sarah Johnson', 'sarah.j@email.com', '+1234567891', '1985-03-22', 'f71d51eb-5629-467c-b4a6-236aa20720bf', NULL, now(), now()),
  (gen_random_uuid(), 'Mike Davis', 'mike.davis@email.com', '+1234567892', '1992-08-10', 'f71d51eb-5629-467c-b4a6-236aa20720bf', NULL, now(), now()),
  (gen_random_uuid(), 'Emily Wilson', 'emily.w@email.com', '+1234567893', '1988-12-05', 'f71d51eb-5629-467c-b4a6-236aa20720bf', NULL, now(), now())
ON CONFLICT (id) DO NOTHING;

-- Create some today's appointments
WITH sample_patients AS (
  SELECT id FROM patients WHERE clinic_id = 'f71d51eb-5629-467c-b4a6-236aa20720bf' LIMIT 4
),
dentist_user AS (
  SELECT id FROM users WHERE role = 'dentist' AND clinic_id = 'f71d51eb-5629-467c-b4a6-236aa20720bf' LIMIT 1
)
INSERT INTO appointments (id, patient_id, dentist_id, clinic_id, scheduled_time, duration_minutes, status, booking_type, notes, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  p.id,
  d.id,
  'f71d51eb-5629-467c-b4a6-236aa20720bf',
  CASE 
    WHEN ROW_NUMBER() OVER() = 1 THEN (CURRENT_DATE + INTERVAL '9 hours')::timestamp with time zone
    WHEN ROW_NUMBER() OVER() = 2 THEN (CURRENT_DATE + INTERVAL '10 hours')::timestamp with time zone  
    WHEN ROW_NUMBER() OVER() = 3 THEN (CURRENT_DATE + INTERVAL '14 hours')::timestamp with time zone
    ELSE (CURRENT_DATE + INTERVAL '16 hours')::timestamp with time zone
  END,
  30,
  CASE 
    WHEN ROW_NUMBER() OVER() = 1 THEN 'checked_in'::appointment_status
    WHEN ROW_NUMBER() OVER() = 2 THEN 'booked'::appointment_status
    ELSE 'booked'::appointment_status
  END,
  'online'::booking_type,
  'Regular checkup',
  now(),
  now()
FROM sample_patients p
CROSS JOIN dentist_user d
ON CONFLICT (id) DO NOTHING;

-- Create some payments for revenue calculation
WITH recent_appointments AS (
  SELECT id FROM appointments 
  WHERE clinic_id = 'f71d51eb-5629-467c-b4a6-236aa20720bf' 
  AND scheduled_time >= CURRENT_DATE - INTERVAL '30 days'
  LIMIT 3
)
INSERT INTO payments (id, appointment_id, patient_id, clinic_id, amount, payment_method, payment_status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  a.id,
  (SELECT patient_id FROM appointments WHERE id = a.id),
  'f71d51eb-5629-467c-b4a6-236aa20720bf',
  CASE 
    WHEN ROW_NUMBER() OVER() = 1 THEN 150.00
    WHEN ROW_NUMBER() OVER() = 2 THEN 200.00
    ELSE 175.00
  END,
  'card',
  'completed',
  CURRENT_DATE + INTERVAL '8 hours',
  CURRENT_DATE + INTERVAL '8 hours'
FROM recent_appointments a
ON CONFLICT (id) DO NOTHING;