
# SwiftCare Dental Clinic MVP - Sample JSON Payloads

## Executive Summary
This document provides comprehensive sample JSON payloads for key API operations in the SwiftCare Dental Clinic MVP system. These examples demonstrate the data structures, validation requirements, and integration patterns for appointment management, status changes, cancellations, billing operations, and other critical system functions.

## 1. API Overview

### 1.1 API Design Principles
- **RESTful Architecture**: Standard HTTP methods and status codes
- **JSON Format**: All requests and responses use JSON
- **Consistent Structure**: Standardized response format across all endpoints
- **Error Handling**: Comprehensive error codes and messages
- **Versioning**: API version included in URL path
- **Authentication**: JWT-based authentication for all endpoints

### 1.2 Base API Configuration
```json
{
  "base_url": "https://api.swiftcare.com/v1",
  "authentication": "Bearer JWT_TOKEN",
  "content_type": "application/json",
  "rate_limit": "1000 requests per hour",
  "timeout": "30 seconds"
}
```

### 1.3 Standard Response Format
```json
{
  "success": true,
  "timestamp": "2025-09-08T14:30:00.000Z",
  "data": {},
  "meta": {
    "request_id": "req_12345",
    "version": "1.0",
    "execution_time": 250
  },
  "errors": []
}
```

## 2. Appointment Management APIs

### 2.1 Create Appointment

#### Endpoint: `POST /appointments`

**Request Payload:**
```json
{
  "patient_id": "patient_67890",
  "provider_id": "provider_123",
  "appointment_type": "routine_cleaning",
  "scheduled_date": "2025-09-15",
  "scheduled_time": "10:00:00",
  "duration_minutes": 60,
  "service_codes": ["D1110", "D0150"],
  "notes": "Patient prefers morning appointments",
  "insurance_info": {
    "primary_insurance": {
      "carrier": "Delta Dental",
      "policy_number": "DD123456789",
      "group_number": "GRP001",
      "subscriber_id": "SUB123"
    },
    "secondary_insurance": null
  },
  "contact_preferences": {
    "reminder_email": true,
    "reminder_sms": true,
    "reminder_call": false
  },
  "special_requirements": {
    "wheelchair_accessible": false,
    "interpreter_needed": false,
    "anxiety_management": true
  }
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "timestamp": "2025-09-08T14:30:00.000Z",
  "data": {
    "appointment_id": "appt_12345",
    "confirmation_number": "SC-2025-001234",
    "patient": {
      "id": "patient_67890",
      "name": "John Smith",
      "phone": "+1-555-0123",
      "email": "john.smith@email.com"
    },
    "provider": {
      "id": "provider_123",
      "name": "Dr. Sarah Johnson",
      "title": "DDS",
      "specialty": "General Dentistry"
    },
    "appointment_details": {
      "type": "routine_cleaning",
      "scheduled_datetime": "2025-09-15T10:00:00.000Z",
      "duration_minutes": 60,
      "estimated_end_time": "2025-09-15T11:00:00.000Z",
      "status": "scheduled",
      "room": "Room 2"
    },
    "services": [
      {
        "code": "D1110",
        "description": "Adult Prophylaxis",
        "estimated_cost": 120.00
      },
      {
        "code": "D0150",
        "description": "Comprehensive Oral Evaluation",
        "estimated_cost": 85.00
      }
    ],
    "financial_estimate": {
      "total_estimated_cost": 205.00,
      "insurance_coverage": 164.00,
      "patient_responsibility": 41.00
    },
    "reminders_scheduled": {
      "email_reminder": "2025-09-14T10:00:00.000Z",
      "sms_reminder": "2025-09-15T08:00:00.000Z"
    }
  },
  "meta": {
    "request_id": "req_12345",
    "version": "1.0",
    "execution_time": 450
  },
  "errors": []
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "timestamp": "2025-09-08T14:30:00.000Z",
  "data": null,
  "meta": {
    "request_id": "req_12346",
    "version": "1.0",
    "execution_time": 125
  },
  "errors": [
    {
      "code": "VALIDATION_ERROR",
      "message": "Invalid appointment time",
      "field": "scheduled_time",
      "details": "Appointment time must be during business hours (8:00 AM - 6:00 PM)"
    },
    {
      "code": "CONFLICT_ERROR",
      "message": "Provider not available",
      "field": "provider_id",
      "details": "Dr. Johnson is not available at the requested time"
    }
  ]
}
```

