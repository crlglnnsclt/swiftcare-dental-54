-- Drop the potentially problematic users policy that might cause recursion
DROP POLICY IF EXISTS "Super admins can view all users" ON public.users;

-- Create a new policy using the existing security definer function
CREATE POLICY "Super admins can view all users" 
ON public.users 
FOR SELECT 
TO authenticated
USING (public.get_current_user_role() = 'super_admin');