-- Continue adding patients and create patient records
-- Add patients (30 users - mix of demographics and situations)
INSERT INTO public.users (email, first_name, last_name, full_name, phone, role, date_of_birth, emergency_contact_name, emergency_contact_phone, insurance_provider, insurance_policy_number, created_at) VALUES
-- Family 1: Doe Family (with insurance)
('john.doe@email.com', 'John', 'Doe', 'John Doe', '+1-555-1001', 'patient', '1985-03-15', 'Jane Doe', '+1-555-1002', 'BlueCross BlueShield', 'BC123456789', NOW() - INTERVAL '2 years'),
('jane.doe@email.com', 'Jane', 'Doe', 'Jane Doe', '+1-555-1002', 'patient', '1987-07-22', 'John Doe', '+1-555-1001', 'BlueCross BlueShield', 'BC123456790', NOW() - INTERVAL '2 years'),
('emma.doe@email.com', 'Emma', 'Doe', 'Emma Doe', '+1-555-1003', 'patient', '2015-09-10', 'Jane Doe', '+1-555-1002', 'BlueCross BlueShield', 'BC123456791', NOW() - INTERVAL '1 year'),

-- Family 2: Johnson Family (with insurance)
('mike.johnson@email.com', 'Mike', 'Johnson', 'Mike Johnson', '+1-555-1004', 'patient', '1978-12-05', 'Susan Johnson', '+1-555-1005', 'Aetna', 'AET987654321', NOW() - INTERVAL '18 months'),
('susan.johnson@email.com', 'Susan', 'Johnson', 'Susan Johnson', '+1-555-1005', 'patient', '1980-04-18', 'Mike Johnson', '+1-555-1004', 'Aetna', 'AET987654322', NOW() - INTERVAL '18 months'),
('tommy.johnson@email.com', 'Tommy', 'Johnson', 'Tommy Johnson', '+1-555-1006', 'patient', '2012-11-30', 'Susan Johnson', '+1-555-1005', 'Aetna', 'AET987654323', NOW() - INTERVAL '1 year'),

-- Family 3: Garcia Family (no insurance)
('maria.garcia@email.com', 'Maria', 'Garcia', 'Maria Garcia', '+1-555-1007', 'patient', '1992-06-14', 'Carlos Garcia', '+1-555-1008', NULL, NULL, NOW() - INTERVAL '6 months'),
('carlos.garcia@email.com', 'Carlos', 'Garcia', 'Carlos Garcia', '+1-555-1008', 'patient', '1990-08-27', 'Maria Garcia', '+1-555-1007', NULL, NULL, NOW() - INTERVAL '6 months'),