### 2.2 Update Appointment Status

#### Endpoint: `PATCH /appointments/{appointment_id}/status`

**Request Payload:**
```json
{
  "status": "checked_in",
  "status_timestamp": "2025-09-15T09:45:00.000Z",
  "updated_by": "user_12345",
  "notes": "Patient arrived early, checked in via mobile app",
  "location": {
    "check_in_method": "mobile_app",
    "ip_address": "192.168.1.100",
    "device_type": "smartphone"
  }
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "timestamp": "2025-09-15T09:45:30.000Z",
  "data": {
    "appointment_id": "appt_12345",
    "previous_status": "scheduled",
    "current_status": "checked_in",
    "status_history": [
      {
        "status": "scheduled",
        "timestamp": "2025-09-08T14:30:00.000Z",
        "updated_by": "system",
        "notes": "Appointment created"
      },
      {
        "status": "confirmed",
        "timestamp": "2025-09-14T16:20:00.000Z",
        "updated_by": "patient_67890",
        "notes": "Patient confirmed via SMS"
      },
      {
        "status": "checked_in",
        "timestamp": "2025-09-15T09:45:00.000Z",
        "updated_by": "user_12345",
        "notes": "Patient arrived early, checked in via mobile app"
      }
    ],
    "queue_position": 2,
    "estimated_wait_time": 15,
    "next_actions": [
      "wait_for_provider",
      "update_insurance_info",
      "complete_health_questionnaire"
    ]
  },
  "meta": {
    "request_id": "req_12347",
    "version": "1.0",
    "execution_time": 180
  },
  "errors": []
}
```

### 2.3 Appointment Cancellation

#### Endpoint: `POST /appointments/{appointment_id}/cancel`

**Request Payload:**
```json
{
  "cancellation_reason": "patient_illness",
  "cancellation_type": "patient_initiated",
  "cancelled_by": "patient_67890",
  "cancellation_notes": "Patient has flu symptoms, wants to reschedule",
  "reschedule_requested": true,
  "preferred_reschedule_dates": [
    "2025-09-22",
    "2025-09-23",
    "2025-09-24"
  ],
  "notification_preferences": {
    "notify_provider": true,
    "notify_admin": false,
    "send_confirmation": true
  },
  "refund_requested": false
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "timestamp": "2025-09-14T11:30:00.000Z",
  "data": {
    "appointment_id": "appt_12345",
    "cancellation_id": "cancel_789",
    "status": "cancelled",
    "cancellation_details": {
      "reason": "patient_illness",
      "type": "patient_initiated",
      "cancelled_by": "patient_67890",
      "cancellation_timestamp": "2025-09-14T11:30:00.000Z",
      "advance_notice_hours": 22
    },
    "financial_impact": {
      "cancellation_fee": 0.00,
      "refund_amount": 0.00,
      "reason": "More than 24 hours advance notice"
    },
    "reschedule_options": {
      "available_slots": [
        {
          "date": "2025-09-22",
          "time": "10:00:00",
          "provider": "Dr. Sarah Johnson",
          "duration": 60
        },
        {
          "date": "2025-09-23",
          "time": "14:00:00",
          "provider": "Dr. Sarah Johnson",
          "duration": 60
        },
        {
          "date": "2025-09-24",
          "time": "09:00:00",
          "provider": "Dr. Sarah Johnson",
          "duration": 60
        }
      ],
      "reschedule_deadline": "2025-09-21T23:59:59.000Z"
    },
    "notifications_sent": {
      "patient_confirmation": {
        "email": "sent",
        "sms": "sent",
        "timestamp": "2025-09-14T11:30:15.000Z"
      },
      "provider_notification": {
        "email": "sent",
        "timestamp": "2025-09-14T11:30:20.000Z"
      }
    }
  },
  "meta": {
    "request_id": "req_12348",
    "version": "1.0",
    "execution_time": 320
  },
  "errors": []
}
```

