-- Update some appointments to show in queue monitor
UPDATE appointments 
SET status = 'checked_in' 
WHERE id IN (
  SELECT id FROM appointments 
  WHERE scheduled_time >= CURRENT_DATE 
  AND scheduled_time < CURRENT_DATE + INTERVAL '1 day'
  AND status = 'booked'
  ORDER BY scheduled_time 
  LIMIT 3
);

-- Update one appointment to in_progress
UPDATE appointments 
SET status = 'in_progress' 
WHERE id = (
  SELECT id FROM appointments 
  WHERE status = 'checked_in'
  ORDER BY scheduled_time 
  LIMIT 1
);