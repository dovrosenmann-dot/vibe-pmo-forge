import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Workstream {
  id: string;
  project_id: string;
  name: string;
  category: string | null;
  owner: string | null;
  progress: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useWorkstreams(projectId?: string) {
  return useQuery({
    queryKey: ["workstreams", projectId],
    queryFn: async () => {
      let query = supabase
        .from("workstreams")
        .select("*")
        .order("name");

      if (projectId) {
        query = query.eq("project_id", projectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Workstream[];
    },
    enabled: !!projectId,
  });
}
