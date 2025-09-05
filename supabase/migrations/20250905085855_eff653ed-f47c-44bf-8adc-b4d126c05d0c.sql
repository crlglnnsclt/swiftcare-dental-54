-- Create missing tables and fix RLS policies step by step

-- 1. Create queue table with proper structure (no patient_id constraint initially)
CREATE TABLE IF NOT EXISTS public.queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id),
  position INTEGER,
  priority TEXT DEFAULT 'scheduled',
  status TEXT DEFAULT 'waiting',
  estimated_wait_minutes INTEGER DEFAULT 0,
  treatment_duration_override INTEGER,
  manual_order INTEGER,
  predicted_completion_time TIMESTAMPTZ,
  checked_in_at TIMESTAMPTZ DEFAULT now(),
  called_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on queue table
ALTER TABLE public.queue ENABLE ROW LEVEL SECURITY;

-- 2. Create treatments table
CREATE TABLE IF NOT EXISTS public.treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  default_price DECIMAL(10,2) DEFAULT 0,
  default_duration_minutes INTEGER DEFAULT 30,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on treatments table
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;