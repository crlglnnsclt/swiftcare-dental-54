-- Add cancellation and status tracking fields to appointments table
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'waiting';
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'in_procedure';
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'billing';
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'no_show';

-- Add cancellation tracking fields
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS cancelled_by_user_id UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS cancelled_by_role user_role,
ADD COLUMN IF NOT EXISTS cancel_reason TEXT,
ADD COLUMN IF NOT EXISTS cancel_timestamp TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS no_show_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reopened_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS cancel_visibility TEXT DEFAULT 'patient_visible',
ADD COLUMN IF NOT EXISTS actual_start_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS actual_end_time TIMESTAMPTZ;

-- Create notification_history table for tracking notifications
CREATE TABLE IF NOT EXISTS notification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  appointment_id UUID REFERENCES appointments(id),
  notification_type TEXT NOT NULL,
  content JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS on notification_history
ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;

-- Create policies for notification_history
CREATE POLICY "Staff can view notifications" ON notification_history
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.user_id = auth.uid() 
    AND users.role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
  )
);

CREATE POLICY "System can insert notifications" ON notification_history
FOR INSERT WITH CHECK (true);

-- Create appointment_audit table for tracking all changes
CREATE TABLE IF NOT EXISTS appointment_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id),
  action_type TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  performed_by UUID REFERENCES users(id),
  performed_by_role user_role,
  timestamp TIMESTAMPTZ DEFAULT now(),
  reason TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS on appointment_audit
ALTER TABLE appointment_audit ENABLE ROW LEVEL SECURITY;

-- Create policies for appointment_audit
CREATE POLICY "Admins can view audit logs" ON appointment_audit
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.user_id = auth.uid() 
    AND users.role IN ('clinic_admin', 'super_admin')
  )
);

CREATE POLICY "System can insert audit logs" ON appointment_audit
FOR INSERT WITH CHECK (true);

-- Create function to log appointment changes
CREATE OR REPLACE FUNCTION log_appointment_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO appointment_audit (
    appointment_id,
    action_type,
    old_values,
    new_values,
    performed_by,
    performed_by_role,
    reason
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    to_jsonb(OLD),
    to_jsonb(NEW),
    auth.uid(),
    (SELECT role FROM users WHERE user_id = auth.uid()),
    CASE 
      WHEN NEW.cancel_reason IS NOT NULL THEN NEW.cancel_reason
      ELSE NULL
    END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for appointment changes
DROP TRIGGER IF EXISTS appointment_audit_trigger ON appointments;
CREATE TRIGGER appointment_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON appointments
  FOR EACH ROW EXECUTE FUNCTION log_appointment_change();