## 3. Billing and Payment APIs

### 3.1 Create Billing Record

#### Endpoint: `POST /billing/charges`

**Request Payload:**
```json
{
  "patient_id": "patient_67890",
  "appointment_id": "appt_12345",
  "provider_id": "provider_123",
  "service_date": "2025-09-15",
  "charges": [
    {
      "service_code": "D1110",
      "description": "Adult Prophylaxis",
      "quantity": 1,
      "unit_price": 120.00,
      "total_charge": 120.00,
      "tooth_numbers": [],
      "surfaces": []
    },
    {
      "service_code": "D0150",
      "description": "Comprehensive Oral Evaluation",
      "quantity": 1,
      "unit_price": 85.00,
      "total_charge": 85.00,
      "tooth_numbers": [],
      "surfaces": []
    },
    {
      "service_code": "D2391",
      "description": "Resin-based composite - one surface, posterior",
      "quantity": 1,
      "unit_price": 180.00,
      "total_charge": 180.00,
      "tooth_numbers": ["14"],
      "surfaces": ["O"]
    }
  ],
  "insurance_claims": [
    {
      "insurance_type": "primary",
      "carrier": "Delta Dental",
      "policy_number": "DD123456789",
      "group_number": "GRP001",
      "subscriber_id": "SUB123",
      "claim_amount": 385.00,
      "estimated_coverage": 308.00
    }
  ],
  "payment_terms": {
    "due_date": "2025-10-15",
    "payment_plan_eligible": true,
    "early_payment_discount": 0.02
  }
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "timestamp": "2025-09-15T16:30:00.000Z",
  "data": {
    "billing_id": "bill_56789",
    "invoice_number": "INV-2025-001234",
    "patient": {
      "id": "patient_67890",
      "name": "John Smith",
      "account_number": "ACC-67890"
    },
    "billing_summary": {
      "total_charges": 385.00,
      "insurance_estimate": 308.00,
      "patient_responsibility": 77.00,
      "previous_balance": 0.00,
      "total_due": 77.00
    },
    "charge_details": [
      {
        "line_item": 1,
        "service_code": "D1110",
        "description": "Adult Prophylaxis",
        "charge_amount": 120.00,
        "insurance_coverage": 96.00,
        "patient_portion": 24.00
      },
      {
        "line_item": 2,
        "service_code": "D0150",
        "description": "Comprehensive Oral Evaluation",
        "charge_amount": 85.00,
        "insurance_coverage": 68.00,
        "patient_portion": 17.00
      },
      {
        "line_item": 3,
        "service_code": "D2391",
        "description": "Resin-based composite - one surface, posterior",
        "charge_amount": 180.00,
        "insurance_coverage": 144.00,
        "patient_portion": 36.00
      }
    ],
    "insurance_claims": [
      {
        "claim_id": "claim_98765",
        "carrier": "Delta Dental",
        "claim_amount": 385.00,
        "status": "submitted",
        "submission_date": "2025-09-15T16:30:00.000Z",
        "expected_payment_date": "2025-09-29T00:00:00.000Z"
      }
    ],
    "payment_options": {
      "due_date": "2025-10-15T23:59:59.000Z",
      "early_payment_discount": {
        "discount_rate": 0.02,
        "discount_amount": 1.54,
        "discount_deadline": "2025-09-25T23:59:59.000Z"
      },
      "payment_plan_available": true,
      "accepted_payment_methods": ["cash", "check", "credit_card", "debit_card", "ach"]
    }
  },
  "meta": {
    "request_id": "req_12349",
    "version": "1.0",
    "execution_time": 680
  },
  "errors": []
}
```

### 3.2 Process Payment

#### Endpoint: `POST /billing/payments`

