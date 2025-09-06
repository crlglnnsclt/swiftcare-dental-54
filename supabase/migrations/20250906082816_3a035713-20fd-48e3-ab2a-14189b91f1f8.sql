-- Enhanced Paperless System Schema for SwiftCare Dental (Fixed)

-- Add missing columns to treatments table if they don't exist
ALTER TABLE treatments 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS requires_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS risk_level TEXT DEFAULT 'low',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Add check constraint for risk_level if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'treatments_risk_level_check') THEN
        ALTER TABLE treatments ADD CONSTRAINT treatments_risk_level_check 
        CHECK (risk_level IN ('low', 'medium', 'high'));
    END IF;
END $$;

-- Create procedure_form_requirements junction table
CREATE TABLE IF NOT EXISTS procedure_form_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_id UUID REFERENCES treatments(id) ON DELETE CASCADE,
  form_id UUID REFERENCES digital_forms(id) ON DELETE CASCADE,
  is_mandatory BOOLEAN DEFAULT true,
  trigger_timing TEXT DEFAULT 'before_appointment' CHECK (trigger_timing IN ('before_appointment', 'at_appointment', 'after_appointment')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(treatment_id, form_id)
);

-- Enhanced digital_forms table modifications
ALTER TABLE digital_forms 
ADD COLUMN IF NOT EXISTS rich_content JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS clinic_branding JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ai_assistance_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS compliance_settings JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS pdf_template JSONB DEFAULT '{}';

-- Enhanced form_responses table modifications  
ALTER TABLE form_responses 
ADD COLUMN IF NOT EXISTS appointment_id UUID REFERENCES appointments(id),
ADD COLUMN IF NOT EXISTS treatment_id UUID REFERENCES treatments(id),
ADD COLUMN IF NOT EXISTS compliance_metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS pdf_generated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS pdf_storage_path TEXT,
ADD COLUMN IF NOT EXISTS notification_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reminder_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_assistance_used BOOLEAN DEFAULT false;

-- Create form notifications table
CREATE TABLE IF NOT EXISTS form_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  form_id UUID REFERENCES digital_forms(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('email', 'sms', 'portal', 'push')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  content JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create form audit logs table
CREATE TABLE IF NOT EXISTS form_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_response_id UUID REFERENCES form_responses(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('created', 'viewed', 'started', 'saved_draft', 'submitted', 'signed', 'verified', 'pdf_generated', 'shared')),
  performed_by UUID REFERENCES users(id),
  timestamp TIMESTAMPTZ DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  compliance_hash TEXT
);

-- Create AI form assistance logs
CREATE TABLE IF NOT EXISTS ai_form_assistance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  form_id UUID REFERENCES digital_forms(id) ON DELETE CASCADE,
  assistance_type TEXT NOT NULL CHECK (assistance_type IN ('explanation', 'autofill', 'validation', 'clause_suggestion')),
  query TEXT,
  response TEXT,
  confidence_score DECIMAL(3,2),
  helpful_rating INTEGER CHECK (helpful_rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Update existing treatments with new data
UPDATE treatments SET 
  description = CASE name
    WHEN 'Dental Cleaning' THEN 'Routine dental cleaning and examination'
    WHEN 'Tooth Filling' THEN 'Cavity restoration with composite filling'
    WHEN 'Root Canal Treatment' THEN 'Endodontic treatment for infected tooth'
    WHEN 'Tooth Extraction' THEN 'Surgical removal of tooth'
    WHEN 'Crown Placement' THEN 'Dental crown installation'
    WHEN 'Dental Implant' THEN 'Surgical implant placement'
    WHEN 'Teeth Whitening' THEN 'Professional teeth whitening treatment'
    WHEN 'Orthodontic Consultation' THEN 'Braces and alignment consultation'
    ELSE description
  END,
  price = CASE name
    WHEN 'Dental Cleaning' THEN 150.00
    WHEN 'Tooth Filling' THEN 200.00
    WHEN 'Root Canal Treatment' THEN 800.00
    WHEN 'Tooth Extraction' THEN 300.00
    WHEN 'Crown Placement' THEN 1200.00
    WHEN 'Dental Implant' THEN 2500.00
    WHEN 'Teeth Whitening' THEN 400.00
    WHEN 'Orthodontic Consultation' THEN 100.00
    ELSE price
  END,
  requires_consent = CASE name
    WHEN 'Dental Cleaning' THEN false
    WHEN 'Tooth Filling' THEN true
    WHEN 'Root Canal Treatment' THEN true
    WHEN 'Tooth Extraction' THEN true
    WHEN 'Crown Placement' THEN true
    WHEN 'Dental Implant' THEN true
    WHEN 'Teeth Whitening' THEN true
    WHEN 'Orthodontic Consultation' THEN false
    ELSE requires_consent
  END,
  risk_level = CASE name
    WHEN 'Dental Cleaning' THEN 'low'
    WHEN 'Tooth Filling' THEN 'low'
    WHEN 'Root Canal Treatment' THEN 'high'
    WHEN 'Tooth Extraction' THEN 'medium'
    WHEN 'Crown Placement' THEN 'medium'
    WHEN 'Dental Implant' THEN 'high'
    WHEN 'Teeth Whitening' THEN 'low'
    WHEN 'Orthodontic Consultation' THEN 'low'
    ELSE risk_level
  END
WHERE name IN ('Dental Cleaning', 'Tooth Filling', 'Root Canal Treatment', 'Tooth Extraction', 'Crown Placement', 'Dental Implant', 'Teeth Whitening', 'Orthodontic Consultation');

-- Create RLS policies
ALTER TABLE procedure_form_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_form_assistance ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Staff can manage procedure form requirements" ON procedure_form_requirements;
DROP POLICY IF EXISTS "Staff can view form notifications" ON form_notifications;
DROP POLICY IF EXISTS "Patients can view own notifications" ON form_notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON form_notifications;
DROP POLICY IF EXISTS "System can insert audit logs" ON form_audit_logs;
DROP POLICY IF EXISTS "Staff can view audit logs" ON form_audit_logs;
DROP POLICY IF EXISTS "Patients can view own AI assistance" ON ai_form_assistance;
DROP POLICY IF EXISTS "System can insert AI assistance" ON ai_form_assistance;

-- Staff can manage procedure form requirements
CREATE POLICY "Staff can manage procedure form requirements" ON procedure_form_requirements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

-- Staff can view form notifications
CREATE POLICY "Staff can view form notifications" ON form_notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

-- Patients can view their own notifications
CREATE POLICY "Patients can view own notifications" ON form_notifications
  FOR SELECT USING (
    patient_id IN (
      SELECT p.id FROM patients p 
      JOIN users u ON p.user_id = u.id 
      WHERE u.user_id = auth.uid()
    )
  );

-- System can insert notifications
CREATE POLICY "System can insert notifications" ON form_notifications
  FOR INSERT WITH CHECK (true);

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" ON form_audit_logs
  FOR INSERT WITH CHECK (true);

-- Staff can view audit logs
CREATE POLICY "Staff can view audit logs" ON form_audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() 
      AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
    )
  );

-- Patients can view their AI assistance
CREATE POLICY "Patients can view own AI assistance" ON ai_form_assistance
  FOR SELECT USING (
    patient_id IN (
      SELECT p.id FROM patients p 
      JOIN users u ON p.user_id = u.id 
      WHERE u.user_id = auth.uid()
    )
  );

-- System can insert AI assistance
CREATE POLICY "System can insert AI assistance" ON ai_form_assistance
  FOR INSERT WITH CHECK (true);