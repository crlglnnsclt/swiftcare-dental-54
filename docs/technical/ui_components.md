
# UI Components and Screen Layouts
## SwiftCare Dental Clinic MVP

### Design System Overview

#### Color Palette
- **Primary**: #2563EB (Blue 600) - Trust, professionalism
- **Secondary**: #059669 (Emerald 600) - Health, growth
- **Accent**: #DC2626 (Red 600) - Urgency, alerts
- **Neutral**: #374151 (Gray 700) - Text, borders
- **Background**: #F9FAFB (Gray 50) - Page backgrounds
- **Success**: #10B981 (Emerald 500)
- **Warning**: #F59E0B (Amber 500)
- **Error**: #EF4444 (Red 500)

#### Typography
- **Headings**: Inter, sans-serif (Bold)
- **Body**: Inter, sans-serif (Regular)
- **Monospace**: JetBrains Mono (Code, IDs)

#### Spacing Scale
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px

### Common Components

#### Navigation Header
```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] SwiftCare Dental    [Nav Links]    [User Menu] [🔔] │
└─────────────────────────────────────────────────────────────┘
```

**Components:**
- Logo with clinic name
- Navigation menu (role-based)
- User profile dropdown
- Notifications bell with badge
- Responsive hamburger menu for mobile

#### Sidebar Navigation (Desktop)
```
┌─────────────────┐
│ 📊 Dashboard    │
│ 👥 Patients     │
│ 📅 Appointments │
│ 🦷 Treatments   │
│ 💰 Billing      │
│ ⚙️ Settings     │
└─────────────────┘
```

**Features:**
- Collapsible sidebar
- Active state indicators
- Role-based menu items
- Quick action buttons

#### Data Table Component
```
┌─────────────────────────────────────────────────────────────┐
│ [Search] [Filter] [Sort]                    [Export] [Add]  │
├─────────────────────────────────────────────────────────────┤
│ ☑ Name          | Date       | Status    | Actions         │
├─────────────────────────────────────────────────────────────┤
│ ☑ John Doe      | 2024-01-20 | Scheduled | [View][Edit]    │
│ ☑ Jane Smith    | 2024-01-21 | Confirmed | [View][Edit]    │
├─────────────────────────────────────────────────────────────┤
│ [< Previous] Page 1 of 5 [Next >]                          │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Sortable columns
- Bulk selection
- Inline actions
- Pagination
- Search and filtering
- Export functionality

#### Form Components
```
┌─────────────────────────────────────────────────────────────┐
│ Form Title                                                  │
├─────────────────────────────────────────────────────────────┤
│ Field Label *                                               │
│ [Input Field                                              ] │
│ Helper text or validation error                             │
│                                                             │
│ [Dropdown Field        ▼]                                  │
│                                                             │
│ ☑ Checkbox Option                                          │
│                                                             │
│ ○ Radio Option 1  ○ Radio Option 2                        │
│                                                             │
│ [Text Area                                                ] │
│ [                                                         ] │
│                                                             │
│                              [Cancel] [Save]               │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Consistent field styling
- Validation states
- Required field indicators
- Help text and tooltips
- Responsive layout

### Screen Layouts by Role

## Patient Portal

### Patient Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│ Welcome back, John Doe                    [Profile] [🔔]    │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │ Next Appointment│ │ Outstanding     │ │ Recent Activity │ │
│ │ Jan 20, 10:00 AM│ │ Balance: $150   │ │ Cleaning        │ │
│ │ Dr. Wilson      │ │ [Pay Now]       │ │ Completed       │ │
│ │ [Reschedule]    │ └─────────────────┘ │ Dec 15, 2023    │ │
│ └─────────────────┘                     └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Quick Actions                                               │
│ [📅 Book Appointment] [💰 View Bills] [📋 Update Profile]  │
├─────────────────────────────────────────────────────────────┤
│ Upcoming Appointments                                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Jan 20, 10:00 AM | Dr. Wilson | Consultation | Confirmed│ │
│ │ Feb 15, 2:00 PM  | Dr. Smith  | Cleaning     | Scheduled│ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Appointment Booking
```
┌─────────────────────────────────────────────────────────────┐
│ Book New Appointment                                        │
├─────────────────────────────────────────────────────────────┤
│ Step 1: Select Service                                      │
│ ○ Consultation    ○ Cleaning    ○ Procedure                │
│                                                             │
│ Step 2: Choose Dentist                                      │
│ ┌─────────────────┐ ┌─────────────────┐                    │
│ │ Dr. Wilson      │ │ Dr. Smith       │                    │
│ │ General         │ │ Orthodontics    │                    │
│ │ ⭐⭐⭐⭐⭐        │ │ ⭐⭐⭐⭐⭐        │                    │
│ │ [Select]        │ │ [Select]        │                    │
│ └─────────────────┘ └─────────────────┘                    │
│                                                             │
│ Step 3: Select Date & Time                                  │
│ [Calendar Widget]                                           │
│                                                             │
│ Available Times:                                            │
│ [9:00 AM] [10:00 AM] [11:00 AM] [2:00 PM] [3:00 PM]       │
│                                                             │
│ Reason for Visit:                                           │
│ [Text area for description]                                 │
│                                                             │
│                              [Back] [Book Appointment]      │
└─────────────────────────────────────────────────────────────┘
```

