-- Add sample data without clinic dependencies to test CRUD operations

-- Insert sample communication templates (these work independently)
INSERT INTO public.communication_templates (name, template_type, subject, content) VALUES
  ('Appointment Reminder', 'reminder', 'Appointment Reminder - SwiftCare Dental', 'Dear {patient_name}, this is a reminder for your dental appointment on {appointment_date} at {appointment_time}. Please arrive 15 minutes early.'),
  ('Welcome Message', 'welcome', 'Welcome to SwiftCare Dental!', 'Dear {patient_name}, welcome to SwiftCare Dental! We are excited to provide you with excellent dental care.')
ON CONFLICT (id) DO NOTHING;

-- Add inventory categories
INSERT INTO public.inventory_categories (name, description) VALUES
  ('Dental Instruments', 'Basic dental instruments and tools'),
  ('Consumables', 'Disposable items and consumables'),
  ('Medications', 'Dental medications and anesthetics')
ON CONFLICT (id) DO NOTHING;

-- Insert sample appointments for the logged-in patient (appointments table should work)
INSERT INTO public.appointments (patient_id, scheduled_time, duration_minutes, status, booking_type, notes) VALUES
  ('42a6a14b-070d-4ec3-b17d-f12027ccabe5', '2025-09-06 10:00:00+00', 30, 'booked', 'online', 'Regular dental cleaning'),
  ('42a6a14b-070d-4ec3-b17d-f12027ccabe5', '2025-09-07 14:00:00+00', 45, 'booked', 'online', 'Tooth filling follow-up')
ON CONFLICT (id) DO NOTHING;

-- Create some family relationships for testing
INSERT INTO public.family_members (primary_patient_id, secondary_patient_id, relationship) VALUES
  ('42a6a14b-070d-4ec3-b17d-f12027ccabe5', 'ea881146-c165-42f2-9275-b13d75d02d46', 'spouse')
ON CONFLICT (id) DO NOTHING;