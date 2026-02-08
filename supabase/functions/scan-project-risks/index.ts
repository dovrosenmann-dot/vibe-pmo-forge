import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { project_id } = await req.json();
    if (!project_id) {
      return new Response(JSON.stringify({ error: "project_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let created = 0;

    // 1. MEAL: Indicators below 50% of target
    const { data: indicators } = await supabase
      .from("indicators")
      .select("id, name, code, current_value, target")
      .eq("project_id", project_id)
      .not("target", "is", null)
      .not("current_value", "is", null);

    for (const ind of indicators || []) {
      if (ind.target > 0 && ind.current_value !== null) {
        const pct = (ind.current_value / ind.target) * 100;
        if (pct < 50) {
          // Check if risk already exists for this indicator
          const { data: existing } = await supabase
            .from("project_risks")
            .select("id")
            .eq("project_id", project_id)
            .eq("source", "auto_meal")
            .eq("source_reference_id", ind.id)
            .eq("status", "identified")
            .limit(1);

          if (!existing || existing.length === 0) {
            await supabase.from("project_risks").insert({
              project_id,
              title: `Indicador ${ind.code} abaixo de 50% da meta`,
              description: `O indicador "${ind.name}" está em ${pct.toFixed(0)}% da meta (${ind.current_value}/${ind.target}).`,
              category: "meal",
              probability: pct < 25 ? "high" : "medium",
              impact: "high",
              source: "auto_meal",
              source_reference_id: ind.id,
              source_reference_type: "indicator",
            });
            created++;
          }
        }
      }
    }

    // 2. Suppliers: Low rating (≤ 2)
    const { data: lowSuppliers } = await supabase
      .from("suppliers")
      .select("id, name, rating")
      .eq("project_id", project_id)
      .eq("status", "active")
      .lte("rating", 2)
      .not("rating", "is", null);

    for (const sup of lowSuppliers || []) {
      const { data: existing } = await supabase
        .from("project_risks")
        .select("id")
        .eq("project_id", project_id)
        .eq("source", "auto_supplier")
        .eq("source_reference_id", sup.id)
        .neq("status", "resolved")
        .limit(1);

      if (!existing || existing.length === 0) {
        await supabase.from("project_risks").insert({
          project_id,
          title: `Fornecedor "${sup.name}" com rating baixo (${sup.rating}★)`,
          description: `O fornecedor tem avaliação de apenas ${sup.rating} estrela(s), indicando problemas de performance.`,
          category: "suppliers",
          probability: sup.rating! <= 1 ? "high" : "medium",
          impact: "medium",
          source: "auto_supplier",
          source_reference_id: sup.id,
          source_reference_type: "supplier",
        });
        created++;
      }
    }

    // 3. Suppliers: Contracts expiring within 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const { data: expiringContracts } = await supabase
      .from("supplier_contracts")
      .select("id, contract_number, end_date, supplier_id, suppliers(name)")
      .eq("project_id", project_id)
      .eq("status", "active")
      .lte("end_date", thirtyDaysFromNow.toISOString().split("T")[0]);

    for (const contract of expiringContracts || []) {
      const { data: existing } = await supabase
        .from("project_risks")
        .select("id")
        .eq("project_id", project_id)
        .eq("source", "auto_supplier")
        .eq("source_reference_id", contract.id)
        .neq("status", "resolved")
        .limit(1);

      if (!existing || existing.length === 0) {
        const supplierName = (contract as any).suppliers?.name || "Desconhecido";
        await supabase.from("project_risks").insert({
          project_id,
          title: `Contrato ${contract.contract_number} expirando em breve`,
          description: `O contrato com "${supplierName}" vence em ${contract.end_date}. Necessário renovar ou replanejar.`,
          category: "suppliers",
          probability: "high",
          impact: "medium",
          source: "auto_supplier",
          source_reference_id: contract.id,
          source_reference_type: "contract",
        });
        created++;
      }
    }

    // 4. Financial: Budget overruns (spent > 90% of allocated)
    const { data: allocations } = await supabase
      .from("budget_allocations")
      .select("id, category, allocated_amount, spent_amount, fiscal_year")
      .eq("project_id", project_id)
      .gt("allocated_amount", 0);

    for (const alloc of allocations || []) {
      const pct = (alloc.spent_amount / alloc.allocated_amount) * 100;
      if (pct > 90) {
        const { data: existing } = await supabase
          .from("project_risks")
          .select("id")
          .eq("project_id", project_id)
          .eq("source", "auto_financial")
          .eq("source_reference_id", alloc.id)
          .neq("status", "resolved")
          .limit(1);

        if (!existing || existing.length === 0) {
          await supabase.from("project_risks").insert({
            project_id,
            title: `Orçamento ${alloc.category} (${alloc.fiscal_year}) acima de 90%`,
            description: `O gasto da categoria "${alloc.category}" atingiu ${pct.toFixed(0)}% do alocado ($${alloc.spent_amount} / $${alloc.allocated_amount}).`,
            category: "financial",
            probability: pct > 100 ? "high" : "medium",
            impact: "high",
            source: "auto_financial",
            source_reference_id: alloc.id,
            source_reference_type: "budget_allocation",
          });
          created++;
        }
      }
    }

    return new Response(JSON.stringify({ created, message: `${created} risk(s) created` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
