-- Fix security warnings: Update functions to have proper search_path

-- Update existing functions to include proper SET search_path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM public.users WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_clinic_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT clinic_id FROM public.users WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_clinic_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT clinic_id FROM public.users WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Update other functions that might be missing search_path
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

CREATE OR REPLACE FUNCTION public.get_current_user_details()
RETURNS TABLE(user_role text, user_clinic_id uuid)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text, clinic_id 
  FROM public.users 
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role text;
BEGIN
    SELECT role::text INTO user_role 
    FROM public.users 
    WHERE user_id = auth.uid() 
    LIMIT 1;
    
    RETURN COALESCE(user_role, 'patient');
END;
$$;

CREATE OR REPLACE FUNCTION public.get_auth_clinic()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_clinic uuid;
BEGIN
    SELECT clinic_id INTO user_clinic 
    FROM public.users 
    WHERE user_id = auth.uid() 
    LIMIT 1;
    
    RETURN user_clinic;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_clinic_enabled_features(clinic_uuid uuid)
RETURNS TABLE(feature_name text, is_enabled boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    cft.feature_name,
    cft.is_enabled
  FROM public.clinic_feature_toggles cft
  WHERE cft.clinic_id = clinic_uuid
  AND cft.is_enabled = true;
$$;

CREATE OR REPLACE FUNCTION public.get_average_treatment_duration(treatment_name text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  avg_duration INTEGER;
BEGIN
  SELECT ROUND(AVG(a.duration_minutes))::INTEGER
  INTO avg_duration
  FROM public.appointments a
  JOIN public.appointment_treatments at ON a.id = at.appointment_id
  JOIN public.treatments t ON at.treatment_id = t.id
  WHERE t.name ILIKE treatment_name
    AND a.status = 'completed'
    AND a.scheduled_time > NOW() - INTERVAL '3 months';
  
  RETURN COALESCE(avg_duration, 30);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_family_members(patient_id uuid)
RETURNS TABLE(member_id uuid, full_name text, relationship text, date_of_birth date, contact_number text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as member_id,
    p.full_name,
    fm.relationship,
    p.date_of_birth,
    p.contact_number
  FROM public.family_members fm
  JOIN public.patients p ON (
    CASE 
      WHEN fm.primary_patient_id = patient_id THEN p.id = fm.secondary_patient_id
      ELSE p.id = fm.primary_patient_id
    END
  )
  WHERE fm.primary_patient_id = patient_id OR fm.secondary_patient_id = patient_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_patient_document_url(file_path text)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN file_path IS NOT NULL THEN 
      'https://ojytxmiuitrjtrocfgei.supabase.co/storage/v1/object/public/patient-documents/' || file_path
    ELSE NULL
  END;
$$;

CREATE OR REPLACE FUNCTION public.split_full_name()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- If first_name and last_name are null but full_name exists, split it
  IF NEW.first_name IS NULL AND NEW.last_name IS NULL AND NEW.full_name IS NOT NULL THEN
    -- Split by first space, everything before is first name, everything after is last name
    NEW.first_name := TRIM(split_part(NEW.full_name, ' ', 1));
    NEW.last_name := TRIM(substring(NEW.full_name from position(' ' in NEW.full_name) + 1));
    
    -- If no space found, put everything in first_name
    IF NEW.last_name = '' THEN
      NEW.last_name := NULL;
    END IF;
  END IF;
  
  -- If first_name and last_name exist, update full_name
  IF NEW.first_name IS NOT NULL THEN
    NEW.full_name := TRIM(COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, ''));
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_queue_wait_times()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update estimated wait times for all waiting queue items
  WITH queue_with_durations AS (
    SELECT 
      q.id,
      q.position,
      q.priority,
      q.manual_order,
      COALESCE(q.treatment_duration_override, a.duration_minutes, 30) as duration,
      ROW_NUMBER() OVER (
        ORDER BY 
          CASE q.priority 
            WHEN 'emergency' THEN 1 
            WHEN 'scheduled' THEN 2 
            WHEN 'walk_in' THEN 3 
          END,
          COALESCE(q.manual_order, q.position),
          q.created_at
      ) as queue_order
    FROM public.queue q
    JOIN public.appointments a ON q.appointment_id = a.id
    WHERE q.status = 'waiting'
  ),
  cumulative_wait AS (
    SELECT 
      id,
      SUM(duration) OVER (ORDER BY queue_order ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) as wait_minutes
    FROM queue_with_durations
  )
  UPDATE public.queue 
  SET 
    estimated_wait_minutes = COALESCE(cw.wait_minutes, 0),
    predicted_completion_time = NOW() + INTERVAL '1 minute' * COALESCE(cw.wait_minutes, 0) + INTERVAL '1 minute' * COALESCE(qwd.duration, 30)
  FROM cumulative_wait cw
  JOIN queue_with_durations qwd ON cw.id = qwd.id
  WHERE queue.id = cw.id;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_data_sharing_access(target_branch_id uuid, data_type text, data_id uuid DEFAULT NULL::uuid, action_type text DEFAULT 'view'::text)
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

CREATE OR REPLACE FUNCTION public.assign_default_features_to_new_clinic()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.clinic_feature_toggles (clinic_id, feature_name, is_enabled, description)
  VALUES 
    (NEW.id, 'queue_management', true, 'Enable patient queue management system'),
    (NEW.id, 'ai_queueing', false, 'AI-powered queue optimization and predictions'),
    (NEW.id, 'teledentistry', false, 'Remote consultation and tele-dentistry features'),
    (NEW.id, 'billing_integration', true, 'Integrated billing and payment processing'),
    (NEW.id, 'inventory_management', true, 'Track and manage clinic inventory'),
    (NEW.id, 'patient_portal', true, 'Patient self-service portal'),
    (NEW.id, 'appointment_reminders', true, 'Automated appointment reminders'),
    (NEW.id, 'digital_forms', true, 'Electronic signature and digital forms'),
    (NEW.id, 'analytics_reporting', true, 'Advanced analytics and reporting'),
    (NEW.id, 'multi_language', false, 'Multi-language support'),
    (NEW.id, 'family_accounts', true, 'Family account management'),
    (NEW.id, 'insurance_integration', false, 'Insurance claim processing');
  
  RETURN NEW;
END;
$$;