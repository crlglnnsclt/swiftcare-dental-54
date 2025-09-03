-- Clean up any remaining auth.users that don't have profiles
DELETE FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM profiles WHERE enhanced_role = 'super_admin');