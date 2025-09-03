-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types/enums
CREATE TYPE user_role AS ENUM ('patient', 'dentist', 'staff', 'admin');
CREATE TYPE enhanced_user_role AS ENUM ('patient', 'dentist', 'staff', 'admin', 'super_admin');

-- Create branches table (foundational)
CREATE TABLE public.branches (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#0ea5e9',
    secondary_color TEXT DEFAULT '#06b6d4',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table (user management)
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'patient',
    enhanced_role enhanced_user_role DEFAULT 'patient',
    branch_id UUID REFERENCES public.branches(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Create services table
CREATE TABLE public.services (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    duration INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create procedures table
CREATE TABLE public.procedures (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT,
    description TEXT,
    category TEXT,
    estimated_duration INTEGER DEFAULT 60,
    requires_forms BOOLEAN DEFAULT false,
    branch_id UUID REFERENCES public.branches(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.profiles(id),
    dentist_id UUID REFERENCES public.profiles(id),
    branch_id UUID REFERENCES public.branches(id),
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    service_type TEXT NOT NULL,
    service_id UUID REFERENCES public.services(id),
    procedure_id UUID REFERENCES public.procedures(id),
    status TEXT NOT NULL DEFAULT 'scheduled',
    priority TEXT DEFAULT 'normal',
    appointment_type TEXT DEFAULT 'scheduled',
    notes TEXT,
    fee NUMERIC NOT NULL DEFAULT 0,
    estimated_duration INTEGER DEFAULT 30,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    is_checked_in BOOLEAN DEFAULT false,
    check_in_time TIMESTAMP WITH TIME ZONE,
    queue_position INTEGER,
    queue_join_time TIMESTAMP WITH TIME ZONE,
    grace_period_end TIMESTAMP WITH TIME ZONE,
    is_no_show BOOLEAN DEFAULT false,
    cancelled_by UUID REFERENCES public.profiles(id),
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    early_completion_prompt TEXT,
    forms_completed BOOLEAN DEFAULT false,
    can_start_treatment BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patient_details table
CREATE TABLE public.patient_details (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.profiles(id),
    first_name TEXT,
    middle_name TEXT,
    last_name TEXT,
    date_of_birth DATE,
    age INTEGER,
    gender TEXT,
    phone TEXT,
    email TEXT,
    home_address TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    occupation TEXT,
    blood_type TEXT,
    allergies TEXT,
    existing_medical_conditions TEXT,
    current_medications TEXT,
    previous_surgeries TEXT,
    dental_history TEXT,
    dental_concerns TEXT,
    last_dental_visit DATE,
    insurance_provider TEXT,
    policy_number TEXT,
    preferred_time TEXT,
    communication_preference TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create digital_forms table
CREATE TABLE public.digital_forms (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    form_fields JSONB NOT NULL,
    requires_signature BOOLEAN DEFAULT false,
    terms_and_conditions TEXT,
    attached_document_url TEXT,
    display_mode TEXT DEFAULT 'form',
    branch_id UUID REFERENCES public.branches(id),
    created_by UUID REFERENCES public.profiles(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patient_form_responses table
CREATE TABLE public.patient_form_responses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.profiles(id),
    form_id UUID NOT NULL REFERENCES public.digital_forms(id),
    responses JSONB NOT NULL,
    signature_data TEXT,
    signature_timestamp TIMESTAMP WITH TIME ZONE,
    signer_ip INET,
    verification_status TEXT DEFAULT 'pending',
    verified_by UUID REFERENCES public.profiles(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_notes TEXT,
    form_version INTEGER DEFAULT 1,
    branch_id UUID REFERENCES public.branches(id),
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create form_procedures table
CREATE TABLE public.form_procedures (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    form_id UUID NOT NULL REFERENCES public.digital_forms(id),
    procedure_name TEXT NOT NULL,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create dental_charts table
CREATE TABLE public.dental_charts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.profiles(id),
    dentist_id UUID REFERENCES public.profiles(id),
    branch_id UUID REFERENCES public.branches(id),
    tooth_number INTEGER NOT NULL,
    surface TEXT,
    treatment_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'planned',
    treatment_date DATE,
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id),
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    appointment_id UUID NOT NULL REFERENCES public.appointments(id),
    patient_id UUID NOT NULL REFERENCES public.profiles(id),
    amount NUMERIC NOT NULL,
    payment_method TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'completed',
    service_name TEXT,
    verification_status TEXT DEFAULT 'pending',
    verified_by UUID REFERENCES public.profiles(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payment_proofs table
CREATE TABLE public.payment_proofs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.profiles(id),
    appointment_id UUID REFERENCES public.appointments(id),
    payment_id UUID REFERENCES public.payments(id),
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    verification_status TEXT DEFAULT 'pending',
    verified_by UUID REFERENCES public.profiles(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patient_results table
CREATE TABLE public.patient_results (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.profiles(id),
    appointment_id UUID REFERENCES public.appointments(id),
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    file_type TEXT,
    requires_payment BOOLEAN DEFAULT true,
    is_visible_to_patient BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medical_documents table
CREATE TABLE public.medical_documents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.profiles(id),
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    document_type TEXT,
    description TEXT,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
    is_visible_to_patient BOOLEAN DEFAULT true,
    requires_payment_approval BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.profiles(id),
    sender_id UUID NOT NULL REFERENCES public.profiles(id),
    sender_role user_role NOT NULL,
    sender_name TEXT NOT NULL,
    message TEXT NOT NULL,
    recipient_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patient_notifications table
CREATE TABLE public.patient_notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.profiles(id),
    appointment_id UUID REFERENCES public.appointments(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'payment',
    recipient_role TEXT NOT NULL,
    related_id UUID,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory_categories table
CREATE TABLE public.inventory_categories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    branch_id UUID REFERENCES public.branches(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create inventory_items table
CREATE TABLE public.inventory_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    sku TEXT,
    category_id UUID REFERENCES public.inventory_categories(id),
    branch_id UUID REFERENCES public.branches(id),
    current_stock INTEGER DEFAULT 0,
    minimum_stock INTEGER DEFAULT 0,
    maximum_stock INTEGER,
    unit_cost NUMERIC DEFAULT 0,
    supplier_info JSONB,
    expiry_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create inventory_transactions table
CREATE TABLE public.inventory_transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID NOT NULL REFERENCES public.inventory_items(id),
    transaction_type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_cost NUMERIC,
    total_cost NUMERIC,
    reference_type TEXT,
    reference_id UUID,
    notes TEXT,
    performed_by UUID NOT NULL REFERENCES public.profiles(id),
    branch_id UUID REFERENCES public.branches(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id UUID,
    action TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    performed_by UUID NOT NULL REFERENCES public.profiles(id),
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ip_address INET,
    user_agent TEXT,
    branch_id UUID REFERENCES public.branches(id)
);

-- Create dental_chart_audit table
CREATE TABLE public.dental_chart_audit (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    chart_id UUID NOT NULL REFERENCES public.dental_charts(id),
    action TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    performed_by UUID NOT NULL REFERENCES public.profiles(id),
    performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    branch_id UUID REFERENCES public.branches(id)
);

-- Create attachments table
CREATE TABLE public.attachments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    description TEXT,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
    is_visible_to_patient BOOLEAN DEFAULT true,
    requires_payment_approval BOOLEAN DEFAULT false,
    branch_id UUID REFERENCES public.branches(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create analytics_reports table
CREATE TABLE public.analytics_reports (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    report_type TEXT NOT NULL,
    report_data JSONB NOT NULL,
    date_range_start DATE,
    date_range_end DATE,
    generated_by UUID NOT NULL REFERENCES public.profiles(id),
    branch_id UUID REFERENCES public.branches(id),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create branch_features table
CREATE TABLE public.branch_features (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    branch_id UUID NOT NULL REFERENCES public.branches(id),
    feature_name TEXT NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payroll_records table
CREATE TABLE public.payroll_records (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id UUID NOT NULL REFERENCES public.profiles(id),
    branch_id UUID REFERENCES public.branches(id),
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    base_salary NUMERIC DEFAULT 0,
    overtime_hours NUMERIC DEFAULT 0,
    overtime_rate NUMERIC DEFAULT 0,
    bonus NUMERIC DEFAULT 0,
    deductions NUMERIC DEFAULT 0,
    total_gross NUMERIC,
    total_net NUMERIC,
    status TEXT DEFAULT 'draft',
    approved_by UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create telemedicine_sessions table
CREATE TABLE public.telemedicine_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.profiles(id),
    dentist_id UUID NOT NULL REFERENCES public.profiles(id),
    appointment_id UUID REFERENCES public.appointments(id),
    branch_id UUID REFERENCES public.branches(id),
    session_type TEXT DEFAULT 'consultation',
    status TEXT DEFAULT 'scheduled',
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    meeting_link TEXT,
    session_notes TEXT,
    recording_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create timesheets table (partial - based on visible columns)
CREATE TABLE public.timesheets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id UUID NOT NULL REFERENCES public.profiles(id),
    date DATE NOT NULL,
    clock_in TIME,
    clock_out TIME,
    break_start TIME,
    break_end TIME,
    notes TEXT,
    approved_by UUID REFERENCES public.profiles(id),
    branch_id UUID REFERENCES public.branches(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default main clinic branch
INSERT INTO public.branches (name, address, phone, email, is_active) 
VALUES ('Main Clinic', '123 Dental Street', '+1-234-567-8900', 'contact@dentalclinic.com', true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add updated_at triggers
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_procedures_updated_at BEFORE UPDATE ON public.procedures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_patient_details_updated_at BEFORE UPDATE ON public.patient_details FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_digital_forms_updated_at BEFORE UPDATE ON public.digital_forms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dental_charts_updated_at BEFORE UPDATE ON public.dental_charts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_patient_results_updated_at BEFORE UPDATE ON public.patient_results FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_medical_documents_updated_at BEFORE UPDATE ON public.medical_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_attachments_updated_at BEFORE UPDATE ON public.attachments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_branch_features_updated_at BEFORE UPDATE ON public.branch_features FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payroll_records_updated_at BEFORE UPDATE ON public.payroll_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_telemedicine_sessions_updated_at BEFORE UPDATE ON public.telemedicine_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();