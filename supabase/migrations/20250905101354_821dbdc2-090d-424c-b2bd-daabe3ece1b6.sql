-- Comprehensive Demo Data Setup for SwiftCare Dental Management System
-- This migration creates realistic demo data for all user roles and features

-- First, let's add more comprehensive user data
INSERT INTO public.users (email, first_name, last_name, full_name, phone, role, created_at) VALUES
-- Super Admin (1 user)
('superadmin@swiftcare.com', 'Sarah', 'Mitchell', 'Sarah Mitchell', '+1-555-0100', 'super_admin', NOW() - INTERVAL '6 months'),

-- Clinic Admins (2 users)
('admin1@swiftcare.com', 'Michael', 'Johnson', 'Michael Johnson', '+1-555-0101', 'clinic_admin', NOW() - INTERVAL '5 months'),
('admin2@swiftcare.com', 'Jennifer', 'Williams', 'Jennifer Williams', '+1-555-0102', 'clinic_admin', NOW() - INTERVAL '4 months'),

-- Dentists (5 users with specialties)
('dr.smith@swiftcare.com', 'Robert', 'Smith', 'Dr. Robert Smith', '+1-555-0103', 'dentist', NOW() - INTERVAL '3 years'),
('dr.garcia@swiftcare.com', 'Maria', 'Garcia', 'Dr. Maria Garcia', '+1-555-0104', 'dentist', NOW() - INTERVAL '2 years'),
('dr.chen@swiftcare.com', 'David', 'Chen', 'Dr. David Chen', '+1-555-0105', 'dentist', NOW() - INTERVAL '18 months'),
('dr.rodriguez@swiftcare.com', 'Ana', 'Rodriguez', 'Dr. Ana Rodriguez', '+1-555-0106', 'dentist', NOW() - INTERVAL '1 year'),
('dr.thompson@swiftcare.com', 'James', 'Thompson', 'Dr. James Thompson', '+1-555-0107', 'dentist', NOW() - INTERVAL '8 months'),

-- Staff (6 users)
('frontdesk1@swiftcare.com', 'Lisa', 'Anderson', 'Lisa Anderson', '+1-555-0108', 'staff', NOW() - INTERVAL '2 years'),
('frontdesk2@swiftcare.com', 'Amanda', 'Brown', 'Amanda Brown', '+1-555-0109', 'staff', NOW() - INTERVAL '1 year'),
('billing1@swiftcare.com', 'Kevin', 'Davis', 'Kevin Davis', '+1-555-0110', 'staff', NOW() - INTERVAL '18 months'),
('billing2@swiftcare.com', 'Rachel', 'Wilson', 'Rachel Wilson', '+1-555-0111', 'staff', NOW() - INTERVAL '1 year'),
('records@swiftcare.com', 'Thomas', 'Miller', 'Thomas Miller', '+1-555-0112', 'staff', NOW() - INTERVAL '2 years'),
('queue@swiftcare.com', 'Emma', 'Taylor', 'Emma Taylor', '+1-555-0113', 'staff', NOW() - INTERVAL '6 months')

ON CONFLICT (email) DO NOTHING;