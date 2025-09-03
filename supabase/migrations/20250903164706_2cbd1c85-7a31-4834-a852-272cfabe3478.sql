-- Insert Philippines-specific form templates and demo data

-- First, get clinic IDs to use in our demo data
INSERT INTO public.digital_forms (clinic_id, name, description, form_type, category, form_fields, requires_signature, template_data) VALUES

-- Medical History Form (PH Standard)
(
  (SELECT id FROM public.clinics LIMIT 1),
  'Patient Medical History Form',
  'Comprehensive medical history form compliant with Philippine health standards',
  'medical_history',
  'ph_template',
  '[
    {
      "id": "full_name",
      "type": "text",
      "label": "Full Name",
      "required": true,
      "placeholder": "Enter complete name"
    },
    {
      "id": "date_of_birth",
      "type": "date",
      "label": "Date of Birth",
      "required": true
    },
    {
      "id": "philhealth_number",
      "type": "text",
      "label": "PhilHealth Number",
      "required": false,
      "placeholder": "XX-XXXXXXXXX-X"
    },
    {
      "id": "blood_type",
      "type": "select",
      "label": "Blood Type",
      "required": false,
      "options": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"]
    },
    {
      "id": "allergies",
      "type": "textarea",
      "label": "Known Allergies (Medicine, Food, Others)",
      "required": false,
      "placeholder": "List any known allergies"
    },
    {
      "id": "current_medications",
      "type": "textarea",
      "label": "Current Medications",
      "required": false,
      "placeholder": "List all current medications"
    },
    {
      "id": "medical_conditions",
      "type": "textarea",
      "label": "Medical Conditions",
      "required": false,
      "placeholder": "Diabetes, Hypertension, Heart Disease, etc."
    },
    {
      "id": "emergency_contact",
      "type": "text",
      "label": "Emergency Contact Name",
      "required": true
    },
    {
      "id": "emergency_phone",
      "type": "phone",
      "label": "Emergency Contact Phone",
      "required": true
    },
    {
      "id": "pregnancy_status",
      "type": "radio",
      "label": "Are you currently pregnant or breastfeeding?",
      "required": true,
      "options": ["No", "Pregnant", "Breastfeeding"]
    }
  ]',
  true,
  '{"regulatory_compliance": ["RA 10173 (Data Privacy Act)", "DOH Guidelines"], "version": "PH-2025"}'
),

-- Consent to Treatment
(
  (SELECT id FROM public.clinics LIMIT 1),
  'Consent to Dental Treatment',
  'General consent form for dental procedures',
  'consent',
  'ph_template',
  '[
    {
      "id": "patient_name",
      "type": "text",
      "label": "Patient Name",
      "required": true
    },
    {
      "id": "procedure_consent",
      "type": "checkbox",
      "label": "I consent to the dental procedure(s) explained to me by my dentist",
      "required": true
    },
    {
      "id": "risks_explained",
      "type": "checkbox",
      "label": "The risks, benefits, and alternatives have been explained to me",
      "required": true
    },
    {
      "id": "financial_agreement",
      "type": "checkbox",
      "label": "I understand the financial responsibility for this treatment",
      "required": true
    },
    {
      "id": "date_signed",
      "type": "date",
      "label": "Date",
      "required": true
    }
  ]',
  true,
  '{"legal_requirements": ["Informed Consent"], "language": "English/Filipino"}'
),

-- Minor Consent Form
(
  (SELECT id FROM public.clinics LIMIT 1),
  'Minor Consent Form (Parent/Guardian)',
  'Consent form for treatment of patients under 18 years old',
  'consent',
  'ph_template',
  '[
    {
      "id": "minor_name",
      "type": "text",
      "label": "Minor Patient Name",
      "required": true
    },
    {
      "id": "minor_age",
      "type": "text",
      "label": "Age",
      "required": true
    },
    {
      "id": "guardian_name",
      "type": "text",
      "label": "Parent/Guardian Name",
      "required": true
    },
    {
      "id": "relationship",
      "type": "select",
      "label": "Relationship to Minor",
      "required": true,
      "options": ["Father", "Mother", "Legal Guardian", "Grandparent"]
    },
    {
      "id": "guardian_consent",
      "type": "checkbox",
      "label": "I give consent for dental treatment of the above-named minor",
      "required": true
    },
    {
      "id": "emergency_treatment",
      "type": "checkbox",
      "label": "I authorize emergency treatment if needed",
      "required": true
    }
  ]',
  true,
  '{"age_requirement": "Under 18", "legal_authority": "Parent/Guardian"}'
),

