import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useMealPlan(projectId?: string) {
  const queryClient = useQueryClient();

  const { data: mealPlan, isLoading } = useQuery({
    queryKey: ["meal-plan", projectId],
    queryFn: async () => {
      if (!projectId) return null;
      
      const { data, error } = await supabase
        .from("meal_plans")
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  const createOrUpdatePlan = useMutation({
    mutationFn: async (planData: any) => {
      if (!projectId) throw new Error("Project ID is required");

      if (mealPlan?.id) {
        // Update existing plan
        const { data, error } = await supabase
          .from("meal_plans")
          .update({
            ...planData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", mealPlan.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new plan
        const { data, error } = await supabase
          .from("meal_plans")
          .insert({
            project_id: projectId,
            ...planData,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meal-plan", projectId] });
      toast.success(mealPlan ? "Plano atualizado com sucesso!" : "Plano criado com sucesso!");
    },
    onError: (error) => {
      console.error("Error saving meal plan:", error);
      toast.error("Erro ao salvar plano de M&A");
    },
  });

  return {
    mealPlan,
    isLoading,
    createOrUpdatePlan,
  };
}
