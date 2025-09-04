-- Fix function search path security warning
CREATE OR REPLACE FUNCTION public.update_invoice_totals()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;