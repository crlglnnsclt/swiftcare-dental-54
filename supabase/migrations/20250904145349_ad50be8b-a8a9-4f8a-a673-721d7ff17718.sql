-- Update users table to support the new registration flow
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS emergency_contact_name text,
ADD COLUMN IF NOT EXISTS emergency_contact_phone text,
ADD COLUMN IF NOT EXISTS insurance_provider text,
ADD COLUMN IF NOT EXISTS insurance_policy_number text,
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS branch_id uuid REFERENCES clinics(id),
ADD COLUMN IF NOT EXISTS is_email_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_temp_password boolean DEFAULT false;

-- Create a trigger to split full_name into first_name and last_name for existing users
CREATE OR REPLACE FUNCTION split_full_name()
RETURNS TRIGGER AS $$
BEGIN
  -- If first_name and last_name are null but full_name exists, split it
  IF NEW.first_name IS NULL AND NEW.last_name IS NULL AND NEW.full_name IS NOT NULL THEN
    -- Split by first space, everything before is first name, everything after is last name
    NEW.first_name := TRIM(split_part(NEW.full_name, ' ', 1));
    NEW.last_name := TRIM(substring(NEW.full_name from position(' ' in NEW.full_name) + 1));
    
    -- If no space found, put everything in first_name
    IF NEW.last_name = '' THEN
      NEW.last_name := NULL;
    END IF;
  END IF;
  
  -- If first_name and last_name exist, update full_name
  IF NEW.first_name IS NOT NULL THEN
    NEW.full_name := TRIM(COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, ''));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_name_fields
BEFORE INSERT OR UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION split_full_name();

-- Update existing users to split their full names
UPDATE public.users 
SET 
  first_name = TRIM(split_part(full_name, ' ', 1)),
  last_name = NULLIF(TRIM(substring(full_name from position(' ' in full_name) + 1)), '')
WHERE first_name IS NULL AND last_name IS NULL AND full_name IS NOT NULL;

-- Create invitation tokens table for staff invitations
CREATE TABLE IF NOT EXISTS public.user_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role user_role NOT NULL,
  clinic_id uuid REFERENCES public.clinics(id) NOT NULL,
  branch_id uuid REFERENCES public.clinics(id),
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  invitation_token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on user_invitations
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for user_invitations
CREATE POLICY "Admins can manage invitations for their clinic"
ON public.user_invitations
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.user_id = auth.uid() 
    AND u.clinic_id = user_invitations.clinic_id 
    AND u.role = ANY(ARRAY['clinic_admin'::user_role, 'super_admin'::user_role])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.user_id = auth.uid() 
    AND u.clinic_id = user_invitations.clinic_id 
    AND u.role = ANY(ARRAY['clinic_admin'::user_role, 'super_admin'::user_role])
  )
);

CREATE POLICY "Super admins can view all invitations"
ON public.user_invitations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.user_id = auth.uid() 
    AND u.role = 'super_admin'::user_role
  )
);

-- Create a function to handle user profile creation from auth triggers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
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

-- Drop the existing trigger if it exists and create the new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();