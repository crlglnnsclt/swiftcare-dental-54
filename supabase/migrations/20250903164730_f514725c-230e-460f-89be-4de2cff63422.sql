-- Insert Philippines-specific digital form templates and demo data

-- First, let's insert the PH form templates
INSERT INTO public.digital_forms (clinic_id, name, description, form_type, category, form_fields, requires_signature, template_data) VALUES
-- Patient Medical History Form (Philippines Standard)
(
  (SELECT id FROM public.clinics LIMIT 1),
  'Patient Medical History Form (Philippines)',
  'Comprehensive medical history form compliant with Philippine healthcare standards',
  'medical_history',
  'ph_template',
  '[
    {"id": "full_name", "type": "text", "label": "Full Name", "required": true, "placeholder": "Enter full name"},
    {"id": "birth_date", "type": "date", "label": "Date of Birth", "required": true},
    {"id": "age", "type": "text", "label": "Age", "required": true, "placeholder": "Enter age"},
    {"id": "gender", "type": "select", "label": "Gender", "required": true, "options": ["Male", "Female"]},
    {"id": "civil_status", "type": "select", "label": "Civil Status", "required": true, "options": ["Single", "Married", "Divorced", "Widowed"]},
    {"id": "address", "type": "textarea", "label": "Complete Address", "required": true, "placeholder": "House No., Street, Barangay, City, Province"},
    {"id": "contact_number", "type": "text", "label": "Contact Number", "required": true, "placeholder": "+63"},
    {"id": "emergency_contact", "type": "text", "label": "Emergency Contact Name", "required": true},
    {"id": "emergency_contact_number", "type": "text", "label": "Emergency Contact Number", "required": true},
    {"id": "emergency_contact_relationship", "type": "select", "label": "Relationship", "required": true, "options": ["Spouse", "Parent", "Child", "Sibling", "Friend", "Other"]},
    {"id": "philhealth_number", "type": "text", "label": "PhilHealth Number", "required": false, "placeholder": "12-345678901-2"},
    {"id": "philhealth_category", "type": "select", "label": "PhilHealth Category", "required": false, "options": ["Employed", "Self-Employed", "OFW", "Indigent", "Senior Citizen", "PWD"]},
    {"id": "allergies", "type": "textarea", "label": "Known Allergies (medications, food, etc.)", "required": false, "placeholder": "List all known allergies"},
    {"id": "current_medications", "type": "textarea", "label": "Current Medications", "required": false, "placeholder": "List all current medications and dosages"},
    {"id": "medical_conditions", "type": "checkbox", "label": "Medical Conditions", "required": false, "options": ["Diabetes", "Hypertension", "Heart Disease", "Asthma", "Kidney Disease", "Liver Disease", "Cancer", "Epilepsy", "Mental Health Conditions", "None"]},
    {"id": "previous_surgeries", "type": "textarea", "label": "Previous Surgeries", "required": false, "placeholder": "List surgeries with dates"},
    {"id": "pregnancy_status", "type": "select", "label": "Are you currently pregnant?", "required": false, "options": ["N/A", "No", "Yes", "Possibly"]},
    {"id": "breastfeeding", "type": "select", "label": "Are you currently breastfeeding?", "required": false, "options": ["N/A", "No", "Yes"]},
    {"id": "smoking", "type": "select", "label": "Do you smoke?", "required": true, "options": ["No", "Yes - Occasionally", "Yes - Regularly"]},
    {"id": "alcohol", "type": "select", "label": "Do you drink alcohol?", "required": true, "options": ["No", "Yes - Occasionally", "Yes - Regularly"]},
    {"id": "dental_concerns", "type": "textarea", "label": "Current Dental Concerns", "required": false, "placeholder": "Describe any current dental problems or concerns"},
    {"id": "last_dental_visit", "type": "date", "label": "Last Dental Visit", "required": false},
    {"id": "previous_dental_work", "type": "checkbox", "label": "Previous Dental Work", "required": false, "options": ["Cleaning", "Filling", "Crown", "Bridge", "Dentures", "Root Canal", "Extraction", "Orthodontics", "Implants", "None"]}
  ]',
  true,
  '{"country": "Philippines", "language": "English", "regulatory_compliance": ["DOH", "PRC"], "version": "2025.1"}'
),

