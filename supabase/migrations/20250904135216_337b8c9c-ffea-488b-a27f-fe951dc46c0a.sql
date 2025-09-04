-- Create branch sharing groups table
CREATE TABLE public.branch_sharing_groups (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    main_clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    group_name text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

-- Create branch group members table
CREATE TABLE public.branch_group_members (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    branch_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    group_id uuid NOT NULL REFERENCES public.branch_sharing_groups(id) ON DELETE CASCADE,
    joined_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(branch_id, group_id)
);

-- Create data sharing audit log
CREATE TABLE public.data_sharing_audit (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    source_branch_id uuid NOT NULL REFERENCES public.clinics(id),
    target_branch_id uuid NOT NULL REFERENCES public.clinics(id),
    data_type text NOT NULL, -- 'patient', 'appointment', 'invoice', etc.
    data_id uuid,
    action_type text NOT NULL, -- 'view', 'create', 'update', 'delete'
    sharing_group_id uuid REFERENCES public.branch_sharing_groups(id),
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add sharing group reference to clinics table
ALTER TABLE public.clinics 
ADD COLUMN sharing_enabled boolean DEFAULT false,
ADD COLUMN default_sharing_group_id uuid REFERENCES public.branch_sharing_groups(id);

-- Enable RLS on new tables
ALTER TABLE public.branch_sharing_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branch_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_sharing_audit ENABLE ROW LEVEL SECURITY;

-- RLS policies for branch_sharing_groups
CREATE POLICY "Clinic admins can manage their sharing groups"
ON public.branch_sharing_groups
FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.user_id = auth.uid() 
    AND u.clinic_id = branch_sharing_groups.main_clinic_id 
    AND u.role = 'clinic_admin'
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.user_id = auth.uid() 
    AND u.clinic_id = branch_sharing_groups.main_clinic_id 
    AND u.role = 'clinic_admin'
));

CREATE POLICY "Super admins can view all sharing groups"
ON public.branch_sharing_groups
FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.user_id = auth.uid() 
    AND u.role = 'super_admin'
));

-- RLS policies for branch_group_members
CREATE POLICY "Clinic admins can manage group members"
ON public.branch_group_members
FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.users u 
    JOIN public.branch_sharing_groups bsg ON bsg.main_clinic_id = u.clinic_id
    WHERE u.user_id = auth.uid() 
    AND bsg.id = branch_group_members.group_id 
    AND u.role = 'clinic_admin'
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.users u 
    JOIN public.branch_sharing_groups bsg ON bsg.main_clinic_id = u.clinic_id
    WHERE u.user_id = auth.uid() 
    AND bsg.id = branch_group_members.group_id 
    AND u.role = 'clinic_admin'
));

CREATE POLICY "Users can view their sharing group memberships"
ON public.branch_group_members
FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.user_id = auth.uid() 
    AND u.clinic_id = branch_group_members.branch_id
));

-- RLS policies for data_sharing_audit
CREATE POLICY "Clinic admins can view audit logs for their clinics"
ON public.data_sharing_audit
FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.user_id = auth.uid() 
    AND (u.clinic_id = data_sharing_audit.source_branch_id OR u.clinic_id = data_sharing_audit.target_branch_id)
    AND u.role IN ('clinic_admin', 'super_admin')
));

CREATE POLICY "System can insert audit logs"
ON public.data_sharing_audit
FOR INSERT
WITH CHECK (true);

-- Create function to get user's sharing group branches
CREATE OR REPLACE FUNCTION public.get_user_sharing_group_branches()
RETURNS TABLE(branch_id uuid)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH user_clinic AS (
    SELECT clinic_id FROM public.users WHERE user_id = auth.uid() LIMIT 1
  ),
  user_sharing_groups AS (
    SELECT bgm.group_id 
    FROM public.branch_group_members bgm
    JOIN user_clinic uc ON bgm.branch_id = uc.clinic_id
    WHERE EXISTS (
      SELECT 1 FROM public.clinics c 
      WHERE c.id = uc.clinic_id 
      AND c.sharing_enabled = true
    )
  )
  SELECT bgm.branch_id
  FROM public.branch_group_members bgm
  JOIN user_sharing_groups usg ON bgm.group_id = usg.group_id
  
  UNION
  
  SELECT clinic_id FROM user_clinic;
$$;

-- Create function to check if user can access branch data
CREATE OR REPLACE FUNCTION public.can_access_branch_data(target_branch_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.get_user_sharing_group_branches() 
    WHERE branch_id = target_branch_id
  )
  OR EXISTS (
    SELECT 1 FROM public.users 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  );
$$;

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_branch_sharing_groups_updated_at
BEFORE UPDATE ON public.branch_sharing_groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_branch_group_members_branch_id ON public.branch_group_members(branch_id);
CREATE INDEX idx_branch_group_members_group_id ON public.branch_group_members(group_id);
CREATE INDEX idx_data_sharing_audit_user_id ON public.data_sharing_audit(user_id);
CREATE INDEX idx_data_sharing_audit_source_branch ON public.data_sharing_audit(source_branch_id);
CREATE INDEX idx_data_sharing_audit_created_at ON public.data_sharing_audit(created_at);