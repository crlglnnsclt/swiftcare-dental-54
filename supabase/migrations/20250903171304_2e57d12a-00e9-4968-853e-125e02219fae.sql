-- Fix RLS policies for patient_documents to allow patients to insert their own documents
DROP POLICY IF EXISTS "Patients can insert their own documents" ON patient_documents;
CREATE POLICY "Patients can insert their own documents" 
ON patient_documents 
FOR INSERT 
TO authenticated
WITH CHECK (
  patient_id IN (
    SELECT p.id FROM patients p 
    JOIN users u ON u.id = p.user_id 
    WHERE u.user_id = auth.uid()
  )
);

-- Fix RLS policies for form_responses to allow patients to insert their own responses
DROP POLICY IF EXISTS "Patients can insert their own form responses" ON form_responses;
CREATE POLICY "Patients can insert their own form responses" 
ON form_responses 
FOR INSERT 
TO authenticated
WITH CHECK (
  patient_id IN (
    SELECT p.id FROM patients p 
    JOIN users u ON u.id = p.user_id 
    WHERE u.user_id = auth.uid()
  )
);

-- Also ensure patients can insert without specifying patient_id (for when they create their own patient record)
DROP POLICY IF EXISTS "Users can create patient documents" ON patient_documents;
CREATE POLICY "Users can create patient documents" 
ON patient_documents 
FOR INSERT 
TO authenticated
WITH CHECK (
  uploaded_by = auth.uid() OR 
  clinic_id IN (
    SELECT u.clinic_id FROM users u WHERE u.user_id = auth.uid()
  )
);

-- Allow users to create form responses for their clinic
DROP POLICY IF EXISTS "Users can create form responses" ON form_responses;
CREATE POLICY "Users can create form responses" 
ON form_responses 
FOR INSERT 
TO authenticated
WITH CHECK (
  signed_by = auth.uid() OR 
  clinic_id IN (
    SELECT u.clinic_id FROM users u WHERE u.user_id = auth.uid()
  )
);