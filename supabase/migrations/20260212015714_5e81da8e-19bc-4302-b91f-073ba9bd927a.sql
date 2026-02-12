
-- Create risk audit log table
CREATE TABLE public.risk_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id uuid NOT NULL REFERENCES public.project_risks(id) ON DELETE CASCADE,
  previous_status text NULL,
  new_status text NOT NULL,
  previous_probability text NULL,
  new_probability text NULL,
  previous_impact text NULL,
  new_impact text NULL,
  changed_by uuid NULL,
  change_reason text NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.risk_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: users can view audit logs of risks in accessible projects
CREATE POLICY "Users can view risk audit logs of accessible projects"
ON public.risk_audit_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_risks pr
    WHERE pr.id = risk_audit_log.risk_id
      AND public.can_access_project(auth.uid(), pr.project_id)
  )
);

-- Policy: admins and PMO can insert audit logs
CREATE POLICY "Admins and PMO can insert risk audit logs"
ON public.risk_audit_log
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pmo') OR public.has_role(auth.uid(), 'project_manager')
);

-- Trigger function to log risk status/probability/impact changes
CREATE OR REPLACE FUNCTION public.log_risk_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status
     OR OLD.probability IS DISTINCT FROM NEW.probability
     OR OLD.impact IS DISTINCT FROM NEW.impact THEN
    INSERT INTO public.risk_audit_log (
      risk_id, previous_status, new_status,
      previous_probability, new_probability,
      previous_impact, new_impact,
      changed_by, metadata
    ) VALUES (
      NEW.id,
      OLD.status::text, NEW.status::text,
      OLD.probability::text, NEW.probability::text,
      OLD.impact::text, NEW.impact::text,
      NEW.created_by,
      jsonb_build_object('title', NEW.title, 'category', NEW.category::text)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER trg_risk_status_change
AFTER UPDATE ON public.project_risks
FOR EACH ROW
EXECUTE FUNCTION public.log_risk_status_change();

-- Trigger for creation
CREATE OR REPLACE FUNCTION public.log_risk_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.risk_audit_log (
    risk_id, previous_status, new_status,
    previous_probability, new_probability,
    previous_impact, new_impact,
    changed_by, metadata
  ) VALUES (
    NEW.id,
    NULL, NEW.status::text,
    NULL, NEW.probability::text,
    NULL, NEW.impact::text,
    NEW.created_by,
    jsonb_build_object('title', NEW.title, 'category', NEW.category::text, 'event', 'created')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_risk_creation
AFTER INSERT ON public.project_risks
FOR EACH ROW
EXECUTE FUNCTION public.log_risk_creation();
