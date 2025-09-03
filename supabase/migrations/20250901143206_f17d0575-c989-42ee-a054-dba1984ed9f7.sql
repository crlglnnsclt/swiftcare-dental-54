-- Delete all dependent records for non-super-admin users in correct order

-- Delete inventory transactions
DELETE FROM inventory_transactions WHERE performed_by IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
);

-- Delete analytics reports
DELETE FROM analytics_reports WHERE generated_by IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
);

-- Delete dental chart audit records
DELETE FROM dental_chart_audit WHERE performed_by IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
);

-- Delete chat messages
DELETE FROM chat_messages 
WHERE sender_id IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
) 
OR recipient_id IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
)
OR patient_id IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
);

-- Delete patient notifications
DELETE FROM patient_notifications WHERE patient_id IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
);

-- Delete patient form responses
DELETE FROM patient_form_responses WHERE patient_id IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
);

-- Delete patient details
DELETE FROM patient_details WHERE patient_id IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
);

-- Delete patient results
DELETE FROM patient_results WHERE patient_id IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
) OR created_by IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
);

-- Delete payment proofs
DELETE FROM payment_proofs WHERE patient_id IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
) OR verified_by IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
);

-- Delete payments
DELETE FROM payments WHERE patient_id IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
) OR verified_by IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
);

-- Delete medical documents
DELETE FROM medical_documents WHERE patient_id IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
) OR uploaded_by IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
);

-- Delete dental charts
DELETE FROM dental_charts WHERE patient_id IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
) OR dentist_id IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
) OR created_by IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
);

-- Delete appointments
DELETE FROM appointments WHERE patient_id IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
) OR dentist_id IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
) OR cancelled_by IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
);

-- Delete telemedicine sessions
DELETE FROM telemedicine_sessions WHERE patient_id IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
) OR dentist_id IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
);

-- Delete timesheets
DELETE FROM timesheets WHERE staff_id IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
) OR approved_by IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
);

-- Delete payroll records
DELETE FROM payroll_records WHERE staff_id IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
) OR approved_by IN (
  SELECT p.id FROM profiles p WHERE p.enhanced_role != 'super_admin'
);

-- Finally delete non-super-admin profiles
DELETE FROM profiles WHERE enhanced_role != 'super_admin';