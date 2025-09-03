-- Create document verification workflow tables for paperless system

-- Add verification status and workflow tracking to form_responses
ALTER TABLE public.form_responses 
ADD COLUMN verification_status TEXT DEFAULT 'pending_verification' CHECK (verification_status IN ('pending_verification', 'approved', 'rejected', 'needs_correction')),
ADD COLUMN verified_by UUID REFERENCES auth.users(id),
ADD COLUMN verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN rejection_reason TEXT,
ADD COLUMN is_visible_to_patient BOOLEAN DEFAULT false,
ADD COLUMN requires_dentist_signature BOOLEAN DEFAULT false,
ADD COLUMN dentist_signature_data TEXT,
ADD COLUMN dentist_signed_by UUID REFERENCES auth.users(id),
ADD COLUMN dentist_signed_at TIMESTAMP WITH TIME ZONE;

-- Add verification status to patient_documents
ALTER TABLE public.patient_documents 
ADD COLUMN verification_status TEXT DEFAULT 'pending_verification' CHECK (verification_status IN ('pending_verification', 'approved', 'rejected', 'needs_correction')),
ADD COLUMN verified_by UUID REFERENCES auth.users(id),
ADD COLUMN verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN rejection_reason TEXT,
ADD COLUMN is_visible_to_patient BOOLEAN DEFAULT false;

-- Create audit trail table for document actions
CREATE TABLE public.document_audit_trail (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID,
  document_type TEXT NOT NULL, -- 'form_response' or 'patient_document'
  action_type TEXT NOT NULL CHECK (action_type IN ('submitted', 'signed', 'verified', 'approved', 'rejected', 'downloaded', 'viewed')),
  action_description TEXT,
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  clinic_id UUID NOT NULL,
  patient_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit trail
ALTER TABLE public.document_audit_trail ENABLE ROW LEVEL SECURITY;

-- RLS policies for audit trail
CREATE POLICY "Clinic staff can view audit trail" 
ON public.document_audit_trail 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM users u 
  WHERE u.user_id = auth.uid() 
    AND u.clinic_id = document_audit_trail.clinic_id 
    AND u.role IN ('clinic_admin', 'dentist', 'staff', 'receptionist')
));

CREATE POLICY "System can insert audit trail" 
ON public.document_audit_trail 
FOR INSERT 
WITH CHECK (true);

-- Update RLS policies for form_responses to include verification workflow
DROP POLICY IF EXISTS "Clinic staff can manage form responses" ON public.form_responses;
CREATE POLICY "Clinic staff can manage form responses" 
ON public.form_responses 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE users.user_id = auth.uid() 
    AND users.clinic_id = form_responses.clinic_id 
    AND users.role IN ('clinic_admin', 'dentist', 'staff', 'receptionist')
));

-- Update RLS policies for form_responses visibility to patients
DROP POLICY IF EXISTS "Patients can view their own form responses" ON public.form_responses;
CREATE POLICY "Patients can view their own form responses" 
ON public.form_responses 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM (patients p JOIN users u ON u.id = p.user_id)
    WHERE u.user_id = auth.uid() 
      AND p.id = form_responses.patient_id
  ) AND (is_visible_to_patient = true OR verification_status = 'approved')
);

-- Update RLS policies for patient_documents visibility 
DROP POLICY IF EXISTS "Patients can view their own documents" ON public.patient_documents;
CREATE POLICY "Patients can view their own documents" 
ON public.patient_documents 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM (patients p JOIN users u ON u.id = p.user_id)
    WHERE u.user_id = auth.uid() 
      AND p.id = patient_documents.patient_id
  ) AND (is_visible_to_patient = true OR verification_status = 'approved')
);

-- Create notification system for workflow events
CREATE TABLE public.workflow_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_user_id UUID REFERENCES auth.users(id),
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  document_id UUID,
  document_type TEXT, -- 'form_response' or 'patient_document'
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  clinic_id UUID NOT NULL
);

-- Enable RLS on notifications
ALTER TABLE public.workflow_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.workflow_notifications 
FOR SELECT 
USING (recipient_user_id = auth.uid());

CREATE POLICY "System can manage notifications" 
ON public.workflow_notifications 
FOR ALL 
USING (true);