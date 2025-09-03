-- Create main clinic branch if it doesn't exist
INSERT INTO branches (name, address, phone, email, is_active)
VALUES (
  'Main Clinic',
  '123 Medical Avenue, Healthcare District',
  '+1 (555) 123-4567', 
  'info@swiftcare.com',
  true
) ON CONFLICT DO NOTHING;

-- Get or set the main clinic branch ID for reference
DO $$
DECLARE
    main_branch_id uuid;
BEGIN
    -- Get the main clinic branch ID
    SELECT id INTO main_branch_id 
    FROM branches 
    WHERE name = 'Main Clinic' 
    LIMIT 1;
    
    -- If no main clinic exists, get the first active branch
    IF main_branch_id IS NULL THEN
        SELECT id INTO main_branch_id 
        FROM branches 
        WHERE is_active = true 
        ORDER BY created_at ASC 
        LIMIT 1;
    END IF;
    
    -- Update all users without a branch to use main clinic
    UPDATE profiles 
    SET branch_id = main_branch_id,
        updated_at = now()
    WHERE branch_id IS NULL 
    AND main_branch_id IS NOT NULL;
END $$;

-- Update the handle_new_user function to automatically assign main clinic
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    main_branch_id uuid;
BEGIN
    -- Get the main clinic branch ID
    SELECT id INTO main_branch_id 
    FROM branches 
    WHERE name = 'Main Clinic' 
    ORDER BY created_at ASC 
    LIMIT 1;
    
    -- If no main clinic, use first active branch
    IF main_branch_id IS NULL THEN
        SELECT id INTO main_branch_id 
        FROM branches 
        WHERE is_active = true 
        ORDER BY created_at ASC 
        LIMIT 1;
    END IF;
    
    -- Insert into profiles with proper role handling and default branch
    INSERT INTO public.profiles (
        user_id, 
        email, 
        full_name, 
        role, 
        enhanced_role,
        branch_id
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        CASE 
            WHEN NEW.raw_user_meta_data->>'role' IN ('patient', 'dentist', 'staff', 'admin') 
            THEN (NEW.raw_user_meta_data->>'role')::user_role
            ELSE 'patient'::user_role
        END,
        CASE 
            WHEN NEW.raw_user_meta_data->>'role' IN ('patient', 'dentist', 'staff', 'admin', 'super_admin') 
            THEN (NEW.raw_user_meta_data->>'role')::enhanced_user_role
            ELSE 'patient'::enhanced_user_role
        END,
        main_branch_id  -- Automatically assign to main clinic
    );
    RETURN NEW;
END;
$$;