**Request Payload:**
```json
{
  "billing_id": "bill_56789",
  "patient_id": "patient_67890",
  "payment_amount": 77.00,
  "payment_method": "credit_card",
  "payment_details": {
    "card_type": "visa",
    "last_four_digits": "1234",
    "cardholder_name": "John Smith",
    "billing_address": {
      "street": "123 Main St",
      "city": "Anytown",
      "state": "CA",
      "zip_code": "12345"
    },
    "transaction_token": "tok_1234567890abcdef"
  },
  "payment_metadata": {
    "processed_by": "user_12345",
    "payment_terminal": "terminal_001",
    "receipt_requested": true,
    "receipt_method": "email"
  }
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "timestamp": "2025-09-15T17:15:00.000Z",
  "data": {
    "payment_id": "pay_11111",
    "transaction_id": "txn_abcdef123456",
    "billing_id": "bill_56789",
    "payment_details": {
      "amount_paid": 77.00,
      "payment_method": "credit_card",
      "card_type": "visa",
      "last_four": "1234",
      "authorization_code": "AUTH123456",
      "transaction_timestamp": "2025-09-15T17:15:00.000Z"
    },
    "account_update": {
      "previous_balance": 77.00,
      "payment_applied": 77.00,
      "new_balance": 0.00,
      "account_status": "paid_in_full"
    },
    "receipt_information": {
      "receipt_number": "RCP-2025-001234",
      "receipt_sent": true,
      "receipt_method": "email",
      "receipt_timestamp": "2025-09-15T17:15:30.000Z"
    },
    "processing_fees": {
      "merchant_fee": 2.31,
      "patient_fee": 0.00,
      "net_amount": 74.69
    }
  },
  "meta": {
    "request_id": "req_12350",
    "version": "1.0",
    "execution_time": 1250
  },
  "errors": []
}
```

**Error Response (402 Payment Required):**
```json
{
  "success": false,
  "timestamp": "2025-09-15T17:15:00.000Z",
  "data": null,
  "meta": {
    "request_id": "req_12351",
    "version": "1.0",
    "execution_time": 890
  },
  "errors": [
    {
      "code": "PAYMENT_DECLINED",
      "message": "Credit card payment was declined",
      "field": "payment_details",
      "details": {
        "decline_reason": "insufficient_funds",
        "decline_code": "51",
        "suggested_action": "Try a different payment method or contact your bank"
      }
    }
  ]
}
```

### 3.3 Generate Invoice

#### Endpoint: `POST /billing/invoices`

**Request Payload:**
```json
{
  "billing_id": "bill_56789",
  "invoice_type": "standard",
  "delivery_method": "email",
  "delivery_address": "john.smith@email.com",
  "include_payment_stub": true,
  "custom_message": "Thank you for choosing SwiftCare Dental Clinic for your dental care needs.",
  "due_date_override": null,
  "payment_plan_terms": null
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "timestamp": "2025-09-15T18:00:00.000Z",
  "data": {
    "invoice_id": "inv_22222",
    "invoice_number": "INV-2025-001234",
    "billing_id": "bill_56789",
    "invoice_details": {
      "invoice_date": "2025-09-15",
      "due_date": "2025-10-15",
      "total_amount": 77.00,
      "status": "sent"
    },
    "delivery_confirmation": {
      "method": "email",
      "address": "john.smith@email.com",
      "sent_timestamp": "2025-09-15T18:00:15.000Z",
      "delivery_status": "delivered"
    },
    "invoice_content": {
      "pdf_url": "https://invoices.swiftcare.com/inv_22222.pdf",
      "html_url": "https://invoices.swiftcare.com/inv_22222.html",
      "payment_url": "https://pay.swiftcare.com/inv_22222"
    },
    "payment_options": {
      "online_payment_enabled": true,
      "payment_methods": ["credit_card", "debit_card", "ach", "check"],
      "payment_plan_available": true,
      "early_payment_discount": {
        "rate": 0.02,
        "deadline": "2025-09-25"
      }
    }
  },
  "meta": {
    "request_id": "req_12352",
    "version": "1.0",
    "execution_time": 420
  },
  "errors": []
}
```

## 4. Patient Management APIs

### 4.1 Create Patient Record

#### Endpoint: `POST /patients`