## Staff/Receptionist Interface

### Receptionist Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│ SwiftCare Dashboard - Today's Overview                      │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ │
│ │ Today's     │ │ Pending     │ │ Walk-ins    │ │ Revenue │ │
│ │ Appointments│ │ Confirmations│ │ Waiting     │ │ Today   │ │
│ │     24      │ │      8      │ │      3      │ │ $2,450  │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Quick Actions                                               │
│ [➕ New Appointment] [👤 New Patient] [💰 Process Payment] │
├─────────────────────────────────────────────────────────────┤
│ Today's Schedule                          [View All]        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 9:00  | John Doe      | Dr. Wilson | Consultation | ✅  │ │
│ │ 9:30  | Jane Smith    | Dr. Wilson | Cleaning     | ⏳  │ │
│ │ 10:00 | Mike Johnson  | Dr. Smith  | Procedure    | 📋  │ │
│ │ 10:30 | [Available]   | Dr. Wilson | -            | ➕  │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Pending Tasks                                               │
│ • 3 appointment confirmations needed                        │
│ • 2 insurance verifications pending                         │
│ • 1 billing inquiry to resolve                             │
└─────────────────────────────────────────────────────────────┘
```

### Patient Management
```
┌─────────────────────────────────────────────────────────────┐
│ Patient Management                                          │
├─────────────────────────────────────────────────────────────┤
│ [🔍 Search patients...] [Filter ▼] [Sort ▼] [➕ Add Patient]│
├─────────────────────────────────────────────────────────────┤
│ Patient List                                                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ☑ │ ID      │ Name         │ Phone        │ Last Visit │ │
│ │───┼─────────┼──────────────┼──────────────┼────────────│ │
│ │ ☑ │ P-0001  │ John Doe     │ 555-0101     │ Dec 15     │ │
│ │ ☑ │ P-0002  │ Jane Smith   │ 555-0102     │ Jan 10     │ │
│ │ ☑ │ P-0003  │ Mike Johnson │ 555-0103     │ Nov 20     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Selected Patient: John Doe                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📋 Basic Info  📅 Appointments  🦷 Treatment  💰 Billing│ │
│ │                                                         │ │
│ │ Name: John Doe                DOB: 1985-03-15          │ │
│ │ Phone: 555-0101               Email: john@email.com    │ │
│ │ Address: 123 Main St, City, State 12345                │ │
│ │                                                         │ │
│ │ Emergency Contact: Jane Doe (555-0199)                  │ │
│ │ Insurance: Blue Cross - Policy #BC123456               │ │
│ │                                                         │ │
│ │ [Edit Patient] [View History] [Schedule Appointment]    │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Dentist Interface

### Dentist Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│ Dr. Wilson's Dashboard - January 20, 2024                  │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ │
│ │ Today's     │ │ Patients    │ │ Procedures  │ │ Revenue │ │
│ │ Appointments│ │ Seen        │ │ Completed   │ │ Today   │ │
│ │      8      │ │      6      │ │      4      │ │ $1,200  │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Current Patient: Jane Smith (P-0002)        [Next Patient] │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📋 Patient Info  🦷 Treatment Plan  📝 Clinical Notes   │ │
│ │                                                         │ │
│ │ Age: 35 | Last Visit: 6 months ago                     │ │
│ │ Allergies: Penicillin | Insurance: Verified            │ │
│ │                                                         │ │
│ │ Today's Appointment: Routine Cleaning (30 min)         │ │
│ │ Status: In Progress                                     │ │
│ │                                                         │ │
│ │ Quick Actions:                                          │ │
│ │ [Add Treatment] [Update Notes] [Complete Visit]        │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Today's Schedule                                            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 9:00  | John Doe      | Consultation | ✅ Completed     │ │
│ │ 9:30  | Jane Smith    | Cleaning     | 🔄 In Progress   │ │
│ │ 10:00 | Mike Johnson  | Procedure    | ⏳ Scheduled     │ │
│ │ 10:30 | [Break]       | -            | -               │ │
│ │ 11:00 | Sarah Wilson  | Consultation | ⏳ Scheduled     │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Treatment Planning
```
┌─────────────────────────────────────────────────────────────┐
│ Treatment Plan - Jane Smith (P-0002)                       │
├─────────────────────────────────────────────────────────────┤
│ Patient Overview                                            │
│ Age: 35 | Last X-ray: 6 months | Risk Level: Low           │
│                                                             │
│ Current Treatment Plan                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Tooth │ Treatment        │ Priority │ Cost   │ Status   │ │
│ │───────┼──────────────────┼──────────┼────────┼──────────│ │
│ │ #14   │ Composite Filling│ High     │ $150   │ Planned  │ │
│ │ #18   │ Crown            │ Medium   │ $800   │ Planned  │ │
│ │ All   │ Cleaning         │ High     │ $100   │ Today    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Add Treatment                                               │
│ Tooth Number: [Dropdown] Treatment: [Dropdown]             │
│ Priority: ○ Low ○ Medium ○ High                            │
│ Notes: [Text area]                                          │
│ [Add to Plan]                                               │
│                                                             │
│ Clinical Notes                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Date: Jan 20, 2024                                      │ │
│ │ Procedure: Routine Cleaning                             │ │
│ │ Notes: Patient reports no pain. Mild plaque buildup... │ │
│ │ [Save Notes]                                            │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Save Plan] [Print] [Send to Patient] [Schedule Next]      │
└─────────────────────────────────────────────────────────────┘
```

