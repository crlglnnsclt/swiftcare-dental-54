-- SwiftCare Dental Demo Data Setup - Part 1: Essential Data
-- Create demo data that works with existing auth constraints

-- Create treatments/services for appointments
INSERT INTO public.treatments (name, description, duration_minutes, base_price) VALUES 
('Routine Cleaning', 'Professional dental cleaning and examination', 60, 120.00),
('Tooth Filling', 'Composite resin filling for cavity restoration', 45, 180.00),
('Root Canal', 'Endodontic treatment for infected tooth', 90, 800.00),
('Crown Placement', 'Dental crown installation', 75, 1200.00),
('Tooth Extraction', 'Surgical tooth removal', 30, 200.00),
('Whitening Treatment', 'Professional teeth whitening procedure', 45, 300.00),
('Dental Implant', 'Titanium implant placement', 120, 2500.00),
('Orthodontic Consultation', 'Initial consultation for braces/aligners', 30, 150.00),
('Emergency Visit', 'Emergency dental care', 45, 250.00),
('Periodontal Treatment', 'Deep cleaning for gum disease', 90, 400.00);

-- Create inventory categories
INSERT INTO public.inventory_categories (name, description) VALUES 
('Dental Supplies', 'Basic dental consumables and materials'),
('Equipment', 'Dental tools and machinery'),
('Pharmaceuticals', 'Medications and anesthetics'),
('Office Supplies', 'Administrative and office materials'),
('Safety Equipment', 'PPE and safety gear');

-- Create inventory items
INSERT INTO public.inventory_items (category_id, name, description, sku, current_stock, minimum_stock, unit_cost, unit_type) VALUES 
((SELECT id FROM inventory_categories WHERE name = 'Dental Supplies'), 'Disposable Gloves', 'Nitrile examination gloves', 'GLV-001', 500, 100, 0.25, 'pairs'),
((SELECT id FROM inventory_categories WHERE name = 'Dental Supplies'), 'Dental Masks', 'Surgical face masks', 'MSK-001', 200, 50, 0.15, 'pieces'),
((SELECT id FROM inventory_categories WHERE name = 'Dental Supplies'), 'Composite Resin', 'Universal composite filling material', 'RES-001', 25, 5, 85.00, 'tubes'),
((SELECT id FROM inventory_categories WHERE name = 'Dental Supplies'), 'Anesthetic Cartridges', 'Local anesthetic for procedures', 'ANE-001', 100, 20, 2.50, 'cartridges'),
((SELECT id FROM inventory_categories WHERE name = 'Equipment'), 'Dental Mirrors', 'Stainless steel examination mirrors', 'MIR-001', 50, 10, 8.00, 'pieces'),
((SELECT id FROM inventory_categories WHERE name = 'Equipment'), 'Dental Probes', 'Periodontal examination probes', 'PRB-001', 30, 5, 12.00, 'pieces'),
((SELECT id FROM inventory_categories WHERE name = 'Pharmaceuticals'), 'Fluoride Gel', 'Professional fluoride treatment gel', 'FLU-001', 15, 3, 25.00, 'tubes'),
((SELECT id FROM inventory_categories WHERE name = 'Office Supplies'), 'Patient Forms', 'Medical history intake forms', 'FRM-001', 1000, 200, 0.05, 'sheets'),
((SELECT id FROM inventory_categories WHERE name = 'Safety Equipment'), 'Safety Glasses', 'Protective eyewear', 'SAF-001', 20, 5, 15.00, 'pieces'),
((SELECT id FROM inventory_categories WHERE name = 'Dental Supplies'), 'Dental Cement', 'Temporary filling cement', 'CEM-001', 12, 3, 45.00, 'packets');

-- Create digital forms templates
INSERT INTO public.digital_forms (name, description, form_type, category, form_fields, is_active) VALUES 
('Patient Intake Form', 'Initial patient registration and medical history', 'intake', 'patient_intake', 
'[
  {"name": "full_name", "type": "text", "required": true, "label": "Full Name"},
  {"name": "date_of_birth", "type": "date", "required": true, "label": "Date of Birth"},
  {"name": "phone", "type": "tel", "required": true, "label": "Phone Number"},
  {"name": "email", "type": "email", "required": true, "label": "Email Address"},
  {"name": "address", "type": "textarea", "required": true, "label": "Home Address"},
  {"name": "emergency_contact", "type": "text", "required": true, "label": "Emergency Contact Name"},
  {"name": "emergency_phone", "type": "tel", "required": true, "label": "Emergency Contact Phone"},
  {"name": "insurance_provider", "type": "text", "required": false, "label": "Insurance Provider"},
  {"name": "insurance_policy", "type": "text", "required": false, "label": "Insurance Policy Number"}
]', true),

