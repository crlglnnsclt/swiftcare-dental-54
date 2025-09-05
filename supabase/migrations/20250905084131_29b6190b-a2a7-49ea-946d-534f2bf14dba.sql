-- Enable real-time functionality for critical tables
ALTER TABLE appointments REPLICA IDENTITY FULL;
ALTER TABLE patients REPLICA IDENTITY FULL;
ALTER TABLE form_responses REPLICA IDENTITY FULL;
ALTER TABLE patient_documents REPLICA IDENTITY FULL;
ALTER TABLE communication_logs REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE patients;
ALTER PUBLICATION supabase_realtime ADD TABLE form_responses;
ALTER PUBLICATION supabase_realtime ADD TABLE patient_documents;
ALTER PUBLICATION supabase_realtime ADD TABLE communication_logs;