-- Individual patients (mix of insured and uninsured)
('sarah.wilson@email.com', 'Sarah', 'Wilson', 'Sarah Wilson', '+1-555-1009', 'patient', '1995-01-12', 'Robert Wilson', '+1-555-1010', 'Cigna', 'CIG456789123', NOW() - INTERVAL '3 months'),
('robert.brown@email.com', 'Robert', 'Brown', 'Robert Brown', '+1-555-1010', 'patient', '1975-10-08', 'Linda Brown', '+1-555-1011', 'UnitedHealth', 'UH789123456', NOW() - INTERVAL '1 year'),
('linda.brown@email.com', 'Linda', 'Brown', 'Linda Brown', '+1-555-1011', 'patient', '1977-05-25', 'Robert Brown', '+1-555-1010', 'UnitedHealth', 'UH789123457', NOW() - INTERVAL '1 year'),
('james.davis@email.com', 'James', 'Davis', 'James Davis', '+1-555-1012', 'patient', '1983-09-03', 'Nancy Davis', '+1-555-1013', NULL, NULL, NOW() - INTERVAL '8 months'),
('nancy.miller@email.com', 'Nancy', 'Miller', 'Nancy Miller', '+1-555-1013', 'patient', '1968-12-17', 'David Miller', '+1-555-1014', 'Medicare', 'MED123456789', NOW() - INTERVAL '4 months'),
('david.anderson@email.com', 'David', 'Anderson', 'David Anderson', '+1-555-1014', 'patient', '1991-02-28', 'Lisa Anderson', '+1-555-1015', 'Humana', 'HUM987654321', NOW() - INTERVAL '2 months'),
('lisa.taylor@email.com', 'Lisa', 'Taylor', 'Lisa Taylor', '+1-555-1015', 'patient', '1986-11-11', 'Mark Taylor', '+1-555-1016', NULL, NULL, NOW() - INTERVAL '5 months'),
('mark.lee@email.com', 'Mark', 'Lee', 'Mark Lee', '+1-555-1016', 'patient', '1994-07-04', 'Jennifer Lee', '+1-555-1017', 'Kaiser Permanente', 'KP456123789', NOW() - INTERVAL '7 months'),
('jennifer.white@email.com', 'Jennifer', 'White', 'Jennifer White', '+1-555-1017', 'patient', '1989-03-20', 'Christopher White', '+1-555-1018', 'Anthem', 'ANT654321987', NOW() - INTERVAL '3 months'),
('christopher.harris@email.com', 'Christopher', 'Harris', 'Christopher Harris', '+1-555-1018', 'patient', '1982-08-15', 'Patricia Harris', '+1-555-1019', NULL, NULL, NOW() - INTERVAL '6 months'),
('patricia.clark@email.com', 'Patricia', 'Clark', 'Patricia Clark', '+1-555-1019', 'patient', '1973-04-02', 'Matthew Clark', '+1-555-1020', 'TRICARE', 'TRI321987654', NOW() - INTERVAL '9 months'),
('matthew.lewis@email.com', 'Matthew', 'Lewis', 'Matthew Lewis', '+1-555-1020', 'patient', '1996-12-09', 'Michelle Lewis', '+1-555-1021', 'Molina Healthcare', 'MOL159753486', NOW() - INTERVAL '4 months'),
('michelle.walker@email.com', 'Michelle', 'Walker', 'Michelle Walker', '+1-555-1021', 'patient', '1998-05-06', 'Daniel Walker', '+1-555-1022', NULL, NULL, NOW() - INTERVAL '2 months'),
('daniel.hall@email.com', 'Daniel', 'Hall', 'Daniel Hall', '+1-555-1022', 'patient', '1976-09-23', 'Barbara Hall', '+1-555-1023', 'MetLife', 'MET753951846', NOW() - INTERVAL '1 month'),
('barbara.allen@email.com', 'Barbara', 'Allen', 'Barbara Allen', '+1-555-1023', 'patient', '1965-01-30', 'Joseph Allen', '+1-555-1024', 'Medicare', 'MED987654321', NOW() - INTERVAL '3 weeks'),
('joseph.young@email.com', 'Joseph', 'Young', 'Joseph Young', '+1-555-1024', 'patient', '1988-06-18', 'Dorothy Young', '+1-555-1025', 'BlueCross BlueShield', 'BC852741963', NOW() - INTERVAL '2 weeks'),
('dorothy.king@email.com', 'Dorothy', 'King', 'Dorothy King', '+1-555-1025', 'patient', '1971-11-07', 'Steven King', '+1-555-1026', NULL, NULL, NOW() - INTERVAL '1 week'),
('steven.wright@email.com', 'Steven', 'Wright', 'Steven Wright', '+1-555-1026', 'patient', '1993-02-14', 'Helen Wright', '+1-555-1027', 'Aetna', 'AET147258369', NOW() - INTERVAL '5 days'),
('helen.lopez@email.com', 'Helen', 'Lopez', 'Helen Lopez', '+1-555-1027', 'patient', '1984-10-25', 'Edward Lopez', '+1-555-1028', 'Cigna', 'CIG963852741', NOW() - INTERVAL '3 days'),
('edward.hill@email.com', 'Edward', 'Hill', 'Edward Hill', '+1-555-1028', 'patient', '1979-07-12', 'Betty Hill', '+1-555-1029', NULL, NULL, NOW() - INTERVAL '2 days'),
('betty.green@email.com', 'Betty', 'Green', 'Betty Green', '+1-555-1029', 'patient', '1967-04-29', 'Paul Green', '+1-555-1030', 'Medicare', 'MED741852963', NOW() - INTERVAL '1 day'),
('paul.adams@email.com', 'Paul', 'Adams', 'Paul Adams', '+1-555-1030', 'patient', '1999-12-01', 'Susan Adams', '+1-555-9999', 'UnitedHealth', 'UH369258147', NOW())

ON CONFLICT (email) DO NOTHING;