**Request Payload:**
```json
{
  "personal_information": {
    "first_name": "Jane",
    "last_name": "Doe",
    "middle_name": "Marie",
    "date_of_birth": "1985-03-15",
    "gender": "female",
    "ssn_last_four": "5678",
    "preferred_name": "Jane",
    "preferred_pronouns": "she/her"
  },
  "contact_information": {
    "primary_phone": "+1-555-0199",
    "secondary_phone": "+1-555-0188",
    "email": "jane.doe@email.com",
    "preferred_contact_method": "email",
    "address": {
      "street": "456 Oak Avenue",
      "apartment": "Apt 2B",
      "city": "Anytown",
      "state": "CA",
      "zip_code": "12345",
      "country": "USA"
    }
  },
  "emergency_contact": {
    "name": "Robert Doe",
    "relationship": "spouse",
    "phone": "+1-555-0177",
    "email": "robert.doe@email.com"
  },
  "insurance_information": {
    "primary_insurance": {
      "carrier": "Blue Cross Blue Shield",
      "policy_number": "BCBS987654321",
      "group_number": "GRP002",
      "subscriber_name": "Jane Doe",
      "subscriber_relationship": "self",
      "effective_date": "2025-01-01",
      "expiration_date": "2025-12-31"
    },
    "secondary_insurance": null
  },
  "medical_history": {
    "allergies": [
      {
        "allergen": "penicillin",
        "reaction": "rash",
        "severity": "moderate"
      }
    ],
    "medications": [
      {
        "name": "Lisinopril",
        "dosage": "10mg",
        "frequency": "daily",
        "prescribing_doctor": "Dr. Smith"
      }
    ],
    "medical_conditions": [
      {
        "condition": "hypertension",
        "diagnosed_date": "2020-05-15",
        "status": "controlled"
      }
    ],
    "previous_dental_work": "Regular cleanings, one filling in 2023"
  },
  "preferences": {
    "appointment_reminders": {
      "email": true,
      "sms": true,
      "phone_call": false
    },
    "marketing_communications": false,
    "preferred_appointment_times": ["morning"],
    "preferred_provider": null,
    "special_needs": []
  }
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "timestamp": "2025-09-08T15:00:00.000Z",
  "data": {
    "patient_id": "patient_99999",
    "account_number": "ACC-99999",
    "registration_date": "2025-09-08T15:00:00.000Z",
    "patient_summary": {
      "full_name": "Jane Marie Doe",
      "date_of_birth": "1985-03-15",
      "age": 40,
      "gender": "female",
      "primary_phone": "+1-555-0199",
      "email": "jane.doe@email.com"
    },
    "account_status": {
      "status": "active",
      "registration_complete": true,
      "insurance_verified": false,
      "forms_completed": false
    },
    "next_steps": [
      {
        "action": "verify_insurance",
        "description": "Verify insurance coverage with Blue Cross Blue Shield",
        "priority": "high",
        "estimated_time": "5 minutes"
      },
      {
        "action": "complete_health_forms",
        "description": "Complete medical history and consent forms",
        "priority": "medium",
        "estimated_time": "10 minutes"
      },
      {
        "action": "schedule_appointment",
        "description": "Schedule initial consultation appointment",
        "priority": "medium",
        "estimated_time": "3 minutes"
      }
    ],
    "assigned_provider": null,
    "created_by": "user_12345"
  },
  "meta": {
    "request_id": "req_12353",
    "version": "1.0",
    "execution_time": 580
  },
  "errors": []
}
```

### 4.2 Update Patient Information

#### Endpoint: `PATCH /patients/{patient_id}`

