-- First, let's see what policies currently exist and drop them all
DROP POLICY IF EXISTS "Branch admins can view their branch features" ON branch_features;
DROP POLICY IF EXISTS "Super admins can manage all branch features" ON branch_features;
DROP POLICY IF EXISTS "Branch admins can manage their branch features" ON branch_features;

-- Create new policy allowing both admins and super admins to manage features
CREATE POLICY "Admins can manage branch features" 
ON branch_features 
FOR ALL
USING (
  -- Super admins can manage all branches
  (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid() 
    AND profiles.enhanced_role = 'super_admin'::enhanced_user_role
    AND profiles.is_active = true
  ))
  OR
  -- Branch admins can manage their own branch features
  (branch_id IN (
    SELECT profiles.branch_id
    FROM profiles
    WHERE profiles.user_id = auth.uid() 
    AND profiles.enhanced_role = 'admin'::enhanced_user_role
    AND profiles.is_active = true
  ))
)
WITH CHECK (
  -- Super admins can create for all branches
  (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid() 
    AND profiles.enhanced_role = 'super_admin'::enhanced_user_role
    AND profiles.is_active = true
  ))
  OR
  -- Branch admins can create for their own branch
  (branch_id IN (
    SELECT profiles.branch_id
    FROM profiles
    WHERE profiles.user_id = auth.uid() 
    AND profiles.enhanced_role = 'admin'::enhanced_user_role
    AND profiles.is_active = true
  ))
);