-- Create teeth_conditions table
CREATE TABLE public.teeth_conditions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  tooth_number integer NOT NULL,
  condition text NOT NULL,
  notes text,
  treatment text,
  date timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create treatment_plans table  
CREATE TABLE public.treatment_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name text NOT NULL,
  procedure text NOT NULL,
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  scheduled_date timestamp with time zone,
  estimated_cost numeric DEFAULT 0,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create progress_notes table
CREATE TABLE public.progress_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  date timestamp with time zone NOT NULL DEFAULT now(),
  note text NOT NULL,
  written_by text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.teeth_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for teeth_conditions
CREATE POLICY "Staff can manage teeth conditions" 
ON public.teeth_conditions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE users.user_id = auth.uid() 
  AND users.role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
));

CREATE POLICY "Patients can view own teeth conditions" 
ON public.teeth_conditions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM patients p 
  JOIN users u ON p.user_id = u.id 
  WHERE u.user_id = auth.uid() 
  AND p.id = teeth_conditions.patient_id
));

-- Create RLS policies for treatment_plans
CREATE POLICY "Staff can manage treatment plans" 
ON public.treatment_plans 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE users.user_id = auth.uid() 
  AND users.role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
));

CREATE POLICY "Patients can view own treatment plans" 
ON public.treatment_plans 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM patients p 
  JOIN users u ON p.user_id = u.id 
  WHERE u.user_id = auth.uid() 
  AND p.id = treatment_plans.patient_id
));

-- Create RLS policies for progress_notes
CREATE POLICY "Staff can manage progress notes" 
ON public.progress_notes 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE users.user_id = auth.uid() 
  AND users.role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
));

CREATE POLICY "Patients can view own progress notes" 
ON public.progress_notes 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM patients p 
  JOIN users u ON p.user_id = u.id 
  WHERE u.user_id = auth.uid() 
  AND p.id = progress_notes.patient_id
));

-- Create triggers for updated_at columns
CREATE TRIGGER update_teeth_conditions_updated_at
  BEFORE UPDATE ON public.teeth_conditions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_treatment_plans_updated_at
  BEFORE UPDATE ON public.treatment_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_progress_notes_updated_at
  BEFORE UPDATE ON public.progress_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();