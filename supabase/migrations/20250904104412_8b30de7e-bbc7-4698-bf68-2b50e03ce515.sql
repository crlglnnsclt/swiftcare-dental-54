-- Create sample dentist users for testing
INSERT INTO public.users (user_id, full_name, email, role, clinic_id, status) VALUES
  (gen_random_uuid(), 'Dr. Sarah Johnson', 'sarah.johnson@clinic.com', 'dentist', (SELECT id FROM clinics LIMIT 1), 'active'),
  (gen_random_uuid(), 'Dr. Michael Chen', 'michael.chen@clinic.com', 'dentist', (SELECT id FROM clinics LIMIT 1), 'active'),
  (gen_random_uuid(), 'Dr. Emily Rodriguez', 'emily.rodriguez@clinic.com', 'dentist', (SELECT id FROM clinics LIMIT 1), 'active'),
  (gen_random_uuid(), 'Dr. James Wilson', 'james.wilson@clinic.com', 'dentist', (SELECT id FROM clinics LIMIT 1), 'active')
ON CONFLICT (email) DO NOTHING;