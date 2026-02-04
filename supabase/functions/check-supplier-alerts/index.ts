import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AlertConfig {
  contractExpirationDays?: number; // Days before expiration to alert (default: 30)
  lowPerformanceThreshold?: number; // Rating threshold for low performance (default: 2)
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse configuration from request body (optional)
    let config: AlertConfig = {};
    try {
      config = await req.json();
    } catch {
      // Use defaults if no body provided
    }

    const expirationDays = config.contractExpirationDays ?? 30;
    const lowPerformanceThreshold = config.lowPerformanceThreshold ?? 2;

    // Calculate the date threshold for expiring contracts
    const today = new Date();
    const expirationThreshold = new Date(today);
    expirationThreshold.setDate(expirationThreshold.getDate() + expirationDays);
    const expirationDateStr = expirationThreshold.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    // Find contracts expiring soon (active contracts ending within threshold)
    const { data: expiringContracts, error: contractsError } = await supabase
      .from("supplier_contracts")
      .select(`
        id,
        contract_number,
        end_date,
        total_value,
        currency,
        supplier_id,
        project_id,
        suppliers!inner (
          id,
          name
        ),
        projects:project_id (
          id,
          code,
          name
        )
      `)
      .eq("status", "active")
      .gte("end_date", todayStr)
      .lte("end_date", expirationDateStr);

    if (contractsError) {
      console.error("Error fetching expiring contracts:", contractsError);
      throw contractsError;
    }

    // Find suppliers with low performance
    const { data: lowPerformanceSuppliers, error: suppliersError } = await supabase
      .from("suppliers")
      .select(`
        id,
        name,
        rating,
        project_id,
        projects:project_id (
          id,
          code,
          name
        )
      `)
      .eq("status", "active")
      .not("rating", "is", null)
      .lte("rating", lowPerformanceThreshold);

    if (suppliersError) {
      console.error("Error fetching low performance suppliers:", suppliersError);
      throw suppliersError;
    }

    // Get all admin and finance users to notify
    const { data: adminFinanceRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .in("role", ["admin", "finance"]);

    if (rolesError) {
      console.error("Error fetching user roles:", rolesError);
      throw rolesError;
    }

    const userIds = [...new Set(adminFinanceRoles?.map(r => r.user_id) || [])];

    if (userIds.length === 0) {
      console.log("No admin/finance users to notify");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No users to notify",
          expiringContracts: expiringContracts?.length || 0,
          lowPerformanceSuppliers: lowPerformanceSuppliers?.length || 0
        }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const notifications: any[] = [];
    const now = new Date().toISOString();

    // Create notifications for expiring contracts
    for (const contract of expiringContracts || []) {
      const daysUntilExpiration = Math.ceil(
        (new Date(contract.end_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      const supplierName = (contract.suppliers as any)?.name || "Fornecedor";
      const projectInfo = contract.projects as any;
      const projectLabel = projectInfo ? `${projectInfo.code} - ${projectInfo.name}` : "";

      for (const userId of userIds) {
        // Check if notification already exists for this contract (avoid duplicates)
        const { data: existing } = await supabase
          .from("notifications")
          .select("id")
          .eq("user_id", userId)
          .eq("reference_id", contract.id)
          .eq("type", "contract_expiring")
          .is("read_at", null)
          .single();

        if (!existing) {
          notifications.push({
            user_id: userId,
            type: "contract_expiring",
            title: "Contrato Próximo do Vencimento",
            message: `O contrato ${contract.contract_number} com ${supplierName} vence em ${daysUntilExpiration} dias (${contract.end_date}). Projeto: ${projectLabel}`,
            reference_id: contract.id,
            reference_type: "supplier_contract",
            created_at: now,
          });
        }
      }
    }

    // Create notifications for low performance suppliers
    for (const supplier of lowPerformanceSuppliers || []) {
      const projectInfo = supplier.projects as any;
      const projectLabel = projectInfo ? `${projectInfo.code} - ${projectInfo.name}` : "";

      for (const userId of userIds) {
        // Check if notification already exists for this supplier (avoid duplicates)
        const { data: existing } = await supabase
          .from("notifications")
          .select("id")
          .eq("user_id", userId)
          .eq("reference_id", supplier.id)
          .eq("type", "supplier_low_performance")
          .is("read_at", null)
          .single();

        if (!existing) {
          notifications.push({
            user_id: userId,
            type: "supplier_low_performance",
            title: "Fornecedor com Baixo Desempenho",
            message: `O fornecedor ${supplier.name} possui avaliação de ${supplier.rating} estrela(s). Projeto: ${projectLabel}. Considere revisar a parceria.`,
            reference_id: supplier.id,
            reference_type: "supplier",
            created_at: now,
          });
        }
      }
    }

    // Insert all notifications
    if (notifications.length > 0) {
      const { error: insertError } = await supabase
        .from("notifications")
        .insert(notifications);

      if (insertError) {
        console.error("Error inserting notifications:", insertError);
        throw insertError;
      }
    }

    console.log(`Created ${notifications.length} notifications`);
    console.log(`Expiring contracts: ${expiringContracts?.length || 0}`);
    console.log(`Low performance suppliers: ${lowPerformanceSuppliers?.length || 0}`);

    return new Response(
      JSON.stringify({
        success: true,
        notificationsCreated: notifications.length,
        expiringContracts: expiringContracts?.length || 0,
        lowPerformanceSuppliers: lowPerformanceSuppliers?.length || 0,
        usersNotified: userIds.length,
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in check-supplier-alerts:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
});
