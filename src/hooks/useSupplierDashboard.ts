import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SupplierSummary {
  id: string;
  name: string;
  category: string;
  status: string;
  rating: number | null;
  totalContracts: number;
  activeContracts: number;
  totalContractValue: number;
  totalTransactions: number;
  totalSpent: number;
  totalDeliveries: number;
  deliveredQty: number;
}

export function useSupplierDashboard(projectId?: string) {
  const { data, isLoading } = useQuery({
    queryKey: ["supplier_dashboard", projectId],
    queryFn: async () => {
      // Fetch suppliers
      let suppliersQuery = supabase
        .from("suppliers")
        .select("*");
      
      if (projectId) {
        suppliersQuery = suppliersQuery.eq("project_id", projectId);
      }
      
      const { data: suppliers, error: suppliersError } = await suppliersQuery;
      if (suppliersError) throw suppliersError;

      // Fetch contracts
      let contractsQuery = supabase
        .from("supplier_contracts")
        .select("supplier_id, status, total_value");
      
      if (projectId) {
        contractsQuery = contractsQuery.eq("project_id", projectId);
      }
      
      const { data: contracts, error: contractsError } = await contractsQuery;
      if (contractsError) throw contractsError;

      // Fetch transactions linked to suppliers
      let transactionsQuery = supabase
        .from("financial_transactions")
        .select("supplier_id, amount, approval_status");
      
      if (projectId) {
        transactionsQuery = transactionsQuery.eq("project_id", projectId);
      }
      
      const { data: transactions, error: transactionsError } = await transactionsQuery;
      if (transactionsError) throw transactionsError;

      // Fetch deliveries linked to suppliers
      let deliveriesQuery = supabase
        .from("meal_deliveries")
        .select("supplier_id, delivered_qty, status");
      
      if (projectId) {
        deliveriesQuery = deliveriesQuery.eq("project_id", projectId);
      }
      
      const { data: deliveries, error: deliveriesError } = await deliveriesQuery;
      if (deliveriesError) throw deliveriesError;

      // Aggregate data per supplier
      const summaries: SupplierSummary[] = (suppliers || []).map((supplier) => {
        const supplierContracts = (contracts || []).filter(c => c.supplier_id === supplier.id);
        const supplierTransactions = (transactions || []).filter(t => t.supplier_id === supplier.id);
        const supplierDeliveries = (deliveries || []).filter(d => d.supplier_id === supplier.id);

        return {
          id: supplier.id,
          name: supplier.name,
          category: supplier.category,
          status: supplier.status,
          rating: supplier.rating,
          totalContracts: supplierContracts.length,
          activeContracts: supplierContracts.filter(c => c.status === "active").length,
          totalContractValue: supplierContracts.reduce((sum, c) => sum + Number(c.total_value), 0),
          totalTransactions: supplierTransactions.length,
          totalSpent: supplierTransactions
            .filter(t => t.approval_status === "approved")
            .reduce((sum, t) => sum + Number(t.amount), 0),
          totalDeliveries: supplierDeliveries.length,
          deliveredQty: supplierDeliveries
            .filter(d => d.status === "Delivered")
            .reduce((sum, d) => sum + Number(d.delivered_qty), 0),
        };
      });

      // Calculate totals
      const totals = {
        totalSuppliers: suppliers?.length || 0,
        activeSuppliers: suppliers?.filter(s => s.status === "active").length || 0,
        totalContractValue: summaries.reduce((sum, s) => sum + s.totalContractValue, 0),
        totalSpent: summaries.reduce((sum, s) => sum + s.totalSpent, 0),
        totalDeliveries: summaries.reduce((sum, s) => sum + s.totalDeliveries, 0),
      };

      return { summaries, totals };
    },
  });

  return { 
    summaries: data?.summaries || [], 
    totals: data?.totals || { totalSuppliers: 0, activeSuppliers: 0, totalContractValue: 0, totalSpent: 0, totalDeliveries: 0 },
    isLoading 
  };
}
