-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Allow system to insert notifications (via triggers/functions)
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create function to notify transaction creator on approval/rejection
CREATE OR REPLACE FUNCTION public.notify_transaction_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
  notification_type TEXT;
BEGIN
  -- Only trigger on status changes from pending to approved/rejected
  IF OLD.approval_status = 'pending' AND NEW.approval_status IN ('approved', 'rejected') THEN
    IF NEW.approval_status = 'approved' THEN
      notification_type := 'transaction_approved';
      notification_title := 'Transação Aprovada';
      notification_message := format('Sua transação "%s" de %s %s foi aprovada.', 
        NEW.description, 
        NEW.currency, 
        NEW.amount::TEXT);
    ELSE
      notification_type := 'transaction_rejected';
      notification_title := 'Transação Rejeitada';
      notification_message := format('Sua transação "%s" de %s %s foi rejeitada. Motivo: %s', 
        NEW.description, 
        NEW.currency, 
        NEW.amount::TEXT,
        COALESCE(NEW.rejection_reason, 'Não informado'));
    END IF;

    -- Insert notification for the transaction creator
    IF NEW.created_by IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, type, title, message, reference_id, reference_type)
      VALUES (NEW.created_by, notification_type, notification_title, notification_message, NEW.id, 'financial_transaction');
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for transaction status notifications
CREATE TRIGGER on_transaction_status_notification
  AFTER UPDATE ON public.financial_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_transaction_status_change();