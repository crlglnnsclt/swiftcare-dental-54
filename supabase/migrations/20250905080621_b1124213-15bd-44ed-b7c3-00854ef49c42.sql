-- Re-enable all features and create comprehensive test setup
UPDATE feature_toggles SET is_enabled = true WHERE feature_name IN ('billing_system', 'dental_charts', 'appointment_booking', 'patient_portal');

-- Create test users for each role to verify sidebar filtering
INSERT INTO users (user_id, email, first_name, last_name, full_name, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'superadmin@test.com', 'Super', 'Admin', 'Super Admin', 'super_admin'),
  ('22222222-2222-2222-2222-222222222222', 'clinicadmin@test.com', 'Clinic', 'Admin', 'Clinic Admin', 'clinic_admin'),
  ('33333333-3333-3333-3333-333333333333', 'dentist@test.com', 'Dr', 'Smith', 'Dr Smith', 'dentist'),
  ('44444444-4444-4444-4444-444444444444', 'staff@test.com', 'Staff', 'Member', 'Staff Member', 'staff'),
  ('55555555-5555-5555-5555-555555555555', 'patient@test.com', 'John', 'Doe', 'John Doe', 'patient')
ON CONFLICT (email) DO UPDATE SET 
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name;