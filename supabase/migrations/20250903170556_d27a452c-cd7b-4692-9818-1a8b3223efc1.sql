-- Fix RLS policies for patients to access digital forms
DROP POLICY IF EXISTS "Patients can view active digital forms" ON digital_forms;
CREATE POLICY "Patients can view active digital forms" 
ON digital_forms 
FOR SELECT 
TO authenticated
USING (is_active = true);

-- Create storage bucket for patient documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('patient-documents', 'patient-documents', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for patient documents
CREATE POLICY "Users can upload to patient documents" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'patient-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own documents" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'patient-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Clinic staff can view all patient documents" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'patient-documents' AND 
  EXISTS (
    SELECT 1 FROM users 
    WHERE user_id = auth.uid() 
    AND role IN ('clinic_admin', 'dentist', 'staff', 'super_admin')
  )
);

CREATE POLICY "Users can update their own documents" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'patient-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'patient-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Clinic staff can delete patient documents
CREATE POLICY "Clinic staff can delete patient documents" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'patient-documents' AND 
  EXISTS (
    SELECT 1 FROM users 
    WHERE user_id = auth.uid() 
    AND role IN ('clinic_admin', 'dentist', 'staff', 'super_admin')
  )
);

-- Update patient_documents table to include file_url properly
ALTER TABLE patient_documents 
ADD COLUMN IF NOT EXISTS file_storage_path text;

-- Create function to generate file URLs
CREATE OR REPLACE FUNCTION get_patient_document_url(file_path text)
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT CASE 
    WHEN file_path IS NOT NULL THEN 
      'https://ojytxmiuitrjtrocfgei.supabase.co/storage/v1/object/public/patient-documents/' || file_path
    ELSE NULL
  END;
$$;