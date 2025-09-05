-- Comprehensive Demo Data Setup for SwiftCare Dental Management System
-- Part 1: Create comprehensive user data for all roles

-- Insert demo users (avoiding conflicts by using unique UUIDs)
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
('queue@swiftcare.com', 'Emma', 'Taylor', 'Emma Taylor', '+1-555-0113', 'staff', NOW() - INTERVAL '6 months'),

-- Patients (30 users - mix of demographics and situations)
('john.doe@email.com', 'John', 'Doe', 'John Doe', '+1-555-1001', 'patient', NOW() - INTERVAL '2 years'),
('jane.doe@email.com', 'Jane', 'Doe', 'Jane Doe', '+1-555-1002', 'patient', NOW() - INTERVAL '2 years'),
('emma.doe@email.com', 'Emma', 'Doe', 'Emma Doe', '+1-555-1003', 'patient', NOW() - INTERVAL '1 year'),
('mike.johnson@email.com', 'Mike', 'Johnson', 'Mike Johnson', '+1-555-1004', 'patient', NOW() - INTERVAL '18 months'),
('susan.johnson@email.com', 'Susan', 'Johnson', 'Susan Johnson', '+1-555-1005', 'patient', NOW() - INTERVAL '18 months'),
('tommy.johnson@email.com', 'Tommy', 'Johnson', 'Tommy Johnson', '+1-555-1006', 'patient', NOW() - INTERVAL '1 year'),
('maria.garcia@email.com', 'Maria', 'Garcia', 'Maria Garcia', '+1-555-1007', 'patient', NOW() - INTERVAL '6 months'),
('carlos.garcia@email.com', 'Carlos', 'Garcia', 'Carlos Garcia', '+1-555-1008', 'patient', NOW() - INTERVAL '6 months'),
('sarah.wilson@email.com', 'Sarah', 'Wilson', 'Sarah Wilson', '+1-555-1009', 'patient', NOW() - INTERVAL '3 months'),
('robert.brown@email.com', 'Robert', 'Brown', 'Robert Brown', '+1-555-1010', 'patient', NOW() - INTERVAL '1 year'),
('linda.brown@email.com', 'Linda', 'Brown', 'Linda Brown', '+1-555-1011', 'patient', NOW() - INTERVAL '1 year'),
('james.davis@email.com', 'James', 'Davis', 'James Davis', '+1-555-1012', 'patient', NOW() - INTERVAL '8 months'),
('nancy.miller@email.com', 'Nancy', 'Miller', 'Nancy Miller', '+1-555-1013', 'patient', NOW() - INTERVAL '4 months'),
('david.anderson@email.com', 'David', 'Anderson', 'David Anderson', '+1-555-1014', 'patient', NOW() - INTERVAL '2 months'),
('lisa.taylor@email.com', 'Lisa', 'Taylor', 'Lisa Taylor', '+1-555-1015', 'patient', NOW() - INTERVAL '5 months'),
('mark.lee@email.com', 'Mark', 'Lee', 'Mark Lee', '+1-555-1016', 'patient', NOW() - INTERVAL '7 months'),
('jennifer.white@email.com', 'Jennifer', 'White', 'Jennifer White', '+1-555-1017', 'patient', NOW() - INTERVAL '3 months'),
('christopher.harris@email.com', 'Christopher', 'Harris', 'Christopher Harris', '+1-555-1018', 'patient', NOW() - INTERVAL '6 months'),
('patricia.clark@email.com', 'Patricia', 'Clark', 'Patricia Clark', '+1-555-1019', 'patient', NOW() - INTERVAL '9 months'),
('matthew.lewis@email.com', 'Matthew', 'Lewis', 'Matthew Lewis', '+1-555-1020', 'patient', NOW() - INTERVAL '4 months'),
('michelle.walker@email.com', 'Michelle', 'Walker', 'Michelle Walker', '+1-555-1021', 'patient', NOW() - INTERVAL '2 months'),
('daniel.hall@email.com', 'Daniel', 'Hall', 'Daniel Hall', '+1-555-1022', 'patient', NOW() - INTERVAL '1 month'),
('barbara.allen@email.com', 'Barbara', 'Allen', 'Barbara Allen', '+1-555-1023', 'patient', NOW() - INTERVAL '3 weeks'),
('joseph.young@email.com', 'Joseph', 'Young', 'Joseph Young', '+1-555-1024', 'patient', NOW() - INTERVAL '2 weeks'),
('dorothy.king@email.com', 'Dorothy', 'King', 'Dorothy King', '+1-555-1025', 'patient', NOW() - INTERVAL '1 week'),
('steven.wright@email.com', 'Steven', 'Wright', 'Steven Wright', '+1-555-1026', 'patient', NOW() - INTERVAL '5 days'),
('helen.lopez@email.com', 'Helen', 'Lopez', 'Helen Lopez', '+1-555-1027', 'patient', NOW() - INTERVAL '3 days'),
('edward.hill@email.com', 'Edward', 'Hill', 'Edward Hill', '+1-555-1028', 'patient', NOW() - INTERVAL '2 days'),
('betty.green@email.com', 'Betty', 'Green', 'Betty Green', '+1-555-1029', 'patient', NOW() - INTERVAL '1 day'),
('paul.adams@email.com', 'Paul', 'Adams', 'Paul Adams', '+1-555-1030', 'patient', NOW());