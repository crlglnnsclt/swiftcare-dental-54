-- Update existing RLS policies to support branch sharing

-- Update patients policy to include sharing group access
DROP POLICY IF EXISTS "Clinic staff can view clinic patients" ON public.patients;
CREATE POLICY "Clinic staff can view patients with sharing access"
ON public.patients
FOR SELECT
USING (
  clinic_id IN (
    SELECT branch_id FROM public.get_user_sharing_group_branches()
  )
  OR EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.user_id = auth.uid() 
    AND u.role = 'super_admin'
  )
);

-- Update appointments policy to include sharing group access
DROP POLICY IF EXISTS "Clinic staff can view clinic appointments" ON public.appointments;
CREATE POLICY "Clinic staff can view appointments with sharing access"
ON public.appointments
FOR SELECT
USING (
  clinic_id IN (
    SELECT branch_id FROM public.get_user_sharing_group_branches()
  )
  OR EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.user_id = auth.uid() 
    AND u.role = 'super_admin'
  )
);

-- Update invoices policy to include sharing group access
DROP POLICY IF EXISTS "Clinic staff can manage invoices" ON public.invoices;
CREATE POLICY "Clinic staff can view invoices with sharing access"
ON public.invoices
FOR SELECT
USING (
  clinic_id IN (
    SELECT branch_id FROM public.get_user_sharing_group_branches()
  )
  OR EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.user_id = auth.uid() 
    AND u.role = 'super_admin'
  )
);

-- Add insert/update/delete policies for invoices (clinic staff can only modify their own clinic data)
CREATE POLICY "Clinic staff can manage their clinic invoices"
ON public.invoices
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.user_id = auth.uid() 
    AND u.clinic_id = invoices.clinic_id 
    AND u.role IN ('clinic_admin', 'dentist', 'staff', 'receptionist')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.user_id = auth.uid() 
    AND u.clinic_id = invoices.clinic_id 
    AND u.role IN ('clinic_admin', 'dentist', 'staff', 'receptionist')
  )
);

-- Update inventory items policy to include sharing group access
DROP POLICY IF EXISTS "Clinic staff can manage inventory items" ON public.inventory_items;
CREATE POLICY "Clinic staff can view inventory with sharing access"
ON public.inventory_items
FOR SELECT
USING (
  clinic_id IN (
    SELECT branch_id FROM public.get_user_sharing_group_branches()
  )
  OR EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.user_id = auth.uid() 
    AND u.role = 'super_admin'
  )
);

-- Add separate policy for managing own clinic inventory
CREATE POLICY "Clinic staff can manage their clinic inventory"
ON public.inventory_items
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.user_id = auth.uid() 
    AND u.clinic_id = inventory_items.clinic_id 
    AND u.role IN ('clinic_admin', 'dentist', 'staff', 'receptionist')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.user_id = auth.uid() 
    AND u.clinic_id = inventory_items.clinic_id 
    AND u.role IN ('clinic_admin', 'dentist', 'staff', 'receptionist')
  )
);

-- Create function to log data sharing access
CREATE OR REPLACE FUNCTION public.log_data_sharing_access(
  target_branch_id uuid,
  data_type text,
  data_id uuid DEFAULT NULL,
  action_type text DEFAULT 'view'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_clinic_id uuid;
  sharing_group_id uuid;
BEGIN
  -- Get user's clinic ID
  SELECT clinic_id INTO user_clinic_id 
  FROM public.users 
  WHERE user_id = auth.uid() 
  LIMIT 1;
  
  -- Only log if accessing different clinic's data
  IF user_clinic_id != target_branch_id THEN
    -- Get sharing group ID if applicable
    SELECT bg.id INTO sharing_group_id
    FROM public.branch_sharing_groups bg
    JOIN public.branch_group_members bgm1 ON bg.id = bgm1.group_id AND bgm1.branch_id = user_clinic_id
    JOIN public.branch_group_members bgm2 ON bg.id = bgm2.group_id AND bgm2.branch_id = target_branch_id
    LIMIT 1;
    
    -- Insert audit log
    INSERT INTO public.data_sharing_audit (
      user_id,
      source_branch_id,
      target_branch_id,
      data_type,
      data_id,
      action_type,
      sharing_group_id
    ) VALUES (
      auth.uid(),
      user_clinic_id,
      target_branch_id,
      data_type,
      data_id,
      action_type,
      sharing_group_id
    );
  END IF;
END;
$$;