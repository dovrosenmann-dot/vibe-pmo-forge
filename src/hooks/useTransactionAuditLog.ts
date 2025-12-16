import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TransactionApprovalStatus } from "./useFinancialTransactions";

export interface TransactionAuditLog {
  id: string;
  transaction_id: string;
  previous_status: TransactionApprovalStatus | null;
  new_status: TransactionApprovalStatus;
  changed_by: string | null;
  change_reason: string | null;
  metadata: {
    amount?: number;
    description?: string;
    transaction_type?: string;
    event?: string;
  };
  created_at: string;
  changed_by_profile?: {
    full_name: string | null;
  };
}

export function useTransactionAuditLog(transactionId?: string) {
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ["transaction-audit-log", transactionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transaction_audit_log")
        .select("*")
        .eq("transaction_id", transactionId!)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profile names for changed_by users
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
      })) as TransactionAuditLog[];
    },
    enabled: !!transactionId,
  });

  return {
    auditLogs,
    isLoading,
  };
}
