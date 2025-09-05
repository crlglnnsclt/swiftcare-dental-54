-- Fix queue monitor and patient dashboard data visibility
-- First, populate the queue table with current appointments
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
  AND DATE(a.scheduled_time) = CURRENT_DATE
  AND NOT EXISTS (
    SELECT 1 FROM public.queue q WHERE q.appointment_id = a.id
  );

-- Create a patient record for the current demo user if missing
DO $$
DECLARE
    demo_user_id UUID := 'dbd48d06-d62f-4378-8092-5a81a64819900';
    patient_exists BOOLEAN;
BEGIN
    -- Check if patient record exists for the demo user
    SELECT EXISTS (
        SELECT 1 FROM public.patients 
        WHERE user_id = demo_user_id
    ) INTO patient_exists;
    
    -- Create patient record if it doesn't exist
    IF NOT patient_exists THEN
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
            gen_random_uuid(),
            demo_user_id,
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
        );
    END IF;
END $$;