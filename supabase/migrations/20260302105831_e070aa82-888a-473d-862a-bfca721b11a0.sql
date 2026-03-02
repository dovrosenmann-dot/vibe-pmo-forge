-- Fix supplier_documents: replace overly permissive RLS with project-scoped policies
DROP POLICY IF EXISTS "Users can view supplier documents" ON public.supplier_documents;
DROP POLICY IF EXISTS "Users can insert supplier documents" ON public.supplier_documents;
DROP POLICY IF EXISTS "Users can update supplier documents" ON public.supplier_documents;
DROP POLICY IF EXISTS "Users can delete supplier documents" ON public.supplier_documents;

-- Read: project members only
CREATE POLICY "Users can view supplier documents of accessible projects"
  ON public.supplier_documents
  FOR SELECT
  USING (can_access_project(auth.uid(), project_id));

-- Full management: admin and finance
CREATE POLICY "Admins and finance can manage supplier documents"
  ON public.supplier_documents
  FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'finance'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'finance'::app_role)
  );

-- Project managers can insert/update docs for their projects
CREATE POLICY "Project managers can manage docs of their projects"
  ON public.supplier_documents
  FOR ALL
  USING (
    has_role(auth.uid(), 'project_manager'::app_role) AND 
    can_access_project(auth.uid(), project_id)
  )
  WITH CHECK (
    has_role(auth.uid(), 'project_manager'::app_role) AND 
    can_access_project(auth.uid(), project_id)
  );