-- Create essential security definer functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = _user_id AND profiles.role = _role AND profiles.is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.has_enhanced_role(_user_id uuid, _role enhanced_user_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = _user_id AND profiles.enhanced_role = _role AND profiles.is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE profiles.user_id = _user_id AND is_active = true;
$$;

CREATE OR REPLACE FUNCTION public.dentist_can_view_patient(patient_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.appointments a
    INNER JOIN public.profiles dentist_profile ON dentist_profile.user_id = auth.uid() 
    WHERE a.patient_id = patient_profile_id
    AND a.dentist_id = dentist_profile.id
    AND dentist_profile.role = 'dentist'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_available_dentists()
RETURNS TABLE(id uuid, full_name text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT profiles.id, profiles.full_name
  FROM public.profiles
  WHERE profiles.role = 'dentist'::user_role
    AND profiles.is_active = true;
$$;

-- Create new user handler function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    main_branch_id uuid;
    user_full_name text;
    user_role user_role;
    user_enhanced_role enhanced_user_role;
BEGIN
    -- Get the main clinic branch ID
    SELECT id INTO main_branch_id 
    FROM branches 
    WHERE name = 'Main Clinic' AND is_active = true
    ORDER BY created_at ASC 
    LIMIT 1;
    
    -- If no main clinic, use first active branch
    IF main_branch_id IS NULL THEN
        SELECT id INTO main_branch_id 
        FROM branches 
        WHERE is_active = true 
        ORDER BY created_at ASC 
        LIMIT 1;
    END IF;
    
    -- Extract full name with better fallback
    user_full_name := COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
        'User'
    );
    
    -- Determine user role with validation
    user_role := CASE 
        WHEN NEW.raw_user_meta_data->>'role' IN ('patient', 'dentist', 'staff', 'admin') 
        THEN (NEW.raw_user_meta_data->>'role')::user_role
        ELSE 'patient'::user_role
    END;
    
    -- Determine enhanced role with validation  
    user_enhanced_role := CASE 
        WHEN NEW.raw_user_meta_data->>'role' IN ('patient', 'dentist', 'staff', 'admin', 'super_admin') 
        THEN (NEW.raw_user_meta_data->>'role')::enhanced_user_role
        ELSE 'patient'::enhanced_user_role
    END;
    
    -- Insert into profiles with proper error handling
    INSERT INTO public.profiles (
        user_id, 
        email, 
        full_name, 
        role, 
        enhanced_role,
        branch_id
    )
    VALUES (
        NEW.id,
        NEW.email,
        user_full_name,
        user_role,
        user_enhanced_role,
        main_branch_id
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error for debugging
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        -- Re-raise the exception to prevent user creation if profile creation fails
        RAISE;
END;
$$;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dental_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branch_features ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view non-super-admin profiles" ON public.profiles FOR SELECT USING (has_enhanced_role(auth.uid(), 'super_admin'::enhanced_user_role) OR (has_role(auth.uid(), 'admin'::user_role) AND (enhanced_role <> 'super_admin'::enhanced_user_role)));
CREATE POLICY "Admins can update non-super-admin profiles" ON public.profiles FOR UPDATE USING (has_enhanced_role(auth.uid(), 'super_admin'::enhanced_user_role) OR (has_role(auth.uid(), 'admin'::user_role) AND (enhanced_role <> 'super_admin'::enhanced_user_role)));
CREATE POLICY "Staff can view patient profiles" ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'staff'::user_role) AND (role = 'patient'::user_role));
CREATE POLICY "Dentists can view assigned patients" ON public.profiles FOR SELECT USING ((role = 'patient'::user_role) AND dentist_can_view_patient(id));
CREATE POLICY "Authenticated users can view basic dentist info for appointments" ON public.profiles FOR SELECT USING ((role = 'dentist'::user_role) AND (is_active = true));

-- Create RLS policies for appointments
CREATE POLICY "Patients can view their own appointments" ON public.appointments FOR SELECT USING (patient_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));
CREATE POLICY "Patients can insert their own appointments" ON public.appointments FOR INSERT WITH CHECK (patient_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));
CREATE POLICY "Patients can update their own appointments" ON public.appointments FOR UPDATE USING (patient_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));
CREATE POLICY "Dentists can view their assigned appointments" ON public.appointments FOR SELECT USING (dentist_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'dentist'::user_role));
CREATE POLICY "Admins and staff can manage appointments" ON public.appointments FOR ALL USING (has_role(auth.uid(), 'admin'::user_role) OR has_role(auth.uid(), 'staff'::user_role));

