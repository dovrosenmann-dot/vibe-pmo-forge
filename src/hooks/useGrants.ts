import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type GrantStatus = "pending" | "approved" | "disbursed" | "completed" | "cancelled";

export interface Grant {
  id: string;
  project_id: string;
  grant_code: string;
  donor_name: string;
  total_amount: number;
  currency: string;
  start_date: string;
  end_date: string;
  status: GrantStatus;
  disbursed_amount: number;
  restrictions: string | null;
  reporting_requirements: string | null;
  created_at: string;
  updated_at: string;
}

export function useGrants(projectId?: string) {
  const queryClient = useQueryClient();

  const { data: grants, isLoading } = useQuery({
    queryKey: ["grants", projectId],
    queryFn: async () => {
      let query = supabase
        .from("grants")
        .select("*")
        .order("start_date", { ascending: false });

      if (projectId) {
        query = query.eq("project_id", projectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Grant[];
    },
    enabled: !!projectId,
  });

  const createGrant = useMutation({
    mutationFn: async (grant: Omit<Grant, "id" | "created_at" | "updated_at" | "disbursed_amount">) => {
      const { data, error } = await supabase
        .from("grants")
        .insert(grant)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grants"] });
      toast.success("Grant criado com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao criar grant: " + error.message);
    },
  });

  const updateGrant = useMutation({
    mutationFn: async ({ id, ...grant }: Partial<Grant> & { id: string }) => {
      const { data, error } = await supabase
        .from("grants")
        .update(grant)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grants"] });
      toast.success("Grant atualizado com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar grant: " + error.message);
    },
  });

  const deleteGrant = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("grants")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grants"] });
      toast.success("Grant removido com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao remover grant: " + error.message);
    },
  });

  return {
    grants,
    isLoading,
    createGrant,
    updateGrant,
    deleteGrant,
  };
}
