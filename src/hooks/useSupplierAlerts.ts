import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AlertConfig {
  contractExpirationDays?: number;
  lowPerformanceThreshold?: number;
}

interface AlertResult {
  success: boolean;
  notificationsCreated: number;
  expiringContracts: number;
  lowPerformanceSuppliers: number;
  usersNotified: number;
}

export function useSupplierAlerts() {
  const checkAlerts = useMutation({
    mutationFn: async (config?: AlertConfig): Promise<AlertResult> => {
      const { data, error } = await supabase.functions.invoke("check-supplier-alerts", {
        body: config || {},
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.notificationsCreated > 0) {
        toast({
          title: "Alertas verificados",
          description: `${data.notificationsCreated} alerta(s) criado(s): ${data.expiringContracts} contrato(s) próximo(s) do vencimento, ${data.lowPerformanceSuppliers} fornecedor(es) com baixo desempenho.`,
        });
      } else {
        toast({
          title: "Nenhum alerta novo",
          description: "Não foram encontrados contratos próximos do vencimento ou fornecedores com baixo desempenho.",
        });
      }
    },
    onError: (error: any) => {
      console.error("Error checking alerts:", error);
      toast({
        title: "Erro ao verificar alertas",
        description: error.message || "Ocorreu um erro ao verificar os alertas.",
        variant: "destructive",
      });
    },
  });

  return {
    checkAlerts: checkAlerts.mutate,
    isChecking: checkAlerts.isPending,
  };
}
