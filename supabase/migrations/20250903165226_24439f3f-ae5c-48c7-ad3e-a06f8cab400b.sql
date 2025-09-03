-- Insert demo invoices and patient documents for 2025 testing

-- Insert demo invoices for patients across different months in 2025
DO $$
DECLARE
    clinic_record RECORD;
    patient_record RECORD;
    appointment_record RECORD;
    demo_months TEXT[] := ARRAY['2025-01-15', '2025-02-20', '2025-03-10', '2025-04-05', '2025-05-15', '2025-06-25', '2025-07-30', '2025-08-12', '2025-09-18', '2025-10-22', '2025-11-08', '2025-12-03'];
    month_date TEXT;
    invoice_num INTEGER := 1000;
    treatment_amount DECIMAL(12,2);
    insurance_coverage DECIMAL(12,2);
BEGIN
    -- Get first clinic
    SELECT * INTO clinic_record FROM public.clinics LIMIT 1;
    
    -- Create invoices for patients with completed appointments
    FOR patient_record IN (SELECT * FROM public.patients WHERE clinic_id = clinic_record.id LIMIT 8)
    LOOP
        -- Get a completed appointment for this patient
        SELECT * INTO appointment_record 
        FROM public.appointments 
        WHERE patient_id = patient_record.id 
        AND status = 'completed' 
        LIMIT 1;
        
        IF appointment_record.id IS NOT NULL THEN
            -- Select a random month for this invoice
            month_date := demo_months[1 + (ABS(HASHTEXT(patient_record.id::TEXT)) % ARRAY_LENGTH(demo_months, 1))];
            
            -- Generate treatment amount based on patient
            treatment_amount := CASE (ABS(HASHTEXT(patient_record.id::TEXT)) % 5)
                WHEN 0 THEN 2500.00 -- Dental cleaning
                WHEN 1 THEN 5500.00 -- Tooth filling
                WHEN 2 THEN 15000.00 -- Crown
                WHEN 3 THEN 25000.00 -- Root canal
                ELSE 8500.00 -- Extraction
            END;
            
            -- Calculate insurance coverage
            insurance_coverage := CASE 
                WHEN EXISTS (SELECT 1 FROM public.patient_insurance WHERE patient_id = patient_record.id AND provider_type = 'philhealth') THEN treatment_amount * 0.30
                WHEN EXISTS (SELECT 1 FROM public.patient_insurance WHERE patient_id = patient_record.id AND provider_type = 'hmo') THEN treatment_amount * 0.80
                ELSE 0
            END;
            
            -- Insert invoice
            INSERT INTO public.invoices (
                patient_id, clinic_id, appointment_id, invoice_number, 
                subtotal, tax_amount, insurance_coverage, total_amount, 
                amount_paid, balance_due, payment_method, payment_status,
                payment_date, treatments, issued_by, created_at
            ) VALUES (
                patient_record.id,
                clinic_record.id,
                appointment_record.id,
                'INV-' || clinic_record.id::TEXT || '-' || LPAD(invoice_num::TEXT, 6, '0'),
                treatment_amount,
                treatment_amount * 0.12, -- 12% VAT in Philippines
                insurance_coverage,
                treatment_amount + (treatment_amount * 0.12) - insurance_coverage,
                treatment_amount + (treatment_amount * 0.12) - insurance_coverage, -- Fully paid
                0, -- No balance
                CASE (ABS(HASHTEXT(patient_record.id::TEXT)) % 4)
                    WHEN 0 THEN 'cash'
                    WHEN 1 THEN 'gcash'
                    WHEN 2 THEN 'card'
                    ELSE 'bank_transfer'
                END,
                'paid',
                (month_date || ' 16:30:00')::TIMESTAMP WITH TIME ZONE,
                jsonb_build_array(
                    jsonb_build_object(
                        'name', CASE (ABS(HASHTEXT(patient_record.id::TEXT)) % 5)
                            WHEN 0 THEN 'Dental Cleaning and Prophylaxis'
                            WHEN 1 THEN 'Composite Tooth Filling'
                            WHEN 2 THEN 'Porcelain Crown Placement'
                            WHEN 3 THEN 'Endodontic Root Canal Treatment'
                            ELSE 'Tooth Extraction (Simple)'
                        END,
                        'description', CASE (ABS(HASHTEXT(patient_record.id::TEXT)) % 5)
                            WHEN 0 THEN 'Professional dental cleaning with fluoride treatment'
                            WHEN 1 THEN 'Composite resin restoration for dental caries'
                            WHEN 2 THEN 'Full ceramic crown restoration'
                            WHEN 3 THEN 'Complete root canal therapy with obturation'
                            ELSE 'Simple tooth extraction with local anesthesia'
                        END,
                        'quantity', 1,
                        'unit_price', treatment_amount,
                        'total', treatment_amount
                    )
                ),
                (SELECT id FROM public.users WHERE clinic_id = clinic_record.id AND role IN ('dentist', 'staff') LIMIT 1),
                (month_date || ' 16:30:00')::TIMESTAMP WITH TIME ZONE
            );
            
            invoice_num := invoice_num + 1;
        END IF;
    END LOOP;
