-- Add only missing policies, avoiding duplicates

-- Only add policies that don't exist yet
DO $$
BEGIN
    -- appointment_treatments policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'appointment_treatments' AND policyname = 'Staff can view appointment treatments'
    ) THEN
        CREATE POLICY "Staff can view appointment treatments" ON public.appointment_treatments
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM users 
              WHERE user_id = auth.uid() 
              AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
            )
          );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'appointment_treatments' AND policyname = 'Staff can manage appointment treatments'
    ) THEN
        CREATE POLICY "Staff can manage appointment treatments" ON public.appointment_treatments
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM users 
              WHERE user_id = auth.uid() 
              AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
            )
          );
    END IF;

    -- inventory_usage policies  
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'inventory_usage' AND policyname = 'Staff can view inventory usage'
    ) THEN
        CREATE POLICY "Staff can view inventory usage" ON public.inventory_usage
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM users 
              WHERE user_id = auth.uid() 
              AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
            )
          );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'inventory_usage' AND policyname = 'Staff can manage inventory usage'
    ) THEN
        CREATE POLICY "Staff can manage inventory usage" ON public.inventory_usage
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM users 
              WHERE user_id = auth.uid() 
              AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
            )
          );
    END IF;

    -- invoice_items policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'invoice_items' AND policyname = 'Staff can view invoice items'
    ) THEN
        CREATE POLICY "Staff can view invoice items" ON public.invoice_items
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM users 
              WHERE user_id = auth.uid() 
              AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
            )
          );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'invoice_items' AND policyname = 'Staff can manage invoice items'
    ) THEN
        CREATE POLICY "Staff can manage invoice items" ON public.invoice_items
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM users 
              WHERE user_id = auth.uid() 
              AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
            )
          );
    END IF;

    -- patient_feedback policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'patient_feedback' AND policyname = 'Patients can submit feedback'
    ) THEN
        CREATE POLICY "Patients can submit feedback" ON public.patient_feedback
          FOR INSERT WITH CHECK (
            patient_id IN (
              SELECT p.id FROM patients p 
              JOIN users u ON p.user_id = u.id 
              WHERE u.user_id = auth.uid()
            )
          );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'patient_feedback' AND policyname = 'Staff can view all feedback'
    ) THEN
        CREATE POLICY "Staff can view all feedback" ON public.patient_feedback
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM users 
              WHERE user_id = auth.uid() 
              AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
            )
          );
    END IF;

    -- patient_insurance policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'patient_insurance' AND policyname = 'Patients can view their insurance'
    ) THEN
        CREATE POLICY "Patients can view their insurance" ON public.patient_insurance
          FOR SELECT USING (
            patient_id IN (
              SELECT p.id FROM patients p 
              JOIN users u ON p.user_id = u.id 
              WHERE u.user_id = auth.uid()
            )
          );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'patient_insurance' AND policyname = 'Staff can view all patient insurance'
    ) THEN
        CREATE POLICY "Staff can view all patient insurance" ON public.patient_insurance
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM users 
              WHERE user_id = auth.uid() 
              AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
            )
          );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'patient_insurance' AND policyname = 'Staff can manage patient insurance'
    ) THEN
        CREATE POLICY "Staff can manage patient insurance" ON public.patient_insurance
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM users 
              WHERE user_id = auth.uid() 
              AND role IN ('clinic_admin', 'staff', 'dentist', 'super_admin')
            )
          );
    END IF;
END $$;