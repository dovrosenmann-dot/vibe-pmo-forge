
-- 1. Fix profiles SELECT: restrict to own profile OR users sharing a project
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

CREATE POLICY "Users can view profiles of project members"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1
    FROM public.user_project_access upa1
    JOIN public.user_project_access upa2 ON upa1.project_id = upa2.project_id
    WHERE upa1.user_id = auth.uid()
      AND upa2.user_id = profiles.user_id
  )
);

-- 2. Fix notifications INSERT: only allow inserting notifications for yourself or via privileged roles
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;

CREATE POLICY "Users can insert own notifications or admins can insert any"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'finance'::app_role)
);