-- Create RLS policies for patient_details
CREATE POLICY "Patients can view their own details" ON public.patient_details FOR SELECT USING (patient_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));
CREATE POLICY "Patients can insert their own details" ON public.patient_details FOR INSERT WITH CHECK (patient_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));
CREATE POLICY "Patients can update their own details" ON public.patient_details FOR UPDATE USING (patient_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));
CREATE POLICY "Staff and admins can manage all patient details" ON public.patient_details FOR ALL USING (has_role(auth.uid(), 'admin'::user_role) OR has_role(auth.uid(), 'staff'::user_role));

-- Create RLS policies for services
CREATE POLICY "Authenticated users can view active services" ON public.services FOR SELECT USING (is_active = true);
CREATE POLICY "Only admins can manage services" ON public.services FOR ALL USING (has_role(auth.uid(), 'admin'::user_role));

-- Create RLS policies for procedures
CREATE POLICY "Authenticated users can view active procedures" ON public.procedures FOR SELECT USING (is_active = true);
CREATE POLICY "Staff can manage procedures in their branch" ON public.procedures FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.enhanced_role = ANY (ARRAY['admin'::enhanced_user_role, 'super_admin'::enhanced_user_role]) AND ((profiles.enhanced_role = 'super_admin'::enhanced_user_role) OR (profiles.branch_id = procedures.branch_id))));

-- Create RLS policies for digital_forms
CREATE POLICY "Branch staff can manage forms in their branch" ON public.digital_forms FOR ALL USING ((branch_id IN (SELECT profiles.branch_id FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.enhanced_role = ANY (ARRAY['admin'::enhanced_user_role, 'staff'::enhanced_user_role, 'dentist'::enhanced_user_role]))) OR (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.enhanced_role = 'super_admin'::enhanced_user_role)));

-- Create RLS policies for patient_form_responses
CREATE POLICY "Patients can manage their own form responses" ON public.patient_form_responses FOR ALL USING (patient_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));
CREATE POLICY "Branch staff can view form responses in their branch" ON public.patient_form_responses FOR SELECT USING ((branch_id IN (SELECT profiles.branch_id FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.enhanced_role = ANY (ARRAY['admin'::enhanced_user_role, 'staff'::enhanced_user_role, 'dentist'::enhanced_user_role]))) OR (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.enhanced_role = 'super_admin'::enhanced_user_role)));

-- Create RLS policies for dental_charts
CREATE POLICY "Patients can view their own dental charts" ON public.dental_charts FOR SELECT USING (patient_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));
CREATE POLICY "Dentists can manage charts for their patients" ON public.dental_charts FOR ALL USING ((dentist_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.enhanced_role = 'dentist'::enhanced_user_role)) OR (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND (profiles.enhanced_role = 'admin'::enhanced_user_role OR profiles.enhanced_role = 'super_admin'::enhanced_user_role))));
CREATE POLICY "Staff can view dental charts in their branch" ON public.dental_charts FOR SELECT USING (branch_id IN (SELECT profiles.branch_id FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.enhanced_role = ANY (ARRAY['staff'::enhanced_user_role, 'admin'::enhanced_user_role])));

-- Create RLS policies for payments
CREATE POLICY "Only admins can view payments" ON public.payments FOR SELECT USING (has_role(auth.uid(), 'admin'::user_role));
CREATE POLICY "Only admins can manage payments" ON public.payments FOR ALL USING (has_role(auth.uid(), 'admin'::user_role));

-- Create RLS policies for payment_proofs
CREATE POLICY "Patients can view their own payment proofs" ON public.payment_proofs FOR SELECT USING (patient_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));
CREATE POLICY "Patients can insert their own payment proofs" ON public.payment_proofs FOR INSERT WITH CHECK (patient_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));
CREATE POLICY "Staff and admins can manage all payment proofs" ON public.payment_proofs FOR ALL USING (has_role(auth.uid(), 'admin'::user_role) OR has_role(auth.uid(), 'staff'::user_role));

