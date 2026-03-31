
-- =============================================
-- Fix ALL policies from {public} to {authenticated}
-- =============================================

-- beneficiaries
DROP POLICY IF EXISTS "Admins and MEAL coordinators can manage all beneficiaries" ON public.beneficiaries;
CREATE POLICY "Admins and MEAL coordinators can manage all beneficiaries" ON public.beneficiaries FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'meal_coordinator'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'meal_coordinator'::app_role));
DROP POLICY IF EXISTS "Users can view beneficiaries of accessible projects" ON public.beneficiaries;
CREATE POLICY "Users can view beneficiaries of accessible projects" ON public.beneficiaries FOR SELECT TO authenticated USING (can_access_project(auth.uid(), project_id));

-- suppliers
DROP POLICY IF EXISTS "Admins and finance can manage all suppliers" ON public.suppliers;
CREATE POLICY "Admins and finance can manage all suppliers" ON public.suppliers FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role));
DROP POLICY IF EXISTS "Users can view suppliers of accessible projects" ON public.suppliers;
CREATE POLICY "Users can view suppliers of accessible projects" ON public.suppliers FOR SELECT TO authenticated USING (can_access_project(auth.uid(), project_id));

-- financial_transactions
DROP POLICY IF EXISTS "Admins and finance can manage all transactions" ON public.financial_transactions;
CREATE POLICY "Admins and finance can manage all transactions" ON public.financial_transactions FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role));
DROP POLICY IF EXISTS "Users can view transactions of accessible projects" ON public.financial_transactions;
CREATE POLICY "Users can view transactions of accessible projects" ON public.financial_transactions FOR SELECT TO authenticated USING (can_access_project(auth.uid(), project_id));

-- grants
DROP POLICY IF EXISTS "Admins and finance can manage all grants" ON public.grants;
CREATE POLICY "Admins and finance can manage all grants" ON public.grants FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role));
DROP POLICY IF EXISTS "Users can view grants of accessible projects" ON public.grants;
CREATE POLICY "Users can view grants of accessible projects" ON public.grants FOR SELECT TO authenticated USING (can_access_project(auth.uid(), project_id));

-- invoices
DROP POLICY IF EXISTS "Admins and finance can manage all invoices" ON public.invoices;
CREATE POLICY "Admins and finance can manage all invoices" ON public.invoices FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role));
DROP POLICY IF EXISTS "Users can view invoices of accessible projects" ON public.invoices;
CREATE POLICY "Users can view invoices of accessible projects" ON public.invoices FOR SELECT TO authenticated USING (can_access_project(auth.uid(), project_id));

-- supplier_contracts
DROP POLICY IF EXISTS "Admins and finance can manage all contracts" ON public.supplier_contracts;
CREATE POLICY "Admins and finance can manage all contracts" ON public.supplier_contracts FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role));
DROP POLICY IF EXISTS "Users can view contracts of accessible projects" ON public.supplier_contracts;
CREATE POLICY "Users can view contracts of accessible projects" ON public.supplier_contracts FOR SELECT TO authenticated USING (can_access_project(auth.uid(), project_id));

-- project_risks
DROP POLICY IF EXISTS "Admins and PMO can manage all risks" ON public.project_risks;
CREATE POLICY "Admins and PMO can manage all risks" ON public.project_risks FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'pmo'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'pmo'::app_role));
DROP POLICY IF EXISTS "Project managers can manage risks of accessible projects" ON public.project_risks;
CREATE POLICY "Project managers can manage risks of accessible projects" ON public.project_risks FOR ALL TO authenticated USING (has_role(auth.uid(), 'project_manager'::app_role) AND can_access_project(auth.uid(), project_id)) WITH CHECK (has_role(auth.uid(), 'project_manager'::app_role) AND can_access_project(auth.uid(), project_id));
DROP POLICY IF EXISTS "Users can view risks of accessible projects" ON public.project_risks;
CREATE POLICY "Users can view risks of accessible projects" ON public.project_risks FOR SELECT TO authenticated USING (can_access_project(auth.uid(), project_id));

-- meal_plans
DROP POLICY IF EXISTS "Admins and MEAL coordinators can manage all meal plans" ON public.meal_plans;
CREATE POLICY "Admins and MEAL coordinators can manage all meal plans" ON public.meal_plans FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'meal_coordinator'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'meal_coordinator'::app_role));
DROP POLICY IF EXISTS "Users can view meal plans of accessible projects" ON public.meal_plans;
CREATE POLICY "Users can view meal plans of accessible projects" ON public.meal_plans FOR SELECT TO authenticated USING (can_access_project(auth.uid(), project_id));

