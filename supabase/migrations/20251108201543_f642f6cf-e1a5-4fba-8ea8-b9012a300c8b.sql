-- Create enum types
CREATE TYPE project_status AS ENUM ('planning', 'execution', 'closing', 'closed');
CREATE TYPE project_health AS ENUM ('green', 'yellow', 'red');
CREATE TYPE invoice_status AS ENUM ('received', 'approved', 'paid', 'archived');
CREATE TYPE import_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE workstream_category AS ENUM ('governance', 'meal', 'field_implementation', 'capacity_building', 'advocacy');

-- Programs (Impact Areas)
CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  kpi_primary TEXT,
  owner TEXT,
  status project_health DEFAULT 'green',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  country TEXT,
  manager TEXT,
  start_date DATE,
  end_date DATE,
  status project_status DEFAULT 'planning',
  health project_health DEFAULT 'green',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  budget_planned DECIMAL(15,2) DEFAULT 0,
  budget_spent DECIMAL(15,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  team_size INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Expenses
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  cost_category TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  vendor TEXT,
  grant_code TEXT,
  workstream TEXT,
  invoice_no TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Invoices
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  invoice_no TEXT NOT NULL,
  vendor TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status invoice_status DEFAULT 'received',
  received_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(project_id, invoice_no)
);

-- HR Allocations
CREATE TABLE public.hr_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL,
  role TEXT NOT NULL,
  fte DECIMAL(3,2) NOT NULL CHECK (fte > 0 AND fte <= 2),
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Workstreams
CREATE TABLE public.workstreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category workstream_category,
  owner TEXT,
  status project_health DEFAULT 'green',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indicators (MEAL)
CREATE TABLE public.indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  unit TEXT,
  baseline DECIMAL(15,2),
  target DECIMAL(15,2),
  current_value DECIMAL(15,2),
  frequency TEXT,
  last_updated DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(project_id, code)
);

-- Evidence (for MEAL)
CREATE TABLE public.evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_id UUID REFERENCES public.indicators(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT,
  date DATE NOT NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Import Logs
CREATE TABLE public.import_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  status import_status DEFAULT 'pending',
  total_rows INTEGER DEFAULT 0,
  success_rows INTEGER DEFAULT 0,
  failed_rows INTEGER DEFAULT 0,
  error_details JSONB,
  imported_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Seed Impact Areas (Programs)
INSERT INTO public.programs (code, name, description, kpi_primary) VALUES
  ('COMM-INDIGENOUS', 'Community & Indigenous Rights', 'Ensuring rights of communities and indigenous peoples', '# people/communities with better secured rights'),
  ('WORKERS-WELFARE', 'Workers'' Welfare', 'Improving working and living conditions', '# individuals with improved working/living conditions'),
  ('FARMERS-RESILIENCE', 'Farmers'' Resilience', 'Building resilience for farmers and families', '# farmers/families with improved resilience'),
  ('THRIVING-ECOSYSTEMS', 'Thriving Ecosystems', 'Protecting and restoring ecosystems', '# hectares protected/restored'),
  ('REGENERATIVE-AG', 'Regenerative Agriculture', 'Promoting regenerative agricultural practices', '# hectares of regenerated agricultural areas');

-- Enable Row Level Security
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workstreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing authenticated users full access for now - will refine with roles later)
CREATE POLICY "Allow all for authenticated users" ON public.programs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.hr_allocations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.workstreams FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.indicators FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.evidence FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON public.import_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON public.programs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_workstreams_updated_at BEFORE UPDATE ON public.workstreams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_projects_program_id ON public.projects(program_id);
CREATE INDEX idx_projects_code ON public.projects(code);
CREATE INDEX idx_expenses_project_id ON public.expenses(project_id);
CREATE INDEX idx_expenses_date ON public.expenses(date);
CREATE INDEX idx_invoices_project_id ON public.invoices(project_id);
CREATE INDEX idx_hr_allocations_project_id ON public.hr_allocations(project_id);
CREATE INDEX idx_workstreams_project_id ON public.workstreams(project_id);
CREATE INDEX idx_indicators_project_id ON public.indicators(project_id);
CREATE INDEX idx_import_logs_status ON public.import_logs(status);
CREATE INDEX idx_import_logs_created_at ON public.import_logs(created_at);