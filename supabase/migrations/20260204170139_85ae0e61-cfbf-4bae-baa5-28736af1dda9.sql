-- Fix infinite recursion in user_roles RLS policies
-- Drop the problematic policy that causes recursion
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Create new policy using the security definer function has_role()
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix the same issue in user_project_access table
DROP POLICY IF EXISTS "Admins can manage all project access" ON public.user_project_access;

CREATE POLICY "Admins can manage all project access"
ON public.user_project_access
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));