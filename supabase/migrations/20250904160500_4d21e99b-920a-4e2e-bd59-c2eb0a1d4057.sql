-- Insert sample data for testing (only if not exists)

-- Insert sample clinic
INSERT INTO public.clinics (id, clinic_name, address, phone_number, email, location_type)
VALUES (
  'c1234567-1234-1234-1234-123456789abc'::uuid,
  'SwiftCare Dental Main Clinic',
  '123 Medical Center Dr, Healthcare City, HC 12345',
  '+1 (555) 123-4567',
  'contact@swiftcaredental.com',
  'main'
) ON CONFLICT (id) DO NOTHING;

-- Insert sample treatments/services (with proper UUID format)
INSERT INTO public.treatments (id, name, default_duration_minutes, default_price, clinic_id, service_code)
VALUES 
  ('11111111-1111-1111-1111-111111111111'::uuid, 'General Consultation', 30, 100.00, 'c1234567-1234-1234-1234-123456789abc'::uuid, 'GEN_CONS'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'Dental Cleaning', 45, 150.00, 'c1234567-1234-1234-1234-123456789abc'::uuid, 'CLEANING'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'Tooth Extraction', 60, 200.00, 'c1234567-1234-1234-1234-123456789abc'::uuid, 'EXTRACTION'),
  ('44444444-4444-4444-4444-444444444444'::uuid, 'Dental Filling', 45, 175.00, 'c1234567-1234-1234-1234-123456789abc'::uuid, 'FILLING'),
  ('55555555-5555-5555-5555-555555555555'::uuid, 'Root Canal Treatment', 90, 800.00, 'c1234567-1234-1234-1234-123456789abc'::uuid, 'ROOT_CANAL')
ON CONFLICT (id) DO NOTHING;

-- Insert global treatments available to all clinics
INSERT INTO public.treatments (id, name, default_duration_minutes, default_price, is_global_template, created_by_super_admin, service_code, clinic_id)
VALUES 
  ('66666666-6666-6666-6666-666666666666'::uuid, 'Emergency Consultation', 30, 120.00, true, true, 'EMERGENCY', 'c1234567-1234-1234-1234-123456789abc'::uuid),
  ('77777777-7777-7777-7777-777777777777'::uuid, 'Teeth Whitening', 60, 300.00, true, true, 'WHITENING', 'c1234567-1234-1234-1234-123456789abc'::uuid),
  ('88888888-8888-8888-8888-888888888888'::uuid, 'Orthodontic Consultation', 45, 150.00, true, true, 'ORTHO_CONS', 'c1234567-1234-1234-1234-123456789abc'::uuid)
ON CONFLICT (id) DO NOTHING;