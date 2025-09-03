-- Fix critical security issue: Add proper RLS policies to dental_chart_audit table
-- First drop any existing policies to ensure clean state

DROP POLICY IF EXISTS "Authorized staff can view audit logs in their branch" ON public.dental_chart_audit;
DROP POLICY IF EXISTS "System only can insert audit records" ON public.dental_chart_audit;
DROP POLICY IF EXISTS "Audit records are immutable" ON public.dental_chart_audit;
DROP POLICY IF EXISTS "Only super admins can delete audit records" ON public.dental_chart_audit;

-- Ensure RLS is enabled
ALTER TABLE public.dental_chart_audit ENABLE ROW LEVEL SECURITY;

-- Policy 1: Only authorized staff can view audit logs in their branch
CREATE POLICY "Staff view audit logs in branch"
ON public.dental_chart_audit
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
    AND p.enhanced_role IN ('dentist', 'staff', 'admin', 'super_admin')
    AND p.is_active = true
    AND (
      p.enhanced_role = 'super_admin'
      OR p.branch_id = dental_chart_audit.branch_id
    )
  )
);

-- Policy 2: Only system triggers can insert audit records
CREATE POLICY "System insert audit only"
ON public.dental_chart_audit
FOR INSERT
WITH CHECK (false);

-- Policy 3: Audit records are immutable (cannot be updated)
CREATE POLICY "Audit immutable"
ON public.dental_chart_audit
FOR UPDATE
USING (false);

-- Policy 4: Only super admins can delete audit records
CREATE POLICY "Super admin delete audit"
ON public.dental_chart_audit
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
    AND p.enhanced_role = 'super_admin'
    AND p.is_active = true
  )
);