**Request Payload:**
```json
{
  "contact_information": {
    "email": "jane.doe.new@email.com",
    "address": {
      "street": "789 Pine Street",
      "apartment": null,
      "city": "Newtown",
      "state": "CA",
      "zip_code": "54321",
      "country": "USA"
    }
  },
  "insurance_information": {
    "primary_insurance": {
      "carrier": "Blue Cross Blue Shield",
      "policy_number": "BCBS987654321",
      "group_number": "GRP003",
      "subscriber_name": "Jane Doe",
      "subscriber_relationship": "self",
      "effective_date": "2025-01-01",
      "expiration_date": "2025-12-31"
    }
  },
  "update_metadata": {
    "updated_by": "user_12345",
    "update_reason": "patient_requested",
    "verification_method": "phone_call"
  }
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "timestamp": "2025-09-10T10:30:00.000Z",
  "data": {
    "patient_id": "patient_99999",
    "update_summary": {
      "fields_updated": ["email", "address", "insurance_group_number"],
      "update_timestamp": "2025-09-10T10:30:00.000Z",
      "updated_by": "user_12345"
    },
    "previous_values": {
      "email": "jane.doe@email.com",
      "address": {
        "street": "456 Oak Avenue",
        "apartment": "Apt 2B",
        "city": "Anytown",
        "zip_code": "12345"
      },
      "insurance_group_number": "GRP002"
    },
    "current_values": {
      "email": "jane.doe.new@email.com",
      "address": {
        "street": "789 Pine Street",
        "apartment": null,
        "city": "Newtown",
        "zip_code": "54321"
      },
      "insurance_group_number": "GRP003"
    },
    "verification_status": {
      "insurance_reverification_required": true,
      "address_verification_complete": true,
      "email_verification_sent": true
    },
    "audit_trail": {
      "change_id": "change_12345",
      "verification_method": "phone_call",
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0..."
    }
  },
  "meta": {
    "request_id": "req_12354",
    "version": "1.0",
    "execution_time": 340
  },
  "errors": []
}
```

## 5. Queue Management APIs

### 5.1 Add Patient to Queue

#### Endpoint: `POST /queue/add`

**Request Payload:**
```json
{
  "patient_id": "patient_67890",
  "appointment_id": "appt_12345",
  "provider_id": "provider_123",
  "queue_type": "scheduled",
  "priority": "normal",
  "estimated_service_time": 60,
  "special_requirements": {
    "wheelchair_accessible": false,
    "interpreter_needed": false,
    "anxiety_management": true
  },
  "check_in_details": {
    "check_in_method": "mobile_app",
    "check_in_location": "parking_lot",
    "check_in_timestamp": "2025-09-15T09:45:00.000Z"
  }
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "timestamp": "2025-09-15T09:45:30.000Z",
  "data": {
    "queue_id": "queue_33333",
    "patient": {
      "id": "patient_67890",
      "name": "John Smith",
      "appointment_time": "2025-09-15T10:00:00.000Z"
    },
    "queue_position": {
      "current_position": 3,
      "total_in_queue": 5,
      "position_type": "scheduled"
    },
    "wait_time_estimate": {
      "estimated_wait_minutes": 25,
      "estimated_service_start": "2025-09-15T10:10:00.000Z",
      "confidence_level": "high"
    },
    "provider_status": {
      "provider_name": "Dr. Sarah Johnson",
      "current_status": "with_patient",
      "estimated_availability": "2025-09-15T10:05:00.000Z"
    },
    "queue_notifications": {
      "position_updates": true,
      "ready_notification": true,
      "delay_notifications": true,
      "notification_methods": ["sms", "mobile_app"]
    }
  },
  "meta": {
    "request_id": "req_12355",
    "version": "1.0",
    "execution_time": 220
  },
  "errors": []
}
```

### 5.2 Update Queue Status

#### Endpoint: `PATCH /queue/{queue_id}/status`

**Request Payload:**
```json
{
  "status": "ready_for_service",
  "room_assignment": "Room 2",
  "provider_ready": true,
  "estimated_service_duration": 60,
  "special_instructions": "Patient has anxiety, please use calming techniques",
  "updated_by": "user_12345"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "timestamp": "2025-09-15T10:08:00.000Z",
  "data": {
    "queue_id": "queue_33333",
    "status_update": {
      "previous_status": "waiting",
      "current_status": "ready_for_service",
      "status_timestamp": "2025-09-15T10:08:00.000Z"
    },
    "service_details": {
      "room_assignment": "Room 2",
      "provider": "Dr. Sarah Johnson",
      "estimated_duration": 60,
      "service_start_time": "2025-09-15T10:10:00.000Z"
    },
    "patient_notification": {
      "notification_sent": true,
      "notification_methods": ["sms", "mobile_app"],
      "message": "Dr. Johnson is ready to see you in Room 2. Please proceed to the treatment area.",
      "sent_timestamp": "2025-09-15T10:08:15.000Z"
    },
    "queue_impact": {
      "patients_behind": 2,
      "estimated_delay_minutes": 0,
      "queue_efficiency": "on_schedule"
    }
  },
  "meta": {
    "request_id": "req_12356",
    "version": "1.0",
    "execution_time": 180
  },
  "errors": []
}
```

