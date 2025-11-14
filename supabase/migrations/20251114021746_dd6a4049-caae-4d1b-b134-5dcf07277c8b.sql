-- Create expense categories enum
CREATE TYPE public.expense_category AS ENUM (
  'personnel',
  'travel',
  'equipment',
  'supplies',
  'services',
  'infrastructure',
  'overhead',
  'other'
);

-- Create grant status enum
CREATE TYPE public.grant_status AS ENUM (
  'pending',
  'approved',
  'disbursed',
  'completed',
  'cancelled'
);

-- Create budget allocation table
CREATE TABLE public.budget_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  workstream_id uuid REFERENCES public.workstreams(id) ON DELETE SET NULL,
  category expense_category NOT NULL,
  allocated_amount numeric NOT NULL DEFAULT 0,
  spent_amount numeric NOT NULL DEFAULT 0,
  committed_amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  fiscal_year integer NOT NULL,
  quarter integer CHECK (quarter >= 1 AND quarter <= 4),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create grants table
CREATE TABLE public.grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  grant_code text NOT NULL,
  donor_name text NOT NULL,
  total_amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  start_date date NOT NULL,
  end_date date NOT NULL,
  status grant_status NOT NULL DEFAULT 'pending',
  disbursed_amount numeric NOT NULL DEFAULT 0,
  restrictions text,
  reporting_requirements text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(project_id, grant_code)
);

-- Create financial transactions table for tracking all money movements
CREATE TABLE public.financial_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  grant_id uuid REFERENCES public.grants(id) ON DELETE SET NULL,
  workstream_id uuid REFERENCES public.workstreams(id) ON DELETE SET NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('income', 'expense', 'transfer', 'adjustment')),
  category expense_category,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  transaction_date date NOT NULL,
  description text NOT NULL,
  reference_number text,
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
  expense_id uuid REFERENCES public.expenses(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id),
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Update expenses table to link with budget allocations
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS budget_allocation_id uuid REFERENCES public.budget_allocations(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS grant_id uuid REFERENCES public.grants(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS category expense_category,
ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Enable RLS
ALTER TABLE public.budget_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for budget_allocations
CREATE POLICY "Users can view budget allocations of accessible projects"
ON public.budget_allocations FOR SELECT
USING (can_access_project(auth.uid(), project_id));

CREATE POLICY "Admins and finance can manage all budget allocations"
ON public.budget_allocations FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'finance'));

-- RLS Policies for grants
CREATE POLICY "Users can view grants of accessible projects"
ON public.grants FOR SELECT
USING (can_access_project(auth.uid(), project_id));

CREATE POLICY "Admins and finance can manage all grants"
ON public.grants FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'finance'));

-- RLS Policies for financial_transactions
CREATE POLICY "Users can view transactions of accessible projects"
ON public.financial_transactions FOR SELECT
USING (can_access_project(auth.uid(), project_id));

CREATE POLICY "Admins and finance can manage all transactions"
ON public.financial_transactions FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'finance'));

-- Create indexes for better performance
CREATE INDEX idx_budget_allocations_project ON public.budget_allocations(project_id);
CREATE INDEX idx_budget_allocations_workstream ON public.budget_allocations(workstream_id);
CREATE INDEX idx_grants_project ON public.grants(project_id);
CREATE INDEX idx_financial_transactions_project ON public.financial_transactions(project_id);
CREATE INDEX idx_financial_transactions_date ON public.financial_transactions(transaction_date);

-- Create triggers for updated_at
CREATE TRIGGER update_budget_allocations_updated_at
BEFORE UPDATE ON public.budget_allocations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_grants_updated_at
BEFORE UPDATE ON public.grants
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_transactions_updated_at
BEFORE UPDATE ON public.financial_transactions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();