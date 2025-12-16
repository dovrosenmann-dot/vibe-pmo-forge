-- Create transaction audit log table
CREATE TABLE public.transaction_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES public.financial_transactions(id) ON DELETE CASCADE,
  previous_status transaction_approval_status,
  new_status transaction_approval_status NOT NULL,
  changed_by uuid REFERENCES auth.users(id),
  change_reason text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transaction_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS policies - same access as financial_transactions
CREATE POLICY "Users can view audit logs of accessible transactions"
ON public.transaction_audit_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.financial_transactions ft
    WHERE ft.id = transaction_audit_log.transaction_id
    AND can_access_project(auth.uid(), ft.project_id)
  )
);

CREATE POLICY "Admins and finance can insert audit logs"
ON public.transaction_audit_log
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'finance')
);

-- Create trigger function for automatic audit logging
CREATE OR REPLACE FUNCTION public.log_transaction_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Only log if approval_status changed
  IF OLD.approval_status IS DISTINCT FROM NEW.approval_status THEN
    INSERT INTO public.transaction_audit_log (
      transaction_id,
      previous_status,
      new_status,
      changed_by,
      change_reason,
      metadata
    ) VALUES (
      NEW.id,
      OLD.approval_status,
      NEW.approval_status,
      NEW.approved_by,
      NEW.rejection_reason,
      jsonb_build_object(
        'amount', NEW.amount,
        'description', NEW.description,
        'transaction_type', NEW.transaction_type
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_transaction_status_change
  AFTER UPDATE ON public.financial_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.log_transaction_status_change();

-- Also log initial creation with pending status
CREATE OR REPLACE FUNCTION public.log_transaction_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.transaction_audit_log (
    transaction_id,
    previous_status,
    new_status,
    changed_by,
    metadata
  ) VALUES (
    NEW.id,
    NULL,
    NEW.approval_status,
    NEW.created_by,
    jsonb_build_object(
      'amount', NEW.amount,
      'description', NEW.description,
      'transaction_type', NEW.transaction_type,
      'event', 'created'
    )
  );
  RETURN NEW;
END;
$$;

-- Create trigger for creation
CREATE TRIGGER on_transaction_created
  AFTER INSERT ON public.financial_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.log_transaction_creation();