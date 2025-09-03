-- Drop existing triggers and functions with CASCADE
DROP TRIGGER IF EXISTS calculate_enhanced_queue_position_trigger ON appointments;
DROP FUNCTION IF EXISTS calculate_enhanced_queue_position CASCADE;

-- Create enhanced queue position function
CREATE OR REPLACE FUNCTION public.calculate_queue_position_v2()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only calculate position for checked-in appointments
  IF NEW.is_checked_in = true AND (OLD.is_checked_in IS NULL OR OLD.is_checked_in = false) THEN
    -- Set queue join time if not already set
    IF NEW.queue_join_time IS NULL THEN
      NEW.queue_join_time = now();
    END IF;
    
    -- Calculate position based on priority hierarchy: Emergency > Scheduled > Walk-in
    WITH queue_order AS (
      SELECT 
        id,
        ROW_NUMBER() OVER (
          ORDER BY 
            -- Emergency appointments get priority 1, scheduled get 2, walk-in get 3
            CASE appointment_type 
              WHEN 'emergency' THEN 1 
              WHEN 'scheduled' THEN 2 
              WHEN 'walk_in' THEN 3 
              ELSE 4 
            END,
            -- Within same type, VIP > Senior > Normal
            CASE priority 
              WHEN 'vip' THEN 1 
              WHEN 'senior' THEN 2 
              WHEN 'normal' THEN 3 
              ELSE 4 
            END,
            -- Finally by check-in time
            COALESCE(queue_join_time, created_at) ASC
        ) as new_position
      FROM appointments 
      WHERE 
        is_checked_in = true 
        AND status NOT IN ('completed', 'cancelled', 'no-show')
        AND DATE(appointment_date) = DATE(NEW.appointment_date)
        AND (branch_id = NEW.branch_id OR (branch_id IS NULL AND NEW.branch_id IS NULL))
    )
    UPDATE appointments 
    SET queue_position = queue_order.new_position
    FROM queue_order 
    WHERE appointments.id = queue_order.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for queue position calculation
CREATE TRIGGER trigger_calculate_queue_position_v2
  BEFORE INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION calculate_queue_position_v2();

-- Create function to notify patients when their appointment starts
CREATE OR REPLACE FUNCTION public.notify_appointment_ready()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When appointment status changes to 'in-treatment', send notification
  IF NEW.status = 'in-treatment' AND (OLD.status IS NULL OR OLD.status != 'in-treatment') THEN
    -- Insert into patient_notifications table
    INSERT INTO patient_notifications (
      patient_id, 
      appointment_id, 
      title, 
      message, 
      type
    ) VALUES (
      NEW.patient_id,
      NEW.id,
      'Your Turn - Please Proceed',
      'The dentist is ready to see you now. Please proceed to the treatment room.',
      'appointment_ready'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for appointment notifications
DROP TRIGGER IF EXISTS trigger_notify_appointment_ready ON appointments;
CREATE TRIGGER trigger_notify_appointment_ready
  AFTER UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION notify_appointment_ready();