-- Data Privacy Consent (RA 10173)
(
  (SELECT id FROM public.clinics LIMIT 1),
  'Data Privacy Consent (RA 10173)',
  'Data Privacy Act compliance form',
  'consent',
  'regulatory',
  '[
    {
      "id": "data_subject_name",
      "type": "text",
      "label": "Data Subject Name",
      "required": true
    },
    {
      "id": "purpose_consent",
      "type": "checkbox",
      "label": "I consent to the collection and processing of my personal data for healthcare purposes",
      "required": true
    },
    {
      "id": "sharing_consent",
      "type": "checkbox",
      "label": "I consent to sharing my data with authorized healthcare providers and insurance companies",
      "required": false
    },
    {
      "id": "marketing_consent",
      "type": "checkbox",
      "label": "I consent to receiving promotional materials and health reminders",
      "required": false
    },
    {
      "id": "data_retention",
      "type": "checkbox",
      "label": "I understand my data will be retained as per clinic policy and legal requirements",
      "required": true
    }
  ]',
  true,
  '{"law_reference": "RA 10173", "compliance_date": "2025", "authority": "NPC"}'
),

-- Extraction Consent
(
  (SELECT id FROM public.clinics LIMIT 1),
  'Tooth Extraction Consent Form',
  'Specific consent for tooth extraction procedures',
  'consent',
  'ph_template',
  '[
    {
      "id": "tooth_number",
      "type": "text",
      "label": "Tooth Number(s) to be Extracted",
      "required": true
    },
    {
      "id": "extraction_reason",
      "type": "textarea",
      "label": "Reason for Extraction",
      "required": true
    },
    {
      "id": "complications_understood",
      "type": "checkbox",
      "label": "I understand possible complications (bleeding, infection, dry socket)",
      "required": true
    },
    {
      "id": "post_care_instructions",
      "type": "checkbox",
      "label": "I will follow all post-extraction care instructions",
      "required": true
    }
  ]',
  true,
  '{"procedure_type": "Extraction", "risk_level": "Medium"}'
);

-- Insert demo medical histories for patients
INSERT INTO public.medical_histories (
  patient_id, 
  clinic_id, 
  blood_type, 
  height, 
  weight, 
  allergies, 
  current_medications, 
  medical_conditions,
  philhealth_number,
  philhealth_category,
  emergency_contact_name,
  emergency_contact_phone,
  emergency_contact_relationship,
  is_pregnant,
  last_updated_by
) 
SELECT 
  p.id,
  p.clinic_id,
  (ARRAY['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'])[floor(random() * 8 + 1)],
  (ARRAY['5''2"', '5''4"', '5''6"', '5''8"', '5''10"', '6''0"'])[floor(random() * 6 + 1)],
  (ARRAY['50kg', '55kg', '60kg', '65kg', '70kg', '75kg'])[floor(random() * 6 + 1)],
  CASE 
    WHEN random() < 0.3 THEN ARRAY['Penicillin', 'Ibuprofen']
    WHEN random() < 0.6 THEN ARRAY['None known']
    ELSE ARRAY['Seafood', 'Peanuts']
  END,
  CASE 
    WHEN random() < 0.4 THEN ARRAY['Vitamin C', 'Multivitamins']
    WHEN random() < 0.7 THEN ARRAY['None']
    ELSE ARRAY['Amlodipine', 'Metformin']
  END,
  CASE 
    WHEN random() < 0.3 THEN ARRAY['Hypertension']
    WHEN random() < 0.6 THEN ARRAY['None']
    ELSE ARRAY['Diabetes Type 2']
  END,
  '12-' || LPAD(floor(random() * 100000000)::text, 8, '0') || '-' || floor(random() * 10)::text,
  (ARRAY['employed', 'self_employed', 'ofw', 'indigent'])[floor(random() * 4 + 1)],
  'Emergency Contact ' || p.full_name,
  '+639' || LPAD(floor(random() * 1000000000)::text, 9, '0'),
  (ARRAY['Spouse', 'Parent', 'Sibling', 'Child'])[floor(random() * 4 + 1)],
  CASE WHEN p.gender = 'Female' AND random() < 0.1 THEN true ELSE false END,
  (SELECT id FROM public.users WHERE role = 'dentist' LIMIT 1)
