-- Remove duplicate patient records, keeping only the oldest one for each user_id
WITH duplicates AS (
  SELECT id, user_id, 
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC) as rn
  FROM patients 
  WHERE user_id IS NOT NULL
)
DELETE FROM patients 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Remove patient records with null user_id as they are invalid
DELETE FROM patients WHERE user_id IS NULL;

-- Add unique constraint to prevent future duplicates
ALTER TABLE patients ADD CONSTRAINT patients_user_id_unique UNIQUE (user_id);

-- Update any appointments that might reference deleted patient records
-- to use the remaining patient record for the same user
UPDATE appointments 
SET patient_id = (
  SELECT p.id 
  FROM patients p 
  JOIN users u ON p.user_id = u.id 
  WHERE u.clinic_id = appointments.clinic_id
  AND p.user_id = (
    SELECT u2.id FROM users u2 
    WHERE u2.clinic_id = appointments.clinic_id 
    AND u2.role = 'patient'
    LIMIT 1
  )
  LIMIT 1
)
WHERE patient_id NOT IN (SELECT id FROM patients);