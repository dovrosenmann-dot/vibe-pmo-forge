
-- Fix function search_path warnings for functions that don't have it set
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_risk_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.log_transaction_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF OLD.approval_status IS DISTINCT FROM NEW.approval_status THEN
    INSERT INTO public.transaction_audit_log (
      transaction_id, previous_status, new_status,
      changed_by, change_reason, metadata
    ) VALUES (
      NEW.id, OLD.approval_status, NEW.approval_status,
      NEW.approved_by, NEW.rejection_reason,
      jsonb_build_object('amount', NEW.amount, 'description', NEW.description, 'transaction_type', NEW.transaction_type)
    );
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_transaction_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.transaction_audit_log (
    transaction_id, previous_status, new_status,
    changed_by, metadata
  ) VALUES (
    NEW.id, NULL, NEW.approval_status, NEW.created_by,
    jsonb_build_object('amount', NEW.amount, 'description', NEW.description, 'transaction_type', NEW.transaction_type, 'event', 'created')
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_transaction_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
  notification_type TEXT;
BEGIN
  IF OLD.approval_status = 'pending' AND NEW.approval_status IN ('approved', 'rejected') THEN
    IF NEW.approval_status = 'approved' THEN
      notification_type := 'transaction_approved';
      notification_title := 'Transação Aprovada';
      notification_message := format('Sua transação "%s" de %s %s foi aprovada.',
        NEW.description, NEW.currency, NEW.amount::TEXT);
    ELSE
      notification_type := 'transaction_rejected';
      notification_title := 'Transação Rejeitada';
      notification_message := format('Sua transação "%s" de %s %s foi rejeitada. Motivo: %s',
        NEW.description, NEW.currency, NEW.amount::TEXT,
        COALESCE(NEW.rejection_reason, 'Não informado'));
    END IF;

    IF NEW.created_by IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, type, title, message, reference_id, reference_type)
      VALUES (NEW.created_by, notification_type, notification_title, notification_message, NEW.id, 'financial_transaction');
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_risk_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
      NEW.id, OLD.status::text, NEW.status::text,
      OLD.probability::text, NEW.probability::text,
      OLD.impact::text, NEW.impact::text,
      NEW.created_by,
      jsonb_build_object('title', NEW.title, 'category', NEW.category::text)
    );
  END IF;
  RETURN NEW;
END;
$function$;
