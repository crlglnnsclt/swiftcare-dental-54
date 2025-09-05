-- Temporarily disable some features to test sidebar filtering
UPDATE feature_toggles SET is_enabled = false WHERE feature_name IN ('billing_system', 'dental_charts', 'inventory_management');