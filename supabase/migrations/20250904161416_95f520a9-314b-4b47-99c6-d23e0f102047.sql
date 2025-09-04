-- First, let's see which tables reference patients and update them all
-- Update all foreign key references to use the oldest patient record for each user

-- Update communication_logs
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

-- Update appointments
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

-- Update form_responses
UPDATE form_responses 
SET patient_id = (
  SELECT p.id 
  FROM patients p 
  WHERE p.user_id = (
    SELECT old_p.user_id 
    FROM patients old_p 
    WHERE old_p.id = form_responses.patient_id
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

-- Update documents
UPDATE documents 
SET patient_id = (
  SELECT p.id 
  FROM patients p 
  WHERE p.user_id = (
    SELECT old_p.user_id 
    FROM patients old_p 
    WHERE old_p.id = documents.patient_id
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

-- Update family_members (both primary and secondary)
UPDATE family_members 
SET primary_patient_id = (
  SELECT p.id 
  FROM patients p 
  WHERE p.user_id = (
    SELECT old_p.user_id 
    FROM patients old_p 
    WHERE old_p.id = family_members.primary_patient_id
  )
  ORDER BY p.created_at ASC 
  LIMIT 1
)
WHERE primary_patient_id IN (
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

UPDATE family_members 
SET secondary_patient_id = (
  SELECT p.id 
  FROM patients p 
  WHERE p.user_id = (
    SELECT old_p.user_id 
    FROM patients old_p 
    WHERE old_p.id = family_members.secondary_patient_id
  )
  ORDER BY p.created_at ASC 
  LIMIT 1
)
WHERE secondary_patient_id IN (
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

-- Update dentist_signatures if any reference patients
UPDATE dentist_signatures 
SET patient_id = (
  SELECT p.id 
  FROM patients p 
  WHERE p.user_id = (
    SELECT old_p.user_id 
    FROM patients old_p 
    WHERE old_p.id = dentist_signatures.patient_id
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

-- Update document_audit_trail if any reference patients  
UPDATE document_audit_trail 
SET patient_id = (
  SELECT p.id 
  FROM patients p 
  WHERE p.user_id = (
    SELECT old_p.user_id 
    FROM patients old_p 
    WHERE old_p.id = document_audit_trail.patient_id
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