('Medical History Form', 'Comprehensive medical and dental history', 'medical_history', 'patient_forms',
'[
  {"name": "allergies", "type": "textarea", "required": false, "label": "Known Allergies"},
  {"name": "medications", "type": "textarea", "required": false, "label": "Current Medications"},
  {"name": "medical_conditions", "type": "textarea", "required": false, "label": "Medical Conditions"},
  {"name": "previous_surgeries", "type": "textarea", "required": false, "label": "Previous Surgeries"},
  {"name": "dental_concerns", "type": "textarea", "required": false, "label": "Current Dental Concerns"},
  {"name": "last_dental_visit", "type": "date", "required": false, "label": "Last Dental Visit"},
  {"name": "pregnancy", "type": "radio", "required": false, "label": "Are you pregnant?", "options": ["Yes", "No", "Prefer not to answer"]},
  {"name": "smoking", "type": "radio", "required": false, "label": "Do you smoke?", "options": ["Yes", "No", "Occasionally"]}
]', true),

('Consent Form', 'Treatment consent and authorization', 'consent', 'patient_forms',
'[
  {"name": "treatment_consent", "type": "checkbox", "required": true, "label": "I consent to the proposed treatment"},
  {"name": "financial_consent", "type": "checkbox", "required": true, "label": "I understand the financial obligations"},
  {"name": "emergency_consent", "type": "checkbox", "required": true, "label": "I consent to emergency treatment if needed"},
  {"name": "signature_date", "type": "date", "required": true, "label": "Date of Signature"}
]', true),

('Post-Treatment Instructions', 'Care instructions after dental procedures', 'instructions', 'treatment_forms',
'[
  {"name": "procedure_performed", "type": "text", "required": true, "label": "Procedure Performed"},
  {"name": "special_instructions", "type": "textarea", "required": false, "label": "Special Care Instructions"},
  {"name": "medications_prescribed", "type": "textarea", "required": false, "label": "Medications Prescribed"},
  {"name": "follow_up_needed", "type": "radio", "required": true, "label": "Follow-up appointment needed?", "options": ["Yes", "No"]},
  {"name": "follow_up_date", "type": "date", "required": false, "label": "Recommended Follow-up Date"}
]', true);

-- Create communication templates
INSERT INTO public.communication_templates (name, template_type, subject, content, is_active) VALUES 
('Appointment Reminder', 'reminder', 'Appointment Reminder - SwiftCare Dental', 
'Dear {{patient_name}},

This is a friendly reminder that you have an appointment scheduled with {{dentist_name}} on {{appointment_date}} at {{appointment_time}}.

Please arrive 15 minutes early for check-in. If you need to reschedule, please call us at least 24 hours in advance.

Best regards,
SwiftCare Dental Team', true),

('Appointment Confirmation', 'confirmation', 'Appointment Confirmed - SwiftCare Dental',
'Dear {{patient_name}},

Your appointment has been confirmed for {{appointment_date}} at {{appointment_time}} with {{dentist_name}}.

Procedure: {{treatment_name}}
Estimated Duration: {{duration}} minutes

Please bring your insurance card and arrive 15 minutes early.

Thank you for choosing SwiftCare Dental!', true),

('Payment Receipt', 'receipt', 'Payment Receipt - SwiftCare Dental',
'Dear {{patient_name}},

Thank you for your payment. Here are the details:

Payment Amount: ${{amount}}
Payment Method: {{payment_method}}
Date: {{payment_date}}
Treatment: {{treatment_name}}

Your receipt number is: {{receipt_number}}

If you have any questions, please contact our billing department.

Best regards,
SwiftCare Dental', true);

-- Create clinic configuration
INSERT INTO public.clinic_config (clinic_name, email, phone_number, address, welcome_message, primary_color, secondary_color) VALUES 
('SwiftCare Dental Clinic', 'info@swiftcare.com', '+1-555-SWIFT', '123 Main Street, Dental City, DC 12345', 
'Welcome to SwiftCare Dental - Your Smile is Our Priority!', '#2563eb', '#10b981')
ON CONFLICT (id) DO UPDATE SET
clinic_name = EXCLUDED.clinic_name,
email = EXCLUDED.email,
phone_number = EXCLUDED.phone_number,
address = EXCLUDED.address,
welcome_message = EXCLUDED.welcome_message,
primary_color = EXCLUDED.primary_color,
secondary_color = EXCLUDED.secondary_color;