
-- Add UPDATE policy for supplier-documents storage bucket
CREATE POLICY "Admins and finance can update supplier documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'supplier-documents'
  AND (
    (SELECT has_role(auth.uid(), 'admin'::app_role))
    OR (SELECT has_role(auth.uid(), 'finance'::app_role))
  )
)
WITH CHECK (
  bucket_id = 'supplier-documents'
  AND (
    (SELECT has_role(auth.uid(), 'admin'::app_role))
    OR (SELECT has_role(auth.uid(), 'finance'::app_role))
  )
);