FROM public.patients p
WHERE p.clinic_id IS NOT NULL
LIMIT 10;

-- Insert demo insurance information
INSERT INTO public.patient_insurance (
  patient_id,
  clinic_id,
  provider_type,
  provider_name,
  policy_number,
  member_id,
  coverage_type,
  coverage_percentage,
  annual_limit,
  remaining_balance,
  is_active
)
SELECT 
  p.id,
  p.clinic_id,
  CASE 
    WHEN random() < 0.3 THEN 'philhealth'
    WHEN random() < 0.6 THEN 'hmo'
    ELSE 'self_pay'
  END,
  CASE 
    WHEN random() < 0.3 THEN 'PhilHealth'
    WHEN random() < 0.5 THEN 'Maxicare'
    WHEN random() < 0.7 THEN 'Intellicare'
    ELSE 'Self Pay'
  END,
  'POL-' || LPAD(floor(random() * 1000000)::text, 6, '0'),
  'MEM-' || LPAD(floor(random() * 10000000)::text, 7, '0'),
  CASE 
    WHEN random() < 0.5 THEN 'partial'
    ELSE 'full'
  END,
  CASE 
    WHEN random() < 0.3 THEN 70.00
    WHEN random() < 0.6 THEN 80.00
    ELSE 100.00
  END,
  50000.00,
  40000.00 + (random() * 10000),
  true
FROM public.patients p
WHERE p.clinic_id IS NOT NULL
LIMIT 10;

-- Generate demo invoices for 2025
INSERT INTO public.invoices (
  patient_id,
  clinic_id,
  appointment_id,
  invoice_number,
  invoice_type,
  subtotal,
  tax_amount,
  total_amount,
  amount_paid,
  balance_due,
  payment_method,
  payment_status,
  payment_date,
  treatments,
  issued_by
)
SELECT 
  a.patient_id,
  a.clinic_id,
  a.id,
  'INV-2025-' || LPAD(ROW_NUMBER() OVER ()::text, 6, '0'),
  'treatment',
  (1000 + random() * 5000)::DECIMAL(12,2),
  ((1000 + random() * 5000) * 0.12)::DECIMAL(12,2),
  ((1000 + random() * 5000) * 1.12)::DECIMAL(12,2),
  CASE 
    WHEN random() < 0.8 THEN ((1000 + random() * 5000) * 1.12)::DECIMAL(12,2)
    ELSE ((1000 + random() * 5000) * 0.5)::DECIMAL(12,2)
  END,
  CASE 
    WHEN random() < 0.8 THEN 0
    ELSE ((1000 + random() * 5000) * 0.62)::DECIMAL(12,2)
  END,
  (ARRAY['cash', 'card', 'gcash', 'paymaya', 'philhealth'])[floor(random() * 5 + 1)],
  CASE 
    WHEN random() < 0.8 THEN 'paid'
    ELSE 'pending'
  END,
  a.scheduled_time + INTERVAL '1 day',
  '[
    {
      "name": "' || (ARRAY['Dental Cleaning', 'Tooth Filling', 'Root Canal', 'Crown', 'Extraction'])[floor(random() * 5 + 1)] || '",
      "quantity": 1,
      "price": ' || (1000 + random() * 5000)::int || ',
      "total": ' || (1000 + random() * 5000)::int || '
    }
  ]',
  (SELECT id FROM public.users WHERE role IN ('dentist', 'clinic_admin') LIMIT 1)
FROM public.appointments a
WHERE a.scheduled_time >= '2025-01-01'
  AND a.scheduled_time < '2025-12-31'
  AND a.status = 'completed'
LIMIT 50;