-- Add sample data for testing CRUD operations

-- Insert sample treatments
INSERT INTO public.treatments (name, description, default_price, default_duration_minutes, category) VALUES
  ('Dental Cleaning', 'Regular dental cleaning and checkup', 100.00, 30, 'Preventive'),
  ('Tooth Filling', 'Composite tooth filling', 150.00, 45, 'Restorative'),
  ('Root Canal', 'Root canal treatment', 500.00, 90, 'Endodontic'),
  ('Tooth Extraction', 'Simple tooth extraction', 200.00, 30, 'Oral Surgery'),
  ('Dental Crown', 'Ceramic dental crown', 800.00, 60, 'Restorative')
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

-- Add some inventory items
INSERT INTO public.inventory_items (name, description, sku, unit_type, current_stock, minimum_stock, unit_cost, category_id) VALUES
  ('Disposable Gloves', 'Latex-free disposable gloves', 'GLV-001', 'box', 50, 10, 25.00, (SELECT id FROM inventory_categories WHERE name = 'Consumables' LIMIT 1)),
  ('Dental Mirror', 'Stainless steel dental mirror', 'MIR-001', 'piece', 20, 5, 15.00, (SELECT id FROM inventory_categories WHERE name = 'Dental Instruments' LIMIT 1)),
  ('Local Anesthetic', 'Lidocaine with epinephrine', 'ANE-001', 'vial', 30, 8, 12.50, (SELECT id FROM inventory_categories WHERE name = 'Medications' LIMIT 1))
ON CONFLICT (id) DO NOTHING;

-- Update updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to tables that need them
DROP TRIGGER IF EXISTS update_queue_updated_at ON public.queue;
CREATE TRIGGER update_queue_updated_at BEFORE UPDATE ON public.queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_treatments_updated_at ON public.treatments;
CREATE TRIGGER update_treatments_updated_at BEFORE UPDATE ON public.treatments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();