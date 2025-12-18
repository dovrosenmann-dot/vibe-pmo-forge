import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Supplier = Tables<"suppliers">;
export type SupplierInsert = TablesInsert<"suppliers">;
export type SupplierCategory = "goods" | "services" | "logistics" | "consulting" | "construction" | "equipment" | "other";
export type SupplierStatus = "active" | "inactive" | "blocked" | "pending_approval";

export function useSuppliers(projectId?: string) {
  const queryClient = useQueryClient();

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ["suppliers", projectId],
    queryFn: async () => {
      let query = supabase
        .from("suppliers")
        .select("*")
        .order("name");

      if (projectId) {
        query = query.eq("project_id", projectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Supplier[];
    },
  });

  const createSupplier = useMutation({
    mutationFn: async (supplier: Omit<SupplierInsert, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("suppliers")
        .insert(supplier)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast({ title: "Fornecedor criado com sucesso" });
    },
    onError: (error) => {
      toast({ title: "Erro ao criar fornecedor", description: error.message, variant: "destructive" });
    },
  });

  const updateSupplier = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Supplier> & { id: string }) => {
      const { data, error } = await supabase
        .from("suppliers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast({ title: "Fornecedor atualizado com sucesso" });
    },
    onError: (error) => {
      toast({ title: "Erro ao atualizar fornecedor", description: error.message, variant: "destructive" });
    },
  });

  const deleteSupplier = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("suppliers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast({ title: "Fornecedor excluído com sucesso" });
    },
    onError: (error) => {
      toast({ title: "Erro ao excluir fornecedor", description: error.message, variant: "destructive" });
    },
  });

  return { suppliers, isLoading, createSupplier, updateSupplier, deleteSupplier };
}
