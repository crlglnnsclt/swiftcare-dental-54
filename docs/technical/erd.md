
# Entity Relationship Diagrams (ERD)
## SwiftCare Dental Clinic MVP

### Complete Data Model

```mermaid
erDiagram
    USERS {
        uuid id PK
        string email UK
        string password_hash
        string first_name
        string last_name
        string phone
        enum role
        boolean is_active
        timestamp created_at
        timestamp updated_at
        timestamp last_login
    }

    PATIENTS {
        uuid id PK
        uuid user_id FK
        string patient_number UK
        date date_of_birth
        enum gender
        string address
        string city
        string state
        string zip_code
        string emergency_contact_name
        string emergency_contact_phone
        text medical_history
        text allergies
        text current_medications
        string insurance_provider
        string insurance_policy_number
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    DENTISTS {
        uuid id PK
        uuid user_id FK
        string license_number UK
        string specialization
        text bio
        decimal consultation_fee
        integer years_experience
        boolean is_available
        timestamp created_at
        timestamp updated_at
    }

    STAFF {
        uuid id PK
        uuid user_id FK
        string employee_id UK
        string department
        string position
        decimal hourly_rate
        date hire_date
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    APPOINTMENTS {
        uuid id PK
        uuid patient_id FK
        uuid dentist_id FK
        uuid created_by FK
        string appointment_number UK
        datetime scheduled_datetime
        integer duration_minutes
        enum status
        enum appointment_type
        text reason_for_visit
        text notes
        decimal estimated_cost
        boolean is_emergency
        timestamp created_at
        timestamp updated_at
        timestamp cancelled_at
        uuid cancelled_by FK
        text cancellation_reason
    }

    TREATMENTS {
        uuid id PK
        string treatment_code UK
        string name
        text description
        decimal base_cost
        integer estimated_duration_minutes
        string category
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    APPOINTMENT_TREATMENTS {
        uuid id PK
        uuid appointment_id FK
        uuid treatment_id FK
        integer quantity
        decimal unit_cost
        decimal total_cost
        enum status
        text notes
        timestamp created_at
        timestamp updated_at
    }

    BILLING {
        uuid id PK
        uuid patient_id FK
        uuid appointment_id FK
        string invoice_number UK
        decimal subtotal
        decimal tax_amount
        decimal discount_amount
        decimal total_amount
        decimal paid_amount
        decimal balance_due
        enum status
        date due_date
        text notes
        timestamp created_at
        timestamp updated_at
    }

    PAYMENTS {
        uuid id PK
        uuid billing_id FK
        string payment_reference UK
        decimal amount
        enum payment_method
        enum status
        string transaction_id
        text notes
        timestamp processed_at
        timestamp created_at
        timestamp updated_at
    }

    SCHEDULES {
        uuid id PK
        uuid dentist_id FK
        date schedule_date
        time start_time
        time end_time
        boolean is_available
        text notes
        timestamp created_at
        timestamp updated_at
    }

    AUDIT_LOGS {
        uuid id PK
        uuid user_id FK
        string entity_type
        uuid entity_id
        enum action
        json old_values
        json new_values
        string ip_address
        string user_agent
        timestamp created_at
    }

    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        string title
        text message
        enum type
        enum status
        json metadata
        timestamp scheduled_at
        timestamp sent_at
        timestamp read_at
        timestamp created_at
    }

    SYSTEM_SETTINGS {
        uuid id PK
        string setting_key UK
        string setting_value
        string description
        enum data_type
        boolean is_public
        timestamp created_at
        timestamp updated_at
    }

    %% Relationships
    USERS ||--o{ PATIENTS : "user_id"
    USERS ||--o{ DENTISTS : "user_id"
    USERS ||--o{ STAFF : "user_id"
    USERS ||--o{ AUDIT_LOGS : "user_id"
    USERS ||--o{ NOTIFICATIONS : "user_id"
    
    PATIENTS ||--o{ APPOINTMENTS : "patient_id"
    PATIENTS ||--o{ BILLING : "patient_id"
    
    DENTISTS ||--o{ APPOINTMENTS : "dentist_id"
    DENTISTS ||--o{ SCHEDULES : "dentist_id"
    
    APPOINTMENTS ||--o{ APPOINTMENT_TREATMENTS : "appointment_id"
    APPOINTMENTS ||--o{ BILLING : "appointment_id"
    
    TREATMENTS ||--o{ APPOINTMENT_TREATMENTS : "treatment_id"
    
    BILLING ||--o{ PAYMENTS : "billing_id"
    
    USERS ||--o{ APPOINTMENTS : "created_by"
    USERS ||--o{ APPOINTMENTS : "cancelled_by"
```

### Entity Definitions

#### USERS
Core user authentication and profile information for all system users.

**Key Attributes:**
- `role`: ENUM('patient', 'dentist', 'receptionist', 'admin', 'manager')
- `email`: Unique identifier for login
- `is_active`: Soft delete flag

#### PATIENTS
Extended profile information specific to patients.

**Key Attributes:**
- `patient_number`: Auto-generated unique identifier (P-YYYY-NNNN)
- `medical_history`: JSON or text field for medical conditions
- `insurance_policy_number`: For billing integration

#### DENTISTS
Professional information for dental practitioners.

**Key Attributes:**
- `license_number`: State dental license number
- `specialization`: Area of expertise
- `consultation_fee`: Base consultation rate

#### APPOINTMENTS
Central scheduling entity with comprehensive status tracking.

**Key Attributes:**
- `status`: ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')
- `appointment_type`: ENUM('consultation', 'cleaning', 'procedure', 'emergency', 'follow_up')
- `duration_minutes`: Default 30, customizable per appointment type

#### TREATMENTS
Master catalog of dental procedures and services.

**Key Attributes:**
- `treatment_code`: Standardized dental procedure codes (ADA codes)
- `category`: Grouping for reporting (preventive, restorative, surgical, etc.)

#### BILLING
Comprehensive billing system with multi-payment support.

**Key Attributes:**
- `status`: ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled')
- `balance_due`: Calculated field (total_amount - paid_amount)

### Database Constraints and Indexes

#### Primary Indexes
- All primary keys (UUID) have clustered indexes
- Unique constraints on business keys (email, patient_number, etc.)

#### Performance Indexes
```sql
-- Appointment queries
CREATE INDEX idx_appointments_patient_date ON appointments(patient_id, scheduled_datetime);
CREATE INDEX idx_appointments_dentist_date ON appointments(dentist_id, scheduled_datetime);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Billing queries
CREATE INDEX idx_billing_patient_status ON billing(patient_id, status);
CREATE INDEX idx_billing_due_date ON billing(due_date) WHERE status != 'paid';

-- Audit trail
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user_date ON audit_logs(user_id, created_at);

-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_active ON users(role, is_active);
```

#### Foreign Key Constraints
All foreign key relationships enforce referential integrity with appropriate CASCADE/RESTRICT rules:
- User deletions: RESTRICT (prevent deletion if related records exist)
- Appointment cancellations: SET NULL for cancelled_by
- Soft deletes: Use is_active flags instead of hard deletes
