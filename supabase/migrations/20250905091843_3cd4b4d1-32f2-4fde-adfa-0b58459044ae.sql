-- Insert sample queue data for today to test the queue monitor
DO $$
DECLARE
    sample_appointment_id_1 uuid;
    sample_appointment_id_2 uuid;
    sample_appointment_id_3 uuid;
    today_start timestamp with time zone;
    today_end timestamp with time zone;
BEGIN
    -- Set today's date range
    today_start := CURRENT_DATE::timestamp with time zone;
    today_end := (CURRENT_DATE + interval '1 day')::timestamp with time zone;
    
    -- Check if we have any appointments for today first
    SELECT id INTO sample_appointment_id_1 
    FROM appointments 
    WHERE scheduled_time >= today_start 
    AND scheduled_time < today_end 
    LIMIT 1;
    
    -- If no appointments exist for today, create some sample appointments first
    IF sample_appointment_id_1 IS NULL THEN
        -- Get a sample patient and dentist
        INSERT INTO appointments (patient_id, dentist_id, scheduled_time, status, duration_minutes, notes)
        SELECT 
            (SELECT id FROM patients ORDER BY created_at DESC LIMIT 1),
            (SELECT id FROM users WHERE role = 'dentist' LIMIT 1),
            CURRENT_DATE + interval '9 hours',
            'confirmed',
            30,
            'Sample appointment for queue testing'
        RETURNING id INTO sample_appointment_id_1;
        
        INSERT INTO appointments (patient_id, dentist_id, scheduled_time, status, duration_minutes, notes)
        SELECT 
            (SELECT id FROM patients ORDER BY created_at DESC LIMIT 1 OFFSET 1),
            (SELECT id FROM users WHERE role = 'dentist' LIMIT 1),
            CURRENT_DATE + interval '10 hours',
            'confirmed',
            45,
            'Sample appointment for queue testing'
        RETURNING id INTO sample_appointment_id_2;
        
        INSERT INTO appointments (patient_id, dentist_id, scheduled_time, status, duration_minutes, notes)
        SELECT 
            (SELECT id FROM patients ORDER BY created_at DESC LIMIT 1),
            (SELECT id FROM users WHERE role = 'dentist' LIMIT 1),
            CURRENT_DATE + interval '11 hours',
            'confirmed',
            60,
            'Sample appointment for queue testing'
        RETURNING id INTO sample_appointment_id_3;
    END IF;
    
    -- Clear existing queue entries for today
    DELETE FROM queue WHERE DATE(created_at) = CURRENT_DATE;
    
    -- Insert sample queue data with correct column names
    INSERT INTO queue (appointment_id, position, status, estimated_wait_minutes)
    VALUES 
        (sample_appointment_id_1, 1, 'waiting', 15),
        (sample_appointment_id_2, 2, 'called', 5),
        (sample_appointment_id_3, 3, 'waiting', 25);
        
END $$;