import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SupplierPerformanceMetrics {
  deliveryScore: number;
  paymentScore: number;
  overallScore: number;
  totalDeliveries: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  deliveryRate: number;
  totalTransactions: number;
  approvedTransactions: number;
  pendingTransactions: number;
  rejectedTransactions: number;
  approvalRate: number;
  averageApprovalDays: number;
  totalContractValue: number;
  totalSpent: number;
  executionRate: number;
}

export function useSupplierPerformance(supplierId: string | undefined) {
  return useQuery({
    queryKey: ["supplier_performance", supplierId],
    enabled: !!supplierId,
    queryFn: async () => {
      if (!supplierId) return null;

      // Fetch deliveries
      const { data: deliveries, error: deliveriesError } = await supabase
        .from("meal_deliveries")
        .select("id, delivery_date_planned, delivery_date_actual, status, delivered_qty, planned_qty")
        .eq("supplier_id", supplierId);

      if (deliveriesError) throw deliveriesError;

      // Fetch transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from("financial_transactions")
        .select("id, transaction_date, approval_status, approved_at, amount, created_at")
        .eq("supplier_id", supplierId);

      if (transactionsError) throw transactionsError;

      // Fetch contracts
      const { data: contracts, error: contractsError } = await supabase
        .from("supplier_contracts")
        .select("id, total_value, status")
        .eq("supplier_id", supplierId);

      if (contractsError) throw contractsError;

      // Calculate delivery metrics
      const totalDeliveries = deliveries?.length || 0;
      const deliveredItems = deliveries?.filter(d => d.status === "Delivered") || [];
      const onTimeDeliveries = deliveredItems.filter(d => {
        if (!d.delivery_date_planned || !d.delivery_date_actual) return false;
        return new Date(d.delivery_date_actual) <= new Date(d.delivery_date_planned);
      }).length;
      const lateDeliveries = deliveredItems.length - onTimeDeliveries;
      const deliveryRate = totalDeliveries > 0 
        ? (deliveredItems.length / totalDeliveries) * 100 
        : 0;

      // Calculate delivery score (0-100)
      let deliveryScore = 0;
      if (deliveredItems.length > 0) {
        const onTimeRate = (onTimeDeliveries / deliveredItems.length) * 100;
        deliveryScore = Math.round(onTimeRate * 0.7 + deliveryRate * 0.3);
      }

      // Calculate transaction/payment metrics
      const totalTransactions = transactions?.length || 0;
      const approvedTransactions = transactions?.filter(t => t.approval_status === "approved").length || 0;
      const pendingTransactions = transactions?.filter(t => t.approval_status === "pending").length || 0;
      const rejectedTransactions = transactions?.filter(t => t.approval_status === "rejected").length || 0;
      const approvalRate = totalTransactions > 0 
        ? (approvedTransactions / totalTransactions) * 100 
        : 0;

      // Calculate average approval time in days
      const approvedWithDates = transactions?.filter(t => 
        t.approval_status === "approved" && t.approved_at && t.created_at
      ) || [];
      
      let averageApprovalDays = 0;
      if (approvedWithDates.length > 0) {
        const totalDays = approvedWithDates.reduce((sum, t) => {
          const created = new Date(t.created_at!);
          const approved = new Date(t.approved_at!);
          const diffDays = (approved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
          return sum + diffDays;
        }, 0);
        averageApprovalDays = Math.round(totalDays / approvedWithDates.length * 10) / 10;
      }

      // Calculate payment score (0-100)
      let paymentScore = 0;
      if (totalTransactions > 0) {
        // Higher approval rate = better score
        // Lower rejection rate = better score
        const rejectionPenalty = (rejectedTransactions / totalTransactions) * 30;
        paymentScore = Math.max(0, Math.round(approvalRate - rejectionPenalty));
      }

      // Calculate contract execution metrics
      const totalContractValue = contracts?.reduce((sum, c) => sum + Number(c.total_value), 0) || 0;
      const totalSpent = transactions
        ?.filter(t => t.approval_status === "approved")
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const executionRate = totalContractValue > 0 
        ? (totalSpent / totalContractValue) * 100 
        : 0;

      // Calculate overall score (weighted average)
      const hasDeliveryData = totalDeliveries > 0;
      const hasPaymentData = totalTransactions > 0;
      
      let overallScore = 0;
      if (hasDeliveryData && hasPaymentData) {
        overallScore = Math.round(deliveryScore * 0.6 + paymentScore * 0.4);
      } else if (hasDeliveryData) {
        overallScore = deliveryScore;
      } else if (hasPaymentData) {
        overallScore = paymentScore;
      }

      const metrics: SupplierPerformanceMetrics = {
        deliveryScore,
        paymentScore,
        overallScore,
        totalDeliveries,
        onTimeDeliveries,
        lateDeliveries,
        deliveryRate,
        totalTransactions,
        approvedTransactions,
        pendingTransactions,
        rejectedTransactions,
        approvalRate,
        averageApprovalDays,
        totalContractValue,
        totalSpent,
        executionRate,
      };

      return metrics;
    },
  });
}
