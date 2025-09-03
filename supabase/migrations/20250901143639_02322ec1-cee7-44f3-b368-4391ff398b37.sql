-- Create super admin user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'escletoglenn24@gmail.com',
  crypt('P@nc@k3$', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"super_admin","full_name":"Super Admin"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Get the main clinic branch ID for assignment
DO $$
DECLARE
    new_user_id uuid;
    main_branch_id uuid;
BEGIN
    -- Get the newly created user ID
    SELECT id INTO new_user_id 
    FROM auth.users 
    WHERE email = 'escletoglenn24@gmail.com'
    LIMIT 1;
    
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
    
    -- Create profile for super admin
    INSERT INTO public.profiles (
        user_id, 
        email, 
        full_name, 
        role, 
        enhanced_role,
        branch_id
    )
    VALUES (
        new_user_id,
        'escletoglenn24@gmail.com',
        'Super Admin',
        'admin'::user_role,
        'super_admin'::enhanced_user_role,
        main_branch_id
    );
END $$;