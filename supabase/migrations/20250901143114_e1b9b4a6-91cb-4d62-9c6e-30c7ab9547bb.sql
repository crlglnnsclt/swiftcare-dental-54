-- Delete all chat messages for non-super-admin users first
DELETE FROM chat_messages 
WHERE sender_id IN (
  SELECT p.id FROM profiles p 
  WHERE p.enhanced_role != 'super_admin'
) 
OR recipient_id IN (
  SELECT p.id FROM profiles p 
  WHERE p.enhanced_role != 'super_admin'
)
OR patient_id IN (
  SELECT p.id FROM profiles p 
  WHERE p.enhanced_role != 'super_admin'
);

-- Delete all other dependent records for non-super-admin users
DELETE FROM patient_notifications WHERE patient_id IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
);

DELETE FROM patient_form_responses WHERE patient_id IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
);

DELETE FROM patient_details WHERE patient_id IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
);

DELETE FROM patient_results WHERE patient_id IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
);

DELETE FROM payment_proofs WHERE patient_id IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
);

DELETE FROM medical_documents WHERE patient_id IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
);

DELETE FROM dental_charts WHERE patient_id IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
);

DELETE FROM appointments WHERE patient_id IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
) OR dentist_id IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
);

DELETE FROM telemedicine_sessions WHERE patient_id IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
) OR dentist_id IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
);

DELETE FROM timesheets WHERE staff_id IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
);

DELETE FROM payroll_records WHERE staff_id IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
);

-- Delete non-super-admin profiles
DELETE FROM profiles WHERE enhanced_role != 'super_admin';

-- Delete non-super-admin auth users 
DELETE FROM auth.users 
WHERE id NOT IN (
  SELECT user_id FROM profiles WHERE enhanced_role = 'super_admin'
);