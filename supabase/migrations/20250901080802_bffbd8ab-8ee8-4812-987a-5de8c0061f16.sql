-- Update the audit trigger to be SECURITY DEFINER so it can bypass RLS for system inserts
CREATE OR REPLACE FUNCTION public.audit_dental_chart_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the trigger to bypass RLS for legitimate system inserts
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