## 6. Notification APIs

### 6.1 Send Appointment Reminder

#### Endpoint: `POST /notifications/appointment-reminder`

**Request Payload:**
```json
{
  "appointment_id": "appt_12345",
  "patient_id": "patient_67890",
  "reminder_type": "24_hour",
  "delivery_methods": ["email", "sms"],
  "custom_message": null,
  "include_preparation_instructions": true,
  "include_cancellation_policy": true,
  "scheduled_send_time": "2025-09-14T10:00:00.000Z"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "timestamp": "2025-09-14T10:00:30.000Z",
  "data": {
    "notification_id": "notif_44444",
    "appointment_details": {
      "appointment_id": "appt_12345",
      "patient_name": "John Smith",
      "appointment_date": "2025-09-15T10:00:00.000Z",
      "provider": "Dr. Sarah Johnson",
      "services": ["Adult Prophylaxis", "Comprehensive Oral Evaluation"]
    },
    "delivery_status": {
      "email": {
        "status": "delivered",
        "delivered_at": "2025-09-14T10:00:45.000Z",
        "recipient": "john.smith@email.com"
      },
      "sms": {
        "status": "delivered",
        "delivered_at": "2025-09-14T10:00:50.000Z",
        "recipient": "+1-555-0123"
      }
    },
    "message_content": {
      "subject": "Appointment Reminder - SwiftCare Dental",
      "preview": "Your appointment with Dr. Johnson is tomorrow at 10:00 AM",
      "includes_preparation": true,
      "includes_cancellation_policy": true,
      "confirmation_link": "https://app.swiftcare.com/confirm/appt_12345"
    },
    "patient_response": {
      "response_tracking_enabled": true,
      "response_deadline": "2025-09-15T08:00:00.000Z",
      "response_options": ["confirm", "reschedule", "cancel"]
    }
  },
  "meta": {
    "request_id": "req_12357",
    "version": "1.0",
    "execution_time": 890
  },
  "errors": []
}
```

### 6.2 Send Queue Update Notification

#### Endpoint: `POST /notifications/queue-update`

**Request Payload:**
```json
{
  "queue_id": "queue_33333",
  "patient_id": "patient_67890",
  "notification_type": "wait_time_update",
  "delivery_methods": ["mobile_app", "sms"],
  "wait_time_minutes": 15,
  "provider_status": "running_slightly_behind",
  "include_queue_position": true
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "timestamp": "2025-09-15T10:15:00.000Z",
  "data": {
    "notification_id": "notif_55555",
    "queue_details": {
      "queue_id": "queue_33333",
      "patient_name": "John Smith",
      "current_position": 2,
      "updated_wait_time": 15,
      "provider": "Dr. Sarah Johnson"
    },
    "delivery_status": {
      "mobile_app": {
        "status": "delivered",
        "delivered_at": "2025-09-15T10:15:05.000Z",
        "device_id": "device_abc123"
      },
      "sms": {
        "status": "delivered",
        "delivered_at": "2025-09-15T10:15:08.000Z",
        "recipient": "+1-555-0123"
      }
    },
    "message_content": {
      "title": "Queue Update",
      "message": "Dr. Johnson is running slightly behind. Your estimated wait time is now 15 minutes. You are #2 in line.",
      "action_buttons": ["View Queue", "Update Preferences", "Contact Office"]
    },
    "patient_options": {
      "can_leave_queue": true,
      "can_reschedule": true,
      "can_update_contact_info": true
    }
  },
  "meta": {
    "request_id": "req_12358",
    "version": "1.0",
    "execution_time": 320
  },
  "errors": []
}
```

