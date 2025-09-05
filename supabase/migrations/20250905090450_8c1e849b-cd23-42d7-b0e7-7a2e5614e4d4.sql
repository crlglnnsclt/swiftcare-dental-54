-- Add basic sample data using minimal column sets

-- Insert sample treatments (minimal columns)
INSERT INTO public.treatments (name, default_price, default_duration_minutes) VALUES
  ('Dental Cleaning', 100.00, 30),
  ('Tooth Filling', 150.00, 45),
  ('Root Canal', 500.00, 90),
  ('Tooth Extraction', 200.00, 30),
  ('Dental Crown', 800.00, 60)
ON CONFLICT (id) DO NOTHING;

-- Insert sample communication templates
INSERT INTO public.communication_templates (name, template_type, subject, content) VALUES
  ('Appointment Reminder', 'reminder', 'Appointment Reminder - SwiftCare Dental', 'Dear patient, this is a reminder for your dental appointment. Please arrive 15 minutes early.'),
  ('Welcome Message', 'welcome', 'Welcome to SwiftCare Dental!', 'Dear patient, welcome to SwiftCare Dental! We are excited to provide you with excellent dental care.'),
  ('Follow-up Message', 'followup', 'Thank you for visiting SwiftCare Dental', 'Dear patient, thank you for your visit. If you have any questions, please contact us.')
ON CONFLICT (id) DO NOTHING;

-- Add inventory categories (minimal)
INSERT INTO public.inventory_categories (name) VALUES
  ('Dental Instruments'),
  ('Consumables'),
  ('Medications'),
  ('Equipment')
ON CONFLICT (id) DO NOTHING;