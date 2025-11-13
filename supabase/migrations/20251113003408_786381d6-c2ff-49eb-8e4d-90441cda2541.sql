-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  job_title TEXT,
  organization TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create app_role enum
CREATE TYPE public.app_role AS ENUM (
  'admin',
  'pmo',
  'project_manager',
  'finance',
  'meal_coordinator',
  'viewer',
  'donor'
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- user_roles policies (only admins can manage roles)
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Users can view own roles"
  ON public.user_roles
  FOR SELECT
  USING (user_id = auth.uid());

-- Create user_project_access table
CREATE TABLE public.user_project_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, project_id)
);

-- Enable RLS on user_project_access
ALTER TABLE public.user_project_access ENABLE ROW LEVEL SECURITY;

-- user_project_access policies
CREATE POLICY "Admins can manage all project access"
  ON public.user_project_access
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Users can view own project access"
  ON public.user_project_access
  FOR SELECT
  USING (user_id = auth.uid());

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create security definer function to check project access
CREATE OR REPLACE FUNCTION public.can_access_project(_user_id UUID, _project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- Admins can access all projects
    public.has_role(_user_id, 'admin') OR
    -- Or user has explicit access to this project
    EXISTS (
      SELECT 1
      FROM public.user_project_access
      WHERE user_id = _user_id
        AND project_id = _project_id
    )
$$;

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies for existing tables to use roles and project access

-- Update beneficiaries table RLS
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.beneficiaries;

CREATE POLICY "Admins and MEAL coordinators can manage all beneficiaries"
  ON public.beneficiaries
  FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'meal_coordinator')
  );

CREATE POLICY "Users can view beneficiaries of accessible projects"
  ON public.beneficiaries
  FOR SELECT
  USING (public.can_access_project(auth.uid(), project_id));

-- Update meal_deliveries table RLS
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.meal_deliveries;

CREATE POLICY "Admins and MEAL coordinators can manage all deliveries"
  ON public.meal_deliveries
  FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'meal_coordinator')
  );

CREATE POLICY "Users can view deliveries of accessible projects"
  ON public.meal_deliveries
  FOR SELECT
  USING (public.can_access_project(auth.uid(), project_id));

-- Update meal_plans table RLS
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.meal_plans;

CREATE POLICY "Admins and MEAL coordinators can manage all meal plans"
  ON public.meal_plans
  FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'meal_coordinator')
  );

CREATE POLICY "Users can view meal plans of accessible projects"
  ON public.meal_plans
  FOR SELECT
  USING (public.can_access_project(auth.uid(), project_id));

-- Update projects table RLS
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.projects;

CREATE POLICY "Admins and PMO can manage all projects"
  ON public.projects
  FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'pmo')
  );

CREATE POLICY "Users can view accessible projects"
  ON public.projects
  FOR SELECT
  USING (public.can_access_project(auth.uid(), id));

-- Update expenses table RLS
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.expenses;

CREATE POLICY "Admins and finance can manage all expenses"
  ON public.expenses
  FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'finance')
  );

CREATE POLICY "Users can view expenses of accessible projects"
  ON public.expenses
  FOR SELECT
  USING (public.can_access_project(auth.uid(), project_id));

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();