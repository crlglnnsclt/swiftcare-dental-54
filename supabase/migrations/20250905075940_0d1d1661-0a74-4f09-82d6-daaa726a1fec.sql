-- Re-enable all features for testing
UPDATE feature_toggles SET is_enabled = true WHERE feature_name IN ('billing_system', 'dental_charts', 'inventory_management');