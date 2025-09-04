-- Create missing invoice_items table only
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

-- Create RLS policies for invoice items (with different name to avoid conflicts)
CREATE POLICY "Staff can manage invoice items via invoices" 
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

-- Create function to update invoice totals (if not exists)
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

-- Create trigger for invoice totals (drop first to avoid conflicts)
DROP TRIGGER IF EXISTS update_invoice_totals_trigger ON public.invoice_items;
CREATE TRIGGER update_invoice_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.invoice_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_invoice_totals();