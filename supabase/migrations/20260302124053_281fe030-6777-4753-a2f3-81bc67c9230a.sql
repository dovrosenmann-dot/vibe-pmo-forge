
-- ============================================================
-- FIX 1: Invoices table - replace overly permissive RLS
-- ============================================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.invoices;

-- Admins and finance can manage all invoices
CREATE POLICY "Admins and finance can manage all invoices"
  ON public.invoices
  FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'finance'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'finance'));

-- Users can view invoices of accessible projects
CREATE POLICY "Users can view invoices of accessible projects"
  ON public.invoices
  FOR SELECT
  USING (can_access_project(auth.uid(), project_id));

-- ============================================================
-- FIX 2: Storage bucket - replace overly permissive policies
-- ============================================================

-- Drop overly permissive storage policies
DROP POLICY IF EXISTS "Authenticated users can upload supplier documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view supplier documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete supplier documents" ON storage.objects;

-- Admins and finance can upload any supplier documents
CREATE POLICY "Admins and finance can upload supplier docs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'supplier-documents' AND
    (
      public.has_role(auth.uid(), 'admin') OR
      public.has_role(auth.uid(), 'finance') OR
      public.has_role(auth.uid(), 'project_manager')
    )
  );

-- Users can view supplier docs if they have project access (via supplier_documents table join)
CREATE POLICY "Users can view supplier docs of accessible projects"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'supplier-documents' AND
    (
      public.has_role(auth.uid(), 'admin') OR
      public.has_role(auth.uid(), 'finance') OR
      EXISTS (
        SELECT 1 FROM public.supplier_documents sd
        WHERE sd.file_path = name
        AND public.can_access_project(auth.uid(), sd.project_id)
      )
    )
  );

-- Admin and finance can delete any docs, project managers can delete from their projects
CREATE POLICY "Users can delete supplier docs with proper access"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'supplier-documents' AND
    (
      public.has_role(auth.uid(), 'admin') OR
      public.has_role(auth.uid(), 'finance') OR
      EXISTS (
        SELECT 1 FROM public.supplier_documents sd
        WHERE sd.file_path = name
        AND public.has_role(auth.uid(), 'project_manager')
        AND public.can_access_project(auth.uid(), sd.project_id)
      )
    )
  );
