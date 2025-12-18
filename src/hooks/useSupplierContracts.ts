import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Tables, TablesInsert } from "@/integrations/supabase/types";

export type SupplierContract = Tables<"supplier_contracts">;
export type SupplierContractInsert = TablesInsert<"supplier_contracts">;
export type ContractStatus = "draft" | "active" | "completed" | "cancelled" | "expired";

export function useSupplierContracts(projectId?: string, supplierId?: string) {
  const queryClient = useQueryClient();

  const { data: contracts, isLoading } = useQuery({
    queryKey: ["supplier_contracts", projectId, supplierId],
    queryFn: async () => {
      let query = supabase
        .from("supplier_contracts")
        .select(`
          *,
          supplier:suppliers(id, name, category)
        `)
        .order("created_at", { ascending: false });

      if (projectId) {
        query = query.eq("project_id", projectId);
      }
      if (supplierId) {
        query = query.eq("supplier_id", supplierId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createContract = useMutation({
    mutationFn: async (contract: Omit<SupplierContractInsert, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("supplier_contracts")
        .insert(contract)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier_contracts"] });
      toast({ title: "Contrato criado com sucesso" });
    },
    onError: (error) => {
      toast({ title: "Erro ao criar contrato", description: error.message, variant: "destructive" });
    },
  });

  const updateContract = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SupplierContract> & { id: string }) => {
      const { data, error } = await supabase
        .from("supplier_contracts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier_contracts"] });
      toast({ title: "Contrato atualizado com sucesso" });
    },
    onError: (error) => {
      toast({ title: "Erro ao atualizar contrato", description: error.message, variant: "destructive" });
    },
  });

  const deleteContract = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("supplier_contracts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier_contracts"] });
      toast({ title: "Contrato excluído com sucesso" });
    },
    onError: (error) => {
      toast({ title: "Erro ao excluir contrato", description: error.message, variant: "destructive" });
    },
  });

  return { contracts, isLoading, createContract, updateContract, deleteContract };
}
