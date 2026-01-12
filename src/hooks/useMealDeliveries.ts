import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MealDeliveryWithRelations {
  id: string;
  project_id: string;
  item_name: string;
  planned_qty: number;
  delivered_qty: number;
  unit: string;
  delivery_date_planned: string | null;
  delivery_date_actual: string | null;
  location: string | null;
  status: string;
  workstream_id: string | null;
  supplier_id: string | null;
  contract_id: string | null;
  beneficiary_group: string | null;
  notes: string | null;
  evidence_files: any;
  salesforce_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  supplier: { id: string; name: string } | null;
  contract: { id: string; contract_number: string } | null;
}

export function useMealDeliveries(projectId?: string, filters?: any) {
  return useQuery({
    queryKey: ["meal-deliveries", projectId, filters],
    queryFn: async () => {
      let query = supabase
        .from("meal_deliveries")
        .select(`
          *,
          supplier:suppliers(id, name),
          contract:supplier_contracts(id, contract_number)
        `)
        .order("delivery_date_planned", { ascending: false });

      if (projectId) {
        query = query.eq("project_id", projectId);
      }

    if (filters?.workstreamId && filters.workstreamId !== "all") {
      query = query.eq("workstream_id", filters.workstreamId);
    }

    if (filters?.status && filters.status !== "all") {
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
      return data as MealDeliveryWithRelations[];
    },
    enabled: !!projectId,
  });
}
