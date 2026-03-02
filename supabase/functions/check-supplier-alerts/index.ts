import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AlertConfig {
  contractExpirationDays?: number;
  lowPerformanceThreshold?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Authentication check ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const userId = claimsData.claims.sub;

    // Verify caller is admin or finance
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .in("role", ["admin", "finance"]);

    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: "Forbidden: admin or finance role required" }), {
        status: 403, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // --- Business logic (unchanged) ---
    let config: AlertConfig = {};
    try {
      config = await req.json();
    } catch {
      // Use defaults if no body provided
    }

    const expirationDays = config.contractExpirationDays ?? 30;
    const lowPerformanceThreshold = config.lowPerformanceThreshold ?? 2;

    const today = new Date();
    const expirationThreshold = new Date(today);
    expirationThreshold.setDate(expirationThreshold.getDate() + expirationDays);
    const expirationDateStr = expirationThreshold.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    const { data: expiringContracts, error: contractsError } = await supabase
      .from("supplier_contracts")
      .select(`
        id, contract_number, end_date, total_value, currency, supplier_id, project_id,
        suppliers!inner ( id, name ),
        projects:project_id ( id, code, name )
      `)
      .eq("status", "active")
      .gte("end_date", todayStr)
      .lte("end_date", expirationDateStr);

    if (contractsError) throw contractsError;

    const { data: lowPerformanceSuppliers, error: suppliersError } = await supabase
      .from("suppliers")
      .select(`id, name, rating, project_id, projects:project_id ( id, code, name )`)
      .eq("status", "active")
      .not("rating", "is", null)
      .lte("rating", lowPerformanceThreshold);

    if (suppliersError) throw suppliersError;

    const { data: adminFinanceRoles, error: rolesError2 } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .in("role", ["admin", "finance"]);

    if (rolesError2) throw rolesError2;

    const userIds = [...new Set(adminFinanceRoles?.map(r => r.user_id) || [])];

    if (userIds.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No users to notify", expiringContracts: expiringContracts?.length || 0, lowPerformanceSuppliers: lowPerformanceSuppliers?.length || 0 }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const notifications: any[] = [];
    const now = new Date().toISOString();

    for (const contract of expiringContracts || []) {
      const daysUntilExpiration = Math.ceil(
        (new Date(contract.end_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      const supplierName = (contract.suppliers as any)?.name || "Fornecedor";
      const projectInfo = contract.projects as any;
      const projectLabel = projectInfo ? `${projectInfo.code} - ${projectInfo.name}` : "";

      for (const uid of userIds) {
        const { data: existing } = await supabase.from("notifications").select("id").eq("user_id", uid).eq("reference_id", contract.id).eq("type", "contract_expiring").is("read_at", null).single();
        if (!existing) {
          notifications.push({ user_id: uid, type: "contract_expiring", title: "Contrato Próximo do Vencimento", message: `O contrato ${contract.contract_number} com ${supplierName} vence em ${daysUntilExpiration} dias (${contract.end_date}). Projeto: ${projectLabel}`, reference_id: contract.id, reference_type: "supplier_contract", created_at: now });
        }
      }
    }

    for (const supplier of lowPerformanceSuppliers || []) {
      const projectInfo = supplier.projects as any;
      const projectLabel = projectInfo ? `${projectInfo.code} - ${projectInfo.name}` : "";
      for (const uid of userIds) {
        const { data: existing } = await supabase.from("notifications").select("id").eq("user_id", uid).eq("reference_id", supplier.id).eq("type", "supplier_low_performance").is("read_at", null).single();
        if (!existing) {
          notifications.push({ user_id: uid, type: "supplier_low_performance", title: "Fornecedor com Baixo Desempenho", message: `O fornecedor ${supplier.name} possui avaliação de ${supplier.rating} estrela(s). Projeto: ${projectLabel}. Considere revisar a parceria.`, reference_id: supplier.id, reference_type: "supplier", created_at: now });
        }
      }
    }

    if (notifications.length > 0) {
      const { error: insertError } = await supabase.from("notifications").insert(notifications);
      if (insertError) throw insertError;
    }

    return new Response(
      JSON.stringify({ success: true, notificationsCreated: notifications.length, expiringContracts: expiringContracts?.length || 0, lowPerformanceSuppliers: lowPerformanceSuppliers?.length || 0, usersNotified: userIds.length }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in check-supplier-alerts:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
});
