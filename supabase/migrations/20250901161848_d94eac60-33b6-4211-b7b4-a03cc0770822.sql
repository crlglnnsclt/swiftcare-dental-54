-- Assign all users to Main Clinic as default branch
UPDATE public.profiles 
SET branch_id = (
  SELECT id 
  FROM public.branches 
  WHERE name = 'Main Clinic' 
  ORDER BY created_at ASC 
  LIMIT 1
)
WHERE branch_id IS NULL OR branch_id != (
  SELECT id 
  FROM public.branches 
  WHERE name = 'Main Clinic' 
  ORDER BY created_at ASC 
  LIMIT 1
);