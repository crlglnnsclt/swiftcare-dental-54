-- Just re-enable all features for testing
UPDATE feature_toggles SET is_enabled = true WHERE feature_name IN ('billing_system', 'dental_charts', 'appointment_booking', 'patient_portal');