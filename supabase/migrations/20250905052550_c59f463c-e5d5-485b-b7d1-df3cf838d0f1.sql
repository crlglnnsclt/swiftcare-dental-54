-- Add n8n integration feature toggle to global feature toggles
INSERT INTO public.feature_toggles (feature_name, is_enabled, description, tooltip_text, reason) 
VALUES (
  'n8n_integration',
  false,
  'Enable n8n workflow automation integration',
  'Allows clinics to use advanced n8n automation workflows for enhanced AI-powered processes',
  'Feature currently in beta testing'
) ON CONFLICT (feature_name) DO UPDATE SET
  description = EXCLUDED.description,
  tooltip_text = EXCLUDED.tooltip_text,
  reason = EXCLUDED.reason;