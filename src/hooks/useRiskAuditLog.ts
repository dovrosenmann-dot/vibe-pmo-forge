import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RiskAuditLog {
  id: string;
  risk_id: string;
  previous_status: string | null;
  new_status: string;
  previous_probability: string | null;
  new_probability: string | null;
  previous_impact: string | null;
  new_impact: string | null;
  changed_by: string | null;
  change_reason: string | null;
  metadata: {
    title?: string;
    category?: string;
    event?: string;
  };
  created_at: string;
  changed_by_profile?: {
    full_name: string | null;
  };
}

export function useRiskAuditLog(riskId?: string) {
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ["risk-audit-log", riskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("risk_audit_log")
        .select("*")
        .eq("risk_id", riskId!)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const userIds = [...new Set(data.filter(log => log.changed_by).map(log => log.changed_by))];

      let profilesMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", userIds);

        if (profiles) {
          profilesMap = profiles.reduce((acc, p) => {
            acc[p.user_id] = p.full_name || "Usuário";
            return acc;
          }, {} as Record<string, string>);
        }
      }

      return data.map(log => ({
        ...log,
        changed_by_profile: log.changed_by ? { full_name: profilesMap[log.changed_by] || null } : undefined,
      })) as RiskAuditLog[];
    },
    enabled: !!riskId,
  });

  return { auditLogs, isLoading };
}
