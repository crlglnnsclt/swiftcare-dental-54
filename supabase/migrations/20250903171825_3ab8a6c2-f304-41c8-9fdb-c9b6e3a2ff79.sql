-- Add RLS policy to allow users to create their own patient records
CREATE POLICY "Users can create their own patient record" 
ON public.patients 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);