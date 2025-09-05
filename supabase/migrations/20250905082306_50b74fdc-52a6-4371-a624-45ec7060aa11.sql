-- Enable n8n Integration feature
UPDATE feature_toggles SET is_enabled = true WHERE feature_name = 'n8n_integration';