END $$;

-- Insert demo patient documents (insurance cards, x-rays, etc.)
DO $$
DECLARE
    clinic_record RECORD;
    patient_record RECORD;
    demo_docs TEXT[] := ARRAY['philhealth_card.jpg', 'xray_image.png', 'hmo_card.jpg', 'dental_scan.jpg', 'insurance_policy.pdf', 'medical_certificate.pdf'];
    doc_name TEXT;
    doc_type TEXT;
    doc_category TEXT;
BEGIN
    -- Get first clinic
    SELECT * INTO clinic_record FROM public.clinics LIMIT 1;
    
    -- Create documents for patients
    FOR patient_record IN (SELECT * FROM public.patients WHERE clinic_id = clinic_record.id LIMIT 8)
    LOOP
        -- Add insurance card
        IF EXISTS (SELECT 1 FROM public.patient_insurance WHERE patient_id = patient_record.id AND provider_type = 'philhealth') THEN
            INSERT INTO public.patient_documents (
                patient_id, clinic_id, document_type, document_category,
                file_name, mime_type, uploaded_by, metadata
            ) VALUES (
                patient_record.id,
                clinic_record.id,
                'insurance',
                'insurance_card',
                'PhilHealth_Card_' || patient_record.full_name || '.jpg',
                'image/jpeg',
                (SELECT id FROM public.users WHERE clinic_id = clinic_record.id AND role IN ('staff', 'receptionist') LIMIT 1),
                jsonb_build_object(
                    'provider', 'PhilHealth',
                    'card_type', 'Primary',
                    'verified', true
                )
            );
        END IF;
        
        IF EXISTS (SELECT 1 FROM public.patient_insurance WHERE patient_id = patient_record.id AND provider_type = 'hmo') THEN
            INSERT INTO public.patient_documents (
                patient_id, clinic_id, document_type, document_category,
                file_name, mime_type, uploaded_by, metadata
            ) VALUES (
                patient_record.id,
                clinic_record.id,
                'insurance',
                'insurance_card',
                'HMO_Card_' || patient_record.full_name || '.jpg',
                'image/jpeg',
                (SELECT id FROM public.users WHERE clinic_id = clinic_record.id AND role IN ('staff', 'receptionist') LIMIT 1),
                jsonb_build_object(
                    'provider', CASE (ABS(HASHTEXT(patient_record.id::TEXT)) % 2) WHEN 0 THEN 'Maxicare' ELSE 'Intellicare' END,
                    'card_type', 'Member Card',
                    'verified', true
                )
            );
        END IF;
        
        -- Add X-ray image
        INSERT INTO public.patient_documents (
            patient_id, clinic_id, document_type, document_category,
            file_name, mime_type, uploaded_by, metadata
        ) VALUES (
            patient_record.id,
            clinic_record.id,
            'xray',
            'diagnostic_image',
            'Panoramic_Xray_' || patient_record.full_name || '_' || TO_CHAR(NOW() - INTERVAL '30 days', 'YYYY-MM-DD') || '.png',
            'image/png',
            (SELECT id FROM public.users WHERE clinic_id = clinic_record.id AND role = 'dentist' LIMIT 1),
            jsonb_build_object(
                'image_type', 'Panoramic',
                'date_taken', TO_CHAR(NOW() - INTERVAL '30 days', 'YYYY-MM-DD'),
                'findings', 'Normal tooth structure with minor plaque buildup'
            )
        );
        
        -- Link signed forms as documents
        INSERT INTO public.patient_documents (
            patient_id, clinic_id, document_type, document_category,
            file_name, mime_type, is_signed, form_response_id, uploaded_by, metadata
        )
        SELECT 
            fr.patient_id,
            fr.clinic_id,
            'form',
            'medical_history',
            'Medical_History_Form_' || p.full_name || '_' || TO_CHAR(fr.signed_at, 'YYYY-MM-DD') || '.pdf',
            'application/pdf',
            true,
            fr.id,
            fr.signed_by,
            jsonb_build_object(
                'form_type', 'medical_history',
                'digitally_signed', true,
                'signature_timestamp', fr.signed_at
            )
        FROM public.form_responses fr
        JOIN public.patients p ON p.id = fr.patient_id
        WHERE fr.patient_id = patient_record.id
        AND fr.status = 'signed'
        LIMIT 1;
        
    END LOOP;
END $$;