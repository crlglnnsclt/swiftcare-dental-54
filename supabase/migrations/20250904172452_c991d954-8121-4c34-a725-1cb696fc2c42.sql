-- Create invoices table to fix system health issues
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  patient_id UUID NOT NULL,
  clinic_id UUID NOT NULL,
  appointment_id UUID,
  issued_by UUID,
  invoice_type TEXT NOT NULL DEFAULT 'treatment',
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  amount_paid NUMERIC(10,2) NOT NULL DEFAULT 0,
  balance_due NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue', 'cancelled')),
  payment_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for invoices
CREATE POLICY "Clinic staff can manage their clinic invoices" 
ON public.invoices 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.user_id = auth.uid() 
    AND u.clinic_id = invoices.clinic_id 
    AND u.role IN ('clinic_admin', 'dentist', 'staff', 'receptionist')
  )
);

CREATE POLICY "Patients can view their own invoices" 
ON public.invoices 
FOR SELECT 
USING (
  patient_id IN (
    SELECT p.id FROM public.patients p 
    JOIN public.users u ON u.id = p.user_id 
    WHERE u.user_id = auth.uid()
  )
);

CREATE POLICY "Super admins can view all invoices" 
ON public.invoices 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.user_id = auth.uid() 
    AND u.role = 'super_admin'
  )
);

-- Create payments table to track payment transactions
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL,
  clinic_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'insurance', 'check')),
  amount NUMERIC(10,2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reference_number TEXT,
  notes TEXT,
  processed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for payments
CREATE POLICY "Clinic staff can manage their clinic payments" 
ON public.payments 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.user_id = auth.uid() 
    AND u.clinic_id = payments.clinic_id 
    AND u.role IN ('clinic_admin', 'dentist', 'staff', 'receptionist')
  )
);

CREATE POLICY "Patients can view their own payments" 
ON public.payments 
FOR SELECT 
USING (
  patient_id IN (
    SELECT p.id FROM public.patients p 
    JOIN public.users u ON u.id = p.user_id 
    WHERE u.user_id = auth.uid()
  )
);

-- Create invoice items table for detailed billing
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  treatment_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for invoice items
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for invoice items
CREATE POLICY "Clinic staff can manage invoice items through invoices" 
ON public.invoice_items 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.invoices i
    JOIN public.users u ON u.clinic_id = i.clinic_id
    WHERE i.id = invoice_items.invoice_id
    AND u.user_id = auth.uid() 
    AND u.role IN ('clinic_admin', 'dentist', 'staff', 'receptionist')
  )
);

-- Create update trigger for invoices
CREATE OR REPLACE FUNCTION public.update_invoice_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_invoice_updated_at();

-- Create function to update invoice totals
CREATE OR REPLACE FUNCTION public.update_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Update invoice totals when invoice items change
  UPDATE public.invoices 
  SET 
    subtotal = (
      SELECT COALESCE(SUM(total_price), 0) 
      FROM public.invoice_items 
      WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
    ),
    total_amount = (
      SELECT COALESCE(SUM(total_price), 0) + COALESCE(tax_amount, 0) - COALESCE(discount_amount, 0)
      FROM public.invoice_items 
      WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
    )
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  -- Update balance due
  UPDATE public.invoices 
  SET balance_due = total_amount - amount_paid
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invoice_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.invoice_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_invoice_totals();