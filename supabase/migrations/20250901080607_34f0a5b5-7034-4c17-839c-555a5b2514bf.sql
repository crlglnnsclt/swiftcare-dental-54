-- Fix critical security issue: Add RLS policies to dental_chart_audit table
-- This table contains sensitive audit information about dental chart changes

-- First, ensure RLS is enabled (it should be already)
ALTER TABLE public.dental_chart_audit ENABLE ROW LEVEL SECURITY;

-- Policy 1: Only authorized staff can view audit logs in their branch
CREATE POLICY "Authorized staff can view audit logs in their branch"
ON public.dental_chart_audit
FOR SELECT
USING (
  -- Only allow dentists, staff, admins, and super_admins
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
    AND p.enhanced_role IN ('dentist', 'staff', 'admin', 'super_admin')
    AND p.is_active = true
    AND (
      -- Super admins can see all branches
      p.enhanced_role = 'super_admin'
      OR
      -- Others can only see their own branch
      p.branch_id = dental_chart_audit.branch_id
    )
  )
);

-- Policy 2: Only the system can insert audit records (via triggers)
-- Staff cannot manually insert audit records
CREATE POLICY "System only can insert audit records"
ON public.dental_chart_audit
FOR INSERT
WITH CHECK (false); -- No one can manually insert audit records

-- Policy 3: Audit records cannot be updated (they are immutable for integrity)
CREATE POLICY "Audit records are immutable"
ON public.dental_chart_audit
FOR UPDATE
USING (false); -- No updates allowed

-- Policy 4: Only super admins can delete audit records (for compliance/retention)
CREATE POLICY "Only super admins can delete audit records"
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

-- Update the audit trigger to be SECURITY DEFINER so it can bypass RLS
CREATE OR REPLACE FUNCTION public.audit_dental_chart_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the trigger to bypass RLS for inserts
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.dental_chart_audit (
      chart_id, 
      action, 
      new_values, 
      performed_by, 
      branch_id
    )
    VALUES (
      NEW.id, 
      'created', 
      to_jsonb(NEW), 
      NEW.created_by, 
      NEW.branch_id
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.dental_chart_audit (
      chart_id, 
      action, 
      old_values, 
      new_values, 
      performed_by, 
      branch_id
    )
    VALUES (
      NEW.id, 
      'updated', 
      to_jsonb(OLD), 
      to_jsonb(NEW), 
      NEW.created_by, 
      NEW.branch_id
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.dental_chart_audit (
      chart_id, 
      action, 
      old_values, 
      performed_by, 
      branch_id
    )
    VALUES (
      OLD.id, 
      'deleted', 
      to_jsonb(OLD), 
      (SELECT id FROM public.profiles WHERE user_id = auth.uid()), 
      OLD.branch_id
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Ensure the trigger exists on dental_charts table
DROP TRIGGER IF EXISTS audit_dental_chart_changes_trigger ON public.dental_charts;
CREATE TRIGGER audit_dental_chart_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.dental_charts
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_dental_chart_changes();