-- meal_deliveries
DROP POLICY IF EXISTS "Admins and MEAL coordinators can manage all deliveries" ON public.meal_deliveries;
CREATE POLICY "Admins and MEAL coordinators can manage all deliveries" ON public.meal_deliveries FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'meal_coordinator'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'meal_coordinator'::app_role));
DROP POLICY IF EXISTS "Users can view deliveries of accessible projects" ON public.meal_deliveries;
CREATE POLICY "Users can view deliveries of accessible projects" ON public.meal_deliveries FOR SELECT TO authenticated USING (can_access_project(auth.uid(), project_id));

-- user_roles
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- user_project_access
DROP POLICY IF EXISTS "Admins can manage all project access" ON public.user_project_access;
CREATE POLICY "Admins can manage all project access" ON public.user_project_access FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Users can view own project access" ON public.user_project_access;
CREATE POLICY "Users can view own project access" ON public.user_project_access FOR SELECT TO authenticated USING (user_id = auth.uid());

-- budget_allocations
DROP POLICY IF EXISTS "Admins and finance can manage all budget allocations" ON public.budget_allocations;
CREATE POLICY "Admins and finance can manage all budget allocations" ON public.budget_allocations FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role));
DROP POLICY IF EXISTS "Users can view budget allocations of accessible projects" ON public.budget_allocations;
CREATE POLICY "Users can view budget allocations of accessible projects" ON public.budget_allocations FOR SELECT TO authenticated USING (can_access_project(auth.uid(), project_id));

-- expenses
DROP POLICY IF EXISTS "Admins and finance can manage all expenses" ON public.expenses;
CREATE POLICY "Admins and finance can manage all expenses" ON public.expenses FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role));
DROP POLICY IF EXISTS "Users can view expenses of accessible projects" ON public.expenses;
CREATE POLICY "Users can view expenses of accessible projects" ON public.expenses FOR SELECT TO authenticated USING (can_access_project(auth.uid(), project_id));

-- transaction_audit_log
DROP POLICY IF EXISTS "Admins and finance can insert audit logs" ON public.transaction_audit_log;
CREATE POLICY "Admins and finance can insert audit logs" ON public.transaction_audit_log FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role));
DROP POLICY IF EXISTS "Users can view audit logs of accessible transactions" ON public.transaction_audit_log;
CREATE POLICY "Users can view audit logs of accessible transactions" ON public.transaction_audit_log FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM financial_transactions ft WHERE ft.id = transaction_audit_log.transaction_id AND can_access_project(auth.uid(), ft.project_id)));

-- risk_audit_log
DROP POLICY IF EXISTS "Admins and PMO can insert risk audit logs" ON public.risk_audit_log;
CREATE POLICY "Admins and PMO can insert risk audit logs" ON public.risk_audit_log FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'pmo'::app_role) OR has_role(auth.uid(), 'project_manager'::app_role));
DROP POLICY IF EXISTS "Users can view risk audit logs of accessible projects" ON public.risk_audit_log;
CREATE POLICY "Users can view risk audit logs of accessible projects" ON public.risk_audit_log FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM project_risks pr WHERE pr.id = risk_audit_log.risk_id AND can_access_project(auth.uid(), pr.project_id)));

-- supplier_documents
DROP POLICY IF EXISTS "Admins and finance can manage supplier documents" ON public.supplier_documents;
CREATE POLICY "Admins and finance can manage supplier documents" ON public.supplier_documents FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role));
DROP POLICY IF EXISTS "Project managers can manage docs of their projects" ON public.supplier_documents;
CREATE POLICY "Project managers can manage docs of their projects" ON public.supplier_documents FOR ALL TO authenticated USING (has_role(auth.uid(), 'project_manager'::app_role) AND can_access_project(auth.uid(), project_id)) WITH CHECK (has_role(auth.uid(), 'project_manager'::app_role) AND can_access_project(auth.uid(), project_id));
DROP POLICY IF EXISTS "Users can view supplier documents of accessible projects" ON public.supplier_documents;
CREATE POLICY "Users can view supplier documents of accessible projects" ON public.supplier_documents FOR SELECT TO authenticated USING (can_access_project(auth.uid(), project_id));

-- projects
DROP POLICY IF EXISTS "Admins and PMO can manage all projects" ON public.projects;
CREATE POLICY "Admins and PMO can manage all projects" ON public.projects FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'pmo'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'pmo'::app_role));
DROP POLICY IF EXISTS "Users can view accessible projects" ON public.projects;
CREATE POLICY "Users can view accessible projects" ON public.projects FOR SELECT TO authenticated USING (can_access_project(auth.uid(), id));