## Manager/Admin Interface

### Admin Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│ SwiftCare Admin Dashboard                                   │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ │
│ │ Total       │ │ Active      │ │ Monthly     │ │ System  │ │
│ │ Patients    │ │ Staff       │ │ Revenue     │ │ Health  │ │
│ │    1,247    │ │     12      │ │  $45,230    │ │   98%   │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Quick Actions                                               │
│ [👤 Manage Staff] [📊 Reports] [⚙️ Settings] [🔒 Security] │
├─────────────────────────────────────────────────────────────┤
│ Recent Activity                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ • New patient registration: John Smith                  │ │
│ │ • Payment processed: $150 - Jane Doe                   │ │
│ │ • Staff login: Dr. Wilson                              │ │
│ │ • System backup completed successfully                  │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ System Alerts                                               │
│ ⚠️ 3 appointments need confirmation                         │
│ ℹ️ Monthly backup scheduled for tonight                     │
│ ✅ All systems operational                                  │
└─────────────────────────────────────────────────────────────┘
```

### Staff Management
```
┌─────────────────────────────────────────────────────────────┐
│ Staff Management                                            │
├─────────────────────────────────────────────────────────────┤
│ [🔍 Search staff...] [Filter by Role ▼] [➕ Add Staff]     │
├─────────────────────────────────────────────────────────────┤
│ Staff Directory                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Name           │ Role         │ Status  │ Last Login    │ │
│ │────────────────┼──────────────┼─────────┼───────────────│ │
│ │ Dr. Wilson     │ Dentist      │ Active  │ 2 hours ago   │ │
│ │ Dr. Smith      │ Dentist      │ Active  │ 1 hour ago    │ │
│ │ Sarah Johnson  │ Receptionist │ Active  │ 30 min ago    │ │
│ │ Mike Davis     │ Manager      │ Active  │ 1 day ago     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Staff Details: Dr. Wilson                                   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Personal Information                                    │ │
│ │ Name: Dr. John Wilson                                   │ │
│ │ Email: j.wilson@swiftcare.com                          │ │
│ │ Phone: 555-0201                                         │ │
│ │ Role: Dentist                                           │ │
│ │                                                         │ │
│ │ Professional Details                                    │ │
│ │ License: DDS123456                                      │ │
│ │ Specialization: General Dentistry                      │ │
│ │ Years Experience: 10                                    │ │
│ │ Consultation Fee: $150                                  │ │
│ │                                                         │ │
│ │ [Edit Details] [Reset Password] [View Schedule]        │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Mobile Responsive Design

#### Mobile Navigation
```
┌─────────────────────┐
│ ☰ SwiftCare    🔔 👤│
├─────────────────────┤
│                     │
│ [Content Area]      │
│                     │
│                     │
├─────────────────────┤
│ 🏠 📅 👥 💰 ⚙️      │
└─────────────────────┘
```

#### Mobile Forms
```
┌─────────────────────┐
│ Book Appointment    │
├─────────────────────┤
│ Service Type        │
│ [Consultation    ▼] │
│                     │
│ Dentist             │
│ [Dr. Wilson      ▼] │
│                     │
│ Date                │
│ [Jan 20, 2024    📅]│
│                     │
│ Time                │
│ [10:00 AM        ▼] │
│                     │
│ Reason              │
│ [Text area...]      │
│                     │
│ [Book Appointment]  │
└─────────────────────┘
```

### Accessibility Features

#### Screen Reader Support
- Semantic HTML structure
- ARIA labels and descriptions
- Keyboard navigation support
- Focus indicators
- Alt text for images

#### Visual Accessibility
- High contrast color combinations
- Scalable fonts (minimum 16px)
- Clear visual hierarchy
- Color-blind friendly palette
- Zoom support up to 200%

#### Interaction Accessibility
- Large touch targets (minimum 44px)
- Clear error messages
- Form validation feedback
- Loading states and progress indicators
- Timeout warnings for sessions

### Component Library

#### Buttons
- Primary: Blue background, white text
- Secondary: White background, blue border
- Danger: Red background, white text
- Ghost: Transparent background, colored text

#### Status Indicators
- Success: Green checkmark
- Warning: Yellow triangle
- Error: Red X
- Info: Blue i
- Loading: Animated spinner

#### Form Validation
- Real-time validation
- Clear error messages
- Success confirmations
- Required field indicators
- Help text and tooltips

This comprehensive UI component guide ensures consistent, accessible, and user-friendly interfaces across all user roles and devices in the SwiftCare Dental Clinic MVP system.
