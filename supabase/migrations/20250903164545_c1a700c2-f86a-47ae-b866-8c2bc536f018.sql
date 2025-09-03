-- Create comprehensive paperless system for SwiftCare Dental Management

-- Digital Forms Templates Table
CREATE TABLE IF NOT EXISTS public.digital_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinics(id),
  name TEXT NOT NULL,
  description TEXT,
  form_type TEXT NOT NULL, -- 'medical_history', 'consent', 'insurance', 'custom'
  category TEXT NOT NULL, -- 'ph_template', 'custom', 'regulatory'
  form_fields JSONB NOT NULL DEFAULT '[]',
  requires_signature BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  template_data JSONB DEFAULT '{}', -- For storing PH-specific template data
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Form Responses Table
CREATE TABLE IF NOT EXISTS public.form_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID REFERENCES public.digital_forms(id),
  patient_id UUID REFERENCES public.patients(id),
  clinic_id UUID NOT NULL,
  responses JSONB NOT NULL DEFAULT '{}',
  signature_data TEXT, -- Base64 signature
  signed_by UUID REFERENCES public.users(id),
  signed_at TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  device_info TEXT,
  status TEXT DEFAULT 'draft', -- 'draft', 'submitted', 'signed', 'archived'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Patient Documents Table (Enhanced)
CREATE TABLE IF NOT EXISTS public.patient_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id),
  clinic_id UUID NOT NULL,
  document_type TEXT NOT NULL, -- 'form', 'invoice', 'receipt', 'insurance', 'xray', 'scan', 'other'
  document_category TEXT, -- 'medical_history', 'consent', 'insurance_card', 'receipt', etc.
  file_name TEXT NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  mime_type TEXT,
  form_response_id UUID REFERENCES public.form_responses(id), -- Link to form if applicable
  appointment_id UUID REFERENCES public.appointments(id), -- Link to appointment if applicable
  uploaded_by UUID REFERENCES public.users(id),
  is_signed BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}', -- Additional document metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Medical History Table (PH Standard)
CREATE TABLE IF NOT EXISTS public.medical_histories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) UNIQUE,
  clinic_id UUID NOT NULL,
  
  -- Basic Information
  blood_type TEXT,
  height TEXT,
  weight TEXT,
  
  -- Philippine Standard Medical History Fields
  allergies TEXT[],
  current_medications TEXT[],
  medical_conditions TEXT[],
  previous_surgeries TEXT[],
  family_medical_history TEXT[],
  
  -- Dental Specific
  previous_dental_work TEXT[],
  dental_concerns TEXT,
  last_dental_visit DATE,
  
  -- Philippine Regulatory Requirements
  philhealth_number TEXT,
  philhealth_category TEXT, -- 'employed', 'self_employed', 'ofw', 'indigent', etc.
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  
  -- Special Considerations
  is_pregnant BOOLEAN DEFAULT false,
  pregnancy_details TEXT,
  is_breastfeeding BOOLEAN DEFAULT false,
  is_minor BOOLEAN DEFAULT false,
  guardian_name TEXT,
  guardian_relationship TEXT,
  
  -- Audit Trail
  last_updated_by UUID REFERENCES public.users(id),
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insurance Information Table
CREATE TABLE IF NOT EXISTS public.patient_insurance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id),
  clinic_id UUID NOT NULL,
  
  -- Insurance Provider Information
  provider_type TEXT NOT NULL, -- 'philhealth', 'hmo', 'private', 'self_pay'
  provider_name TEXT, -- 'PhilHealth', 'Maxicare', 'Intellicare', etc.
  policy_number TEXT,
  member_id TEXT,
  
  -- Coverage Details
  coverage_type TEXT, -- 'full', 'partial', 'dental_only'
  coverage_percentage DECIMAL(5,2),
  annual_limit DECIMAL(12,2),
  remaining_balance DECIMAL(12,2),
  
  -- Card Information
  card_image_url TEXT,
  card_expiry DATE,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES public.users(id),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Invoices and Receipts Table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id),
  clinic_id UUID NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id),
  
  -- Invoice Details
  invoice_number TEXT UNIQUE NOT NULL,
  invoice_type TEXT DEFAULT 'treatment', -- 'treatment', 'consultation', 'procedure'
  
  -- Financial Information (PHP)
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  insurance_coverage DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0,
  balance_due DECIMAL(12,2) NOT NULL DEFAULT 0,
  
  -- Payment Information
  payment_method TEXT, -- 'cash', 'card', 'gcash', 'paymaya', 'bank_transfer', 'philhealth'
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'partial', 'paid', 'overdue'
  payment_date TIMESTAMP WITH TIME ZONE,
  
  -- Treatment Details
  treatments JSONB DEFAULT '[]', -- Array of treatment items
  
  -- Insurance Claims
  insurance_claim_status TEXT, -- 'none', 'submitted', 'approved', 'denied', 'processing'
  insurance_claim_amount DECIMAL(12,2),
  
  -- Document
  pdf_url TEXT,
  
  -- Audit
  issued_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.digital_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Digital Forms
