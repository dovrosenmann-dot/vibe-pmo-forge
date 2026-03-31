-- Fix storage policies: change from public to authenticated role

-- Drop existing policies with public role
DROP POLICY IF EXISTS "Admins and finance can upload supplier docs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete supplier docs with proper access" ON storage.objects;
DROP POLICY IF EXISTS "Users can view supplier docs of accessible projects" ON storage.objects;

-- Recreate INSERT policy scoped to authenticated
CREATE POLICY "Admins and finance can upload supplier docs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'supplier-documents'
  AND (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'finance')
  )
);

-- Recreate DELETE policy scoped to authenticated
CREATE POLICY "Users can delete supplier docs with proper access"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'supplier-documents'
  AND (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'finance') OR
    (
      public.has_role(auth.uid(), 'project_manager')
      AND public.can_access_project(auth.uid(), (storage.foldername(name))[1]::uuid)
    )
  )
);

-- Recreate SELECT policy scoped to authenticated
CREATE POLICY "Users can view supplier docs of accessible projects"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'supplier-documents'
  AND public.can_access_project(auth.uid(), (storage.foldername(name))[1]::uuid)
);