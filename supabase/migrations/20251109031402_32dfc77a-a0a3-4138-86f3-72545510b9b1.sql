-- Create enums for MEAL module
CREATE TYPE meal_delivery_unit AS ENUM ('un', 'kg', 'kit', 'caixa', 'outro');
CREATE TYPE meal_delivery_status AS ENUM ('Planned', 'In-Progress', 'Delivered', 'Blocked');
CREATE TYPE meal_plan_approval_status AS ENUM ('Draft', 'Under Review', 'Approved');
CREATE TYPE beneficiary_type AS ENUM ('Pessoa', 'Família', 'Escola', 'Comunidade', 'Associação');
CREATE TYPE beneficiary_sex AS ENUM ('F', 'M', 'Outro', 'ND');
CREATE TYPE beneficiary_consent_status AS ENUM ('Obtained', 'Pending', 'Not Required');
CREATE TYPE quarterly_report_period AS ENUM ('Q1', 'Q2', 'Q3', 'Q4');
CREATE TYPE quarterly_report_approval_status AS ENUM ('Draft', 'Under Review', 'Approved');
CREATE TYPE quarterly_report_risk_flag AS ENUM ('schedule', 'cost', 'scope', 'compliance', 'quality');
CREATE TYPE lesson_learned_category AS ENUM ('Operação', 'MEAL', 'Financeiro', 'Parcerias', 'Risco', 'Compliance');
CREATE TYPE lesson_learned_applicability AS ENUM ('Projeto', 'Programa', 'Portfólio');
CREATE TYPE lesson_learned_status AS ENUM ('Captured', 'Validated', 'Disseminated', 'Actioned');

-- Table: meal_deliveries (Entregas de Salgados)
CREATE TABLE public.meal_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  workstream_id UUID REFERENCES public.workstreams(id) ON DELETE SET NULL,
  salesforce_id TEXT UNIQUE,
  item_name TEXT NOT NULL,
  planned_qty NUMERIC NOT NULL CHECK (planned_qty >= 0),
  delivered_qty NUMERIC NOT NULL DEFAULT 0 CHECK (delivered_qty >= 0),
  unit meal_delivery_unit NOT NULL DEFAULT 'un',
  delivery_date_planned DATE,
  delivery_date_actual DATE,
  location TEXT,
  beneficiary_group TEXT,
  evidence_files JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  status meal_delivery_status NOT NULL DEFAULT 'Planned',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: meal_plans (Plano de Monitoramento & Avaliação)
CREATE TABLE public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE UNIQUE,
  theory_of_change_link TEXT,
  indicators_json JSONB DEFAULT '[]'::jsonb,
  collection_calendar TEXT,
  data_quality_procedures TEXT,
  responsibilities_raci TEXT,
  approval_status meal_plan_approval_status NOT NULL DEFAULT 'Draft',
  last_review_at DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: beneficiaries (Cadastro de Beneficiários)
CREATE TABLE public.beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  beneficiary_code TEXT NOT NULL,
  type beneficiary_type NOT NULL,
  name_or_label TEXT NOT NULL,
  sex beneficiary_sex,
  age_or_range TEXT,
  vulnerability_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  location TEXT,
  consent_status beneficiary_consent_status NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(project_id, beneficiary_code)
);

-- Table: quarterly_reports (Relatórios Trimestrais de Entregas)
CREATE TABLE public.quarterly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  period quarterly_report_period NOT NULL,
  fiscal_year INTEGER NOT NULL,
  deliveries_summary TEXT,
  indicators_progress_json JSONB DEFAULT '[]'::jsonb,
  finance_linkage_notes TEXT,
  risk_flags quarterly_report_risk_flag[] DEFAULT ARRAY[]::quarterly_report_risk_flag[],
  approval_status quarterly_report_approval_status NOT NULL DEFAULT 'Draft',
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(project_id, period, fiscal_year)
);

-- Table: lessons_learned (Lições Aprendidas)
CREATE TABLE public.lessons_learned (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  category lesson_learned_category NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_link TEXT,
  recommendation TEXT,
  applicability_scope lesson_learned_applicability NOT NULL,
  status lesson_learned_status NOT NULL DEFAULT 'Captured',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all MEAL tables
ALTER TABLE public.meal_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quarterly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons_learned ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meal_deliveries
CREATE POLICY "Allow all for authenticated users" ON public.meal_deliveries
  FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for meal_plans
CREATE POLICY "Allow all for authenticated users" ON public.meal_plans
  FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for beneficiaries
CREATE POLICY "Allow all for authenticated users" ON public.beneficiaries
  FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for quarterly_reports
CREATE POLICY "Allow all for authenticated users" ON public.quarterly_reports
  FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for lessons_learned
CREATE POLICY "Allow all for authenticated users" ON public.lessons_learned
  FOR ALL USING (true) WITH CHECK (true);

-- Add updated_at triggers
CREATE TRIGGER update_meal_deliveries_updated_at
  BEFORE UPDATE ON public.meal_deliveries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at
  BEFORE UPDATE ON public.meal_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_beneficiaries_updated_at
  BEFORE UPDATE ON public.beneficiaries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quarterly_reports_updated_at
  BEFORE UPDATE ON public.quarterly_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lessons_learned_updated_at
  BEFORE UPDATE ON public.lessons_learned
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_meal_deliveries_project_id ON public.meal_deliveries(project_id);
CREATE INDEX idx_meal_deliveries_workstream_id ON public.meal_deliveries(workstream_id);
CREATE INDEX idx_meal_deliveries_salesforce_id ON public.meal_deliveries(salesforce_id);
CREATE INDEX idx_meal_deliveries_status ON public.meal_deliveries(status);
CREATE INDEX idx_meal_deliveries_delivery_date_planned ON public.meal_deliveries(delivery_date_planned);

CREATE INDEX idx_meal_plans_project_id ON public.meal_plans(project_id);
CREATE INDEX idx_meal_plans_approval_status ON public.meal_plans(approval_status);

CREATE INDEX idx_beneficiaries_project_id ON public.beneficiaries(project_id);
CREATE INDEX idx_beneficiaries_beneficiary_code ON public.beneficiaries(beneficiary_code);
CREATE INDEX idx_beneficiaries_type ON public.beneficiaries(type);
CREATE INDEX idx_beneficiaries_consent_status ON public.beneficiaries(consent_status);

CREATE INDEX idx_quarterly_reports_project_id ON public.quarterly_reports(project_id);
CREATE INDEX idx_quarterly_reports_period_year ON public.quarterly_reports(period, fiscal_year);
CREATE INDEX idx_quarterly_reports_approval_status ON public.quarterly_reports(approval_status);

CREATE INDEX idx_lessons_learned_project_id ON public.lessons_learned(project_id);
CREATE INDEX idx_lessons_learned_category ON public.lessons_learned(category);
CREATE INDEX idx_lessons_learned_status ON public.lessons_learned(status);
CREATE INDEX idx_lessons_learned_date ON public.lessons_learned(date);