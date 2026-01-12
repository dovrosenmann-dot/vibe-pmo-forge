import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface SupplierDocument {
  id: string;
  project_id: string;
  supplier_id: string | null;
  contract_id: string | null;
  file_name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  document_type: string;
  description: string | null;
  uploaded_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export type DocumentType = "contract" | "invoice" | "proposal" | "certificate" | "report" | "other";

export const documentTypeLabels: Record<DocumentType, string> = {
  contract: "Contrato",
  invoice: "Fatura/NF",
  proposal: "Proposta",
  certificate: "Certificado",
  report: "Relatório",
  other: "Outro",
};

export function useSupplierDocuments(projectId?: string, supplierId?: string, contractId?: string) {
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ["supplier_documents", projectId, supplierId, contractId],
    queryFn: async () => {
      let query = supabase
        .from("supplier_documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (projectId) {
        query = query.eq("project_id", projectId);
      }
      if (supplierId) {
        query = query.eq("supplier_id", supplierId);
      }
      if (contractId) {
        query = query.eq("contract_id", contractId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SupplierDocument[];
    },
    enabled: !!projectId,
  });

  const uploadDocument = useMutation({
    mutationFn: async ({
      file,
      projectId,
      supplierId,
      contractId,
      documentType,
      description,
    }: {
      file: File;
      projectId: string;
      supplierId?: string;
      contractId?: string;
      documentType: string;
      description?: string;
    }) => {
      // Generate unique file path
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${projectId}/${supplierId || contractId}/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from("supplier-documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create document record
      const { data, error } = await supabase
        .from("supplier_documents")
        .insert({
          project_id: projectId,
          supplier_id: supplierId || null,
          contract_id: contractId || null,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          document_type: documentType,
          description: description || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier_documents"] });
      toast({ title: "Documento enviado com sucesso" });
    },
    onError: (error) => {
      toast({ title: "Erro ao enviar documento", description: error.message, variant: "destructive" });
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async (document: SupplierDocument) => {
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from("supplier-documents")
        .remove([document.file_path]);

      if (storageError) throw storageError;

      // Delete document record
      const { error } = await supabase
        .from("supplier_documents")
        .delete()
        .eq("id", document.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier_documents"] });
      toast({ title: "Documento excluído com sucesso" });
    },
    onError: (error) => {
      toast({ title: "Erro ao excluir documento", description: error.message, variant: "destructive" });
    },
  });

  const getDocumentUrl = async (filePath: string) => {
    const { data } = await supabase.storage
      .from("supplier-documents")
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    return data?.signedUrl;
  };

  return { documents, isLoading, uploadDocument, deleteDocument, getDocumentUrl };
}