## 7. Error Handling Examples

### 7.1 Validation Errors

**Request with Multiple Validation Issues:**
```json
{
  "patient_id": "",
  "provider_id": "invalid_provider",
  "scheduled_date": "2025-02-30",
  "scheduled_time": "25:00:00"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "timestamp": "2025-09-08T14:30:00.000Z",
  "data": null,
  "meta": {
    "request_id": "req_12359",
    "version": "1.0",
    "execution_time": 125
  },
  "errors": [
    {
      "code": "REQUIRED_FIELD_MISSING",
      "message": "Patient ID is required",
      "field": "patient_id",
      "details": "Patient ID cannot be empty"
    },
    {
      "code": "INVALID_REFERENCE",
      "message": "Provider not found",
      "field": "provider_id",
      "details": "Provider ID 'invalid_provider' does not exist"
    },
    {
      "code": "INVALID_DATE",
      "message": "Invalid date format",
      "field": "scheduled_date",
      "details": "Date '2025-02-30' is not a valid calendar date"
    },
    {
      "code": "INVALID_TIME",
      "message": "Invalid time format",
      "field": "scheduled_time",
      "details": "Time '25:00:00' is not a valid 24-hour time"
    }
  ]
}
```

### 7.2 Business Logic Errors

**Error Response (409 Conflict):**
```json
{
  "success": false,
  "timestamp": "2025-09-08T14:30:00.000Z",
  "data": null,
  "meta": {
    "request_id": "req_12360",
    "version": "1.0",
    "execution_time": 280
  },
  "errors": [
    {
      "code": "APPOINTMENT_CONFLICT",
      "message": "Appointment time conflict detected",
      "field": "scheduled_time",
      "details": {
        "conflict_type": "provider_unavailable",
        "conflicting_appointment": "appt_98765",
        "suggested_times": [
          "2025-09-15T11:00:00.000Z",
          "2025-09-15T14:00:00.000Z",
          "2025-09-16T10:00:00.000Z"
        ]
      }
    }
  ]
}
```

### 7.3 System Errors

**Error Response (503 Service Unavailable):**
```json
{
  "success": false,
  "timestamp": "2025-09-08T14:30:00.000Z",
  "data": null,
  "meta": {
    "request_id": "req_12361",
    "version": "1.0",
    "execution_time": 5000
  },
  "errors": [
    {
      "code": "SERVICE_UNAVAILABLE",
      "message": "Insurance verification service is temporarily unavailable",
      "field": null,
      "details": {
        "service": "insurance_verification",
        "estimated_recovery": "2025-09-08T15:00:00.000Z",
        "alternative_action": "Proceed with manual verification",
        "retry_after": 1800
      }
    }
  ]
}
```

## 8. API Authentication Examples

### 8.1 JWT Token Structure

**JWT Header:**
```json
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "swiftcare_key_001"
}
```

**JWT Payload:**
```json
{
  "iss": "https://auth.swiftcare.com",
  "sub": "user_12345",
  "aud": "https://api.swiftcare.com",
  "exp": 1725811800,
  "iat": 1725808200,
  "jti": "jwt_abc123",
  "user_id": "user_12345",
  "email": "dr.smith@swiftcare.com",
  "role": "dentist",
  "permissions": [
    "read:patients",
    "write:patients",
    "read:appointments",
    "write:appointments",
    "read:billing",
    "write:billing"
  ],
  "clinic_id": "clinic_001",
  "session_id": "sess_xyz789"
}
```

### 8.2 API Request with Authentication

**Request Headers:**
```http
POST /appointments HTTP/1.1
Host: api.swiftcare.com
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
X-Request-ID: req_12345
X-Client-Version: 1.0.0
User-Agent: SwiftCare-Mobile/1.0.0 (iOS 15.0)
```

This comprehensive API documentation provides the foundation for implementing robust, secure, and user-friendly integrations with the SwiftCare Dental Clinic MVP system.

