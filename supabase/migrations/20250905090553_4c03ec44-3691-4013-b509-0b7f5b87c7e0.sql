-- Fix CRUD operations by adding sample data with correct structure

-- Insert sample treatments with only existing columns
INSERT INTO public.treatments (name, default_price, default_duration_minutes) VALUES
  ('Dental Cleaning', 100.00, 30),
  ('Tooth Filling', 150.00, 45),
  ('Root Canal', 500.00, 90),
  ('Tooth Extraction', 200.00, 30),
  ('Dental Crown', 800.00, 60)
ON CONFLICT (id) DO NOTHING;

-- Insert sample communication templates
INSERT INTO public.communication_templates (name, template_type, subject, content) VALUES
  ('Appointment Reminder', 'reminder', 'Appointment Reminder - SwiftCare Dental', 'Dear {patient_name}, this is a reminder for your dental appointment on {appointment_date} at {appointment_time}. Please arrive 15 minutes early.'),
  ('Welcome Message', 'welcome', 'Welcome to SwiftCare Dental!', 'Dear {patient_name}, welcome to SwiftCare Dental! We are excited to provide you with excellent dental care.'),
  ('Follow-up Message', 'followup', 'Thank you for visiting SwiftCare Dental', 'Dear {patient_name}, thank you for your visit. If you have any questions or concerns, please don''t hesitate to contact us.')
ON CONFLICT (id) DO NOTHING;

-- Add inventory categories
INSERT INTO public.inventory_categories (name, description) VALUES
  ('Dental Instruments', 'Basic dental instruments and tools'),
  ('Consumables', 'Disposable items and consumables'),
  ('Medications', 'Dental medications and anesthetics'),
  ('Equipment', 'Dental equipment and machinery')
ON CONFLICT (id) DO NOTHING;

-- Insert some sample appointments for the logged-in patient
INSERT INTO public.appointments (patient_id, scheduled_time, duration_minutes, status, booking_type, notes) VALUES
  ('42a6a14b-070d-4ec3-b17d-f12027ccabe5', '2025-09-06 10:00:00+00', 30, 'booked', 'online', 'Regular dental cleaning'),
  ('42a6a14b-070d-4ec3-b17d-f12027ccabe5', '2025-09-07 14:00:00+00', 45, 'booked', 'online', 'Tooth filling follow-up'),
  ('ea881146-c165-42f2-9275-b13d75d02d46', '2025-09-08 09:00:00+00', 90, 'booked', 'online', 'Root canal treatment')
ON CONFLICT (id) DO NOTHING;

-- Add some queue entries for testing
INSERT INTO public.queue (appointment_id, position, priority, status, estimated_wait_minutes)
SELECT 
  a.id,
  1,
  'scheduled',
  'waiting',
  15
FROM appointments a 
WHERE a.scheduled_time::date = CURRENT_DATE
LIMIT 1
ON CONFLICT (id) DO NOTHING;