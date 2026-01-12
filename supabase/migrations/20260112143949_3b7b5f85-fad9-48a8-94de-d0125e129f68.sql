-- Create storage bucket for supplier documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('supplier-documents', 'supplier-documents', false);

-- Create table to track uploaded documents
CREATE TABLE public.supplier_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES public.supplier_contracts(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  document_type TEXT NOT NULL DEFAULT 'other',
  description TEXT,
  uploaded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT supplier_or_contract CHECK (supplier_id IS NOT NULL OR contract_id IS NOT NULL)
);

-- Enable RLS
ALTER TABLE public.supplier_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for supplier_documents
CREATE POLICY "Users can view supplier documents" ON public.supplier_documents
  FOR SELECT USING (true);

CREATE POLICY "Users can insert supplier documents" ON public.supplier_documents
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update supplier documents" ON public.supplier_documents
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete supplier documents" ON public.supplier_documents
  FOR DELETE USING (true);

-- Storage RLS policies
CREATE POLICY "Authenticated users can upload supplier documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'supplier-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view supplier documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'supplier-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete supplier documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'supplier-documents' AND auth.role() = 'authenticated');

-- Trigger for updated_at
CREATE TRIGGER update_supplier_documents_updated_at
  BEFORE UPDATE ON public.supplier_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();