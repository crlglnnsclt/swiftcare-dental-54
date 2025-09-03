-- Create the super admin user properly using Supabase auth functions
-- First, let's create the user using the admin API approach

-- Create a function to properly create the admin user
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_user_id uuid;
    main_branch_id uuid;
BEGIN
    -- Get the main branch ID
    SELECT id INTO main_branch_id 
    FROM branches 
    WHERE is_active = true 
    ORDER BY created_at ASC 
    LIMIT 1;
    
    -- Generate a new UUID for the user
    new_user_id := gen_random_uuid();
    
    -- Insert into auth.users table directly (this is allowed in migration context)
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        new_user_id,
        'authenticated',
        'authenticated', 
        'escletoglenn24@gmail.com',
        crypt('P@nc@k3$', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"full_name": "Super Admin", "role": "super_admin"}',
        false,
        '',
        '',
        '',
        ''
    );
    
    -- Insert the profile
    INSERT INTO public.profiles (
        user_id,
        email,
        full_name,
        role,
        enhanced_role,
        branch_id
    ) VALUES (
        new_user_id,
        'escletoglenn24@gmail.com',
        'Super Admin',
        'admin'::user_role,
        'super_admin'::enhanced_user_role,
        main_branch_id
    );
    
    RAISE NOTICE 'Super admin user created successfully with ID: %', new_user_id;
END;
$$;

-- Execute the function
SELECT create_admin_user();

-- Drop the function after use
DROP FUNCTION create_admin_user();