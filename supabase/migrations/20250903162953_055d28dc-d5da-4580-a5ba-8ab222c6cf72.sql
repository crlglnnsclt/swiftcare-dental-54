-- Add super admin policies for treatment records
CREATE POLICY "Super admins can view all treatment records" 
ON public.treatment_records 
FOR SELECT 
TO authenticated
USING (public.get_current_user_role() = 'super_admin');

-- Add super admin policies for inventory items
CREATE POLICY "Super admins can view all inventory items" 
ON public.inventory_items 
FOR SELECT 
TO authenticated
USING (public.get_current_user_role() = 'super_admin');

-- Add super admin policies for documents
CREATE POLICY "Super admins can view all documents" 
ON public.documents 
FOR SELECT 
TO authenticated
USING (public.get_current_user_role() = 'super_admin');