-- SwiftCare Dental Demo Data Setup
-- This migration creates comprehensive demo data for testing and client presentation

-- First, let's create demo users for all roles
INSERT INTO public.users (user_id, email, first_name, last_name, full_name, role, phone) VALUES 
-- Super Admin (1)
('00000000-0000-0000-0000-000000000001', 'admin@swiftcare.com', 'Sarah', 'Wilson', 'Sarah Wilson', 'super_admin', '+1-555-0001'),

-- Clinic Admins (2)
('00000000-0000-0000-0000-000000000002', 'clinic.admin@swiftcare.com', 'Michael', 'Johnson', 'Michael Johnson', 'clinic_admin', '+1-555-0002'),
('00000000-0000-0000-0000-000000000003', 'admin.backup@swiftcare.com', 'Lisa', 'Chen', 'Lisa Chen', 'clinic_admin', '+1-555-0003'),

-- Dentists (5 with specialties)
('00000000-0000-0000-0000-000000000004', 'dr.martinez@swiftcare.com', 'Dr. Carlos', 'Martinez', 'Dr. Carlos Martinez', 'dentist', '+1-555-0004'),
('00000000-0000-0000-0000-000000000005', 'dr.thompson@swiftcare.com', 'Dr. Emily', 'Thompson', 'Dr. Emily Thompson', 'dentist', '+1-555-0005'),
('00000000-0000-0000-0000-000000000006', 'dr.patel@swiftcare.com', 'Dr. Raj', 'Patel', 'Dr. Raj Patel', 'dentist', '+1-555-0006'),
('00000000-0000-0000-0000-000000000007', 'dr.wong@swiftcare.com', 'Dr. Amy', 'Wong', 'Dr. Amy Wong', 'dentist', '+1-555-0007'),
('00000000-0000-0000-0000-000000000008', 'dr.brown@swiftcare.com', 'Dr. James', 'Brown', 'Dr. James Brown', 'dentist', '+1-555-0008'),

-- Staff (6 members)
('00000000-0000-0000-0000-000000000009', 'reception@swiftcare.com', 'Maria', 'Garcia', 'Maria Garcia', 'staff', '+1-555-0009'),
('00000000-0000-0000-0000-000000000010', 'billing@swiftcare.com', 'Jennifer', 'Kim', 'Jennifer Kim', 'staff', '+1-555-0010'),
('00000000-0000-0000-0000-000000000011', 'records@swiftcare.com', 'David', 'Lee', 'David Lee', 'staff', '+1-555-0011'),
('00000000-0000-0000-0000-000000000012', 'queue.manager@swiftcare.com', 'Rebecca', 'Taylor', 'Rebecca Taylor', 'staff', '+1-555-0012'),
('00000000-0000-0000-0000-000000000013', 'assistant@swiftcare.com', 'Kevin', 'Rodriguez', 'Kevin Rodriguez', 'staff', '+1-555-0013'),
('00000000-0000-0000-0000-000000000014', 'coordinator@swiftcare.com', 'Samantha', 'Davis', 'Samantha Davis', 'staff', '+1-555-0014'),

