-- Add missing features to the feature_toggles table
INSERT INTO feature_toggles (feature_name, is_enabled, description) VALUES
  ('billing_system', true, 'Billing and invoicing system'),
  ('payment_processing', true, 'Payment processing and tracking'),
  ('patient_records', true, 'Patient records and management'),
  ('digital_forms', true, 'Digital forms and e-signatures'),
  ('document_management', true, 'Document upload and management'),
  ('dental_charts', true, 'Dental charts and odontograms'),
  ('inventory_management', true, 'Inventory and supply management'),
  ('user_management', true, 'User and staff management'),
  ('patient_portal', true, 'Patient self-service portal'),
  ('family_accounts', true, 'Family account management'),
  ('insurance_management', true, 'Insurance and HMO management'),
  ('appointment_settings', true, 'Appointment configuration settings'),
  ('patient_engagement', true, 'Patient communication and engagement')
ON CONFLICT (feature_name) DO UPDATE SET
  is_enabled = EXCLUDED.is_enabled,
  description = EXCLUDED.description;