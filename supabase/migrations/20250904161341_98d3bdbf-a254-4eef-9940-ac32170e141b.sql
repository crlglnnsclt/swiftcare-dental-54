-- First, update foreign key references to point to the oldest patient record for each user
-- Update communication_logs to reference the oldest patient record for each user
UPDATE communication_logs 
SET patient_id = (
  SELECT p.id 
  FROM patients p 
  WHERE p.user_id = (
    SELECT old_p.user_id 
    FROM patients old_p 
    WHERE old_p.id = communication_logs.patient_id
  )
  ORDER BY p.created_at ASC 
  LIMIT 1
)
WHERE patient_id IN (
  SELECT p.id FROM patients p
  WHERE p.user_id IN (
    SELECT user_id FROM patients 
    WHERE user_id IS NOT NULL
    GROUP BY user_id 
    HAVING COUNT(*) > 1
  )
  AND p.id NOT IN (
    SELECT DISTINCT ON (user_id) id 
    FROM patients 
    WHERE user_id IS NOT NULL
    ORDER BY user_id, created_at ASC
  )
);

-- Update appointments to reference the oldest patient record for each user
UPDATE appointments 
SET patient_id = (
  SELECT p.id 
  FROM patients p 
  WHERE p.user_id = (
    SELECT old_p.user_id 
    FROM patients old_p 
    WHERE old_p.id = appointments.patient_id
  )
  ORDER BY p.created_at ASC 
  LIMIT 1
)
WHERE patient_id IN (
  SELECT p.id FROM patients p
  WHERE p.user_id IN (
    SELECT user_id FROM patients 
    WHERE user_id IS NOT NULL
    GROUP BY user_id 
    HAVING COUNT(*) > 1
  )
  AND p.id NOT IN (
    SELECT DISTINCT ON (user_id) id 
    FROM patients 
    WHERE user_id IS NOT NULL
    ORDER BY user_id, created_at ASC
  )
);

-- Now safely remove duplicate patient records
DELETE FROM patients 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id 
  FROM patients 
  WHERE user_id IS NOT NULL
  ORDER BY user_id, created_at ASC
);

-- Remove patient records with null user_id
DELETE FROM patients WHERE user_id IS NULL;

-- Add unique constraint to prevent future duplicates
ALTER TABLE patients ADD CONSTRAINT patients_user_id_unique UNIQUE (user_id);