-- Patients (30 realistic patients)
('00000000-0000-0000-0000-000000000015', 'patient1@email.com', 'John', 'Smith', 'John Smith', 'patient', '+1-555-1001'),
('00000000-0000-0000-0000-000000000016', 'patient2@email.com', 'Emma', 'Johnson', 'Emma Johnson', 'patient', '+1-555-1002'),
('00000000-0000-0000-0000-000000000017', 'patient3@email.com', 'Michael', 'Williams', 'Michael Williams', 'patient', '+1-555-1003'),
('00000000-0000-0000-0000-000000000018', 'patient4@email.com', 'Sophia', 'Brown', 'Sophia Brown', 'patient', '+1-555-1004'),
('00000000-0000-0000-0000-000000000019', 'patient5@email.com', 'William', 'Jones', 'William Jones', 'patient', '+1-555-1005'),
('00000000-0000-0000-0000-000000000020', 'patient6@email.com', 'Olivia', 'Garcia', 'Olivia Garcia', 'patient', '+1-555-1006'),
('00000000-0000-0000-0000-000000000021', 'patient7@email.com', 'James', 'Miller', 'James Miller', 'patient', '+1-555-1007'),
('00000000-0000-0000-0000-000000000022', 'patient8@email.com', 'Ava', 'Davis', 'Ava Davis', 'patient', '+1-555-1008'),
('00000000-0000-0000-0000-000000000023', 'patient9@email.com', 'Benjamin', 'Rodriguez', 'Benjamin Rodriguez', 'patient', '+1-555-1009'),
('00000000-0000-0000-0000-000000000024', 'patient10@email.com', 'Isabella', 'Martinez', 'Isabella Martinez', 'patient', '+1-555-1010'),
('00000000-0000-0000-0000-000000000025', 'patient11@email.com', 'Lucas', 'Anderson', 'Lucas Anderson', 'patient', '+1-555-1011'),
('00000000-0000-0000-0000-000000000026', 'patient12@email.com', 'Mia', 'Taylor', 'Mia Taylor', 'patient', '+1-555-1012'),
('00000000-0000-0000-0000-000000000027', 'patient13@email.com', 'Henry', 'Thomas', 'Henry Thomas', 'patient', '+1-555-1013'),
('00000000-0000-0000-0000-000000000028', 'patient14@email.com', 'Charlotte', 'Hernandez', 'Charlotte Hernandez', 'patient', '+1-555-1014'),
('00000000-0000-0000-0000-000000000029', 'patient15@email.com', 'Alexander', 'Moore', 'Alexander Moore', 'patient', '+1-555-1015'),
('00000000-0000-0000-0000-000000000030', 'patient16@email.com', 'Amelia', 'Martin', 'Amelia Martin', 'patient', '+1-555-1016'),
('00000000-0000-0000-0000-000000000031', 'patient17@email.com', 'Sebastian', 'Jackson', 'Sebastian Jackson', 'patient', '+1-555-1017'),
('00000000-0000-0000-0000-000000000032', 'patient18@email.com', 'Harper', 'Thompson', 'Harper Thompson', 'patient', '+1-555-1018'),
('00000000-0000-0000-0000-000000000033', 'patient19@email.com', 'Owen', 'White', 'Owen White', 'patient', '+1-555-1019'),
('00000000-0000-0000-0000-000000000034', 'patient20@email.com', 'Evelyn', 'Lopez', 'Evelyn Lopez', 'patient', '+1-555-1020'),
('00000000-0000-0000-0000-000000000035', 'patient21@email.com', 'Jack', 'Lee', 'Jack Lee', 'patient', '+1-555-1021'),
('00000000-0000-0000-0000-000000000036', 'patient22@email.com', 'Luna', 'Gonzalez', 'Luna Gonzalez', 'patient', '+1-555-1022'),
('00000000-0000-0000-0000-000000000037', 'patient23@email.com', 'Theodore', 'Wilson', 'Theodore Wilson', 'patient', '+1-555-1023'),
('00000000-0000-0000-0000-000000000038', 'patient24@email.com', 'Grace', 'Clark', 'Grace Clark', 'patient', '+1-555-1024'),
('00000000-0000-0000-0000-000000000039', 'patient25@email.com', 'Leo', 'Lewis', 'Leo Lewis', 'patient', '+1-555-1025'),
('00000000-0000-0000-0000-000000000040', 'patient26@email.com', 'Zoe', 'Robinson', 'Zoe Robinson', 'patient', '+1-555-1026'),
('00000000-0000-0000-0000-000000000041', 'patient27@email.com', 'Eli', 'Walker', 'Eli Walker', 'patient', '+1-555-1027'),
('00000000-0000-0000-0000-000000000042', 'patient28@email.com', 'Stella', 'Perez', 'Stella Perez', 'patient', '+1-555-1028'),
('00000000-0000-0000-0000-000000000043', 'patient29@email.com', 'Asher', 'Hall', 'Asher Hall', 'patient', '+1-555-1029'),
('00000000-0000-0000-0000-000000000044', 'patient30@email.com', 'Hazel', 'Allen', 'Hazel Allen', 'patient', '+1-555-1030');

