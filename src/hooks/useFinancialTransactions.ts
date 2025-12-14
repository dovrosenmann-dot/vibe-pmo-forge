import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ExpenseCategory } from "./useBudgetAllocations";

export type TransactionType = "income" | "expense" | "transfer" | "adjustment";
export type TransactionApprovalStatus = "pending" | "approved" | "rejected";

export interface FinancialTransaction {
  id: string;
  project_id: string;
  grant_id: string | null;
  workstream_id: string | null;
  transaction_type: TransactionType;
  category: ExpenseCategory | null;
  amount: number;
  currency: string;
  transaction_date: string;
  description: string;
  reference_number: string | null;
  invoice_id: string | null;
  expense_id: string | null;
  created_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  approval_status: TransactionApprovalStatus;
  rejection_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useFinancialTransactions(projectId?: string, filters?: {
  type?: TransactionType;
  dateFrom?: string;
  dateTo?: string;
  approvalStatus?: TransactionApprovalStatus;
}) {
  const queryClient = useQueryClient();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["financial-transactions", projectId, filters],
    queryFn: async () => {
      let query = supabase
        .from("financial_transactions")
        .select("*")
        .order("transaction_date", { ascending: false });

      if (projectId) {
        query = query.eq("project_id", projectId);
      }

      if (filters?.type) {
        query = query.eq("transaction_type", filters.type);
      }

      if (filters?.dateFrom) {
        query = query.gte("transaction_date", filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte("transaction_date", filters.dateTo);
      }

      if (filters?.approvalStatus) {
        query = query.eq("approval_status", filters.approvalStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as FinancialTransaction[];
    },
    enabled: !!projectId,
  });

  const createTransaction = useMutation({
    mutationFn: async (transaction: Omit<FinancialTransaction, "id" | "created_at" | "updated_at" | "created_by" | "approved_by" | "approved_at" | "approval_status" | "rejection_reason">) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("financial_transactions")
        .insert({
          ...transaction,
          created_by: user?.id,
          approval_status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-transactions"] });
      toast.success("Transação registrada com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao registrar transação: " + error.message);
    },
  });

  const updateTransaction = useMutation({
    mutationFn: async ({ id, ...transaction }: Partial<FinancialTransaction> & { id: string }) => {
      const { data, error } = await supabase
        .from("financial_transactions")
        .update(transaction)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-transactions"] });
      toast.success("Transação atualizada com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar transação: " + error.message);
    },
  });

  const approveTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("financial_transactions")
        .update({
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          approval_status: "approved",
          rejection_reason: null,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-transactions"] });
      toast.success("Transação aprovada com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao aprovar transação: " + error.message);
    },
  });

  const rejectTransaction = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("financial_transactions")
        .update({
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          approval_status: "rejected",
          rejection_reason: reason,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-transactions"] });
      toast.success("Transação rejeitada");
    },
    onError: (error) => {
      toast.error("Erro ao rejeitar transação: " + error.message);
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("financial_transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-transactions"] });
      toast.success("Transação removida com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao remover transação: " + error.message);
    },
  });

  return {
    transactions,
    isLoading,
    createTransaction,
    updateTransaction,
    approveTransaction,
    rejectTransaction,
    deleteTransaction,
  };
}
