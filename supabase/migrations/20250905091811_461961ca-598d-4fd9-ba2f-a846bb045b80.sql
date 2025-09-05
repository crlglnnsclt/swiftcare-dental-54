-- First, check the queue table structure and add missing columns
DO $$
BEGIN
    -- Add missing columns to queue table if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'queue' AND column_name = 'estimated_wait_time') THEN
        ALTER TABLE queue ADD COLUMN estimated_wait_time INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'queue' AND column_name = 'estimated_wait_minutes') THEN
        ALTER TABLE queue ADD COLUMN estimated_wait_minutes INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'queue' AND column_name = 'predicted_completion_time') THEN
        ALTER TABLE queue ADD COLUMN predicted_completion_time TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'queue' AND column_name = 'treatment_duration_override') THEN
        ALTER TABLE queue ADD COLUMN treatment_duration_override INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'queue' AND column_name = 'priority') THEN
        ALTER TABLE queue ADD COLUMN priority TEXT DEFAULT 'scheduled';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'queue' AND column_name = 'manual_order') THEN
        ALTER TABLE queue ADD COLUMN manual_order INTEGER;
    END IF;
END $$;