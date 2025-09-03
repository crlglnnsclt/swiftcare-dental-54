-- Add super admin access policies for appointments
CREATE POLICY "Super admins can view all appointments" 
ON public.appointments 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE users.user_id = auth.uid() 
  AND users.role = 'super_admin'
));

-- Add super admin access policies for payments
CREATE POLICY "Super admins can view all payments" 
ON public.payments 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE users.user_id = auth.uid() 
  AND users.role = 'super_admin'
));

-- Add super admin access policies for patients
CREATE POLICY "Super admins can view all patients" 
ON public.patients 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE users.user_id = auth.uid() 
  AND users.role = 'super_admin'
));

-- Add super admin access policies for users table
CREATE POLICY "Super admins can view all users" 
ON public.users 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.users u2
  WHERE u2.user_id = auth.uid() 
  AND u2.role = 'super_admin'
));

-- Add super admin access policies for queue
CREATE POLICY "Super admins can view all queue" 
ON public.queue 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE users.user_id = auth.uid() 
  AND users.role = 'super_admin'
));