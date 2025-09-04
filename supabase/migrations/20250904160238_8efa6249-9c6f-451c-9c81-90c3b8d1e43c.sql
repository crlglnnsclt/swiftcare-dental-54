-- Insert sample data for testing with correct column structure

-- Insert sample clinic (if not exists)
INSERT INTO public.clinics (id, clinic_name, address, phone_number, email, location_type)
VALUES (
  'c1234567-1234-1234-1234-123456789abc',
  'SwiftCare Dental Main Clinic',
  '123 Medical Center Dr, Healthcare City, HC 12345',
  '+1 (555) 123-4567',
  'contact@swiftcaredental.com',
  'main'
) ON CONFLICT (id) DO NOTHING;

-- Insert sample treatments/services with correct columns
INSERT INTO public.treatments (id, name, default_duration_minutes, default_price, clinic_id, service_code)
VALUES 
  ('t1111111-1111-1111-1111-111111111111', 'General Consultation', 30, 100.00, 'c1234567-1234-1234-1234-123456789abc', 'GEN_CONS'),
  ('t2222222-2222-2222-2222-222222222222', 'Dental Cleaning', 45, 150.00, 'c1234567-1234-1234-1234-123456789abc', 'CLEANING'),
  ('t3333333-3333-3333-3333-333333333333', 'Tooth Extraction', 60, 200.00, 'c1234567-1234-1234-1234-123456789abc', 'EXTRACTION'),
  ('t4444444-4444-4444-4444-444444444444', 'Dental Filling', 45, 175.00, 'c1234567-1234-1234-1234-123456789abc', 'FILLING'),
  ('t5555555-5555-5555-5555-555555555555', 'Root Canal Treatment', 90, 800.00, 'c1234567-1234-1234-1234-123456789abc', 'ROOT_CANAL')
ON CONFLICT (id) DO NOTHING;

-- Insert global treatments available to all clinics
INSERT INTO public.treatments (id, name, default_duration_minutes, default_price, clinic_id, is_global_template, created_by_super_admin, service_code)
VALUES 
  ('tg111111-1111-1111-1111-111111111111', 'Emergency Consultation', 30, 120.00, 'c1234567-1234-1234-1234-123456789abc', true, true, 'EMERGENCY'),
  ('tg222222-2222-2222-2222-222222222222', 'Teeth Whitening', 60, 300.00, 'c1234567-1234-1234-1234-123456789abc', true, true, 'WHITENING'),
  ('tg333333-3333-3333-3333-333333333333', 'Orthodontic Consultation', 45, 150.00, 'c1234567-1234-1234-1234-123456789abc', true, true, 'ORTHO_CONS')
ON CONFLICT (id) DO NOTHING;