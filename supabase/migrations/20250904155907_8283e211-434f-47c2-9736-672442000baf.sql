-- Fix infinite recursion in RLS policies for users table
-- First, drop all existing problematic policies on users table
DROP POLICY IF EXISTS "Patients can view dentists in their clinic for appointments" ON public.users;
DROP POLICY IF EXISTS "Clinic staff can view appointments with sharing access" ON public.users;
DROP POLICY IF EXISTS "Users can view their clinic" ON public.users;
DROP POLICY IF EXISTS "Super admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Clinic staff can view their clinic users" ON public.users;

-- Create security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM public.users WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_clinic_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT clinic_id FROM public.users WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  );
$$;

-- Create new safe RLS policies for users table
CREATE POLICY "Users can view their own profile"
ON public.users
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Allow patients to view dentists (without self-referencing)
CREATE POLICY "Patients can view dentists for appointments"
ON public.users
FOR SELECT
TO authenticated
USING (
  role = 'dentist' 
  AND public.get_current_user_role() = 'patient'
  AND clinic_id = public.get_current_user_clinic_id()
);

-- Allow clinic staff to view other staff in their clinic
CREATE POLICY "Clinic staff can view clinic members"
ON public.users
FOR SELECT
TO authenticated
USING (
  clinic_id = public.get_current_user_clinic_id()
  AND public.get_current_user_role() IN ('clinic_admin', 'staff', 'dentist', 'receptionist')
);

-- Allow super admins to view all users
CREATE POLICY "Super admins can view all users"
ON public.users
FOR SELECT
TO authenticated
USING (public.is_super_admin());

-- Allow super admins to manage all users
CREATE POLICY "Super admins can manage all users"
ON public.users
FOR ALL
TO authenticated
USING (public.is_super_admin());

-- Fix treatments table RLS policies for patient booking
-- First check if policies exist and drop them
DROP POLICY IF EXISTS "Patients can view treatments in their clinic" ON public.treatments;
DROP POLICY IF EXISTS "Patients can view global treatments" ON public.treatments;

-- Add policies for treatments table to allow patient appointment booking
CREATE POLICY "Patients can view treatments in their clinic"
ON public.treatments
FOR SELECT
TO authenticated
USING (
  clinic_id = public.get_current_user_clinic_id()
  AND public.get_current_user_role() = 'patient'
);

CREATE POLICY "Patients can view global treatments"
ON public.treatments
FOR SELECT
TO authenticated
USING (
  (is_global_template = true OR created_by_super_admin = true)
  AND public.get_current_user_role() = 'patient'
);

-- Allow clinic staff to manage treatments
CREATE POLICY "Clinic staff can manage treatments"
ON public.treatments
FOR ALL
TO authenticated
USING (
  clinic_id = public.get_current_user_clinic_id()
  AND public.get_current_user_role() IN ('clinic_admin', 'dentist', 'staff')
);

-- Allow super admins to manage all treatments
CREATE POLICY "Super admins can manage all treatments"
ON public.treatments
FOR ALL
TO authenticated
USING (public.is_super_admin());

-- Fix appointments table policies to use new functions
DROP POLICY IF EXISTS "Clinic staff can view appointments with sharing access" ON public.appointments;

CREATE POLICY "Clinic staff can view appointments with sharing access"
ON public.appointments
FOR SELECT
TO authenticated
USING (
  clinic_id IN (
    SELECT branch_id FROM get_user_sharing_group_branches()
  )
  OR public.is_super_admin()
  OR (
    clinic_id = public.get_current_user_clinic_id()
    AND public.get_current_user_role() IN ('clinic_admin', 'dentist', 'staff', 'receptionist')
  )
);

-- Update existing user lookup functions to be more robust
CREATE OR REPLACE FUNCTION public.get_user_clinic_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT clinic_id FROM public.users WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Ensure handle_new_user trigger function is properly set
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
      clinic_id, 
      branch_id,
      created_by,
      is_temp_password
    ) VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 1)),
      COALESCE(NEW.raw_user_meta_data->>'last_name', NULLIF(TRIM(substring(COALESCE(NEW.raw_user_meta_data->>'full_name', '') from position(' ' in COALESCE(NEW.raw_user_meta_data->>'full_name', '')) + 1)), '')),
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      invitation_record.role,
      invitation_record.clinic_id,
      invitation_record.branch_id,
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
      clinic_id,
      branch_id,
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
      (NEW.raw_user_meta_data->>'clinic_id')::uuid,
      (NEW.raw_user_meta_data->>'branch_id')::uuid,
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
        clinic_id,
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
        (NEW.raw_user_meta_data->>'clinic_id')::uuid,
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
$$;