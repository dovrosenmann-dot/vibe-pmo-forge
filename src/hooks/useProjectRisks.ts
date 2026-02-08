import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type RiskCategory = "meal" | "suppliers" | "financial" | "beneficiaries" | "operational" | "contextual";
export type RiskProbability = "low" | "medium" | "high";
export type RiskImpact = "low" | "medium" | "high";
export type RiskStatus = "identified" | "mitigating" | "resolved" | "accepted" | "escalated";
export type RiskSource = "manual" | "auto_meal" | "auto_supplier" | "auto_financial";

export interface ProjectRisk {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  category: RiskCategory;
  probability: RiskProbability;
  impact: RiskImpact;
  status: RiskStatus;
  source: RiskSource;
  source_reference_id: string | null;
  source_reference_type: string | null;
  owner: string | null;
  mitigation_plan: string | null;
  contingency_plan: string | null;
  due_date: string | null;
  resolved_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RiskFilters {
  category?: RiskCategory;
  status?: RiskStatus;
  probability?: RiskProbability;
  impact?: RiskImpact;
  source?: RiskSource;
}

export function useProjectRisks(projectId?: string, filters?: RiskFilters) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: risks = [], isLoading } = useQuery({
    queryKey: ["project_risks", projectId, filters],
    queryFn: async () => {
      let query = supabase
        .from("project_risks")
        .select("*")
        .order("created_at", { ascending: false });

      if (projectId) query = query.eq("project_id", projectId);
      if (filters?.category) query = query.eq("category", filters.category);
      if (filters?.status) query = query.eq("status", filters.status);
      if (filters?.probability) query = query.eq("probability", filters.probability);
      if (filters?.impact) query = query.eq("impact", filters.impact);
      if (filters?.source) query = query.eq("source", filters.source);

      const { data, error } = await query;
      if (error) throw error;
      return data as ProjectRisk[];
    },
  });

  const createRisk = useMutation({
    mutationFn: async (risk: Omit<ProjectRisk, "id" | "created_at" | "updated_at" | "resolved_at">) => {
      const { data, error } = await supabase
        .from("project_risks")
        .insert(risk)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project_risks"] });
      toast({ title: "Risco criado com sucesso" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar risco", description: error.message, variant: "destructive" });
    },
  });

  const updateRisk = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProjectRisk> & { id: string }) => {
      const { data, error } = await supabase
        .from("project_risks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project_risks"] });
      toast({ title: "Risco atualizado" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar risco", description: error.message, variant: "destructive" });
    },
  });

  const deleteRisk = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("project_risks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project_risks"] });
      toast({ title: "Risco removido" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao remover risco", description: error.message, variant: "destructive" });
    },
  });

  return { risks, isLoading, createRisk, updateRisk, deleteRisk };
}
