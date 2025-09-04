-- Create default feature toggles for SwiftCare Demo Clinic
INSERT INTO clinic_feature_toggles (clinic_id, feature_name, is_enabled, description) VALUES
('f71d51eb-5629-467c-b4a6-236aa20720bf', 'queue_management', true, 'Enable patient queue management system'),
('f71d51eb-5629-467c-b4a6-236aa20720bf', 'ai_queueing', false, 'AI-powered queue optimization and predictions'),
('f71d51eb-5629-467c-b4a6-236aa20720bf', 'teledentistry', false, 'Remote consultation and tele-dentistry features'),
('f71d51eb-5629-467c-b4a6-236aa20720bf', 'billing_integration', true, 'Integrated billing and payment processing'),
('f71d51eb-5629-467c-b4a6-236aa20720bf', 'inventory_management', true, 'Track and manage clinic inventory'),
('f71d51eb-5629-467c-b4a6-236aa20720bf', 'patient_portal', true, 'Patient self-service portal'),
('f71d51eb-5629-467c-b4a6-236aa20720bf', 'appointment_reminders', true, 'Automated appointment reminders'),
('f71d51eb-5629-467c-b4a6-236aa20720bf', 'digital_forms', true, 'Electronic signature and digital forms'),
('f71d51eb-5629-467c-b4a6-236aa20720bf', 'analytics_reporting', true, 'Advanced analytics and reporting'),
('f71d51eb-5629-467c-b4a6-236aa20720bf', 'multi_language', false, 'Multi-language support'),
('f71d51eb-5629-467c-b4a6-236aa20720bf', 'family_accounts', true, 'Family account management'),
('f71d51eb-5629-467c-b4a6-236aa20720bf', 'insurance_integration', false, 'Insurance claim processing');