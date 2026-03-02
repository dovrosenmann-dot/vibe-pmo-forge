
-- ============================================================
-- Fix overly permissive RLS on 8 core tables
-- Replace "Allow all for authenticated users" with proper policies
-- ============================================================

-- 1. PROGRAMS (reference data - read for all, write for admin/pmo)
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.programs;

CREATE POLICY "All authenticated users can view programs"
  ON public.programs FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins and PMO can manage programs"
  ON public.programs FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'pmo'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'pmo'::app_role));

-- 2. WORKSTREAMS
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.workstreams;

CREATE POLICY "Admins and PMO can manage all workstreams"
  ON public.workstreams FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'pmo'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'pmo'::app_role));

CREATE POLICY "Project managers can manage workstreams of their projects"
  ON public.workstreams FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'project_manager'::app_role) AND can_access_project(auth.uid(), project_id))
  WITH CHECK (has_role(auth.uid(), 'project_manager'::app_role) AND can_access_project(auth.uid(), project_id));

CREATE POLICY "Users can view workstreams of accessible projects"
  ON public.workstreams FOR SELECT TO authenticated
  USING (can_access_project(auth.uid(), project_id));

-- 3. INDICATORS
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.indicators;

CREATE POLICY "Admins and MEAL coordinators can manage all indicators"
  ON public.indicators FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'meal_coordinator'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'meal_coordinator'::app_role));

CREATE POLICY "Users can view indicators of accessible projects"
  ON public.indicators FOR SELECT TO authenticated
  USING (can_access_project(auth.uid(), project_id));

-- 4. EVIDENCE
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.evidence;

CREATE POLICY "Admins and MEAL coordinators can manage all evidence"
  ON public.evidence FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'meal_coordinator'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'meal_coordinator'::app_role));

CREATE POLICY "Users can view evidence of accessible projects"
  ON public.evidence FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.indicators i
      WHERE i.id = evidence.indicator_id
      AND can_access_project(auth.uid(), i.project_id)
    )
  );

-- 5. HR_ALLOCATIONS (sensitive - salary/FTE data)
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.hr_allocations;

CREATE POLICY "Admins and PMO can manage all HR allocations"
  ON public.hr_allocations FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'pmo'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'pmo'::app_role));

CREATE POLICY "Users can view HR allocations of accessible projects"
  ON public.hr_allocations FOR SELECT TO authenticated
  USING (can_access_project(auth.uid(), project_id));

-- 6. IMPORT_LOGS
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.import_logs;

CREATE POLICY "Admins can manage all import logs"
  ON public.import_logs FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own import logs"
  ON public.import_logs FOR SELECT TO authenticated
  USING (imported_by = auth.uid()::text OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can insert import logs"
  ON public.import_logs FOR INSERT TO authenticated
  WITH CHECK (true);

-- 7. QUARTERLY_REPORTS
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.quarterly_reports;

CREATE POLICY "Admins and MEAL coordinators can manage all quarterly reports"
  ON public.quarterly_reports FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'meal_coordinator'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'meal_coordinator'::app_role));

CREATE POLICY "Users can view quarterly reports of accessible projects"
  ON public.quarterly_reports FOR SELECT TO authenticated
  USING (can_access_project(auth.uid(), project_id));

-- 8. LESSONS_LEARNED
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.lessons_learned;

CREATE POLICY "Admins and PMO can manage all lessons learned"
  ON public.lessons_learned FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'pmo'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'pmo'::app_role));

CREATE POLICY "Project managers can manage lessons learned of their projects"
  ON public.lessons_learned FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'project_manager'::app_role) AND can_access_project(auth.uid(), project_id))
  WITH CHECK (has_role(auth.uid(), 'project_manager'::app_role) AND can_access_project(auth.uid(), project_id));

CREATE POLICY "Users can view lessons learned of accessible projects"
  ON public.lessons_learned FOR SELECT TO authenticated
  USING (can_access_project(auth.uid(), project_id));
