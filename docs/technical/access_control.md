
# Access Control Matrix
## SwiftCare Dental Clinic MVP

### Role Definitions

#### Patient
End users who book appointments and receive dental care.

#### Receptionist
Front desk staff who manage appointments and basic patient information.

#### Dentist
Licensed dental professionals who provide care and manage their schedules.

#### Manager
Clinic managers who oversee operations and staff.

#### Admin
System administrators with full access to all features.

### Permission Matrix

| Feature/Resource | Patient | Receptionist | Dentist | Manager | Admin |
|------------------|---------|--------------|---------|---------|-------|
| **Authentication** |
| Login/Logout | ✅ | ✅ | ✅ | ✅ | ✅ |
| Change Own Password | ✅ | ✅ | ✅ | ✅ | ✅ |
| Reset Password | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Profile Management** |
| View Own Profile | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit Own Profile | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Other Profiles | ❌ | 👥 | 👥 | ✅ | ✅ |
| Edit Other Profiles | ❌ | 👥 | ❌ | ✅ | ✅ |
| **Patient Management** |
| View Own Patient Record | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit Own Patient Record | ✅ | ❌ | ❌ | ❌ | ❌ |
| View All Patients | ❌ | ✅ | 👥 | ✅ | ✅ |
| Create Patient Records | ❌ | ✅ | ❌ | ✅ | ✅ |
| Edit Patient Records | ❌ | ✅ | 📝 | ✅ | ✅ |
| Delete Patient Records | ❌ | ❌ | ❌ | ✅ | ✅ |
| View Medical History | 🔒 | ❌ | 👥 | ✅ | ✅ |
| Edit Medical History | ❌ | ❌ | 👥 | ❌ | ✅ |
| **Appointment Management** |
| View Own Appointments | ✅ | ❌ | ❌ | ❌ | ❌ |
| Book Own Appointments | ✅ | ❌ | ❌ | ❌ | ❌ |
| Cancel Own Appointments | ✅ | ❌ | ❌ | ❌ | ❌ |
| View All Appointments | ❌ | ✅ | 👥 | ✅ | ✅ |
| Create Any Appointment | ❌ | ✅ | ❌ | ✅ | ✅ |
| Edit Any Appointment | ❌ | ✅ | 👥 | ✅ | ✅ |
| Cancel Any Appointment | ❌ | ✅ | 👥 | ✅ | ✅ |
| Confirm Appointments | ❌ | ✅ | ✅ | ✅ | ✅ |
| Mark No-Show | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Schedule Management** |
| View Dentist Schedules | 📅 | ✅ | 🔒 | ✅ | ✅ |
| Edit Own Schedule | ❌ | ❌ | ✅ | ❌ | ✅ |
| Edit Any Schedule | ❌ | ❌ | ❌ | ✅ | ✅ |
| Set Availability | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Treatment Management** |
| View Treatment Catalog | ✅ | ✅ | ✅ | ✅ | ✅ |
| Add Treatments to Appointments | ❌ | ❌ | ✅ | ✅ | ✅ |
| Edit Treatment Catalog | ❌ | ❌ | ❌ | ✅ | ✅ |
| Set Treatment Prices | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Billing Management** |
| View Own Bills | ✅ | ❌ | ❌ | ❌ | ❌ |
| Pay Own Bills | ✅ | ❌ | ❌ | ❌ | ❌ |
| View All Bills | ❌ | ✅ | ❌ | ✅ | ✅ |
| Create Bills | ❌ | ✅ | ❌ | ✅ | ✅ |
| Edit Bills | ❌ | ✅ | ❌ | ✅ | ✅ |
| Process Payments | ❌ | ✅ | ❌ | ✅ | ✅ |
| Generate Reports | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Staff Management** |
| View Staff List | ❌ | ❌ | ❌ | ✅ | ✅ |
| Create Staff Accounts | ❌ | ❌ | ❌ | ✅ | ✅ |
| Edit Staff Information | ❌ | ❌ | ❌ | ✅ | ✅ |
| Deactivate Staff | ❌ | ❌ | ❌ | ✅ | ✅ |
| Assign Roles | ❌ | ❌ | ❌ | ❌ | ✅ |
| **System Administration** |
| View System Settings | ❌ | ❌ | ❌ | ❌ | ✅ |
| Edit System Settings | ❌ | ❌ | ❌ | ❌ | ✅ |
| View Audit Logs | ❌ | ❌ | ❌ | ✅ | ✅ |
| Backup System | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Notifications** |
| Receive Notifications | ✅ | ✅ | ✅ | ✅ | ✅ |
| Send Notifications | ❌ | ✅ | ✅ | ✅ | ✅ |
| Configure Notifications | ❌ | ❌ | ❌ | ✅ | ✅ |

### Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Full Access |
| ❌ | No Access |
| 🔒 | Own Records Only |
| 👥 | Assigned Patients Only |
| 📝 | Clinical Notes Only |
| 📅 | View Only for Booking |

### Detailed Permission Rules

#### Patient Permissions
- **Own Data Access**: Patients can only view and edit their own profile and patient records
- **Appointment Management**: Can book, view, and cancel their own appointments only
- **Billing**: Can view their own bills and make payments
- **Restrictions**: Cannot access other patients' data or administrative functions

#### Receptionist Permissions
- **Patient Management**: Full CRUD access to patient records for operational needs
- **Appointment Management**: Can manage all appointments across all patients and dentists
- **Billing**: Can create bills, process payments, and manage billing records
- **Restrictions**: Cannot access medical history details or system administration

#### Dentist Permissions
- **Patient Access**: Can view and edit clinical information for assigned patients only
- **Appointment Management**: Can manage appointments for their own schedule
- **Treatment Management**: Can add treatments to appointments and update clinical notes
- **Schedule Management**: Full control over their own schedule and availability
- **Restrictions**: Cannot access billing details or other dentists' information

#### Manager Permissions
- **Operational Oversight**: Can view and manage most operational aspects
- **Staff Management**: Can manage staff information and assignments
- **Reporting**: Access to business reports and analytics
- **Billing Management**: Full access to billing and financial information
- **Restrictions**: Cannot modify system settings or access audit logs

#### Admin Permissions
- **Full System Access**: Complete access to all features and data
- **System Administration**: Can modify system settings and configurations
- **User Management**: Can create, modify, and deactivate user accounts
- **Security**: Access to audit logs and security settings
- **Backup and Maintenance**: System backup and maintenance functions

### Security Policies

#### Authentication Requirements
- **Password Policy**: Minimum 8 characters, must include uppercase, lowercase, number, and special character
- **Session Management**: JWT tokens expire after 24 hours
- **Multi-Factor Authentication**: Required for Admin and Manager roles
- **Account Lockout**: 5 failed login attempts result in 15-minute lockout

#### Data Access Controls
- **Row-Level Security**: Patients can only access their own records
- **Column-Level Security**: Sensitive medical information restricted by role
- **Audit Logging**: All data access and modifications are logged
- **Data Encryption**: All sensitive data encrypted at rest and in transit

#### API Security
- **Rate Limiting**: API calls limited by role and endpoint
- **IP Whitelisting**: Admin functions restricted to clinic IP addresses
- **CORS Policy**: Strict cross-origin resource sharing policies
- **Input Validation**: All inputs validated and sanitized

#### Business Rules
- **Appointment Booking**: Patients cannot book appointments outside business hours
- **Cancellation Policy**: Appointments can only be cancelled up to 24 hours in advance
- **Medical Records**: Only licensed dentists can modify medical history
- **Billing**: Bills cannot be deleted, only voided with proper authorization

### Role Assignment Rules

#### Automatic Role Assignment
- New patient registrations automatically receive "Patient" role
- Staff accounts must be created by Manager or Admin
- Dentist accounts require license verification before activation

#### Role Modification
- Only Admins can change user roles
- Role changes require approval workflow for sensitive roles
- Temporary role elevation available for emergency situations

#### Role Inheritance
- Manager role includes all Receptionist permissions
- Admin role includes all Manager permissions
- Dentist role includes relevant Patient permissions for their own account

### Compliance and Audit

#### HIPAA Compliance
- All medical data access logged and monitored
- Minimum necessary access principle enforced
- Regular access reviews and certifications required

#### Audit Requirements
- All user actions logged with timestamp and IP address
- Failed access attempts monitored and reported
- Regular security assessments and penetration testing

#### Data Retention
- Audit logs retained for 7 years
- Patient records retained per state regulations
- Deleted records moved to secure archive, not permanently deleted
