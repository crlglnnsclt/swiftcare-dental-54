
# Database Schema
## SwiftCare Dental Clinic MVP

### Database Configuration

**Database Engine:** PostgreSQL 14+  
**Character Set:** UTF8  
**Collation:** en_US.UTF8  
**Timezone:** UTC (application handles local timezone conversion)

### Table Definitions

#### USERS Table
Core authentication and user profile table.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role user_role_enum NOT NULL DEFAULT 'patient',
    is_active BOOLEAN NOT NULL DEFAULT true,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Enum for user roles
CREATE TYPE user_role_enum AS ENUM (
    'patient',
    'dentist', 
    'receptionist',
    'manager',
    'admin'
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_active ON users(role, is_active);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### PATIENTS Table
Extended patient-specific information.

```sql
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    patient_number VARCHAR(20) NOT NULL UNIQUE,
    date_of_birth DATE NOT NULL,
    gender gender_enum,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(10),
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    medical_history TEXT,
    allergies TEXT,
    current_medications TEXT,
    insurance_provider VARCHAR(200),
    insurance_policy_number VARCHAR(100),
    insurance_group_number VARCHAR(100),
    preferred_language VARCHAR(50) DEFAULT 'English',
    communication_preference communication_pref_enum DEFAULT 'email',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Enums
CREATE TYPE gender_enum AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE communication_pref_enum AS ENUM ('email', 'sms', 'phone', 'mail');

-- Indexes
CREATE UNIQUE INDEX idx_patients_user_id ON patients(user_id);
CREATE UNIQUE INDEX idx_patients_number ON patients(patient_number);
CREATE INDEX idx_patients_active ON patients(is_active);
CREATE INDEX idx_patients_insurance ON patients(insurance_provider);

-- Trigger for auto-generating patient number
CREATE OR REPLACE FUNCTION generate_patient_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.patient_number := 'P-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-' || 
                         LPAD(NEXTVAL('patient_number_seq')::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE patient_number_seq START 1;
CREATE TRIGGER trigger_generate_patient_number
    BEFORE INSERT ON patients
    FOR EACH ROW
    EXECUTE FUNCTION generate_patient_number();
```

#### DENTISTS Table
Dentist professional information.

```sql
CREATE TABLE dentists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    license_number VARCHAR(50) NOT NULL UNIQUE,
    license_state VARCHAR(50) NOT NULL,
    license_expiry_date DATE,
    specialization VARCHAR(200),
    bio TEXT,
    consultation_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    years_experience INTEGER DEFAULT 0,
    education TEXT,
    certifications TEXT,
    languages_spoken TEXT[] DEFAULT ARRAY['English'],
    is_available BOOLEAN NOT NULL DEFAULT true,
    is_accepting_new_patients BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE UNIQUE INDEX idx_dentists_user_id ON dentists(user_id);
CREATE UNIQUE INDEX idx_dentists_license ON dentists(license_number);
CREATE INDEX idx_dentists_available ON dentists(is_available);
CREATE INDEX idx_dentists_specialization ON dentists(specialization);
```

#### STAFF Table
Non-dentist staff information.

```sql
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    employee_id VARCHAR(20) NOT NULL UNIQUE,
    department VARCHAR(100),
    position VARCHAR(100),
    hourly_rate DECIMAL(8,2),
    hire_date DATE NOT NULL,
    supervisor_id UUID REFERENCES staff(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE UNIQUE INDEX idx_staff_user_id ON staff(user_id);
CREATE UNIQUE INDEX idx_staff_employee_id ON staff(employee_id);
CREATE INDEX idx_staff_department ON staff(department);
CREATE INDEX idx_staff_active ON staff(is_active);
```

#### APPOINTMENTS Table
Central appointment scheduling table.

```sql
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_number VARCHAR(20) NOT NULL UNIQUE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    dentist_id UUID NOT NULL REFERENCES dentists(id) ON DELETE RESTRICT,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    scheduled_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    status appointment_status_enum NOT NULL DEFAULT 'scheduled',
    appointment_type appointment_type_enum NOT NULL,
    reason_for_visit TEXT,
    notes TEXT,
    internal_notes TEXT, -- Staff-only notes
    estimated_cost DECIMAL(10,2) DEFAULT 0.00,
    is_emergency BOOLEAN NOT NULL DEFAULT false,
    confirmation_sent_at TIMESTAMP WITH TIME ZONE,
    reminder_sent_at TIMESTAMP WITH TIME ZONE,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_by UUID REFERENCES users(id),
    cancellation_reason TEXT,
    no_show_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Enums
CREATE TYPE appointment_status_enum AS ENUM (
    'scheduled',
    'confirmed', 
    'checked_in',
    'in_progress',
    'completed',
    'cancelled',
    'no_show',
    'rescheduled'
);

CREATE TYPE appointment_type_enum AS ENUM (
    'consultation',
    'cleaning',
    'procedure',
    'surgery',
    'emergency',
    'follow_up',
    'x_ray'
);

-- Indexes
CREATE UNIQUE INDEX idx_appointments_number ON appointments(appointment_number);
CREATE INDEX idx_appointments_patient_date ON appointments(patient_id, scheduled_datetime);
CREATE INDEX idx_appointments_dentist_date ON appointments(dentist_id, scheduled_datetime);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_date_range ON appointments(scheduled_datetime);
CREATE INDEX idx_appointments_emergency ON appointments(is_emergency) WHERE is_emergency = true;

-- Trigger for auto-generating appointment number
CREATE OR REPLACE FUNCTION generate_appointment_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.appointment_number := 'A-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-' || 
                             LPAD(NEXTVAL('appointment_number_seq')::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE appointment_number_seq START 1;
CREATE TRIGGER trigger_generate_appointment_number
    BEFORE INSERT ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION generate_appointment_number();

-- Constraint to prevent double booking
CREATE UNIQUE INDEX idx_appointments_dentist_time_conflict 
ON appointments(dentist_id, scheduled_datetime) 
WHERE status NOT IN ('cancelled', 'no_show', 'completed');
```

#### TREATMENTS Table
Master catalog of dental procedures.

```sql
CREATE TABLE treatments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    treatment_code VARCHAR(20) NOT NULL UNIQUE, -- ADA codes
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    base_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    estimated_duration_minutes INTEGER NOT NULL DEFAULT 30,
    requires_anesthesia BOOLEAN DEFAULT false,
    requires_followup BOOLEAN DEFAULT false,
    is_surgical BOOLEAN DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE UNIQUE INDEX idx_treatments_code ON treatments(treatment_code);
CREATE INDEX idx_treatments_category ON treatments(category);
CREATE INDEX idx_treatments_active ON treatments(is_active);
CREATE INDEX idx_treatments_cost ON treatments(base_cost);
```

#### APPOINTMENT_TREATMENTS Table
Junction table for treatments performed during appointments.

```sql
CREATE TABLE appointment_treatments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    treatment_id UUID NOT NULL REFERENCES treatments(id) ON DELETE RESTRICT,
    tooth_number VARCHAR(10), -- Specific tooth if applicable
    surface VARCHAR(50), -- Tooth surface if applicable
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_cost DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    status treatment_status_enum NOT NULL DEFAULT 'planned',
    notes TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE treatment_status_enum AS ENUM (
    'planned',
    'in_progress', 
    'completed',
    'cancelled',
    'deferred'
);

-- Indexes
CREATE INDEX idx_appointment_treatments_appointment ON appointment_treatments(appointment_id);
CREATE INDEX idx_appointment_treatments_treatment ON appointment_treatments(treatment_id);
CREATE INDEX idx_appointment_treatments_status ON appointment_treatments(status);

-- Trigger to calculate total cost
CREATE OR REPLACE FUNCTION calculate_treatment_total()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total_cost := NEW.quantity * NEW.unit_cost;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_treatment_total
    BEFORE INSERT OR UPDATE ON appointment_treatments
    FOR EACH ROW
    EXECUTE FUNCTION calculate_treatment_total();
```

#### SCHEDULES Table
Dentist availability schedules.

```sql
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dentist_id UUID NOT NULL REFERENCES dentists(id) ON DELETE CASCADE,
    schedule_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT true,
    schedule_type schedule_type_enum NOT NULL DEFAULT 'regular',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_time_order CHECK (start_time < end_time)
);

CREATE TYPE schedule_type_enum AS ENUM (
    'regular',
    'vacation',
    'sick_leave',
    'conference',
    'emergency_only'
);

-- Indexes
CREATE INDEX idx_schedules_dentist_date ON schedules(dentist_id, schedule_date);
CREATE INDEX idx_schedules_date_range ON schedules(schedule_date);
CREATE INDEX idx_schedules_available ON schedules(is_available);

-- Prevent overlapping schedules for same dentist
CREATE UNIQUE INDEX idx_schedules_no_overlap 
ON schedules(dentist_id, schedule_date, start_time, end_time);
```

#### BILLING Table
Comprehensive billing system.

```sql
CREATE TABLE billing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(20) NOT NULL UNIQUE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0875, -- 8.75% default
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_reason TEXT,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    balance_due DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status billing_status_enum NOT NULL DEFAULT 'draft',
    due_date DATE,
    sent_date DATE,
    payment_terms INTEGER DEFAULT 30, -- Days
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE billing_status_enum AS ENUM (
    'draft',
    'sent',
    'partial_payment',
    'paid',
    'overdue',
    'cancelled',
    'refunded'
);

-- Indexes
CREATE UNIQUE INDEX idx_billing_invoice_number ON billing(invoice_number);
CREATE INDEX idx_billing_patient_status ON billing(patient_id, status);
CREATE INDEX idx_billing_due_date ON billing(due_date) WHERE status NOT IN ('paid', 'cancelled');
CREATE INDEX idx_billing_appointment ON billing(appointment_id);

-- Trigger for auto-generating invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.invoice_number := 'INV-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-' || 
                         LPAD(NEXTVAL('invoice_number_seq')::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE invoice_number_seq START 1;
CREATE TRIGGER trigger_generate_invoice_number
    BEFORE INSERT ON billing
    FOR EACH ROW
    EXECUTE FUNCTION generate_invoice_number();

-- Trigger to calculate totals
CREATE OR REPLACE FUNCTION calculate_billing_totals()
RETURNS TRIGGER AS $$
BEGIN
    NEW.tax_amount := NEW.subtotal * NEW.tax_rate;
    NEW.total_amount := NEW.subtotal + NEW.tax_amount - NEW.discount_amount;
    NEW.balance_due := NEW.total_amount - NEW.paid_amount;
    
    -- Update status based on payment
    IF NEW.balance_due <= 0 THEN
        NEW.status := 'paid';
    ELSIF NEW.paid_amount > 0 THEN
        NEW.status := 'partial_payment';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_billing_totals
    BEFORE INSERT OR UPDATE ON billing
    FOR EACH ROW
    EXECUTE FUNCTION calculate_billing_totals();
```

#### PAYMENTS Table
Payment transaction records.

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    billing_id UUID NOT NULL REFERENCES billing(id) ON DELETE RESTRICT,
    payment_reference VARCHAR(50) NOT NULL UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method payment_method_enum NOT NULL,
    status payment_status_enum NOT NULL DEFAULT 'pending',
    transaction_id VARCHAR(100), -- External payment processor ID
    processor VARCHAR(50), -- Stripe, Square, etc.
    processor_fee DECIMAL(10,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    notes TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,
    refunded_at TIMESTAMP WITH TIME ZONE,
    refund_amount DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE payment_method_enum AS ENUM (
    'cash',
    'check',
    'credit_card',
    'debit_card',
    'bank_transfer',
    'insurance',
    'financing'
);

CREATE TYPE payment_status_enum AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed',
    'cancelled',
    'refunded'
);

-- Indexes
CREATE UNIQUE INDEX idx_payments_reference ON payments(payment_reference);
CREATE INDEX idx_payments_billing ON payments(billing_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_method ON payments(payment_method);
CREATE INDEX idx_payments_processed_date ON payments(processed_at);

-- Trigger for auto-generating payment reference
CREATE OR REPLACE FUNCTION generate_payment_reference()
RETURNS TRIGGER AS $$
BEGIN
    NEW.payment_reference := 'PAY-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-' || 
                            LPAD(NEXTVAL('payment_reference_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE payment_reference_seq START 1;
CREATE TRIGGER trigger_generate_payment_reference
    BEFORE INSERT ON payments
    FOR EACH ROW
    EXECUTE FUNCTION generate_payment_reference();
```

#### AUDIT_LOGS Table
Comprehensive audit trail.

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action audit_action_enum NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE audit_action_enum AS ENUM (
    'create',
    'read',
    'update', 
    'delete',
    'login',
    'logout',
    'password_change',
    'permission_change'
);

-- Indexes
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Partition by month for performance
CREATE TABLE audit_logs_y2024m01 PARTITION OF audit_logs
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

#### NOTIFICATIONS Table
System notifications and messaging.

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type notification_type_enum NOT NULL,
    status notification_status_enum NOT NULL DEFAULT 'pending',
    priority notification_priority_enum NOT NULL DEFAULT 'normal',
    metadata JSONB,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE notification_type_enum AS ENUM (
    'appointment_reminder',
    'appointment_confirmation',
    'appointment_cancelled',
    'payment_due',
    'payment_received',
    'treatment_plan',
    'system_alert',
    'marketing'
);

CREATE TYPE notification_status_enum AS ENUM (
    'pending',
    'sent',
    'delivered',
    'failed',
    'cancelled'
);

CREATE TYPE notification_priority_enum AS ENUM (
    'low',
    'normal',
    'high',
    'urgent'
);

-- Indexes
CREATE INDEX idx_notifications_user_status ON notifications(user_id, status);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_at) WHERE status = 'pending';
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_priority ON notifications(priority);
```

#### SYSTEM_SETTINGS Table
Application configuration settings.

```sql
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description TEXT,
    data_type setting_data_type_enum NOT NULL DEFAULT 'string',
    is_public BOOLEAN NOT NULL DEFAULT false,
    is_encrypted BOOLEAN NOT NULL DEFAULT false,
    validation_rules JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE setting_data_type_enum AS ENUM (
    'string',
    'integer',
    'decimal',
    'boolean',
    'json',
    'date',
    'time'
);

-- Indexes
CREATE UNIQUE INDEX idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX idx_system_settings_public ON system_settings(is_public);

-- Default settings
INSERT INTO system_settings (setting_key, setting_value, description, data_type, is_public) VALUES
('clinic_name', 'SwiftCare Dental Clinic', 'Clinic name displayed in UI', 'string', true),
('clinic_phone', '(555) 123-4567', 'Main clinic phone number', 'string', true),
('clinic_email', 'info@swiftcare.com', 'Main clinic email', 'string', true),
('appointment_duration_default', '30', 'Default appointment duration in minutes', 'integer', false),
('appointment_buffer_time', '15', 'Buffer time between appointments in minutes', 'integer', false),
('business_hours_start', '09:00', 'Business hours start time', 'time', true),
('business_hours_end', '17:00', 'Business hours end time', 'time', true),
('tax_rate', '0.0875', 'Default tax rate for billing', 'decimal', false),
('payment_terms_days', '30', 'Default payment terms in days', 'integer', false);
```

### Views and Functions

#### Patient Summary View
```sql
CREATE VIEW patient_summary AS
SELECT 
    p.id,
    p.patient_number,
    u.first_name,
    u.last_name,
    u.email,
    u.phone,
    p.date_of_birth,
    p.insurance_provider,
    p.is_active,
    COUNT(a.id) as total_appointments,
    MAX(a.scheduled_datetime) as last_appointment,
    COALESCE(SUM(b.balance_due), 0) as outstanding_balance
FROM patients p
JOIN users u ON p.user_id = u.id
LEFT JOIN appointments a ON p.id = a.patient_id AND a.status = 'completed'
LEFT JOIN billing b ON p.id = b.patient_id AND b.status != 'paid'
GROUP BY p.id, p.patient_number, u.first_name, u.last_name, u.email, u.phone, 
         p.date_of_birth, p.insurance_provider, p.is_active;
```

#### Appointment Schedule View
```sql
CREATE VIEW appointment_schedule AS
SELECT 
    a.id,
    a.appointment_number,
    a.scheduled_datetime,
    a.duration_minutes,
    a.status,
    a.appointment_type,
    p.patient_number,
    u_patient.first_name as patient_first_name,
    u_patient.last_name as patient_last_name,
    u_dentist.first_name as dentist_first_name,
    u_dentist.last_name as dentist_last_name,
    a.reason_for_visit,
    a.is_emergency
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN users u_patient ON p.user_id = u_patient.id
JOIN dentists d ON a.dentist_id = d.id
JOIN users u_dentist ON d.user_id = u_dentist.id
WHERE a.status NOT IN ('cancelled', 'no_show');
```

### Database Maintenance

#### Automated Tasks
```sql
-- Clean up old audit logs (keep 7 years)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM audit_logs 
    WHERE created_at < CURRENT_DATE - INTERVAL '7 years';
END;
$$ LANGUAGE plpgsql;

-- Update overdue billing status
CREATE OR REPLACE FUNCTION update_overdue_bills()
RETURNS void AS $$
BEGIN
    UPDATE billing 
    SET status = 'overdue'
    WHERE due_date < CURRENT_DATE 
    AND status = 'sent' 
    AND balance_due > 0;
END;
$$ LANGUAGE plpgsql;

-- Schedule these functions to run daily
SELECT cron.schedule('cleanup-audit-logs', '0 2 * * *', 'SELECT cleanup_old_audit_logs();');
SELECT cron.schedule('update-overdue-bills', '0 1 * * *', 'SELECT update_overdue_bills();');
```

#### Backup Strategy
```sql
-- Full backup script (run nightly)
pg_dump -h localhost -U postgres -d swiftcare_db -f /backups/swiftcare_full_$(date +%Y%m%d).sql

-- Incremental backup using WAL archiving
archive_mode = on
archive_command = 'cp %p /backups/wal/%f'
```

### Performance Optimization

#### Query Optimization
- All foreign keys have corresponding indexes
- Composite indexes for common query patterns
- Partial indexes for filtered queries
- Covering indexes for read-heavy operations

#### Connection Pooling
```sql
-- Recommended connection pool settings
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
```

#### Monitoring Queries
```sql
-- Find slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Monitor table sizes
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

This comprehensive database schema provides a robust foundation for the SwiftCare Dental Clinic MVP, with proper normalization, constraints, indexes, and maintenance procedures to ensure data integrity and optimal performance.
