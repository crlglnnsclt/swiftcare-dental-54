-- Update the existing profile to super admin
UPDATE public.profiles 
SET 
  enhanced_role = 'super_admin'::enhanced_user_role,
  role = 'admin'::user_role,
  full_name = 'Super Admin'
WHERE email = 'escletoglenn24@gmail.com';