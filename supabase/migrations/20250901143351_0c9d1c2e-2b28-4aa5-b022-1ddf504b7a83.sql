-- Fix function search_path security issues

-- Update existing functions to have proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_payment_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- If payment proof is approved, make related patient results visible
  IF NEW.verification_status = 'approved' AND (OLD IS NULL OR OLD.verification_status != 'approved') THEN
    -- Update patient results to be visible when payment is approved
    UPDATE public.patient_results 
    SET is_visible_to_patient = true,
        updated_at = now()
    WHERE patient_id = NEW.patient_id 
      AND (appointment_id = NEW.appointment_id OR appointment_id IS NULL)
      AND requires_payment = true
      AND is_visible_to_patient = false;
      
    -- Create a notification for the patient (only if patient_id exists)
    IF NEW.patient_id IS NOT NULL THEN
      INSERT INTO public.notifications (
        title,
        message,
        type,
        recipient_role,
        related_id
      ) VALUES (
        'Payment Approved',
        'Your payment has been approved. Your results are now available.',
        'payment',
        'patient',
        NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_appointment_start()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- If appointment status changes to 'in-treatment', notify the patient
  IF NEW.status = 'in-treatment' AND (OLD IS NULL OR OLD.status != 'in-treatment') THEN
    -- Create a notification for the patient
    INSERT INTO public.notifications (
      title,
      message,
      type,
      recipient_role,
      related_id
    ) VALUES (
      'Appointment Started',
      'Your appointment has started. Please proceed to the treatment room.',
      'appointment',
      'patient',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$function$;