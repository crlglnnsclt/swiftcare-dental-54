-- Comprehensive database schema updates for dental clinic system

-- 1. Create audit trail table for all sensitive actions
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id UUID,
    action TEXT NOT NULL, -- 'create', 'update', 'delete', 'soft_delete'
    old_values JSONB,
    new_values JSONB,
    performed_by UUID NOT NULL,
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ip_address INET,
    user_agent TEXT,
    branch_id UUID REFERENCES public.branches(id)
);

-- 2. Create attachments table for files linked to various entities
CREATE TABLE IF NOT EXISTS public.attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    entity_type TEXT NOT NULL, -- 'patient', 'appointment', 'form', 'chart_entry'
    entity_id UUID NOT NULL,
    uploaded_by UUID NOT NULL,
    is_visible_to_patient BOOLEAN DEFAULT true,
    requires_payment_approval BOOLEAN DEFAULT false,
    description TEXT,
    branch_id UUID REFERENCES public.branches(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create form procedure associations
CREATE TABLE IF NOT EXISTS public.form_procedures (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_id UUID NOT NULL REFERENCES public.digital_forms(id) ON DELETE CASCADE,
    procedure_name TEXT NOT NULL,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Update digital_forms table for document attachments and signatures
ALTER TABLE public.digital_forms 
ADD COLUMN IF NOT EXISTS attached_document_url TEXT,
ADD COLUMN IF NOT EXISTS terms_and_conditions TEXT,
ADD COLUMN IF NOT EXISTS display_mode TEXT DEFAULT 'form', -- 'form', 'terms_and_conditions', 'hybrid'
ADD COLUMN IF NOT EXISTS created_by UUID;

-- 5. Update patient_form_responses for enhanced signature capture
ALTER TABLE public.patient_form_responses 
ADD COLUMN IF NOT EXISTS signature_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS signer_ip INET,
ADD COLUMN IF NOT EXISTS form_version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
ADD COLUMN IF NOT EXISTS verified_by UUID,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- 6. Create procedure master table
CREATE TABLE IF NOT EXISTS public.procedures (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    code TEXT UNIQUE,
    estimated_duration INTEGER DEFAULT 60, -- minutes
    requires_forms BOOLEAN DEFAULT false,
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    branch_id UUID REFERENCES public.branches(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Update appointments to link with procedures
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS procedure_id UUID REFERENCES public.procedures(id),
ADD COLUMN IF NOT EXISTS forms_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_start_treatment BOOLEAN DEFAULT true;

-- 8. Create user invitations table
CREATE TABLE IF NOT EXISTS public.user_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL,
    enhanced_role enhanced_user_role,
    branch_id UUID REFERENCES public.branches(id),
    invited_by UUID NOT NULL,
    invitation_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'expired'
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    accepted_at TIMESTAMP WITH TIME ZONE
);

-- 9. Enable RLS on new tables
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS policies for audit_logs
CREATE POLICY "Staff can view audit logs in their branch" ON public.audit_logs
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() 
        AND enhanced_role IN ('staff', 'admin', 'dentist', 'super_admin')
        AND (enhanced_role = 'super_admin' OR branch_id = audit_logs.branch_id)
    )
);

CREATE POLICY "System can insert audit logs" ON public.audit_logs
FOR INSERT WITH CHECK (true); -- System-level inserts

-- 11. Create RLS policies for attachments
CREATE POLICY "Users can view attachments based on visibility rules" ON public.attachments
FOR SELECT USING (
    -- Staff/admin/dentist can see all attachments in their branch
    (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() 
        AND enhanced_role IN ('staff', 'admin', 'dentist', 'super_admin')
        AND (enhanced_role = 'super_admin' OR branch_id = attachments.branch_id)
    ))
    OR
    -- Patients can see their own attachments if visible and payment approved
    (entity_type = 'patient' AND entity_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    ) AND is_visible_to_patient = true AND (
        requires_payment_approval = false OR 
        EXISTS (
            SELECT 1 FROM public.payment_proofs 
            WHERE patient_id = entity_id AND verification_status = 'approved'
        )
    ))
);

CREATE POLICY "Staff can manage attachments" ON public.attachments
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() 
        AND enhanced_role IN ('staff', 'admin', 'dentist', 'super_admin')
        AND (enhanced_role = 'super_admin' OR branch_id = attachments.branch_id)
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() 
        AND enhanced_role IN ('staff', 'admin', 'dentist', 'super_admin')
        AND (enhanced_role = 'super_admin' OR branch_id = attachments.branch_id)
    )
);

-- 12. Create RLS policies for procedures
CREATE POLICY "Authenticated users can view active procedures" ON public.procedures
FOR SELECT USING (is_active = true);

CREATE POLICY "Staff can manage procedures in their branch" ON public.procedures
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() 
        AND enhanced_role IN ('admin', 'super_admin')
        AND (enhanced_role = 'super_admin' OR branch_id = procedures.branch_id)
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() 
        AND enhanced_role IN ('admin', 'super_admin')
        AND (enhanced_role = 'super_admin' OR branch_id = procedures.branch_id)
    )
);

