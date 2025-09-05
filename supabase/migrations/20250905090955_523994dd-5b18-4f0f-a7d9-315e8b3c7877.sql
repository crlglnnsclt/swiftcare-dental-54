-- Add minimal sample data to test CRUD operations

-- Add inventory categories (should work)
INSERT INTO public.inventory_categories (name, description) VALUES
  ('Dental Instruments', 'Basic dental instruments and tools'),
  ('Consumables', 'Disposable items and consumables')
ON CONFLICT (id) DO NOTHING;

-- Insert sample appointments for the logged-in patient (should work based on schema)
INSERT INTO public.appointments (patient_id, scheduled_time, duration_minutes, status, booking_type, notes) VALUES
  ('42a6a14b-070d-4ec3-b17d-f12027ccabe5', '2025-09-06 10:00:00+00', 30, 'booked', 'online', 'Regular dental cleaning'),
  ('42a6a14b-070d-4ec3-b17d-f12027ccabe5', '2025-09-07 14:00:00+00', 45, 'booked', 'online', 'Tooth filling follow-up')
ON CONFLICT (id) DO NOTHING;

-- Create family relationships for testing family management
INSERT INTO public.family_members (primary_patient_id, secondary_patient_id, relationship) VALUES
  ('42a6a14b-070d-4ec3-b17d-f12027ccabe5', 'ea881146-c165-42f2-9275-b13d75d02d46', 'spouse')
ON CONFLICT (id) DO NOTHING;

-- Add a queue entry for the appointment
INSERT INTO public.queue (appointment_id, position, priority, status, estimated_wait_minutes)
SELECT 
  a.id,
  1,
  'scheduled',
  'waiting',
  15
FROM appointments a 
WHERE a.patient_id = '42a6a14b-070d-4ec3-b17d-f12027ccabe5'
AND a.scheduled_time > NOW()
LIMIT 1
ON CONFLICT (id) DO NOTHING;