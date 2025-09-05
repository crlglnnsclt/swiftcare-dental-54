-- Fix the queue table structure and populate with demo data
-- First fix the queue table by adding missing patient_id column
ALTER TABLE public.queue ADD COLUMN IF NOT EXISTS patient_id UUID;

-- Then populate queue with demo data from appointments
DELETE FROM public.queue; -- Clear any existing data

INSERT INTO public.queue (
  appointment_id,
  patient_id,
  priority,
  status,
  position,
  estimated_wait_minutes,
  predicted_completion_time,
  created_at
)
SELECT 
  a.id,
  a.patient_id,
  CASE 
    WHEN a.booking_type = 'emergency' THEN 'emergency'
    WHEN a.booking_type = 'walk_in' THEN 'walk_in'
    ELSE 'scheduled'
  END::queue_priority,
  CASE 
    WHEN a.status = 'in_progress' THEN 'called'
    WHEN a.status = 'checked_in' THEN 'waiting'
    ELSE 'waiting'
  END::queue_status,
  ROW_NUMBER() OVER (ORDER BY 
    CASE 
      WHEN a.booking_type = 'emergency' THEN 1
      WHEN a.booking_type = 'scheduled' THEN 2
      ELSE 3
    END,
    a.scheduled_time
  ),
  CASE 
    WHEN a.booking_type = 'emergency' THEN 5
    ELSE (ROW_NUMBER() OVER (ORDER BY a.scheduled_time) - 1) * 30
  END,
  a.scheduled_time + INTERVAL '30 minutes',
  NOW()
FROM public.appointments a
WHERE a.status IN ('checked_in', 'in_progress')
  AND DATE(a.scheduled_time) = CURRENT_DATE;

-- Create a patient record for the current demo user 
INSERT INTO public.patients (
  id,
  user_id,
  full_name,
  email,
  contact_number,
  date_of_birth,
  gender,
  emergency_contact,
  medical_history,
  insurance_info,
  created_at,
  updated_at
) VALUES (
  'b3105522-cc6f-4f5b-8b0c-a3fb8e82a1c8',
  'b3105522-cc6f-4f5b-8b0c-a3fb8e82a1c8',
  'Patient One',
  'escletocarl24+patient1@gmail.com',
  '+1-555-0123',
  '1985-06-15',
  'female',
  'Emergency Contact: Jane Doe +1-555-0124',
  'No known allergies. Previous dental work: fillings, cleaning.',
  'DentaCare Plus - Policy #DC123456',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  contact_number = EXCLUDED.contact_number;

-- Add some demo appointments for the current patient
INSERT INTO public.appointments (
  id,
  patient_id,
  dentist_id,
  scheduled_time,
  status,
  booking_type,
  duration_minutes,
  notes,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'b3105522-cc6f-4f5b-8b0c-a3fb8e82a1c8',
  (SELECT id FROM users WHERE role = 'dentist' LIMIT 1),
  CURRENT_DATE + INTERVAL '3 days' + TIME '14:00:00',
  'booked',
  'online',
  60,
  'Regular checkup and cleaning',
  NOW(),
  NOW()
), (
  gen_random_uuid(),
  'b3105522-cc6f-4f5b-8b0c-a3fb8e82a1c8',
  (SELECT id FROM users WHERE role = 'dentist' LIMIT 1),
  CURRENT_DATE + INTERVAL '1 week' + TIME '10:30:00',
  'booked',
  'online',
  30,
  'Follow-up appointment',
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;