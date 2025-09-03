-- Create storage bucket for branch logos
INSERT INTO storage.buckets (id, name, public) VALUES ('branch-logos', 'branch-logos', true);

-- Create RLS policies for branch logo uploads
CREATE POLICY "Anyone can view branch logos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'branch-logos');

CREATE POLICY "Authenticated users can upload branch logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'branch-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update branch logos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'branch-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete branch logos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'branch-logos' AND auth.role() = 'authenticated');