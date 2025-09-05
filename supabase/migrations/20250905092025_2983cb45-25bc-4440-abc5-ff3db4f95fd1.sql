-- First, ensure we have some basic sample data for testing queue monitor
-- Insert a sample patient if none exists
INSERT INTO patients (full_name, email, contact_number, date_of_birth)
SELECT 'John Doe', 'john.doe@test.com', '+1234567890', '1990-01-01'
WHERE NOT EXISTS (SELECT 1 FROM patients);

-- Insert a sample dentist if none exists  
INSERT INTO users (user_id, email, first_name, last_name, full_name, role)
SELECT gen_random_uuid(), 'dr.smith@clinic.com', 'Dr. Jane', 'Smith', 'Dr. Jane Smith', 'dentist'::user_role
WHERE NOT EXISTS (SELECT 1 FROM users WHERE role = 'dentist');

-- Insert sample appointments for today
WITH sample_data AS (
  SELECT 
    (SELECT id FROM patients LIMIT 1) as patient_id,
    (SELECT id FROM users WHERE role = 'dentist' LIMIT 1) as dentist_id,
    CURRENT_DATE + interval '9 hours' as scheduled_time_1,
    CURRENT_DATE + interval '10 hours' as scheduled_time_2,
    CURRENT_DATE + interval '11 hours' as scheduled_time_3
)
INSERT INTO appointments (patient_id, dentist_id, scheduled_time, status, duration_minutes, notes)
SELECT 
  sample_data.patient_id,
  sample_data.dentist_id,
  sample_data.scheduled_time_1,
  'confirmed'::appointment_status,
  30,
  'Regular cleaning'
FROM sample_data
WHERE NOT EXISTS (
  SELECT 1 FROM appointments 
  WHERE scheduled_time >= CURRENT_DATE 
  AND scheduled_time < CURRENT_DATE + interval '1 day'
)
UNION ALL
SELECT 
  sample_data.patient_id,
  sample_data.dentist_id,
  sample_data.scheduled_time_2,
  'confirmed'::appointment_status,
  45,
  'Dental consultation'
FROM sample_data
WHERE NOT EXISTS (
  SELECT 1 FROM appointments 
  WHERE scheduled_time >= CURRENT_DATE 
  AND scheduled_time < CURRENT_DATE + interval '1 day'
)
UNION ALL
SELECT 
  sample_data.patient_id,
  sample_data.dentist_id,
  sample_data.scheduled_time_3,
  'confirmed'::appointment_status,
  60,
  'Root canal treatment'
FROM sample_data
WHERE NOT EXISTS (
  SELECT 1 FROM appointments 
  WHERE scheduled_time >= CURRENT_DATE 
  AND scheduled_time < CURRENT_DATE + interval '1 day'
);

-- Clear existing queue entries for today
DELETE FROM queue WHERE DATE(created_at) = CURRENT_DATE;

-- Insert sample queue data using today's appointments
WITH today_appointments AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY scheduled_time) as rn
  FROM appointments 
  WHERE scheduled_time >= CURRENT_DATE 
  AND scheduled_time < CURRENT_DATE + interval '1 day'
  LIMIT 3
)
INSERT INTO queue (appointment_id, position, status, estimated_wait_minutes)
SELECT 
  ta.id,
  ta.rn,
  CASE 
    WHEN ta.rn = 1 THEN 'waiting'::queue_status
    WHEN ta.rn = 2 THEN 'called'::queue_status
    ELSE 'waiting'::queue_status
  END,
  CASE 
    WHEN ta.rn = 1 THEN 15
    WHEN ta.rn = 2 THEN 5
    ELSE 25
  END
FROM today_appointments ta;