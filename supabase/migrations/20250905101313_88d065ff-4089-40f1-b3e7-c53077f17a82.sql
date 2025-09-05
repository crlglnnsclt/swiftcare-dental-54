-- Comprehensive Demo Data Setup for SwiftCare Dental Management System
-- This migration creates realistic demo data for all user roles and features

-- First, let's add more comprehensive user data
INSERT INTO public.users (user_id, email, first_name, last_name, full_name, phone, role, created_at) VALUES
-- Super Admin (1 user)
('11111111-1111-1111-1111-111111111111', 'superadmin@swiftcare.com', 'Sarah', 'Mitchell', 'Sarah Mitchell', '+1-555-0100', 'super_admin', NOW() - INTERVAL '6 months'),

-- Clinic Admins (2 users)
('22222222-2222-2222-2222-222222222222', 'admin1@swiftcare.com', 'Michael', 'Johnson', 'Michael Johnson', '+1-555-0101', 'clinic_admin', NOW() - INTERVAL '5 months'),
('22222222-2222-2222-2222-222222222223', 'admin2@swiftcare.com', 'Jennifer', 'Williams', 'Jennifer Williams', '+1-555-0102', 'clinic_admin', NOW() - INTERVAL '4 months'),

-- Dentists (5 users with specialties)
('33333333-3333-3333-3333-333333333333', 'dr.smith@swiftcare.com', 'Robert', 'Smith', 'Dr. Robert Smith', '+1-555-0103', 'dentist', NOW() - INTERVAL '3 years'),
('33333333-3333-3333-3333-333333333334', 'dr.garcia@swiftcare.com', 'Maria', 'Garcia', 'Dr. Maria Garcia', '+1-555-0104', 'dentist', NOW() - INTERVAL '2 years'),
('33333333-3333-3333-3333-333333333335', 'dr.chen@swiftcare.com', 'David', 'Chen', 'Dr. David Chen', '+1-555-0105', 'dentist', NOW() - INTERVAL '18 months'),
('33333333-3333-3333-3333-333333333336', 'dr.rodriguez@swiftcare.com', 'Ana', 'Rodriguez', 'Dr. Ana Rodriguez', '+1-555-0106', 'dentist', NOW() - INTERVAL '1 year'),
('33333333-3333-3333-3333-333333333337', 'dr.thompson@swiftcare.com', 'James', 'Thompson', 'Dr. James Thompson', '+1-555-0107', 'dentist', NOW() - INTERVAL '8 months'),

-- Staff (6 users)
('44444444-4444-4444-4444-444444444444', 'frontdesk1@swiftcare.com', 'Lisa', 'Anderson', 'Lisa Anderson', '+1-555-0108', 'staff', NOW() - INTERVAL '2 years'),
('44444444-4444-4444-4444-444444444445', 'frontdesk2@swiftcare.com', 'Amanda', 'Brown', 'Amanda Brown', '+1-555-0109', 'staff', NOW() - INTERVAL '1 year'),
('44444444-4444-4444-4444-444444444446', 'billing1@swiftcare.com', 'Kevin', 'Davis', 'Kevin Davis', '+1-555-0110', 'staff', NOW() - INTERVAL '18 months'),
('44444444-4444-4444-4444-444444444447', 'billing2@swiftcare.com', 'Rachel', 'Wilson', 'Rachel Wilson', '+1-555-0111', 'staff', NOW() - INTERVAL '1 year'),
('44444444-4444-4444-4444-444444444448', 'records@swiftcare.com', 'Thomas', 'Miller', 'Thomas Miller', '+1-555-0112', 'staff', NOW() - INTERVAL '2 years'),
('44444444-4444-4444-4444-444444444449', 'queue@swiftcare.com', 'Emma', 'Taylor', 'Emma Taylor', '+1-555-0113', 'staff', NOW() - INTERVAL '6 months'),