-- Consent to Treatment Form
(
  (SELECT id FROM public.clinics LIMIT 1),
  'Consent to Treatment Form',
  'General consent form for dental treatment procedures',
  'consent',
  'ph_template',
  '[
    {"id": "patient_name", "type": "text", "label": "Patient Name", "required": true},
    {"id": "treatment_description", "type": "textarea", "label": "Treatment/Procedure Description", "required": true},
    {"id": "risks_explained", "type": "checkbox", "label": "I acknowledge that the risks, benefits, and alternatives have been explained to me", "required": true},
    {"id": "questions_answered", "type": "checkbox", "label": "All my questions have been answered to my satisfaction", "required": true},
    {"id": "financial_responsibility", "type": "checkbox", "label": "I understand my financial responsibility for this treatment", "required": true},
    {"id": "consent_given", "type": "checkbox", "label": "I voluntarily consent to the proposed treatment", "required": true},
    {"id": "alternative_treatments", "type": "textarea", "label": "Alternative treatments discussed", "required": false},
    {"id": "post_treatment_care", "type": "checkbox", "label": "I understand the post-treatment care instructions", "required": true}
  ]',
  true,
  '{"type": "general_consent", "applicable_procedures": ["cleaning", "filling", "extraction", "minor_surgery"]}'
),

-- Minor Consent Form (Parent/Guardian)
(
  (SELECT id FROM public.clinics LIMIT 1),
  'Minor Consent Form (Parent/Guardian)',
  'Consent form for dental treatment of minors (under 18 years old)',
  'consent',
  'ph_template',
  '[
    {"id": "minor_name", "type": "text", "label": "Minor Patient Name", "required": true},
    {"id": "minor_age", "type": "text", "label": "Age of Minor", "required": true},
    {"id": "guardian_name", "type": "text", "label": "Parent/Guardian Name", "required": true},
    {"id": "relationship", "type": "select", "label": "Relationship to Minor", "required": true, "options": ["Mother", "Father", "Legal Guardian", "Grandparent"]},
    {"id": "guardian_id", "type": "text", "label": "Valid ID Type and Number", "required": true, "placeholder": "e.g., Drivers License #123456789"},
    {"id": "treatment_description", "type": "textarea", "label": "Treatment/Procedure Description", "required": true},
    {"id": "consent_authorization", "type": "checkbox", "label": "I authorize the treatment of the above-named minor", "required": true},
    {"id": "medical_history_complete", "type": "checkbox", "label": "I have provided complete and accurate medical history", "required": true},
    {"id": "emergency_treatment", "type": "checkbox", "label": "I authorize emergency treatment if necessary", "required": true},
    {"id": "financial_responsibility", "type": "checkbox", "label": "I accept financial responsibility for the treatment", "required": true}
  ]',
  true,
  '{"applicable_age": "under_18", "required_documents": ["valid_id", "birth_certificate"]}'
),

-- Data Privacy Consent (RA 10173 Compliance)
(
  (SELECT id FROM public.clinics LIMIT 1),
  'Data Privacy Consent Form (RA 10173)',
  'Data privacy consent form compliant with Republic Act 10173 (Data Privacy Act of 2012)',
  'consent',
  'regulatory',
  '[
    {"id": "data_subject_name", "type": "text", "label": "Data Subject Name", "required": true},
    {"id": "personal_data_collection", "type": "checkbox", "label": "I consent to the collection of my personal and sensitive personal data", "required": true},
    {"id": "data_processing_purpose", "type": "checkbox", "label": "I understand my data will be processed for healthcare and administrative purposes", "required": true},
    {"id": "data_sharing", "type": "checkbox", "label": "I consent to sharing my data with authorized healthcare providers and insurance companies", "required": false},
    {"id": "data_retention", "type": "checkbox", "label": "I understand my data will be retained as required by law and professional standards", "required": true},
    {"id": "rights_awareness", "type": "checkbox", "label": "I am aware of my rights under RA 10173 including access, correction, and deletion", "required": true},
    {"id": "withdraw_consent", "type": "checkbox", "label": "I understand I may withdraw this consent at any time", "required": true},
    {"id": "contact_dpo", "type": "checkbox", "label": "I know how to contact the Data Protection Officer for concerns", "required": true}
  ]',
  true,
  '{"law_reference": "RA_10173", "compliance_type": "data_privacy", "mandatory": true}'
);

