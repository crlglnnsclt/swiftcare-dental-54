
# API Specifications
## SwiftCare Dental Clinic MVP

### Base Configuration

**Base URL:** `https://api.swiftcare.com/v1`  
**Authentication:** Bearer Token (JWT)  
**Content-Type:** `application/json`  
**API Version:** v1

### Authentication Endpoints

#### POST /auth/login
Authenticate user and receive JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "patient",
      "isActive": true
    },
    "expiresIn": 86400
  }
}
```

**Error Responses:**
- `401`: Invalid credentials
- `403`: Account inactive
- `429`: Too many login attempts

#### POST /auth/logout
Invalidate current JWT token.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

#### POST /auth/refresh
Refresh JWT token before expiration.

**Request:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token",
    "expiresIn": 86400
  }
}
```

### User Management Endpoints

#### GET /users/profile
Get current user profile information.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "role": "patient",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "lastLogin": "2024-01-15T10:30:00Z"
  }
}
```

#### PUT /users/profile
Update current user profile.

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### POST /users/change-password
Change user password.

**Request:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456",
  "confirmPassword": "newSecurePassword456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

### Patient Management Endpoints

#### GET /patients
Get list of patients (Admin/Staff only).

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `search`: Search by name, email, or patient number
- `isActive`: Filter by active status

**Response (200):**
```json
{
  "success": true,
  "data": {
    "patients": [
      {
        "id": "uuid",
        "patientNumber": "P-2024-0001",
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane@example.com",
        "phone": "+1234567890",
        "dateOfBirth": "1990-05-15",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

#### GET /patients/:id
Get specific patient details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "patientNumber": "P-2024-0001",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "dateOfBirth": "1990-05-15",
    "gender": "female",
    "address": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zipCode": "12345",
    "emergencyContactName": "John Smith",
    "emergencyContactPhone": "+1234567891",
    "medicalHistory": "No significant medical history",
    "allergies": "Penicillin",
    "currentMedications": "None",
    "insuranceProvider": "Blue Cross",
    "insurancePolicyNumber": "BC123456789",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### POST /patients
Create new patient record.

**Request:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "dateOfBirth": "1990-05-15",
  "gender": "female",
  "address": "123 Main St",
  "city": "Anytown",
  "state": "CA",
  "zipCode": "12345",
  "emergencyContactName": "John Smith",
  "emergencyContactPhone": "+1234567891",
  "medicalHistory": "No significant medical history",
  "allergies": "Penicillin",
  "insuranceProvider": "Blue Cross",
  "insurancePolicyNumber": "BC123456789"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "patientNumber": "P-2024-0001",
    "firstName": "Jane",
    "lastName": "Smith",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Appointment Management Endpoints

#### GET /appointments
Get appointments list with filtering.

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `patientId`: Filter by patient
- `dentistId`: Filter by dentist
- `status`: Filter by status
- `date`: Filter by specific date (YYYY-MM-DD)
- `dateFrom`: Filter from date
- `dateTo`: Filter to date

**Response (200):**
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "id": "uuid",
        "appointmentNumber": "A-2024-0001",
        "patient": {
          "id": "uuid",
          "firstName": "Jane",
          "lastName": "Smith",
          "patientNumber": "P-2024-0001"
        },
        "dentist": {
          "id": "uuid",
          "firstName": "Dr. John",
          "lastName": "Wilson"
        },
        "scheduledDateTime": "2024-01-20T10:00:00Z",
        "durationMinutes": 30,
        "status": "scheduled",
        "appointmentType": "consultation",
        "reasonForVisit": "Regular checkup",
        "estimatedCost": 150.00,
        "isEmergency": false,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

#### POST /appointments
Create new appointment.

**Request:**
```json
{
  "patientId": "uuid",
  "dentistId": "uuid",
  "scheduledDateTime": "2024-01-20T10:00:00Z",
  "durationMinutes": 30,
  "appointmentType": "consultation",
  "reasonForVisit": "Regular checkup",
  "notes": "Patient prefers morning appointments",
  "isEmergency": false
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "appointmentNumber": "A-2024-0001",
    "scheduledDateTime": "2024-01-20T10:00:00Z",
    "status": "scheduled",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### PUT /appointments/:id/status
Update appointment status.

**Request:**
```json
{
  "status": "confirmed",
  "notes": "Patient confirmed via phone"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "confirmed",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### DELETE /appointments/:id
Cancel appointment.

**Request:**
```json
{
  "cancellationReason": "Patient requested reschedule"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Appointment cancelled successfully"
}
```

### Dentist and Schedule Endpoints

#### GET /dentists
Get list of dentists.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "dentists": [
      {
        "id": "uuid",
        "firstName": "Dr. John",
        "lastName": "Wilson",
        "licenseNumber": "DDS123456",
        "specialization": "General Dentistry",
        "consultationFee": 150.00,
        "yearsExperience": 10,
        "isAvailable": true
      }
    ]
  }
}
```

#### GET /dentists/:id/schedule
Get dentist's schedule for date range.

**Query Parameters:**
- `dateFrom`: Start date (YYYY-MM-DD)
- `dateTo`: End date (YYYY-MM-DD)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "schedule": [
      {
        "date": "2024-01-20",
        "startTime": "09:00",
        "endTime": "17:00",
        "isAvailable": true,
        "appointments": [
          {
            "id": "uuid",
            "startTime": "10:00",
            "endTime": "10:30",
            "patient": "Jane Smith",
            "status": "scheduled"
          }
        ]
      }
    ]
  }
}
```

### Billing and Payment Endpoints

#### GET /billing
Get billing records.

**Query Parameters:**
- `patientId`: Filter by patient
- `status`: Filter by billing status
- `dateFrom`: Filter from date
- `dateTo`: Filter to date

**Response (200):**
```json
{
  "success": true,
  "data": {
    "bills": [
      {
        "id": "uuid",
        "invoiceNumber": "INV-2024-0001",
        "patient": {
          "id": "uuid",
          "firstName": "Jane",
          "lastName": "Smith"
        },
        "subtotal": 150.00,
        "taxAmount": 12.00,
        "totalAmount": 162.00,
        "paidAmount": 0.00,
        "balanceDue": 162.00,
        "status": "sent",
        "dueDate": "2024-02-15",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

#### POST /billing/:id/payments
Record payment for billing record.

**Request:**
```json
{
  "amount": 162.00,
  "paymentMethod": "credit_card",
  "transactionId": "txn_123456789",
  "notes": "Payment processed via Stripe"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "amount": 162.00,
    "paymentMethod": "credit_card",
    "status": "completed",
    "processedAt": "2024-01-15T10:30:00Z"
  }
}
```

### System and Utility Endpoints

#### GET /treatments
Get available treatments catalog.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "treatments": [
      {
        "id": "uuid",
        "treatmentCode": "D0120",
        "name": "Periodic Oral Evaluation",
        "description": "Comprehensive oral examination",
        "baseCost": 75.00,
        "estimatedDurationMinutes": 30,
        "category": "preventive"
      }
    ]
  }
}
```

#### GET /notifications
Get user notifications.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "title": "Appointment Reminder",
        "message": "Your appointment is scheduled for tomorrow at 10:00 AM",
        "type": "appointment_reminder",
        "status": "unread",
        "scheduledAt": "2024-01-19T09:00:00Z",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### Error Response Format

All API errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `422`: Validation Error
- `429`: Rate Limited
- `500`: Internal Server Error

### Rate Limiting

- **Authentication endpoints**: 5 requests per minute per IP
- **General API**: 100 requests per minute per user
- **Search endpoints**: 20 requests per minute per user

### Pagination

All list endpoints support pagination:
- Default page size: 20
- Maximum page size: 100
- Response includes pagination metadata