-- Create patients table entries
INSERT INTO public.patients (user_id, full_name, email, contact_number, date_of_birth, emergency_contact_name, emergency_contact_phone, insurance_provider, insurance_policy_number) VALUES 
((SELECT id FROM users WHERE email = 'patient1@email.com'), 'John Smith', 'patient1@email.com', '+1-555-1001', '1985-03-15', 'Jane Smith', '+1-555-2001', 'BlueCross BlueShield', 'BC123456789'),
((SELECT id FROM users WHERE email = 'patient2@email.com'), 'Emma Johnson', 'patient2@email.com', '+1-555-1002', '1990-07-22', 'David Johnson', '+1-555-2002', 'Aetna', 'AET987654321'),
((SELECT id FROM users WHERE email = 'patient3@email.com'), 'Michael Williams', 'patient3@email.com', '+1-555-1003', '1978-11-08', 'Sarah Williams', '+1-555-2003', NULL, NULL),
((SELECT id FROM users WHERE email = 'patient4@email.com'), 'Sophia Brown', 'patient4@email.com', '+1-555-1004', '1995-01-30', 'Mark Brown', '+1-555-2004', 'UnitedHealthcare', 'UHC456789123'),
((SELECT id FROM users WHERE email = 'patient5@email.com'), 'William Jones', 'patient5@email.com', '+1-555-1005', '1982-05-17', 'Lisa Jones', '+1-555-2005', 'Cigna', 'CIG789123456'),
((SELECT id FROM users WHERE email = 'patient6@email.com'), 'Olivia Garcia', 'patient6@email.com', '+1-555-1006', '1988-09-12', 'Carlos Garcia', '+1-555-2006', NULL, NULL),
((SELECT id FROM users WHERE email = 'patient7@email.com'), 'James Miller', 'patient7@email.com', '+1-555-1007', '1976-12-25', 'Anna Miller', '+1-555-2007', 'BlueCross BlueShield', 'BC789456123'),
((SELECT id FROM users WHERE email = 'patient8@email.com'), 'Ava Davis', 'patient8@email.com', '+1-555-1008', '1992-04-03', 'Robert Davis', '+1-555-2008', 'Aetna', 'AET321654987'),
((SELECT id FROM users WHERE email = 'patient9@email.com'), 'Benjamin Rodriguez', 'patient9@email.com', '+1-555-1009', '1987-08-19', 'Maria Rodriguez', '+1-555-2009', 'Kaiser Permanente', 'KP147258369'),
((SELECT id FROM users WHERE email = 'patient10@email.com'), 'Isabella Martinez', 'patient10@email.com', '+1-555-1010', '1993-02-14', 'Juan Martinez', '+1-555-2010', NULL, NULL),
((SELECT id FROM users WHERE email = 'patient11@email.com'), 'Lucas Anderson', 'patient11@email.com', '+1-555-1011', '1980-06-28', 'Emily Anderson', '+1-555-2011', 'UnitedHealthcare', 'UHC963852741'),
((SELECT id FROM users WHERE email = 'patient12@email.com'), 'Mia Taylor', 'patient12@email.com', '+1-555-1012', '1989-10-07', 'Kevin Taylor', '+1-555-2012', 'Humana', 'HUM258147369'),
((SELECT id FROM users WHERE email = 'patient13@email.com'), 'Henry Thomas', 'patient13@email.com', '+1-555-1013', '1975-03-21', 'Patricia Thomas', '+1-555-2013', 'BlueCross BlueShield', 'BC852741963'),
((SELECT id FROM users WHERE email = 'patient14@email.com'), 'Charlotte Hernandez', 'patient14@email.com', '+1-555-1014', '1996-11-16', 'Miguel Hernandez', '+1-555-2014', NULL, NULL),
((SELECT id FROM users WHERE email = 'patient15@email.com'), 'Alexander Moore', 'patient15@email.com', '+1-555-1015', '1983-07-04', 'Rebecca Moore', '+1-555-2015', 'Cigna', 'CIG741852963'),
((SELECT id FROM users WHERE email = 'patient16@email.com'), 'Amelia Martin', 'patient16@email.com', '+1-555-1016', '1991-12-09', 'Thomas Martin', '+1-555-2016', 'Aetna', 'AET159753486'),
((SELECT id FROM users WHERE email = 'patient17@email.com'), 'Sebastian Jackson', 'patient17@email.com', '+1-555-1017', '1986-01-27', 'Michelle Jackson', '+1-555-2017', 'UnitedHealthcare', 'UHC486159753'),
((SELECT id FROM users WHERE email = 'patient18@email.com'), 'Harper Thompson', 'patient18@email.com', '+1-555-1018', '1994-05-13', 'Brian Thompson', '+1-555-2018', NULL, NULL),
((SELECT id FROM users WHERE email = 'patient19@email.com'), 'Owen White', 'patient19@email.com', '+1-555-1019', '1979-09-01', 'Susan White', '+1-555-2019', 'Kaiser Permanente', 'KP753486159'),
((SELECT id FROM users WHERE email = 'patient20@email.com'), 'Evelyn Lopez', 'patient20@email.com', '+1-555-1020', '1997-04-18', 'Fernando Lopez', '+1-555-2020', 'Humana', 'HUM159486753'),
((SELECT id FROM users WHERE email = 'patient21@email.com'), 'Jack Lee', 'patient21@email.com', '+1-555-1021', '1984-08-26', 'Nancy Lee', '+1-555-2021', 'BlueCross BlueShield', 'BC486753159'),
((SELECT id FROM users WHERE email = 'patient22@email.com'), 'Luna Gonzalez', 'patient22@email.com', '+1-555-1022', '1981-12-11', 'Roberto Gonzalez', '+1-555-2022', NULL, NULL),
((SELECT id FROM users WHERE email = 'patient23@email.com'), 'Theodore Wilson', 'patient23@email.com', '+1-555-1023', '1998-02-29', 'Catherine Wilson', '+1-555-2023', 'Cigna', 'CIG753159486'),
((SELECT id FROM users WHERE email = 'patient24@email.com'), 'Grace Clark', 'patient24@email.com', '+1-555-1024', '1977-06-15', 'Daniel Clark', '+1-555-2024', 'Aetna', 'AET486753912'),
((SELECT id FROM users WHERE email = 'patient25@email.com'), 'Leo Lewis', 'patient25@email.com', '+1-555-1025', '1990-10-23', 'Jennifer Lewis', '+1-555-2025', 'UnitedHealthcare', 'UHC159753486'),
((SELECT id FROM users WHERE email = 'patient26@email.com'), 'Zoe Robinson', 'patient26@email.com', '+1-555-1026', '1985-03-07', 'Matthew Robinson', '+1-555-2026', NULL, NULL),
((SELECT id FROM users WHERE email = 'patient27@email.com'), 'Eli Walker', 'patient27@email.com', '+1-555-1027', '1992-07-14', 'Amanda Walker', '+1-555-2027', 'Kaiser Permanente', 'KP486159753'),
((SELECT id FROM users WHERE email = 'patient28@email.com'), 'Stella Perez', 'patient28@email.com', '+1-555-1028', '1988-11-02', 'Jose Perez', '+1-555-2028', 'Humana', 'HUM753486912'),
((SELECT id FROM users WHERE email = 'patient29@email.com'), 'Asher Hall', 'patient29@email.com', '+1-555-1029', '1974-04-20', 'Mary Hall', '+1-555-2029', 'BlueCross BlueShield', 'BC912486753'),
((SELECT id FROM users WHERE email = 'patient30@email.com'), 'Hazel Allen', 'patient30@email.com', '+1-555-1030', '1995-08-08', 'Christopher Allen', '+1-555-2030', 'Cigna', 'CIG486912753');