-- Insert demo form responses with signatures for testing
-- We''ll create responses for existing patients across different months in 2025

-- Get clinic and patient IDs for demo data
DO $$
DECLARE
    clinic_record RECORD;
    patient_record RECORD;
    form_record RECORD;
    demo_months TEXT[] := ARRAY['2025-01-15', '2025-02-20', '2025-03-10', '2025-04-05', '2025-05-15', '2025-06-25', '2025-07-30', '2025-08-12', '2025-09-18', '2025-10-22', '2025-11-08', '2025-12-03'];
    month_date TEXT;
BEGIN
    -- Get first clinic
    SELECT * INTO clinic_record FROM public.clinics LIMIT 1;
    
    -- Get the medical history form
    SELECT * INTO form_record FROM public.digital_forms WHERE form_type = 'medical_history' LIMIT 1;
    
    -- Create responses for multiple patients
    FOR patient_record IN (SELECT * FROM public.patients WHERE clinic_id = clinic_record.id LIMIT 8)
    LOOP
        -- Select a random month for this patient
        month_date := demo_months[1 + (ABS(HASHTEXT(patient_record.id::TEXT)) % ARRAY_LENGTH(demo_months, 1))];
        
        -- Insert medical history response
        INSERT INTO public.form_responses (
            form_id, patient_id, clinic_id, responses, signature_data, signed_by, signed_at, ip_address, device_info, status
        ) VALUES (
            form_record.id,
            patient_record.id,
            clinic_record.id,
            jsonb_build_object(
                'full_name', patient_record.full_name,
                'contact_number', COALESCE(patient_record.contact_number, '+639123456789'),
                'address', COALESCE(patient_record.address, 'Metro Manila, Philippines'),
                'allergies', CASE (ABS(HASHTEXT(patient_record.id::TEXT)) % 4)
                    WHEN 0 THEN 'Penicillin, Shellfish'
                    WHEN 1 THEN 'None known'
                    WHEN 2 THEN 'Ibuprofen'
                    ELSE 'Latex, Nuts'
                END,
                'medical_conditions', ARRAY['None'],
                'philhealth_number', '12-' || LPAD((ABS(HASHTEXT(patient_record.id::TEXT)) % 999999999)::TEXT, 9, '0') || '-1',
                'philhealth_category', CASE (ABS(HASHTEXT(patient_record.id::TEXT)) % 3)
                    WHEN 0 THEN 'Employed'
                    WHEN 1 THEN 'Self-Employed'
                    ELSE 'OFW'
                END,
                'smoking', 'No',
                'alcohol', 'Yes - Occasionally',
                'dental_concerns', CASE (ABS(HASHTEXT(patient_record.id::TEXT)) % 3)
                    WHEN 0 THEN 'Regular cleaning and check-up'
                    WHEN 1 THEN 'Tooth sensitivity'
                    ELSE 'Teeth whitening inquiry'
                END
            ),
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', -- Demo signature
            (SELECT id FROM public.users WHERE clinic_id = clinic_record.id AND role IN ('dentist', 'staff') LIMIT 1),
            (month_date || ' 14:30:00')::TIMESTAMP WITH TIME ZONE,
            '192.168.1.100'::INET,
            'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
            'signed'
        );
    END LOOP;
END $$;

