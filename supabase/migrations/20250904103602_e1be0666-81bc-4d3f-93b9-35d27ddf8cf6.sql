-- Fix RLS policies for clinic staff to manage feature toggles
CREATE POLICY "Clinic staff can manage feature toggles"
ON public.clinic_feature_toggles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.user_id = auth.uid()
    AND u.clinic_id = clinic_feature_toggles.clinic_id
    AND u.role IN ('clinic_admin', 'dentist', 'staff', 'receptionist')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.user_id = auth.uid()
    AND u.clinic_id = clinic_feature_toggles.clinic_id
    AND u.role IN ('clinic_admin', 'dentist', 'staff', 'receptionist')
  )
);

-- Create appointments table if not exists with proper structure
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  dentist_id UUID,
  clinic_id UUID NOT NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status TEXT DEFAULT 'booked',
  notes TEXT,
  booking_type TEXT DEFAULT 'online',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  actual_start_time TIMESTAMP WITH TIME ZONE,
  actual_end_time TIMESTAMP WITH TIME ZONE,
  is_group_booking BOOLEAN DEFAULT false,
  group_id UUID,
  family_group_name TEXT,
  qr_code TEXT
);

-- Enable RLS on appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create patients table if not exists
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  clinic_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  contact_number TEXT,
  date_of_birth DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on patients
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Create appointment policies if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'appointments' 
    AND policyname = 'Clinic staff can manage appointments'
  ) THEN
    CREATE POLICY "Clinic staff can manage appointments"
    ON public.appointments
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.user_id = auth.uid()
        AND u.clinic_id = appointments.clinic_id
        AND u.role IN ('clinic_admin', 'dentist', 'staff', 'receptionist')
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.user_id = auth.uid()
        AND u.clinic_id = appointments.clinic_id
        AND u.role IN ('clinic_admin', 'dentist', 'staff', 'receptionist')
      )
    );
  END IF;
END
$$;

-- Create patient policies if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'patients' 
    AND policyname = 'Clinic staff can manage patients'
  ) THEN
    CREATE POLICY "Clinic staff can manage patients"
    ON public.patients
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.user_id = auth.uid()
        AND u.clinic_id = patients.clinic_id
        AND u.role IN ('clinic_admin', 'dentist', 'staff', 'receptionist')
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.user_id = auth.uid()
        AND u.clinic_id = patients.clinic_id
        AND u.role IN ('clinic_admin', 'dentist', 'staff', 'receptionist')
      )
    );
  END IF;
END
$$;