-- Update RLS policies for branch_features to allow branch admins to manage features
DROP POLICY IF EXISTS "Branch admins can view their branch features" ON branch_features;
DROP POLICY IF EXISTS "Super admins can manage all branch features" ON branch_features;

-- Allow branch admins to manage features in their own branch
CREATE POLICY "Branch admins can manage their branch features" 
ON branch_features 
FOR ALL
USING (
  branch_id IN (
    SELECT profiles.branch_id
    FROM profiles
    WHERE profiles.user_id = auth.uid() 
    AND profiles.enhanced_role = ANY(ARRAY['admin'::enhanced_user_role, 'super_admin'::enhanced_user_role])
    AND profiles.is_active = true
  )
)
WITH CHECK (
  branch_id IN (
    SELECT profiles.branch_id
    FROM profiles
    WHERE profiles.user_id = auth.uid() 
    AND profiles.enhanced_role = ANY(ARRAY['admin'::enhanced_user_role, 'super_admin'::enhanced_user_role])
    AND profiles.is_active = true
  )
);

-- Allow super admins to manage all branch features
CREATE POLICY "Super admins can manage all branch features" 
ON branch_features 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid() 
    AND profiles.enhanced_role = 'super_admin'::enhanced_user_role
    AND profiles.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid() 
    AND profiles.enhanced_role = 'super_admin'::enhanced_user_role
    AND profiles.is_active = true
  )
);