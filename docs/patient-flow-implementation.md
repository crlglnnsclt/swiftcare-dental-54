# Patient Status Flow Implementation Guide

## Swimlane Diagram

### Roles & Responsibilities

**Patient**
- Book/reschedule/cancel appointments
- Check-in via QR/online
- View appointment status and notifications
- Cannot mark appointments completed for others

**Staff**
- Create/edit/cancel appointments
- Assist with check-in (QR/manual)
- Reorder queue for emergencies
- Mark patients as checked-in → waiting → in-procedure
- Cancel with required reason

**Dentist**
- Pull patients into procedure
- Log treatments and consumables
- Cancel with required reason (triggers urgent alerts if last-minute)
- Complete procedures → trigger billing

**Admin (Per Clinic)**
- Cancel/reopen appointments with policy governance
- View cancellation audit logs
- Edit cancellation visibility settings

**Super Admin**
- System-level audit view
- Override blocked operations
- Special logging for post-procedure cancellations

**System**
- Auto-transitions and no-show detection
- Queue management and notifications
- Audit logging and alerts

## Implementation Checklist

### Database Changes

1. **Update appointments table enum:**
```sql
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'waiting';
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'in_procedure';
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'billing';
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'no_show';
```

2. **Add cancellation fields to appointments:**
```sql
ALTER TABLE appointments ADD COLUMN cancelled_by_user_id UUID REFERENCES users(id);
ALTER TABLE appointments ADD COLUMN cancelled_by_role user_role;
ALTER TABLE appointments ADD COLUMN cancel_reason TEXT;
ALTER TABLE appointments ADD COLUMN cancel_timestamp TIMESTAMPTZ;
ALTER TABLE appointments ADD COLUMN no_show_at TIMESTAMPTZ;
ALTER TABLE appointments ADD COLUMN reopened_by UUID REFERENCES users(id);
ALTER TABLE appointments ADD COLUMN cancel_visibility TEXT DEFAULT 'patient_visible';
```

### API Endpoints

1. **POST /appointments/{id}/checkin**
   - Payload: `{ user_id, branch_id, checkin_method }`
   - Emits: `appointment.checked_in` event

2. **POST /appointments/{id}/start**
   - Payload: `{ dentist_id }`
   - Emits: `appointment.in_procedure` event

3. **POST /appointments/{id}/billing**
   - Payload: `{ treatment_data, consumables }`
   - Emits: `billing.created` event

4. **POST /appointments/{id}/cancel**
   - Payload: `{ user_id, role, reason, timestamp, visibility }`
   - Emits: `appointment.cancelled` and notification events

5. **POST /appointments/{id}/reopen**
   - Admin/Super Admin only
   - Logs reopened_by field

### Background Jobs

1. **No-Show Worker**
   - Runs every 5 minutes
   - Checks appointments at scheduled_time + 15min grace period
   - Sets status='cancelled', reason='no_show', cancelled_by_role='system'

2. **Queue Management Worker**
   - Real-time queue updates
   - Remove cancelled appointments
   - Update TV displays and patient dashboards

### UI Components Required

1. **CancellationModal**
   - Required cancel reason field
   - Optional reschedule suggestion checkbox
   - Role-specific visibility options

2. **QueueMonitor** (TV Display)
   - Real-time cancellation removal
   - Red highlight for urgent cancellations
   - Smooth removal animations

3. **PatientDashboard**
   - Status display with cancellation reasons
   - No-show countdown timer
   - Urgent alerts banner

4. **AuditPopup** (Admin/Super Admin)
   - Full cancellation trail
   - Who, when, reason, acknowledged_by fields

### Event System

1. **appointment.checked_in**
   - Triggers queue insertion
   - Updates patient dashboard

2. **appointment.cancelled**
   - Removes from queue
   - Sends notifications based on role/timing

3. **urgent.cancellation**
   - Last-minute dentist/staff cancellations
   - Creates persistent alerts

## Acceptance Criteria

### Cancellation Flow
- [ ] Any role cancelling requires reason (UI validation)
- [ ] Cancelled appointments disappear from queue monitor
- [ ] Patient dashboard shows cancellation with reason (if visible)
- [ ] System auto-cancels no-shows after 15min grace period

### Urgent Alerts
- [ ] Dentist cancelling <30min before start creates urgent alert
- [ ] Staff see alert banner and persistent toast
- [ ] Patient dashboard shows red banner notification

### Audit Trail
- [ ] Admin/Super Admin can view full cancellation history
- [ ] All cancellations logged with who, when, reason
- [ ] Reopening requires Admin+ authorization and is logged

### Access Control
- [ ] Staff/Dentist cannot cancel after in_procedure starts
- [ ] Super Admin can override with special logging
- [ ] Post-procedure cancellation handles partial billing

### No-Show Handling
- [ ] 15min countdown visible to staff and patient
- [ ] Auto-cancellation with system role attribution
- [ ] Queue updates in real-time

## Sample JSON Payloads

### Appointment Cancel
```json
{
  "user_id": "uuid",
  "role": "dentist",
  "reason": "Emergency - equipment failure",
  "timestamp": "2024-01-15T10:30:00Z",
  "visibility": "patient_visible",
  "suggest_reschedule": true
}
```

### System No-Show
```json
{
  "cancelled_by_role": "system",
  "cancel_reason": "no_show",
  "cancel_timestamp": "2024-01-15T10:15:00Z",
  "no_show_at": "2024-01-15T10:15:00Z"
}
```

### Status Change
```json
{
  "appointment_id": "uuid",
  "old_status": "waiting",
  "new_status": "in_procedure",
  "changed_by": "uuid",
  "changed_by_role": "dentist",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

## Development Notes

- Enhance existing appointment/queue components rather than rebuilding
- Emphasize auditability - every action must be logged
- Keep patient-facing language friendly and professional
- Make queue monitor TV-friendly with smooth animations
- Include admin screen for cancellation management with filters