
DROP POLICY IF EXISTS "Authenticated users can insert import logs" ON public.import_logs;
CREATE POLICY "Users with data roles can insert import logs" ON public.import_logs FOR INSERT TO authenticated WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'pmo'::app_role)
  OR has_role(auth.uid(), 'project_manager'::app_role)
  OR has_role(auth.uid(), 'meal_coordinator'::app_role)
  OR has_role(auth.uid(), 'finance'::app_role)
);