-- Create RLS policies for patient_results
CREATE POLICY "Patients can view their own results when visible" ON public.patient_results FOR SELECT USING ((patient_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid())) AND (is_visible_to_patient = true));
CREATE POLICY "Staff and admins can manage all results" ON public.patient_results FOR ALL USING (has_role(auth.uid(), 'admin'::user_role) OR has_role(auth.uid(), 'staff'::user_role));

-- Create RLS policies for medical_documents
CREATE POLICY "Patients can view their own visible documents" ON public.medical_documents FOR SELECT USING ((patient_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid())) AND (is_visible_to_patient = true) AND ((requires_payment_approval = false) OR (EXISTS (SELECT 1 FROM payment_proofs pp WHERE pp.patient_id = medical_documents.patient_id AND pp.verification_status = 'approved'))));
CREATE POLICY "Patients can insert their own documents" ON public.medical_documents FOR INSERT WITH CHECK ((patient_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'patient'::user_role)) OR (has_role(auth.uid(), 'admin'::user_role) OR has_role(auth.uid(), 'staff'::user_role)));
CREATE POLICY "Staff and admins can manage all medical documents" ON public.medical_documents FOR ALL USING (has_role(auth.uid(), 'admin'::user_role) OR has_role(auth.uid(), 'staff'::user_role));

-- Create RLS policies for chat_messages
CREATE POLICY "Patients can view their own chat messages" ON public.chat_messages FOR SELECT USING (patient_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));
CREATE POLICY "Patients can insert their own chat messages" ON public.chat_messages FOR INSERT WITH CHECK ((patient_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid())) AND (sender_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid())) AND (sender_role = 'patient'::user_role));
CREATE POLICY "Staff dentists admins can view targeted or general messages" ON public.chat_messages FOR SELECT USING ((has_role(auth.uid(), 'admin'::user_role) OR has_role(auth.uid(), 'staff'::user_role) OR has_role(auth.uid(), 'dentist'::user_role)) AND ((recipient_id IS NULL) OR (recipient_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()))));
CREATE POLICY "Staff dentists admins can insert messages" ON public.chat_messages FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::user_role) OR has_role(auth.uid(), 'staff'::user_role) OR has_role(auth.uid(), 'dentist'::user_role));

-- Create RLS policies for patient_notifications
CREATE POLICY "Patients can view their own notifications" ON public.patient_notifications FOR SELECT USING (patient_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));
CREATE POLICY "Staff can create notifications" ON public.patient_notifications FOR INSERT WITH CHECK (has_role(auth.uid(), 'staff'::user_role) OR has_role(auth.uid(), 'dentist'::user_role) OR has_role(auth.uid(), 'admin'::user_role));

-- Create RLS policies for notifications
CREATE POLICY "Patients can view their own notifications" ON public.notifications FOR SELECT USING ((recipient_role = 'patient') AND (related_id IN (SELECT payment_proofs.id FROM payment_proofs WHERE payment_proofs.patient_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()))));
CREATE POLICY "Staff and admins can view relevant notifications" ON public.notifications FOR SELECT USING (((recipient_role = 'admin') AND has_role(auth.uid(), 'admin'::user_role)) OR ((recipient_role = 'staff') AND (has_role(auth.uid(), 'staff'::user_role) OR has_role(auth.uid(), 'admin'::user_role))));
CREATE POLICY "Staff and admins can update notifications" ON public.notifications FOR UPDATE USING (((recipient_role = 'admin') AND has_role(auth.uid(), 'admin'::user_role)) OR ((recipient_role = 'staff') AND (has_role(auth.uid(), 'staff'::user_role) OR has_role(auth.uid(), 'admin'::user_role))));

-- Create RLS policies for inventory
CREATE POLICY "Branch staff can manage inventory in their branch" ON public.inventory_categories FOR ALL USING (branch_id IN (SELECT profiles.branch_id FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.enhanced_role = ANY (ARRAY['admin'::enhanced_user_role, 'staff'::enhanced_user_role, 'dentist'::enhanced_user_role, 'super_admin'::enhanced_user_role])));
CREATE POLICY "Branch staff can manage inventory items in their branch" ON public.inventory_items FOR ALL USING (branch_id IN (SELECT profiles.branch_id FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.enhanced_role = ANY (ARRAY['admin'::enhanced_user_role, 'staff'::enhanced_user_role, 'dentist'::enhanced_user_role, 'super_admin'::enhanced_user_role])));
CREATE POLICY "Branch staff can manage inventory transactions in their branch" ON public.inventory_transactions FOR ALL USING (branch_id IN (SELECT profiles.branch_id FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.enhanced_role = ANY (ARRAY['admin'::enhanced_user_role, 'staff'::enhanced_user_role, 'dentist'::enhanced_user_role, 'super_admin'::enhanced_user_role])));