-- Patients (30 users - mix of demographics and situations)
('55555555-5555-5555-5555-555555555555', 'john.doe@email.com', 'John', 'Doe', 'John Doe', '+1-555-1001', 'patient', NOW() - INTERVAL '2 years'),
('55555555-5555-5555-5555-555555555556', 'jane.doe@email.com', 'Jane', 'Doe', 'Jane Doe', '+1-555-1002', 'patient', NOW() - INTERVAL '2 years'),
('55555555-5555-5555-5555-555555555557', 'emma.doe@email.com', 'Emma', 'Doe', 'Emma Doe', '+1-555-1003', 'patient', NOW() - INTERVAL '1 year'),
('55555555-5555-5555-5555-555555555558', 'mike.johnson@email.com', 'Mike', 'Johnson', 'Mike Johnson', '+1-555-1004', 'patient', NOW() - INTERVAL '18 months'),
('55555555-5555-5555-5555-555555555559', 'susan.johnson@email.com', 'Susan', 'Johnson', 'Susan Johnson', '+1-555-1005', 'patient', NOW() - INTERVAL '18 months'),
('55555555-5555-5555-5555-555555555560', 'tommy.johnson@email.com', 'Tommy', 'Johnson', 'Tommy Johnson', '+1-555-1006', 'patient', NOW() - INTERVAL '1 year'),
('55555555-5555-5555-5555-555555555561', 'maria.garcia@email.com', 'Maria', 'Garcia', 'Maria Garcia', '+1-555-1007', 'patient', NOW() - INTERVAL '6 months'),
('55555555-5555-5555-5555-555555555562', 'carlos.garcia@email.com', 'Carlos', 'Garcia', 'Carlos Garcia', '+1-555-1008', 'patient', NOW() - INTERVAL '6 months'),
('55555555-5555-5555-5555-555555555563', 'sarah.wilson@email.com', 'Sarah', 'Wilson', 'Sarah Wilson', '+1-555-1009', 'patient', NOW() - INTERVAL '3 months'),
('55555555-5555-5555-5555-555555555564', 'robert.brown@email.com', 'Robert', 'Brown', 'Robert Brown', '+1-555-1010', 'patient', NOW() - INTERVAL '1 year'),
('55555555-5555-5555-5555-555555555565', 'linda.brown@email.com', 'Linda', 'Brown', 'Linda Brown', '+1-555-1011', 'patient', NOW() - INTERVAL '1 year'),
('55555555-5555-5555-5555-555555555566', 'james.davis@email.com', 'James', 'Davis', 'James Davis', '+1-555-1012', 'patient', NOW() - INTERVAL '8 months'),
('55555555-5555-5555-5555-555555555567', 'nancy.miller@email.com', 'Nancy', 'Miller', 'Nancy Miller', '+1-555-1013', 'patient', NOW() - INTERVAL '4 months'),
('55555555-5555-5555-5555-555555555568', 'david.anderson@email.com', 'David', 'Anderson', 'David Anderson', '+1-555-1014', 'patient', NOW() - INTERVAL '2 months'),
('55555555-5555-5555-5555-555555555569', 'lisa.taylor@email.com', 'Lisa', 'Taylor', 'Lisa Taylor', '+1-555-1015', 'patient', NOW() - INTERVAL '5 months'),
('55555555-5555-5555-5555-555555555570', 'mark.lee@email.com', 'Mark', 'Lee', 'Mark Lee', '+1-555-1016', 'patient', NOW() - INTERVAL '7 months'),
('55555555-5555-5555-5555-555555555571', 'jennifer.white@email.com', 'Jennifer', 'White', 'Jennifer White', '+1-555-1017', 'patient', NOW() - INTERVAL '3 months'),
('55555555-5555-5555-5555-555555555572', 'christopher.harris@email.com', 'Christopher', 'Harris', 'Christopher Harris', '+1-555-1018', 'patient', NOW() - INTERVAL '6 months'),
('55555555-5555-5555-5555-555555555573', 'patricia.clark@email.com', 'Patricia', 'Clark', 'Patricia Clark', '+1-555-1019', 'patient', NOW() - INTERVAL '9 months'),
('55555555-5555-5555-5555-555555555574', 'matthew.lewis@email.com', 'Matthew', 'Lewis', 'Matthew Lewis', '+1-555-1020', 'patient', NOW() - INTERVAL '4 months'),
('55555555-5555-5555-5555-555555555575', 'michelle.walker@email.com', 'Michelle', 'Walker', 'Michelle Walker', '+1-555-1021', 'patient', NOW() - INTERVAL '2 months'),
('55555555-5555-5555-5555-555555555576', 'daniel.hall@email.com', 'Daniel', 'Hall', 'Daniel Hall', '+1-555-1022', 'patient', NOW() - INTERVAL '1 month'),
('55555555-5555-5555-5555-555555555577', 'barbara.allen@email.com', 'Barbara', 'Allen', 'Barbara Allen', '+1-555-1023', 'patient', NOW() - INTERVAL '3 weeks'),
('55555555-5555-5555-5555-555555555578', 'joseph.young@email.com', 'Joseph', 'Young', 'Joseph Young', '+1-555-1024', 'patient', NOW() - INTERVAL '2 weeks'),
('55555555-5555-5555-5555-555555555579', 'dorothy.king@email.com', 'Dorothy', 'King', 'Dorothy King', '+1-555-1025', 'patient', NOW() - INTERVAL '1 week'),
('55555555-5555-5555-5555-555555555580', 'steven.wright@email.com', 'Steven', 'Wright', 'Steven Wright', '+1-555-1026', 'patient', NOW() - INTERVAL '5 days'),
('55555555-5555-5555-5555-555555555581', 'helen.lopez@email.com', 'Helen', 'Lopez', 'Helen Lopez', '+1-555-1027', 'patient', NOW() - INTERVAL '3 days'),
('55555555-5555-5555-5555-555555555582', 'edward.hill@email.com', 'Edward', 'Hill', 'Edward Hill', '+1-555-1028', 'patient', NOW() - INTERVAL '2 days'),
('55555555-5555-5555-5555-555555555583', 'betty.green@email.com', 'Betty', 'Green', 'Betty Green', '+1-555-1029', 'patient', NOW() - INTERVAL '1 day'),
('55555555-5555-5555-5555-555555555584', 'paul.adams@email.com', 'Paul', 'Adams', 'Paul Adams', '+1-555-1030', 'patient', NOW())
ON CONFLICT (user_id) DO NOTHING;