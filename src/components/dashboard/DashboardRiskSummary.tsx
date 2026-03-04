import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShieldAlert, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface RiskWithProject {
  id: string;
  title: string;
  category: string;
  probability: string;
  impact: string;
  status: string;
  project_id: string;
  projects: { name: string; code: string } | null;
}

const severityScore = (probability: string, impact: string) => {
  const map: Record<string, number> = { low: 1, medium: 2, high: 3 };
  return (map[probability] || 0) * (map[impact] || 0);
};

const statusLabels: Record<string, string> = {
  identified: "Identificado",
  mitigating: "Em Mitigação",
  escalated: "Escalado",
  accepted: "Aceito",
  resolved: "Resolvido",
};

const categoryLabels: Record<string, string> = {
  meal: "MEAL",
  suppliers: "Fornecedores",
  financial: "Financeiro",
  beneficiaries: "Beneficiários",
  operational: "Operacional",
  contextual: "Contextual",
};

const statusColors: Record<string, string> = {
  identified: "bg-secondary text-muted-foreground",
  mitigating: "status-pending",
  escalated: "status-blocked",
  accepted: "bg-primary/15 text-primary border-primary/30",
  resolved: "status-active",
};

export function DashboardRiskSummary() {
  const { data: risks = [], isLoading } = useQuery({
    queryKey: ["dashboard_critical_risks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_risks")
        .select("id, title, category, probability, impact, status, project_id, projects(name, code)")
        .in("status", ["identified", "mitigating", "escalated"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as RiskWithProject[]).filter(
        (r) => severityScore(r.probability, r.impact) >= 6
      );
    },
  });

  const grouped = risks.reduce<Record<string, { project: { name: string; code: string }; risks: RiskWithProject[] }>>(
    (acc, risk) => {
      const key = risk.project_id;
      if (!acc[key]) {
        acc[key] = {
          project: risk.projects || { name: "Projeto", code: "—" },
          risks: [],
        };
      }
      acc[key].risks.push(risk);
      return acc;
    },
    {}
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-destructive" />
            Riscos Críticos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full rounded-md" />
          <Skeleton className="h-16 w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-destructive" />
            Riscos Críticos
          </CardTitle>
          {risks.length > 0 && (
            <span className="inline-flex items-center rounded-full border px-[9px] py-[3px] text-[10px] font-mono tracking-[0.06em] status-blocked">
              {risks.length} {risks.length === 1 ? "risco" : "riscos"}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {risks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
            <TrendingUp className="h-6 w-6 mb-2 text-success" />
            <p className="text-[12px] font-mono font-medium">Nenhum risco crítico ativo</p>
            <p className="text-[10px] font-mono mt-1">Todos os riscos de alta severidade estão controlados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([projectId, { project, risks: projectRisks }]) => (
              <div key={projectId} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                  <span className="text-[12px] font-mono font-medium text-foreground">
                    {project.name}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">({project.code})</span>
                </div>
                <div className="space-y-1.5 pl-4 border-l-2 border-destructive/20">
                  {projectRisks.map((risk) => (
                    <div
                      key={risk.id}
                      className="flex items-start justify-between gap-2 rounded-md bg-secondary/50 px-3 py-2"
                    >
                      <div className="flex items-start gap-2 min-w-0">
                        <AlertTriangle className="h-3 w-3 text-destructive mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[12px] font-mono font-medium text-foreground truncate">{risk.title}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-[10px] font-mono text-muted-foreground">
                              {categoryLabels[risk.category] || risk.category}
                            </span>
                            <span className="text-[10px] text-muted-foreground">•</span>
                            <span className="text-[10px] font-mono text-destructive font-medium">
                              P: {risk.probability === "high" ? "Alta" : "Média"} / I: {risk.impact === "high" ? "Alto" : "Médio"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[9px] flex-shrink-0 ${statusColors[risk.status] || ""}`}
                      >
                        {statusLabels[risk.status] || risk.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <a
              href="/risks"
              className="block text-[11px] font-mono text-primary hover:underline text-center pt-2"
            >
              Ver todos os riscos →
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
