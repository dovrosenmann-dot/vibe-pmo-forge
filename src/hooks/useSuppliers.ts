import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { SupplierService, Supplier, SupplierInsert } from "@/services/supplierService";

export type SupplierCategory = "goods" | "services" | "logistics" | "consulting" | "construction" | "equipment" | "other";
export type SupplierStatus = "active" | "inactive" | "blocked" | "pending_approval";
export type { Supplier, SupplierInsert };

export function useSuppliers(projectId?: string) {
  const queryClient = useQueryClient();

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ["suppliers", projectId],
    queryFn: () => SupplierService.getSuppliers(projectId),
  });

  const createSupplier = useMutation({
    mutationFn: (supplier: Omit<SupplierInsert, "id" | "created_at" | "updated_at">) => 
      SupplierService.createSupplier(supplier),
    onMutate: async (newSupplier) => {
      await queryClient.cancelQueries({ queryKey: ["suppliers"] });
      const previousSuppliers = queryClient.getQueryData<Supplier[]>(["suppliers", projectId]);
      
      const optimisticSupplier = { 
        ...newSupplier, 
        id: `temp-${Date.now()}`, 
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      } as unknown as Supplier;
      
      queryClient.setQueryData(["suppliers", projectId], (old: Supplier[] | undefined) => {
        return old ? [optimisticSupplier, ...old] : [optimisticSupplier];
      });
      
      return { previousSuppliers };
    },
    onError: (err, newSupplier, context) => {
      if (context?.previousSuppliers) {
        queryClient.setQueryData(["suppliers", projectId], context.previousSuppliers);
      }
      toast({ title: "Erro ao criar fornecedor", description: err.message, variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onSuccess: () => {
      toast({ title: "Fornecedor criado com sucesso" });
    },
  });

  const updateSupplier = useMutation({
    mutationFn: ({ id, ...updates }: Partial<Supplier> & { id: string }) => 
      SupplierService.updateSupplier(id, updates),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["suppliers"] });
      const previousSuppliers = queryClient.getQueryData<Supplier[]>(["suppliers", projectId]);
      
      queryClient.setQueryData(["suppliers", projectId], (old: Supplier[] | undefined) => {
        if (!old) return old;
        return old.map(supplier => 
          supplier.id === variables.id ? { ...supplier, ...variables } : supplier
        );
      });
      
      return { previousSuppliers };
    },
    onError: (err, newSupplier, context) => {
      if (context?.previousSuppliers) {
        queryClient.setQueryData(["suppliers", projectId], context.previousSuppliers);
      }
      toast({ title: "Erro ao atualizar fornecedor", description: err.message, variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onSuccess: () => {
      toast({ title: "Fornecedor atualizado com sucesso" });
    },
  });

  const deleteSupplier = useMutation({
    mutationFn: (id: string) => SupplierService.deleteSupplier(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["suppliers"] });
      const previousSuppliers = queryClient.getQueryData<Supplier[]>(["suppliers", projectId]);
      
      queryClient.setQueryData(["suppliers", projectId], (old: Supplier[] | undefined) => {
        if (!old) return old;
        return old.filter(supplier => supplier.id !== id);
      });
      
      return { previousSuppliers };
    },
    onError: (err, id, context) => {
      if (context?.previousSuppliers) {
        queryClient.setQueryData(["suppliers", projectId], context.previousSuppliers);
      }
      toast({ title: "Erro ao excluir fornecedor", description: err.message, variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onSuccess: () => {
      toast({ title: "Fornecedor excluído com sucesso" });
    },
  });

  return { suppliers, isLoading, createSupplier, updateSupplier, deleteSupplier };
}
