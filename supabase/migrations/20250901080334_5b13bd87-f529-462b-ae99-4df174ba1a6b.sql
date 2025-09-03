-- Fix the handle_new_user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles with proper role handling
  INSERT INTO public.profiles (
    user_id, 
    email, 
    full_name, 
    role, 
    enhanced_role
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' IN ('patient', 'dentist', 'staff', 'admin') 
      THEN (NEW.raw_user_meta_data->>'role')::user_role
      ELSE 'patient'::user_role
    END,
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' IN ('patient', 'dentist', 'staff', 'admin', 'super_admin') 
      THEN (NEW.raw_user_meta_data->>'role')::enhanced_user_role
      ELSE 'patient'::enhanced_user_role
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;