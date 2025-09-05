-- Add sample data with correct column names

-- Insert sample treatments (using only existing columns)
INSERT INTO public.treatments (name, default_price, default_duration_minutes, category) VALUES
  ('Dental Cleaning', 100.00, 30, 'Preventive'),
  ('Tooth Filling', 150.00, 45, 'Restorative'),
  ('Root Canal', 500.00, 90, 'Endodontic'),
  ('Tooth Extraction', 200.00, 30, 'Oral Surgery'),
  ('Dental Crown', 800.00, 60, 'Restorative')
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