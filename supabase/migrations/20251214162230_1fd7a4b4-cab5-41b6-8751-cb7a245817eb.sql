-- Create approval status enum for financial transactions
CREATE TYPE public.transaction_approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Add approval_status column to financial_transactions
ALTER TABLE public.financial_transactions 
ADD COLUMN approval_status public.transaction_approval_status NOT NULL DEFAULT 'pending';

-- Add rejection reason column
ALTER TABLE public.financial_transactions 
ADD COLUMN rejection_reason text;

-- Create index for faster queries on approval status
CREATE INDEX idx_financial_transactions_approval_status ON public.financial_transactions(approval_status);