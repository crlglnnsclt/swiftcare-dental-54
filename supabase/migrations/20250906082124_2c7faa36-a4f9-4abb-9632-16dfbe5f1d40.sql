-- Enhanced Paperless System Schema for SwiftCare Dental

-- Create treatments table if not exists (for procedure-aware forms)
CREATE TABLE IF NOT EXISTS treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER DEFAULT 30,
  price DECIMAL(10,2),
  requires_consent BOOLEAN DEFAULT false,
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

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

-- Insert some sample treatments
INSERT INTO treatments (name, description, duration_minutes, price, requires_consent, risk_level) VALUES
('Dental Cleaning', 'Routine dental cleaning and examination', 45, 150.00, false, 'low'),
('Tooth Filling', 'Cavity restoration with composite filling', 60, 200.00, true, 'low'),
('Root Canal Treatment', 'Endodontic treatment for infected tooth', 90, 800.00, true, 'high'),
('Tooth Extraction', 'Surgical removal of tooth', 45, 300.00, true, 'medium'),
('Crown Placement', 'Dental crown installation', 120, 1200.00, true, 'medium'),
('Dental Implant', 'Surgical implant placement', 180, 2500.00, true, 'high'),
('Teeth Whitening', 'Professional teeth whitening treatment', 60, 400.00, true, 'low'),
('Orthodontic Consultation', 'Braces and alignment consultation', 30, 100.00, false, 'low')
ON CONFLICT (name) DO NOTHING;

-- Create RLS policies
ALTER TABLE procedure_form_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_form_assistance ENABLE ROW LEVEL SECURITY;

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

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_treatments_updated_at BEFORE UPDATE ON treatments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();