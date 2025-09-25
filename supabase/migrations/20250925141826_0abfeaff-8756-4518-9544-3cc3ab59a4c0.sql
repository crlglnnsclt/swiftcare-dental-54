-- Add missing columns to the queue table to match the application expectations

ALTER TABLE public.queue 
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS queue_type TEXT DEFAULT 'appointment',
ADD COLUMN IF NOT EXISTS patient_id UUID,
ADD COLUMN IF NOT EXISTS assigned_dentist_id UUID,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update the queue_type column for existing records
UPDATE public.queue SET queue_type = 'appointment' WHERE queue_type IS NULL;

-- Add foreign key constraints
ALTER TABLE public.queue 
ADD CONSTRAINT fk_queue_patient_id FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_queue_assigned_dentist FOREIGN KEY (assigned_dentist_id) REFERENCES users(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_queue_checked_in_at ON public.queue(checked_in_at);
CREATE INDEX IF NOT EXISTS idx_queue_patient_id ON public.queue(patient_id);
CREATE INDEX IF NOT EXISTS idx_queue_status_priority ON public.queue(status, priority);