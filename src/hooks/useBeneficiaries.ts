import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type BeneficiaryInsert = Database["public"]["Tables"]["beneficiaries"]["Insert"];
type BeneficiaryUpdate = Database["public"]["Tables"]["beneficiaries"]["Update"];
type BeneficiaryRow = Database["public"]["Tables"]["beneficiaries"]["Row"];

export interface Beneficiary extends BeneficiaryRow {}

export const useBeneficiaries = (projectId: string) => {
  const queryClient = useQueryClient();

  const { data: beneficiaries, isLoading } = useQuery({
    queryKey: ["beneficiaries", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beneficiaries")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Beneficiary[];
    },
    enabled: !!projectId,
  });

  const createBeneficiary = useMutation({
    mutationFn: async (beneficiary: BeneficiaryInsert) => {
      const { data, error } = await supabase
        .from("beneficiaries")
        .insert(beneficiary)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beneficiaries", projectId] });
      toast.success("Beneficiário cadastrado com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao cadastrar beneficiário: " + error.message);
    },
  });

  const updateBeneficiary = useMutation({
    mutationFn: async ({ id, ...beneficiary }: BeneficiaryUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("beneficiaries")
        .update(beneficiary)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beneficiaries", projectId] });
      toast.success("Beneficiário atualizado com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar beneficiário: " + error.message);
    },
  });

  const deleteBeneficiary = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("beneficiaries")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beneficiaries", projectId] });
      toast.success("Beneficiário removido com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao remover beneficiário: " + error.message);
    },
  });

  return {
    beneficiaries,
    isLoading,
    createBeneficiary,
    updateBeneficiary,
    deleteBeneficiary,
  };
};
