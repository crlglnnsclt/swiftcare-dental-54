-- Add missing RLS policies for clinic_feature_toggles table
-- Allow super admins to update and insert feature toggles

CREATE POLICY "Super admins can update clinic feature toggles" 
ON public.clinic_feature_toggles 
FOR UPDATE 
USING (EXISTS ( 
  SELECT 1 
  FROM users 
  WHERE users.user_id = auth.uid() 
  AND users.role = 'super_admin'::user_role
));

CREATE POLICY "Super admins can insert clinic feature toggles" 
ON public.clinic_feature_toggles 
FOR INSERT 
WITH CHECK (EXISTS ( 
  SELECT 1 
  FROM users 
  WHERE users.user_id = auth.uid() 
  AND users.role = 'super_admin'::user_role
));