CREATE POLICY "Clinic staff can manage digital forms" ON public.digital_forms
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.user_id = auth.uid() 
    AND users.clinic_id = digital_forms.clinic_id 
    AND users.role IN ('clinic_admin', 'dentist', 'staff', 'receptionist')
  )
);

CREATE POLICY "Super admins can view all digital forms" ON public.digital_forms
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.user_id = auth.uid() 
    AND users.role = 'super_admin'
  )
);

-- RLS Policies for Form Responses
CREATE POLICY "Clinic staff can manage form responses" ON public.form_responses
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.user_id = auth.uid() 
    AND users.clinic_id = form_responses.clinic_id 
    AND users.role IN ('clinic_admin', 'dentist', 'staff', 'receptionist')
  )
);

CREATE POLICY "Patients can view their own form responses" ON public.form_responses
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.patients p
    JOIN public.users u ON u.id = p.user_id
    WHERE u.user_id = auth.uid() 
    AND p.id = form_responses.patient_id
  )
);

-- RLS Policies for Patient Documents
CREATE POLICY "Clinic staff can manage patient documents" ON public.patient_documents
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.user_id = auth.uid() 
    AND users.clinic_id = patient_documents.clinic_id 
    AND users.role IN ('clinic_admin', 'dentist', 'staff', 'receptionist')
  )
);

CREATE POLICY "Patients can view their own documents" ON public.patient_documents
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.patients p
    JOIN public.users u ON u.id = p.user_id
    WHERE u.user_id = auth.uid() 
    AND p.id = patient_documents.patient_id
  )
);

-- RLS Policies for Medical Histories
CREATE POLICY "Clinic staff can manage medical histories" ON public.medical_histories
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.user_id = auth.uid() 
    AND users.clinic_id = medical_histories.clinic_id 
    AND users.role IN ('clinic_admin', 'dentist', 'staff', 'receptionist')
  )
);

CREATE POLICY "Patients can view their own medical history" ON public.medical_histories
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.patients p
    JOIN public.users u ON u.id = p.user_id
    WHERE u.user_id = auth.uid() 
    AND p.id = medical_histories.patient_id
  )
);

-- RLS Policies for Patient Insurance
CREATE POLICY "Clinic staff can manage patient insurance" ON public.patient_insurance
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.user_id = auth.uid() 
    AND users.clinic_id = patient_insurance.clinic_id 
    AND users.role IN ('clinic_admin', 'dentist', 'staff', 'receptionist')
  )
);

-- RLS Policies for Invoices
CREATE POLICY "Clinic staff can manage invoices" ON public.invoices
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.user_id = auth.uid() 
    AND users.clinic_id = invoices.clinic_id 
    AND users.role IN ('clinic_admin', 'dentist', 'staff', 'receptionist')
  )
);

CREATE POLICY "Patients can view their own invoices" ON public.invoices
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.patients p
    JOIN public.users u ON u.id = p.user_id
    WHERE u.user_id = auth.uid() 
    AND p.id = invoices.patient_id
  )
);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_digital_forms_updated_at 
BEFORE UPDATE ON public.digital_forms 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_form_responses_updated_at 
BEFORE UPDATE ON public.form_responses 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_documents_updated_at 
BEFORE UPDATE ON public.patient_documents 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_insurance_updated_at 
BEFORE UPDATE ON public.patient_insurance 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at 
BEFORE UPDATE ON public.invoices 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();