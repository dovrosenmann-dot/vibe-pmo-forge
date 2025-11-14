import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ExpenseCategory = 
  | "personnel"
  | "travel"
  | "equipment"
  | "supplies"
  | "services"
  | "infrastructure"
  | "overhead"
  | "other";

export interface BudgetAllocation {
  id: string;
  project_id: string;
  workstream_id: string | null;
  category: ExpenseCategory;
  allocated_amount: number;
  spent_amount: number;
  committed_amount: number;
  currency: string;
  fiscal_year: number;
  quarter: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useBudgetAllocations(projectId?: string) {
  const queryClient = useQueryClient();

  const { data: allocations, isLoading } = useQuery({
    queryKey: ["budget-allocations", projectId],
    queryFn: async () => {
      let query = supabase
        .from("budget_allocations")
        .select("*")
        .order("fiscal_year", { ascending: false })
        .order("quarter", { ascending: false });

      if (projectId) {
        query = query.eq("project_id", projectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as BudgetAllocation[];
    },
    enabled: !!projectId,
  });

  const createAllocation = useMutation({
    mutationFn: async (allocation: Omit<BudgetAllocation, "id" | "created_at" | "updated_at" | "spent_amount" | "committed_amount">) => {
      const { data, error } = await supabase
        .from("budget_allocations")
        .insert(allocation)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-allocations"] });
      toast.success("Alocação de orçamento criada com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao criar alocação: " + error.message);
    },
  });

  const updateAllocation = useMutation({
    mutationFn: async ({ id, ...allocation }: Partial<BudgetAllocation> & { id: string }) => {
      const { data, error } = await supabase
        .from("budget_allocations")
        .update(allocation)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-allocations"] });
      toast.success("Alocação atualizada com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar alocação: " + error.message);
    },
  });

  const deleteAllocation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("budget_allocations")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-allocations"] });
      toast.success("Alocação removida com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao remover alocação: " + error.message);
    },
  });

  return {
    allocations,
    isLoading,
    createAllocation,
    updateAllocation,
    deleteAllocation,
  };
}
