-- Fix function search path security issue
CREATE OR REPLACE FUNCTION get_patient_document_url(file_path text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN file_path IS NOT NULL THEN 
      'https://ojytxmiuitrjtrocfgei.supabase.co/storage/v1/object/public/patient-documents/' || file_path
    ELSE NULL
  END;
$$;