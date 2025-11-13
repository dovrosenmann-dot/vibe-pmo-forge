import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProjectAccess {
  id: string;
  user_id: string;
  project_id: string;
  created_at: string;
}

export const useProjectAccess = (userId?: string) => {
  const queryClient = useQueryClient();

  const { data: userProjects, isLoading: loadingUserProjects } = useQuery({
    queryKey: ["user-project-access", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("user_project_access")
        .select("*, projects(id, name, code)")
        .eq("user_id", userId);

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: allProjects, isLoading: loadingProjects } = useQuery({
    queryKey: ["all-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, code")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const grantAccess = useMutation({
    mutationFn: async ({ userId, projectId }: { userId: string; projectId: string }) => {
      const { error } = await supabase
        .from("user_project_access")
        .insert({ user_id: userId, project_id: projectId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-project-access"] });
      toast.success("Acesso ao projeto concedido");
    },
    onError: (error: any) => {
      toast.error("Erro ao conceder acesso: " + error.message);
    },
  });

  const revokeAccess = useMutation({
    mutationFn: async ({ userId, projectId }: { userId: string; projectId: string }) => {
      const { error } = await supabase
        .from("user_project_access")
        .delete()
        .eq("user_id", userId)
        .eq("project_id", projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-project-access"] });
      toast.success("Acesso ao projeto revogado");
    },
    onError: (error: any) => {
      toast.error("Erro ao revogar acesso: " + error.message);
    },
  });

  return {
    userProjects,
    allProjects,
    isLoading: loadingUserProjects || loadingProjects,
    grantAccess,
    revokeAccess,
  };
};
