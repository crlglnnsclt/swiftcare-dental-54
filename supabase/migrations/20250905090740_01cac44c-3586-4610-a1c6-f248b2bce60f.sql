-- Fix CRUD operations by adding sample data with correct clinic references

-- First, get or create a default clinic
INSERT INTO public.clinics (clinic_name, email, phone_number) VALUES
  ('SwiftCare Dental Clinic', 'info@swiftcare.dental', '+63-2-123-4567')
ON CONFLICT (id) DO NOTHING;

-- Insert sample treatments with clinic_id
INSERT INTO public.treatments (name, default_price, default_duration_minutes, clinic_id) 
SELECT 
  'Dental Cleaning', 100.00, 30, c.id
FROM clinics c 
WHERE c.clinic_name = 'SwiftCare Dental Clinic'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.treatments (name, default_price, default_duration_minutes, clinic_id) 
SELECT 
  'Tooth Filling', 150.00, 45, c.id
FROM clinics c 
WHERE c.clinic_name = 'SwiftCare Dental Clinic'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.treatments (name, default_price, default_duration_minutes, clinic_id) 
SELECT 
  'Root Canal', 500.00, 90, c.id
FROM clinics c 
WHERE c.clinic_name = 'SwiftCare Dental Clinic'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Insert sample communication templates (these don't need clinic_id based on schema)
INSERT INTO public.communication_templates (name, template_type, subject, content) VALUES
  ('Appointment Reminder', 'reminder', 'Appointment Reminder - SwiftCare Dental', 'Dear {patient_name}, this is a reminder for your dental appointment on {appointment_date} at {appointment_time}. Please arrive 15 minutes early.'),
  ('Welcome Message', 'welcome', 'Welcome to SwiftCare Dental!', 'Dear {patient_name}, welcome to SwiftCare Dental! We are excited to provide you with excellent dental care.')
ON CONFLICT (id) DO NOTHING;

-- Insert sample appointments for the logged-in patient
INSERT INTO public.appointments (patient_id, scheduled_time, duration_minutes, status, booking_type, notes) VALUES
  ('42a6a14b-070d-4ec3-b17d-f12027ccabe5', '2025-09-06 10:00:00+00', 30, 'booked', 'online', 'Regular dental cleaning'),
  ('42a6a14b-070d-4ec3-b17d-f12027ccabe5', '2025-09-07 14:00:00+00', 45, 'booked', 'online', 'Tooth filling follow-up')
ON CONFLICT (id) DO NOTHING;