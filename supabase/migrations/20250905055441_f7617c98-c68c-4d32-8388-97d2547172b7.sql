-- Remove multi-clinic related tables and simplify to single clinic system

-- Drop sharing and branch related tables
DROP TABLE IF EXISTS public.data_sharing_audit CASCADE;
DROP TABLE IF EXISTS public.branch_group_members CASCADE;
DROP TABLE IF EXISTS public.branch_sharing_groups CASCADE;
DROP TABLE IF EXISTS public.clinic_locations CASCADE;

-- Remove sharing-related functions
DROP FUNCTION IF EXISTS public.get_user_sharing_group_branches() CASCADE;
DROP FUNCTION IF EXISTS public.can_access_branch_data(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.log_data_sharing_access(uuid, text, uuid, text) CASCADE;

-- Remove clinic_id from users table since we're single clinic now
ALTER TABLE public.users DROP COLUMN IF EXISTS clinic_id CASCADE;
ALTER TABLE public.users DROP COLUMN IF EXISTS branch_id CASCADE;

-- Remove clinic_id from other tables and simplify to single clinic
ALTER TABLE public.patients DROP COLUMN IF EXISTS clinic_id CASCADE;
ALTER TABLE public.appointments DROP COLUMN IF EXISTS clinic_id CASCADE;
ALTER TABLE public.inventory_items DROP COLUMN IF EXISTS clinic_id CASCADE;
ALTER TABLE public.inventory_categories DROP COLUMN IF EXISTS clinic_id CASCADE;
ALTER TABLE public.inventory_alerts DROP COLUMN IF EXISTS clinic_id CASCADE;
ALTER TABLE public.inventory_transactions DROP COLUMN IF EXISTS clinic_id CASCADE;
ALTER TABLE public.digital_forms DROP COLUMN IF EXISTS clinic_id CASCADE;
ALTER TABLE public.form_responses DROP COLUMN IF EXISTS clinic_id CASCADE;
ALTER TABLE public.communication_templates DROP COLUMN IF EXISTS clinic_id CASCADE;
ALTER TABLE public.communication_logs DROP COLUMN IF EXISTS clinic_id CASCADE;
ALTER TABLE public.analytics_metrics DROP COLUMN IF EXISTS clinic_id CASCADE;
ALTER TABLE public.clinic_feature_toggles DROP COLUMN IF EXISTS clinic_id CASCADE;
ALTER TABLE public.dentist_signatures DROP COLUMN IF EXISTS clinic_id CASCADE;
ALTER TABLE public.document_audit_trail DROP COLUMN IF EXISTS clinic_id CASCADE;

-- Simplify clinics table to single clinic configuration
CREATE TABLE IF NOT EXISTS public.clinic_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_name text NOT NULL DEFAULT 'SwiftCare Dental Clinic',
  address text,
  phone_number text,
  email text,
  operating_hours jsonb DEFAULT '{}',
  logo_url text,
  primary_color text DEFAULT '#2563eb',
  secondary_color text DEFAULT '#10b981',
  welcome_message text DEFAULT 'Welcome to our dental clinic',
  custom_button_labels jsonb DEFAULT '{}',
  subscription_package text DEFAULT 'professional',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on clinic_config
ALTER TABLE public.clinic_config ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clinic_config
CREATE POLICY "All authenticated users can view clinic config" 
ON public.clinic_config FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Admins can manage clinic config" 
ON public.clinic_config FOR ALL 
TO authenticated 
USING (get_current_user_role() = ANY(ARRAY['super_admin', 'clinic_admin']));

-- Insert default clinic configuration
INSERT INTO public.clinic_config (clinic_name, address, phone_number, email, welcome_message)
VALUES (
  'SwiftCare Dental Clinic',
  '123 Healthcare Drive, Medical Center, CA 90210',
  '+1 (555) 123-4567',
  'info@swiftcaredental.com',
  'Welcome to SwiftCare Dental - Your Smile is Our Priority'
) ON CONFLICT DO NOTHING;

-- Update functions to remove clinic-specific logic
CREATE OR REPLACE FUNCTION public.get_current_user_clinic_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  -- Return null since we no longer have clinic_id
  SELECT null::uuid;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_clinic_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  -- Return null since we no longer have clinic_id
  SELECT null::uuid;
$function$;

-- Update handle_new_user function to remove clinic logic
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  invitation_record user_invitations%ROWTYPE;
BEGIN
  -- Check if this user was invited
  SELECT * INTO invitation_record 
  FROM public.user_invitations 
  WHERE email = NEW.email 
  AND accepted_at IS NULL 
  AND expires_at > now()
  ORDER BY created_at DESC 
  LIMIT 1;
  
  IF FOUND THEN
    -- This is an invited user (staff/admin)
    INSERT INTO public.users (
      user_id, 
      email, 
      first_name, 
      last_name, 
      full_name,
      role,
      created_by,
      is_temp_password
    ) VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 1)),
      COALESCE(NEW.raw_user_meta_data->>'last_name', NULLIF(TRIM(substring(COALESCE(NEW.raw_user_meta_data->>'full_name', '') from position(' ' in COALESCE(NEW.raw_user_meta_data->>'full_name', '')) + 1)), '')),
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      invitation_record.role,
      invitation_record.created_by,
      true -- Temporary password, user should change on first login
    );
    
    -- Mark invitation as accepted
    UPDATE public.user_invitations 
    SET accepted_at = now() 
    WHERE id = invitation_record.id;
    
  ELSE
    -- This is a patient self-registration
    INSERT INTO public.users (
      user_id, 
      email, 
      first_name, 
      last_name, 
      full_name,
      phone,
      role,
      date_of_birth,
      emergency_contact_name,
      emergency_contact_phone,
      insurance_provider,
      insurance_policy_number
    ) VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 1)),
      COALESCE(NEW.raw_user_meta_data->>'last_name', NULLIF(TRIM(substring(COALESCE(NEW.raw_user_meta_data->>'full_name', '') from position(' ' in COALESCE(NEW.raw_user_meta_data->>'full_name', '')) + 1)), '')),
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      NEW.raw_user_meta_data->>'phone',
      COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patient'::user_role),
      (NEW.raw_user_meta_data->>'date_of_birth')::date,
      NEW.raw_user_meta_data->>'emergency_contact_name',
      NEW.raw_user_meta_data->>'emergency_contact_phone',
      NEW.raw_user_meta_data->>'insurance_provider',
      NEW.raw_user_meta_data->>'insurance_policy_number'
    );
    
    -- Create patient record if role is patient
    IF COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patient'::user_role) = 'patient' THEN
      INSERT INTO public.patients (
        user_id,
        full_name,
        email,
        contact_number,
        date_of_birth,
        emergency_contact_name,
        emergency_contact_phone,
        insurance_provider,
        insurance_policy_number
      ) VALUES (
        (SELECT id FROM public.users WHERE user_id = NEW.id),
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NEW.email,
        NEW.raw_user_meta_data->>'phone',
        (NEW.raw_user_meta_data->>'date_of_birth')::date,
        NEW.raw_user_meta_data->>'emergency_contact_name',
        NEW.raw_user_meta_data->>'emergency_contact_phone',
        NEW.raw_user_meta_data->>'insurance_provider',
        NEW.raw_user_meta_data->>'insurance_policy_number'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;