-- 13. Create RLS policies for user_invitations
CREATE POLICY "Admins can manage invitations in their branch" ON public.user_invitations
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() 
        AND enhanced_role IN ('admin', 'super_admin')
        AND (enhanced_role = 'super_admin' OR branch_id = user_invitations.branch_id)
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() 
        AND enhanced_role IN ('admin', 'super_admin')
        AND (enhanced_role = 'super_admin' OR branch_id = user_invitations.branch_id)
    )
);

-- 14. Create function to log audit trail
CREATE OR REPLACE FUNCTION public.log_audit_trail()
RETURNS TRIGGER AS $$
DECLARE
    branch_id_val UUID;
BEGIN
    -- Try to get branch_id from the record
    branch_id_val := COALESCE(
        CASE WHEN TG_OP = 'DELETE' THEN OLD.branch_id ELSE NEW.branch_id END,
        (SELECT branch_id FROM public.profiles WHERE user_id = auth.uid())
    );
    
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_logs (
            table_name, record_id, action, new_values, performed_by, branch_id
        ) VALUES (
            TG_TABLE_NAME, NEW.id, 'create', to_jsonb(NEW), 
            (SELECT id FROM public.profiles WHERE user_id = auth.uid()), 
            branch_id_val
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_logs (
            table_name, record_id, action, old_values, new_values, performed_by, branch_id
        ) VALUES (
            TG_TABLE_NAME, NEW.id, 'update', to_jsonb(OLD), to_jsonb(NEW),
            (SELECT id FROM public.profiles WHERE user_id = auth.uid()),
            branch_id_val
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_logs (
            table_name, record_id, action, old_values, performed_by, branch_id
        ) VALUES (
            TG_TABLE_NAME, OLD.id, 'delete', to_jsonb(OLD),
            (SELECT id FROM public.profiles WHERE user_id = auth.uid()),
            branch_id_val
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Create triggers for audit logging on sensitive tables
DROP TRIGGER IF EXISTS audit_appointments_trigger ON public.appointments;
CREATE TRIGGER audit_appointments_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION public.log_audit_trail();

DROP TRIGGER IF EXISTS audit_profiles_trigger ON public.profiles;
CREATE TRIGGER audit_profiles_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.log_audit_trail();

-- 16. Insert sample procedures
INSERT INTO public.procedures (name, description, code, estimated_duration, requires_forms, category) VALUES
('Dental Cleaning', 'Routine dental cleaning and examination', 'CLEAN', 60, true, 'Preventive'),
('Tooth Extraction', 'Surgical removal of tooth', 'EXTRACT', 90, true, 'Surgery'),
('Dental Filling', 'Cavity filling with composite material', 'FILL', 45, true, 'Restorative'),
('Root Canal', 'Endodontic treatment of infected tooth', 'ROOT', 120, true, 'Endodontic'),
('Crown Placement', 'Dental crown installation', 'CROWN', 90, true, 'Restorative'),
('Orthodontic Consultation', 'Braces and alignment consultation', 'ORTHO', 60, true, 'Orthodontic'),
('Emergency Visit', 'Urgent dental care', 'EMERG', 30, false, 'Emergency')
ON CONFLICT (code) DO NOTHING;

-- 17. Update existing appointments to allow treatment start
UPDATE public.appointments 
SET can_start_treatment = true, forms_completed = false 
WHERE can_start_treatment IS NULL;

-- 18. Create function to check if appointment can start treatment
CREATE OR REPLACE FUNCTION public.check_appointment_can_start()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if all required forms are completed for this appointment's procedure
    IF NEW.procedure_id IS NOT NULL THEN
        -- Get required forms count for this procedure
        WITH required_forms AS (
            SELECT COUNT(*) as form_count
            FROM public.form_procedures fp
            JOIN public.digital_forms df ON fp.form_id = df.id
            WHERE fp.procedure_name = (SELECT name FROM public.procedures WHERE id = NEW.procedure_id)
            AND fp.is_required = true
            AND df.is_active = true
        ),
        completed_forms AS (
            SELECT COUNT(*) as completed_count
            FROM public.patient_form_responses pfr
            JOIN public.digital_forms df ON pfr.form_id = df.id
            JOIN public.form_procedures fp ON df.id = fp.form_id
            WHERE pfr.patient_id = NEW.patient_id
            AND fp.procedure_name = (SELECT name FROM public.procedures WHERE id = NEW.procedure_id)
            AND fp.is_required = true
        )
        SELECT 
            CASE 
                WHEN rf.form_count = 0 THEN true
                WHEN cf.completed_count >= rf.form_count THEN true
                ELSE false
            END
        INTO NEW.can_start_treatment
        FROM required_forms rf, completed_forms cf;
        
        NEW.forms_completed := NEW.can_start_treatment;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 19. Create trigger to check appointment readiness
DROP TRIGGER IF EXISTS check_appointment_readiness_trigger ON public.appointments;
CREATE TRIGGER check_appointment_readiness_trigger
    BEFORE INSERT OR UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION public.check_appointment_can_start();

-- 20. Add updated_at triggers for new tables
CREATE TRIGGER update_attachments_updated_at
    BEFORE UPDATE ON public.attachments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_procedures_updated_at
    BEFORE UPDATE ON public.procedures
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();