-- Create RLS policies for branches
CREATE POLICY "Super admins can manage all branches" ON public.branches FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.enhanced_role = 'super_admin'::enhanced_user_role));
CREATE POLICY "Branch admins can view their branch" ON public.branches FOR SELECT USING (id IN (SELECT profiles.branch_id FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.enhanced_role = 'admin'::enhanced_user_role));

-- Create RLS policies for branch_features
CREATE POLICY "Admins can manage branch features" ON public.branch_features FOR ALL USING ((EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.enhanced_role = 'super_admin'::enhanced_user_role AND profiles.is_active = true)) OR (branch_id IN (SELECT profiles.branch_id FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.enhanced_role = 'admin'::enhanced_user_role AND profiles.is_active = true)));

-- Create RLS policies for audit_logs
CREATE POLICY "System can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff can view audit logs in their branch" ON public.audit_logs FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.enhanced_role = ANY (ARRAY['staff'::enhanced_user_role, 'admin'::enhanced_user_role, 'dentist'::enhanced_user_role, 'super_admin'::enhanced_user_role]) AND ((profiles.enhanced_role = 'super_admin'::enhanced_user_role) OR (profiles.branch_id = audit_logs.branch_id))));

-- Create RLS policies for analytics_reports
CREATE POLICY "Branch admins can manage analytics in their branch" ON public.analytics_reports FOR ALL USING (branch_id IN (SELECT profiles.branch_id FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.enhanced_role = ANY (ARRAY['admin'::enhanced_user_role, 'super_admin'::enhanced_user_role])));

-- Create RLS policies for attachments
CREATE POLICY "Staff can manage attachments" ON public.attachments FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.enhanced_role = ANY (ARRAY['staff'::enhanced_user_role, 'admin'::enhanced_user_role, 'dentist'::enhanced_user_role, 'super_admin'::enhanced_user_role]) AND ((profiles.enhanced_role = 'super_admin'::enhanced_user_role) OR (profiles.branch_id = attachments.branch_id))));
CREATE POLICY "Users can view attachments based on visibility rules" ON public.attachments FOR SELECT USING ((EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.enhanced_role = ANY (ARRAY['staff'::enhanced_user_role, 'admin'::enhanced_user_role, 'dentist'::enhanced_user_role, 'super_admin'::enhanced_user_role]) AND ((profiles.enhanced_role = 'super_admin'::enhanced_user_role) OR (profiles.branch_id = attachments.branch_id)))) OR ((entity_type = 'patient') AND (entity_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid())) AND (is_visible_to_patient = true) AND ((requires_payment_approval = false) OR (EXISTS (SELECT 1 FROM payment_proofs WHERE payment_proofs.patient_id = attachments.entity_id AND payment_proofs.verification_status = 'approved')))));

-- Insert some default services
INSERT INTO public.services (name, description, price, duration) VALUES
('Dental Cleaning', 'Regular dental cleaning and checkup', 150.00, 60),
('Tooth Extraction', 'Simple tooth extraction procedure', 200.00, 45),
('Dental Filling', 'Composite or amalgam filling', 120.00, 30),
('Root Canal', 'Root canal treatment', 800.00, 90),
('Dental Crown', 'Porcelain or metal crown placement', 600.00, 120);

-- Insert some default procedures
INSERT INTO public.procedures (name, code, description, category, estimated_duration) VALUES
('Oral Examination', 'D0150', 'Comprehensive oral examination', 'Diagnostic', 30),
('Dental Prophylaxis', 'D1110', 'Adult prophylaxis cleaning', 'Preventive', 60),
('Composite Filling', 'D2391', 'One surface posterior composite', 'Restorative', 45),
('Crown Preparation', 'D2740', 'Crown - porcelain fused to metal', 'Restorative', 90),
('Root Canal Therapy', 'D3310', 'Endodontic therapy, anterior tooth', 'Endodontic', 120);