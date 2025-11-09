import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useMealDeliveries(projectId?: string, filters?: any) {
  return useQuery({
    queryKey: ["meal-deliveries", projectId, filters],
    queryFn: async () => {
      let query = supabase
        .from("meal_deliveries")
        .select("*")
        .order("delivery_date_planned", { ascending: false });

      if (projectId) {
        query = query.eq("project_id", projectId);
      }

      if (filters?.workstreamId) {
        query = query.eq("workstream_id", filters.workstreamId);
      }

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      if (filters?.dateFrom) {
        query = query.gte("delivery_date_planned", filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte("delivery_date_planned", filters.dateTo);
      }

      if (filters?.location) {
        query = query.ilike("location", `%${filters.location}%`);
      }

      if (filters?.beneficiaryGroup) {
        query = query.ilike("beneficiary_group", `%${filters.beneficiaryGroup}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });
}
