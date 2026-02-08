
-- Risk categories aligned with existing modules
CREATE TYPE public.risk_category AS ENUM (
  'meal',
  'suppliers',
  'financial',
  'beneficiaries',
  'operational',
  'contextual'
);

-- Probability and impact levels for 3x3 matrix
CREATE TYPE public.risk_probability AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.risk_impact AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.risk_status AS ENUM ('identified', 'mitigating', 'resolved', 'accepted', 'escalated');
CREATE TYPE public.risk_source AS ENUM ('manual', 'auto_meal', 'auto_supplier', 'auto_financial');

-- Main risks table
CREATE TABLE public.project_risks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category public.risk_category NOT NULL,
  probability public.risk_probability NOT NULL DEFAULT 'medium',
  impact public.risk_impact NOT NULL DEFAULT 'medium',
  status public.risk_status NOT NULL DEFAULT 'identified',
  source public.risk_source NOT NULL DEFAULT 'manual',
  source_reference_id UUID,
  source_reference_type TEXT,
  owner TEXT,
  mitigation_plan TEXT,
  contingency_plan TEXT,
  due_date DATE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_risks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins and PMO can manage all risks"
ON public.project_risks
FOR ALL
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pmo'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pmo'));

CREATE POLICY "Project managers can manage risks of accessible projects"
ON public.project_risks
FOR ALL
USING (
  public.has_role(auth.uid(), 'project_manager') AND public.can_access_project(auth.uid(), project_id)
)
WITH CHECK (
  public.has_role(auth.uid(), 'project_manager') AND public.can_access_project(auth.uid(), project_id)
);

CREATE POLICY "Users can view risks of accessible projects"
ON public.project_risks
FOR SELECT
USING (public.can_access_project(auth.uid(), project_id));

-- Trigger for updated_at
CREATE TRIGGER update_project_risks_updated_at
BEFORE UPDATE ON public.project_risks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