-- Insert demo patient insurance data
INSERT INTO public.patient_insurance (patient_id, clinic_id, provider_type, provider_name, policy_number, member_id, coverage_type, coverage_percentage, annual_limit)
SELECT 
    p.id,
    p.clinic_id,
    CASE (ABS(HASHTEXT(p.id::TEXT)) % 4)
        WHEN 0 THEN 'philhealth'
        WHEN 1 THEN 'hmo'
        WHEN 2 THEN 'hmo'
        ELSE 'self_pay'
    END,
    CASE (ABS(HASHTEXT(p.id::TEXT)) % 4)
        WHEN 0 THEN 'PhilHealth'
        WHEN 1 THEN 'Maxicare'
        WHEN 2 THEN 'Intellicare'
        ELSE NULL
    END,
    CASE WHEN (ABS(HASHTEXT(p.id::TEXT)) % 4) != 3 THEN 'POL-' || LPAD((ABS(HASHTEXT(p.id::TEXT)) % 9999999)::TEXT, 7, '0') ELSE NULL END,
    CASE WHEN (ABS(HASHTEXT(p.id::TEXT)) % 4) != 3 THEN 'MEM-' || LPAD((ABS(HASHTEXT(p.id::TEXT)) % 999999)::TEXT, 6, '0') ELSE NULL END,
    CASE (ABS(HASHTEXT(p.id::TEXT)) % 4)
        WHEN 0 THEN 'partial'
        WHEN 1 THEN 'dental_only'
        WHEN 2 THEN 'full'
        ELSE 'self_pay'
    END,
    CASE (ABS(HASHTEXT(p.id::TEXT)) % 4)
        WHEN 0 THEN 50.00
        WHEN 1 THEN 80.00
        WHEN 2 THEN 100.00
        ELSE NULL
    END,
    CASE (ABS(HASHTEXT(p.id::TEXT)) % 4)
        WHEN 0 THEN 50000.00
        WHEN 1 THEN 30000.00
        WHEN 2 THEN 100000.00
        ELSE NULL
    END
FROM public.patients p
WHERE p.clinic_id = (SELECT id FROM public.clinics LIMIT 1)
LIMIT 10;

-- Insert demo medical histories
INSERT INTO public.medical_histories (patient_id, clinic_id, blood_type, allergies, current_medications, medical_conditions, philhealth_number, philhealth_category, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship)
SELECT 
    p.id,
    p.clinic_id,
    CASE (ABS(HASHTEXT(p.id::TEXT)) % 8)
        WHEN 0 THEN 'O+'
        WHEN 1 THEN 'A+'
        WHEN 2 THEN 'B+'
        WHEN 3 THEN 'AB+'
        WHEN 4 THEN 'O-'
        WHEN 5 THEN 'A-'
        WHEN 6 THEN 'B-'
        ELSE 'AB-'
    END,
    CASE (ABS(HASHTEXT(p.id::TEXT)) % 4)
        WHEN 0 THEN ARRAY['Penicillin', 'Shellfish']
        WHEN 1 THEN ARRAY[]::TEXT[]
        WHEN 2 THEN ARRAY['Ibuprofen']
        ELSE ARRAY['Latex', 'Nuts']
    END,
    CASE (ABS(HASHTEXT(p.id::TEXT)) % 3)
        WHEN 0 THEN ARRAY[]::TEXT[]
        WHEN 1 THEN ARRAY['Vitamin D', 'Multivitamins']
        ELSE ARRAY['Losartan 50mg', 'Metformin 500mg']
    END,
    CASE (ABS(HASHTEXT(p.id::TEXT)) % 3)
        WHEN 0 THEN ARRAY[]::TEXT[]
        WHEN 1 THEN ARRAY['Hypertension']
        ELSE ARRAY['Diabetes Type 2', 'Hypertension']
    END,
    '12-' || LPAD((ABS(HASHTEXT(p.id::TEXT)) % 999999999)::TEXT, 9, '0') || '-1',
    CASE (ABS(HASHTEXT(p.id::TEXT)) % 3)
        WHEN 0 THEN 'employed'
        WHEN 1 THEN 'self_employed'
        ELSE 'ofw'
    END,
    'Emergency Contact ' || (ABS(HASHTEXT(p.id::TEXT)) % 100),
    '+639' || LPAD((ABS(HASHTEXT(p.id::TEXT)) % 999999999)::TEXT, 9, '0'),
    'Spouse'
FROM public.patients p
WHERE p.clinic_id = (SELECT id FROM public.clinics LIMIT 1)
LIMIT 10;