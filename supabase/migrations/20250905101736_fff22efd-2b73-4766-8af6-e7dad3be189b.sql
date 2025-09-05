-- Create patient records linked to users with correct schema
WITH patient_users AS (
  SELECT id, user_id, full_name, email, phone, date_of_birth, created_at
  FROM users 
  WHERE role = 'patient'
)
INSERT INTO public.patients (
  user_id, full_name, email, contact_number, date_of_birth, created_at
)
SELECT 
  pu.user_id,
  pu.full_name,
  pu.email,
  pu.phone,
  pu.date_of_birth,
  pu.created_at
FROM patient_users pu
ON CONFLICT (user_id) DO NOTHING;

-- Create family relationships
WITH patient_ids AS (
  SELECT p.id, u.email, u.full_name
  FROM patients p
  JOIN users u ON p.user_id = u.user_id
  WHERE u.role = 'patient'
)
INSERT INTO public.family_members (primary_patient_id, secondary_patient_id, relationship, created_at) VALUES
-- Doe Family
((SELECT id FROM patient_ids WHERE email = 'john.doe@email.com'), 
 (SELECT id FROM patient_ids WHERE email = 'jane.doe@email.com'), 'spouse'),
((SELECT id FROM patient_ids WHERE email = 'john.doe@email.com'), 
 (SELECT id FROM patient_ids WHERE email = 'emma.doe@email.com'), 'parent'),
((SELECT id FROM patient_ids WHERE email = 'jane.doe@email.com'), 
 (SELECT id FROM patient_ids WHERE email = 'emma.doe@email.com'), 'parent'),

-- Johnson Family
((SELECT id FROM patient_ids WHERE email = 'mike.johnson@email.com'), 
 (SELECT id FROM patient_ids WHERE email = 'susan.johnson@email.com'), 'spouse'),
((SELECT id FROM patient_ids WHERE email = 'mike.johnson@email.com'), 
 (SELECT id FROM patient_ids WHERE email = 'tommy.johnson@email.com'), 'parent'),
((SELECT id FROM patient_ids WHERE email = 'susan.johnson@email.com'), 
 (SELECT id FROM patient_ids WHERE email = 'tommy.johnson@email.com'), 'parent'),

-- Garcia Family
((SELECT id FROM patient_ids WHERE email = 'maria.garcia@email.com'), 
 (SELECT id FROM patient_ids WHERE email = 'carlos.garcia@email.com'), 'spouse'),

-- Brown Family
((SELECT id FROM patient_ids WHERE email = 'robert.brown@email.com'), 
 (SELECT id FROM patient_ids WHERE email = 'linda.brown@email.com'), 'spouse')

ON CONFLICT DO NOTHING;