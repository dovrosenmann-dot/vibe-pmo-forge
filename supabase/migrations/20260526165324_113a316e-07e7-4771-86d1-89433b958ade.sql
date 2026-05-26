
-- 1) Fix programs SELECT policy
DROP POLICY IF EXISTS "All authenticated users can view programs" ON public.programs;

CREATE POLICY "Users can view accessible programs"
ON public.programs FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'pmo'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.program_id = programs.id
      AND public.can_access_project(auth.uid(), p.id)
  )
);

-- 2) Revoke EXECUTE from anon/authenticated/PUBLIC on trigger-only and internal functions.
--    These are only invoked by triggers (which run regardless of caller EXECUTE grants)
--    or by other SECURITY DEFINER functions; end users should not call them directly.
REVOKE ALL ON FUNCTION public.log_risk_creation() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.log_risk_status_change() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.log_transaction_creation() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.log_transaction_status_change() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_transaction_status_change() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- 3) Restrict role/access helpers so anonymous visitors cannot probe them.
--    Authenticated users still need EXECUTE because RLS policies evaluate these
--    functions in the caller's role context.
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.can_access_project(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_access_project(uuid, uuid) TO authenticated, service_role;
