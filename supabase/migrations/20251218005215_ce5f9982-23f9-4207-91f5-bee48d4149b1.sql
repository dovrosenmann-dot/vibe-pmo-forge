-- Create supplier category enum
CREATE TYPE public.supplier_category AS ENUM (
  'goods',
  'services', 
  'logistics',
  'consulting',
  'construction',
  'equipment',
  'other'
);

-- Create supplier status enum
CREATE TYPE public.supplier_status AS ENUM (
  'active',
  'inactive',
  'blocked',
  'pending_approval'
);

-- Create contract status enum
CREATE TYPE public.contract_status AS ENUM (
  'draft',
  'active',
  'completed',
  'cancelled',
  'expired'
);

-- Create suppliers table
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tax_id TEXT,
  category public.supplier_category NOT NULL DEFAULT 'other',
  status public.supplier_status NOT NULL DEFAULT 'active',
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  payment_terms TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create supplier_contracts table
CREATE TABLE public.supplier_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  contract_number TEXT NOT NULL,
  description TEXT,
  total_value NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status public.contract_status NOT NULL DEFAULT 'draft',
  payment_schedule TEXT,
  deliverables TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add supplier reference to financial_transactions
ALTER TABLE public.financial_transactions 
ADD COLUMN supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
ADD COLUMN contract_id UUID REFERENCES public.supplier_contracts(id) ON DELETE SET NULL;

-- Add supplier reference to meal_deliveries
ALTER TABLE public.meal_deliveries 
ADD COLUMN supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
ADD COLUMN contract_id UUID REFERENCES public.supplier_contracts(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_contracts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for suppliers
CREATE POLICY "Admins and finance can manage all suppliers" 
ON public.suppliers 
FOR ALL 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'finance'));

CREATE POLICY "Users can view suppliers of accessible projects" 
ON public.suppliers 
FOR SELECT 
USING (can_access_project(auth.uid(), project_id));

-- RLS Policies for supplier_contracts
CREATE POLICY "Admins and finance can manage all contracts" 
ON public.supplier_contracts 
FOR ALL 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'finance'));

CREATE POLICY "Users can view contracts of accessible projects" 
ON public.supplier_contracts 
FOR SELECT 
USING (can_access_project(auth.uid(), project_id));

-- Triggers for updated_at
CREATE TRIGGER update_suppliers_updated_at
BEFORE UPDATE ON public.suppliers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_supplier_contracts_updated_at
BEFORE UPDATE ON public.supplier_contracts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();